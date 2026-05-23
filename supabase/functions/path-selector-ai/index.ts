import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "detect_signals":
        systemPrompt = `You are an entrepreneurial path advisor for MyRaaha. Analyze the user's exploration data and detect signals indicating promising entrepreneurial directions. Return JSON: { "signals": [{ "area": string, "strength": number (0-1), "evidence": string, "suggested_path": string }], "top_recommendation": string, "reasoning": string }`;
        userPrompt = `User data: Ideas interacted with: ${JSON.stringify(context.ideas)}. Problems observed: ${JSON.stringify(context.problems)}. Skills: ${JSON.stringify(context.skills)}. Interests: ${JSON.stringify(context.interests)}. Challenges completed: ${context.challengesCompleted}. Industry: ${context.industry}. Goals: ${context.goals}.`;
        break;

      case "generate_roadmap":
        systemPrompt = `You are a startup roadmap generator for MyRaaha. Create a detailed, actionable 8-step roadmap for the chosen entrepreneurial path. Each step should be specific and achievable. Return JSON: { "steps": [{ "title": string, "description": string, "duration": string, "category": "learning"|"building"|"networking"|"validating", "resources": string[] }], "estimated_timeline": string, "key_milestones": string[] }`;
        userPrompt = `Path chosen: ${context.pathType} - "${context.pathTitle}". User skills: ${JSON.stringify(context.skills)}. Industry: ${context.industry}. Experience level: ${context.experienceLevel}.`;
        break;

      case "evaluate_alignment":
        systemPrompt = `You are a career-path alignment evaluator for MyRaaha. Assess how well the user's profile aligns with their chosen path. Return JSON: { "alignment_score": number (0-100), "strengths_match": string[], "gaps": string[], "risk_level": "low"|"medium"|"high", "advice": string, "next_actions": string[] }`;
        userPrompt = `Path: ${context.pathType} - "${context.pathTitle}". User profile: industry=${context.industry}, skills=${JSON.stringify(context.skills)}, interests=${JSON.stringify(context.interests)}, experience=${context.experienceLevel}, goals=${context.goals}.`;
        break;

      case "refine_signals":
        systemPrompt = `You are a signal refinement engine for MyRaaha. Compare previous signals with current user activity to identify emerging patterns, shifts in interest, and confidence changes. Return JSON: { "evolved_signals": [{ "area": string, "previous_strength": number, "current_strength": number, "trend": "rising"|"stable"|"declining", "insight": string }], "new_discoveries": string[], "recommended_pivots": string[], "confidence_trend": "increasing"|"stable"|"decreasing", "narrative": string }`;
        userPrompt = `Previous signals: ${JSON.stringify(context.previousSignals)}. Current activity: Ideas=${JSON.stringify(context.ideas)}, Problems=${JSON.stringify(context.problems)}, Skills=${JSON.stringify(context.skills)}, Interests=${JSON.stringify(context.interests)}, Reflections=${JSON.stringify(context.reflections)}, Path history=${JSON.stringify(context.pathHistory)}.`;
        break;

      case "reflection_prompts":
        systemPrompt = `You are a reflective coach for MyRaaha. Generate 4 thoughtful reflection prompts tailored to the user's current path and stage. Each prompt should help them evaluate readiness, passion, risk appetite, or alignment. Return JSON: { "prompts": [{ "prompt": string, "category": "readiness"|"passion"|"risk"|"alignment"|"values", "why_this_matters": string }] }`;
        userPrompt = `Path: ${context.pathType} - "${context.pathTitle}". Stage: ${context.stage}. Skills: ${JSON.stringify(context.skills)}. Recent reflections: ${JSON.stringify(context.recentReflections)}. Alignment score: ${context.alignmentScore}.`;
        break;

      case "mentor_match":
        systemPrompt = `You are a mentor matching engine for MyRaaha. Based on the user's chosen path and profile, recommend ideal mentor characteristics and suggest how to find them. Return JSON: { "ideal_mentor_profile": { "expertise_areas": string[], "experience_level": string, "personality_traits": string[] }, "matching_criteria": string[], "outreach_tips": string[], "conversation_starters": string[], "what_to_look_for": string[] }`;
        userPrompt = `Path: ${context.pathType} - "${context.pathTitle}". User skills: ${JSON.stringify(context.skills)}. Gaps: ${JSON.stringify(context.gaps)}. Industry: ${context.industry}. Experience: ${context.experienceLevel}.`;
        break;

      case "community_summary":
        systemPrompt = `You are a storytelling assistant for MyRaaha. Create a compelling, shareable summary of the user's entrepreneurial path journey that they can share with their community for feedback. Return JSON: { "summary": string, "key_highlights": string[], "feedback_questions": string[], "tags": string[] }`;
        userPrompt = `Path: ${context.pathType} - "${context.pathTitle}". Journey so far: signals=${JSON.stringify(context.signals)}, alignment=${context.alignmentScore}%, roadmap_progress=${context.roadmapProgress}, reflections=${JSON.stringify(context.reflections)}, skills=${JSON.stringify(context.skills)}.`;
        break;

      case "compare_paths":
        systemPrompt = `You are a path comparison analyst for MyRaaha. Compare multiple entrepreneurial paths for the user and provide a detailed comparative analysis. Return JSON: { "comparison": [{ "path": string, "fit_score": number (0-100), "pros": string[], "cons": string[], "time_to_first_revenue": string, "skill_gap_count": number }], "recommendation": string, "reasoning": string }`;
        userPrompt = `Paths to compare: ${JSON.stringify(context.paths)}. User profile: skills=${JSON.stringify(context.skills)}, interests=${JSON.stringify(context.interests)}, industry=${context.industry}, risk_appetite=${context.riskAppetite}, time_commitment=${context.timeCommitment}.`;
        break;

      default:
        throw new Error("Unknown type: " + type);
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limited. Try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: content };
    } catch {
      parsed = { raw: content };
    }

    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("path-selector error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
