import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// ── Firecrawl helper (inlined per edge-function isolation) ────────────────
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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) throw new Error("Unauthorized");

    // ─── Gather user inclinations across all modules ───────────────────────
    const [
      profileRes,
      domainAffinityRes,
      skillsRes,
      interestsRes,
      careerInteractionsRes,
      challengeInteractionsRes,
      jobMatchRes,
      moodboardRes,
      journalRes,
      existingRoadmapsRes,
      signalsRes, // NEW: cross-module Compass signals
    ] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", user.id).single(),
      supabase.from("domain_affinity").select("*").eq("user_id", user.id).order("affinity_score", { ascending: false }).limit(10),
      supabase.from("user_skills").select("*").eq("user_id", user.id).order("proficiency_level", { ascending: false }).limit(20),
      supabase.from("user_interests").select("*").eq("user_id", user.id).limit(20),
      supabase.from("career_path_interactions").select("*, career_paths(title, domain, related_skills)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
      supabase.from("challenge_card_interactions").select("*, domain_challenge_cards(challenge_name, domain, skills_needed)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(15),
      supabase.from("job_applications").select("*, job_listings(title, company, required_skills, domain)").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
      supabase.from("moodboard_items").select("*").eq("user_id", user.id).order("created_at", { ascending: false }).limit(20),
      supabase.from("journal_entries").select("id, mood, tags, created_at").eq("user_id", user.id).order("created_at", { ascending: false }).limit(10),
      supabase.from("roadmaps").select("id, title").eq("user_id", user.id),
      supabase.from("user_signals").select("signal_value, signal_source, signal_type, strength").eq("user_id", user.id).order("created_at", { ascending: false }).limit(300),
    ]);

    const profile = profileRes.data || {};
    const domainAffinities = domainAffinityRes.data || [];
    const skills = skillsRes.data || [];
    const interests = interestsRes.data || [];
    const careerInteractions = careerInteractionsRes.data || [];
    const challengeInteractions = challengeInteractionsRes.data || [];
    const jobMatches = jobMatchRes.data || [];
    const moodboardItems = moodboardRes.data || [];
    const journalEntries = journalRes.data || [];
    const existingRoadmaps = existingRoadmapsRes.data || [];
    const signals = signalsRes.data || [];

    // Aggregate signals by frequency × strength
    const signalFreq: Record<string, { count: number; strength: number; type: string; sources: Set<string> }> = {};
    for (const s of signals as any[]) {
      const key = s.signal_value;
      if (!signalFreq[key]) signalFreq[key] = { count: 0, strength: 0, type: s.signal_type, sources: new Set() };
      signalFreq[key].count++;
      signalFreq[key].strength += Number(s.strength || 0.5);
      signalFreq[key].sources.add(s.signal_source);
    }
    const topSignals = Object.entries(signalFreq)
      .sort((a, b) => b[1].count * b[1].strength - a[1].count * a[1].strength)
      .slice(0, 30)
      .map(([value, info]) => ({ value, count: info.count, type: info.type, sources: Array.from(info.sources) }));

    const topDomains = domainAffinities.slice(0, 5).map((d: any) => d.domain_name);
    const topSkills = skills.slice(0, 10).map((s: any) => s.skill_name);
    const interestKeywords = interests.map((i: any) => i.interest_name);
    const likedCareerPaths = careerInteractions
      .filter((c: any) => c.interaction_type === "saved" || c.interaction_type === "liked")
      .map((c: any) => c.career_paths?.title)
      .filter(Boolean);
    const completedChallenges = challengeInteractions
      .filter((c: any) => c.interaction_type === "completed")
      .map((c: any) => c.domain_challenge_cards?.challenge_name)
      .filter(Boolean);
    const appliedJobDomains = [...new Set(jobMatches.map((j: any) => j.job_listings?.domain).filter(Boolean))];
    const moodboardThemes = [...new Set(moodboardItems.flatMap((m: any) => m.tags || []))];
    const recentMoods = journalEntries.map((j: any) => j.mood).filter(Boolean);
    const existingRoadmapTitles = existingRoadmaps.map((r: any) => r.title);

    const userSignals = {
      profile: {
        careerStage: (profile as any).career_stage,
        intent: (profile as any).intent,
        shortTermGoals: (profile as any).short_term_goals,
        longTermGoals: (profile as any).long_term_goals,
        areasOfFocus: (profile as any).areas_of_focus,
      },
      topSignalsFromCompass: topSignals,
      topDomains,
      topSkills,
      interestKeywords,
      likedCareerPaths,
      completedChallenges,
      appliedJobDomains,
      moodboardThemes,
      recentMoods,
      existingRoadmapTitles,
    };

    // ─── Live web grounding via Firecrawl (top 3-5 queries) ─────────────────
    const groundingQueries: string[] = [];
    const seedTerms = [
      ...topSignals.slice(0, 3).map((s) => s.value),
      ...topDomains.slice(0, 2),
      ...topSkills.slice(0, 2),
    ].filter(Boolean);
    seedTerms.slice(0, 4).forEach((term) =>
      groundingQueries.push(`career roadmap to become a ${term} in India 2026 skills courses salary INR`)
    );
    if ((profile as any).short_term_goals) {
      groundingQueries.push(`${(profile as any).short_term_goals} India 2026 step by step plan`);
    }

    const liveContext: { query: string; results: any[] }[] = [];
    if (groundingQueries.length > 0) {
      const grounded = await Promise.all(
        groundingQueries.slice(0, 5).map(async (q) => ({ query: q, results: await firecrawlSearch(q, 3) }))
      );
      liveContext.push(...grounded.filter((g) => g.results.length > 0));
    }

    // ─── Career paths / job roles for reference ─────────────────────────────
    const [careerPathsRes, jobRolesRes] = await Promise.all([
      supabase.from("career_paths").select("title, domain, description, related_skills, demand_level").limit(50),
      supabase.from("job_roles_directory").select("title, domain, description, skills_required, demand_level").limit(50),
    ]);

    const careerPaths = careerPathsRes.data || [];
    const jobRoles = jobRolesRes.data || [];

    // ─── AI generation ──────────────────────────────────────────────────────
    const systemPrompt = `You are MyRaaha's career intelligence engine for India (Tier 2/3/4 friendly). Analyze multi-module user behavior and live web context to suggest 3-5 highly personalized career roadmaps.

Hard rules:
- Use INR for all salary figures (convert if source is USD).
- Reference live courses/programs from the LIVE_WEB_CONTEXT when relevant; cite the source URL in reasoning.
- Each suggestion must build on existing strengths AND fill a real gap.
- Do NOT repeat any roadmap title the user already has.
- Match the user's career stage and behavioral signals from Curiosity Compass.
- Voice: warm, jargon-free, Gen Z friendly ("no cap" energy when natural — don't force it).

Return strict JSON:
{
  "suggestions": [
    {
      "title": string,
      "description": string,
      "match_score": number,
      "reasoning": [string],
      "key_skills": [string],
      "target_roles": [string],
      "estimated_timeline": string,
      "phases": [string],
      "live_resources": [{"title": string, "url": string}]
    }
  ],
  "analysis_summary": string,
  "strongest_signals": [string]
}`;

    const userPrompt = `USER_SIGNALS:
${JSON.stringify(userSignals, null, 2)}

LIVE_WEB_CONTEXT (real, current — use for grounding & citations):
${JSON.stringify(liveContext, null, 2)}

AVAILABLE_CAREER_PATHS (system catalog):
${JSON.stringify(careerPaths.slice(0, 25).map((c: any) => ({ title: c.title, domain: c.domain, skills: c.related_skills })))}

AVAILABLE_JOB_ROLES:
${JSON.stringify(jobRoles.slice(0, 25).map((j: any) => ({ title: j.title, domain: j.domain, skills: j.skills_required })))}

EXISTING_USER_ROADMAPS_DO_NOT_REPEAT: ${existingRoadmapTitles.join(", ") || "None"}

Generate 3-5 personalized roadmap suggestions grounded in LIVE_WEB_CONTEXT and USER_SIGNALS.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-pro",
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
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
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
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { suggestions: [] };
    } catch {
      parsed = { suggestions: [], raw: content };
    }

    // Persist suggestions (replace prior 'suggested' batch)
    if (parsed.suggestions?.length > 0) {
      const inserts = parsed.suggestions.map((s: any) => ({
        user_id: user.id,
        title: s.title,
        description: s.description,
        match_score: s.match_score || 0,
        reasoning: s.reasoning || [],
        source_signals: userSignals,
        roadmap_data: {
          key_skills: s.key_skills,
          target_roles: s.target_roles,
          estimated_timeline: s.estimated_timeline,
          phases: s.phases,
          live_resources: s.live_resources || [],
        },
        status: "suggested",
        source_module: "for_you_v2",
      }));

      await supabase.from("suggested_roadmaps")
        .delete()
        .eq("user_id", user.id)
        .eq("status", "suggested");

      await supabase.from("suggested_roadmaps").insert(inserts);
    }

    return new Response(JSON.stringify({
      ...parsed,
      grounded_with: liveContext.length,
      user_signals_summary: { topDomains, topSkills: topSkills.slice(0, 5), careerStage: (profile as any).career_stage },
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("roadmap-suggestions error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
