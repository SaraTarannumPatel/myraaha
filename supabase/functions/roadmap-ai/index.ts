import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Firecrawl helper for live grounding
const FIRECRAWL_V2 = "https://api.firecrawl.dev/v2";
async function firecrawlSearch(query: string, limit = 4): Promise<any[]> {
  const apiKey = Deno.env.get("FIRECRAWL_API_KEY");
  if (!apiKey) return [];
  try {
    const res = await fetch(`${FIRECRAWL_V2}/search`, {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({ query, limit, country: "in", lang: "en" }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const arr = data?.data || data?.web?.results || data?.results || [];
    return (arr as any[])
      .map((r) => ({
        url: r.url || r.link || "",
        title: (r.title || r.name || "").slice(0, 120),
        description: (r.description || r.snippet || r.summary || "").slice(0, 200),
      }))
      .filter((r) => r.url && r.title);
  } catch {
    return [];
  }
}

async function gatherLiveContext(ctx: any): Promise<{ query: string; results: any[] }[]> {
  const queries: string[] = [];
  const focus = (ctx.areasOfFocus || []).filter(Boolean).slice(0, 2);
  const skills = (ctx.skills || []).filter(Boolean).slice(0, 2);
  const interests = (ctx.interests || []).filter(Boolean).slice(0, 2);

  focus.forEach((r: string) =>
    queries.push(`how to become a ${r} in India 2026 step by step skills certifications salary INR`)
  );
  skills.forEach((s: string) =>
    queries.push(`best free course to learn ${s} 2026 India site:coursera.org OR site:youtube.com OR site:nptel.ac.in`)
  );
  interests.forEach((i: string) =>
    queries.push(`career paths in ${i} India 2026 entry level roles`)
  );
  if (ctx.shortTermGoals) {
    queries.push(`${ctx.shortTermGoals} actionable plan India 2026`);
  }

  const capped = queries.slice(0, 5);
  if (capped.length === 0) return [];
  const results = await Promise.all(
    capped.map(async (q) => ({ query: q, results: await firecrawlSearch(q, 3) }))
  );
  return results.filter((r) => r.results.length > 0);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, context: rawContext, persist: persistFlag } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    // Enrich context with real user signals from the database when authenticated
    let context = { ...(rawContext || {}) };
    try {
      const authHeader = req.headers.get("Authorization") || "";
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
      const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
      if (authHeader && SUPABASE_URL && SERVICE_KEY) {
        const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.45.0");
        const userClient = createClient(SUPABASE_URL, SERVICE_KEY, {
          global: { headers: { Authorization: authHeader } },
        });
        const { data: { user } } = await userClient.auth.getUser();
        if (user) {
          const [signalsRes, interestsRes, profileRes, skillItemsRes] = await Promise.all([
            userClient.from("user_signals").select("signal_type, signal_value, source_module").eq("user_id", user.id).order("created_at", { ascending: false }).limit(40),
            userClient.from("interests").select("name, category, intensity").eq("user_id", user.id).limit(30),
            userClient.from("profiles").select("full_name, career_stage, industry, areas_of_focus, short_term_goals, long_term_goals, user_type, age").eq("user_id", user.id).maybeSingle(),
            userClient.from("skill_items").select("name, category, proficiency_level").eq("user_id", user.id).limit(30),
          ]);
          const signals = signalsRes.data || [];
          const interests = (interestsRes.data || []).map((i: any) => i.name);
          const skills = (skillItemsRes.data || []).map((s: any) => s.name);
          const p = profileRes.data || {};
          context = {
            ...context,
            interests: Array.from(new Set([...(context.interests || []), ...interests])).slice(0, 20),
            skills: Array.from(new Set([...(context.skills || []), ...skills])).slice(0, 30),
            careerStage: context.careerStage || p.career_stage || "exploring",
            industry: context.industry || p.industry || null,
            shortTermGoals: context.shortTermGoals || p.short_term_goals || null,
            longTermGoals: context.longTermGoals || p.long_term_goals || null,
            areasOfFocus: context.areasOfFocus || p.areas_of_focus || [],
            userType: p.user_type || "student",
            userName: p.full_name || null,
            topSignals: signals.slice(0, 15).map((s: any) => ({ type: s.signal_type, value: s.signal_value, source: s.source_module })),
          };
        }
      }
    } catch (enrichErr) {
      console.warn("roadmap-ai: signal enrichment skipped:", enrichErr);
    }

    let systemPrompt = "";
    let userPrompt = "";
    let liveContext: { query: string; results: any[] }[] = [];

    if (type === "generate_roadmap") {
      // Live web grounding
      liveContext = await gatherLiveContext(context);

      systemPrompt = `You are MyRaaha's AI career roadmap architect for India (Tier 2/3/4 friendly). Build a comprehensive, hyper-personalized roadmap across 5 phases: Exploration, Learning, Practice, Connection, Opportunity.

Hard rules:
- Use the LIVE_WEB_CONTEXT for real, current course names, certifications, programs and platforms. Cite the URL in step.resource_url when applicable.
- All money figures in INR.
- Each step must be specific, achievable, and time-boxed (estimated_duration).
- Match the user's stated career stage and behavioral signals.
- Voice: warm, jargon-free, Gen Z friendly.

Return strict JSON: {
  "title": string,
  "description": string,
  "phases": [
    {
      "name": "exploration" | "learning" | "practice" | "connection" | "opportunity",
      "steps": [
        {
          "title": string,
          "description": string,
          "category": "discovery" | "learning" | "project" | "networking" | "application",
          "priority": "high" | "medium" | "low",
          "skill_tags": string[],
          "estimated_duration": string,
          "action_type": "explore" | "learn" | "build" | "connect" | "apply",
          "resource_url": string | null,
          "resource_title": string | null
        }
      ]
    }
  ],
  "skill_gaps": [{ "skill": string, "current_level": number, "target_level": number, "importance": string }],
  "milestones": [{ "title": string, "phase": string, "description": string }],
  "estimated_timeline": string,
  "live_resources_used": [{ "title": string, "url": string }]
}`;
      userPrompt = `USER_CONTEXT:
Goals — Short-term: ${context.shortTermGoals || "Not specified"} | Long-term: ${context.longTermGoals || "Not specified"}
Interests: ${JSON.stringify(context.interests || [])}
Current Skills: ${JSON.stringify(context.skills || [])}
Industry: ${context.industry || "Not specified"}
Career Stage: ${context.careerStage || "exploring"}
Areas of Focus: ${JSON.stringify(context.areasOfFocus || [])}
Top Compass Signals: ${JSON.stringify(context.topSignals || [])}

LIVE_WEB_CONTEXT (real, current — use for grounding & resource_url citations):
${JSON.stringify(liveContext, null, 2)}`;
    } else if (type === "suggest_next_steps") {
      systemPrompt = `You are an adaptive career coach. Based on the user's current roadmap progress and behavior patterns, suggest the 3-5 most impactful next steps. Consider their completed tasks, skipped items, and current phase.

Return JSON: {
  "suggestions": [
    {
      "title": string,
      "description": string,
      "reason": string,
      "category": "learning" | "project" | "networking" | "application" | "reflection",
      "priority": "high" | "medium" | "low",
      "estimated_time": string,
      "skill_tags": string[]
    }
  ],
  "encouragement": string,
  "pattern_insight": string
}`;
      userPrompt = `User's roadmap progress:
Completed steps: ${JSON.stringify(context.completedSteps || [])}.
In-progress steps: ${JSON.stringify(context.inProgressSteps || [])}.
Skipped steps: ${JSON.stringify(context.skippedSteps || [])}.
Current phase: ${context.currentPhase || "exploration"}.
Goals: ${context.goals || "Career growth"}.
Recent mood: ${context.mood || "neutral"}.`;
    } else if (type === "analyze_progress") {
      systemPrompt = `You are a career progress analyst. Analyze the user's roadmap journey and provide insights on their progress, patterns, and recommendations for staying on track.

Return JSON: {
  "progress_summary": string,
  "strengths_observed": string[],
  "areas_for_improvement": string[],
  "phase_readiness": {
    "current_phase": string,
    "completion_percentage": number,
    "ready_for_next": boolean,
    "next_phase": string
  },
  "skill_progress": [{ "skill": string, "growth": string, "recommendation": string }],
  "motivational_message": string,
  "recommended_adjustments": string[]
}`;
      userPrompt = `Analyze progress:
Total steps: ${context.totalSteps || 0}.
Completed: ${context.completedCount || 0}.
Current phase: ${context.currentPhase || "exploration"}.
Goals: Short-term: ${context.shortTermGoals}. Long-term: ${context.longTermGoals}.
Time on platform: ${context.daysActive || 0} days.
Recent activity: ${JSON.stringify(context.recentActivity || [])}.`;
    } else if (type === "adaptive_feedback") {
      systemPrompt = `You are an empathetic career guide. The user's behavior suggests they may need roadmap adjustments. Provide personalized recommendations that respect their preferences while keeping them on track.

Return JSON: {
  "observation": string,
  "suggested_adjustments": [
    {
      "type": "add" | "remove" | "modify" | "reorder",
      "reason": string,
      "details": string
    }
  ],
  "alternative_paths": [
    {
      "name": string,
      "description": string,
      "alignment_score": number
    }
  ],
  "encouragement": string
}`;
      userPrompt = `User behavior patterns:
Preferred categories: ${JSON.stringify(context.preferredCategories || [])}.
Avoided categories: ${JSON.stringify(context.avoidedCategories || [])}.
Average completion time: ${context.avgCompletionTime || "unknown"}.
Engagement level: ${context.engagementLevel || "moderate"}.
Recent skips: ${JSON.stringify(context.recentSkips || [])}.
Current roadmap focus: ${context.roadmapFocus || "general career growth"}.`;
    } else if (type === "milestone_reflection") {
      systemPrompt = `You are a supportive career mentor. The user has reached a milestone. Generate a meaningful reflection prompt and celebration message.

Return JSON: {
  "celebration": string,
  "reflection_prompts": string[],
  "insights": string,
  "next_milestone_preview": string,
  "achievement_summary": string
}`;
      userPrompt = `Milestone reached:
Milestone: ${context.milestoneName || "Phase completion"}.
Phase completed: ${context.phaseCompleted || "exploration"}.
Steps completed in phase: ${context.stepsCompleted || 0}.
User goals: ${context.goals || "Career advancement"}.
Time taken: ${context.timeTaken || "unknown"}.`;
    } else {
      throw new Error("Unknown type: " + type);
    }

    // Use stronger reasoning model for full roadmap generation, faster for utility ops.
    const model = type === "generate_roadmap" ? "google/gemini-2.5-pro" : "google/gemini-2.5-flash";

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    let parsed: any;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: content };
    } catch {
      parsed = { raw: content };
    }

    // Attach grounding metadata
    if (type === "generate_roadmap") {
      parsed.grounded_with = liveContext.length;
      parsed.live_context = liveContext;

      // Persist to roadmaps + roadmap_steps so the user's roadmap survives reloads.
      try {
        const authHeader = req.headers.get("Authorization") || "";
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
        const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
        if (authHeader && SUPABASE_URL && SERVICE_KEY) {
          const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.45.0");
          const userClient = createClient(SUPABASE_URL, SERVICE_KEY, {
            global: { headers: { Authorization: authHeader } },
          });
          const { data: { user } } = await userClient.auth.getUser();
          if (user) {
            // Deactivate prior active roadmaps of same intent so only one is "active"
            const intent = (rawContext?.intent === "entrepreneurship") ? "entrepreneurship" : "career";
            await userClient.from("roadmaps").update({ is_active: false })
              .eq("user_id", user.id).eq("intent", intent).eq("is_active", true);

            const { data: rmRow, error: rmErr } = await userClient.from("roadmaps").insert({
              user_id: user.id,
              title: parsed.title || "Your Personalized Roadmap",
              description: parsed.description || null,
              intent,
              is_active: true,
              short_term_goals: context.shortTermGoals || null,
              long_term_goals: context.longTermGoals || null,
              current_phase: parsed.phases?.[0]?.name || "exploration",
              skill_gaps: parsed.skill_gaps || [],
              ai_suggestions: { milestones: parsed.milestones || [], estimated_timeline: parsed.estimated_timeline || null, grounded_with: parsed.grounded_with || 0 },
            }).select("id").single();

            if (!rmErr && rmRow?.id) {
              const stepsToInsert: any[] = [];
              let order = 0;
              for (const phase of parsed.phases || []) {
                for (const step of phase.steps || []) {
                  stepsToInsert.push({
                    roadmap_id: rmRow.id,
                    user_id: user.id,
                    title: step.title || "Step",
                    description: [
                      step.description || "",
                      step.resource_url ? `\n\nResource: ${step.resource_title || step.resource_url} — ${step.resource_url}` : "",
                      step.estimated_duration ? `\nDuration: ${step.estimated_duration}` : "",
                      step.skill_tags?.length ? `\nSkills: ${step.skill_tags.join(", ")}` : "",
                      `\nPhase: ${phase.name}`,
                    ].join(""),
                    order_index: order++,
                    status: "pending",
                  });
                }
              }
              if (stepsToInsert.length > 0) {
                await userClient.from("roadmap_steps").insert(stepsToInsert);
              }
              parsed.roadmap_id = rmRow.id;
              parsed.persisted = true;
            } else if (rmErr) {
              console.warn("roadmap-ai: persist failed", rmErr);
            }
          }
        }
      } catch (persistErr) {
        console.warn("roadmap-ai: persistence skipped:", persistErr);
      }
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("roadmap-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
