import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!);

    // Get authenticated user
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) throw new Error("Unauthorized");

    // ─── Gather user inclinations from all modules ───────────────────────────
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
      supabase.from("roadmaps").select("id, title, status").eq("user_id", user.id),
    ]);

    // Compile user signals
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

    // Extract signal patterns
    const topDomains = domainAffinities.slice(0, 5).map(d => d.domain_name);
    const topSkills = skills.slice(0, 10).map(s => s.skill_name);
    const interestKeywords = interests.map(i => i.interest_name);
    const likedCareerPaths = careerInteractions
      .filter(c => c.interaction_type === "saved" || c.interaction_type === "liked")
      .map(c => c.career_paths?.title)
      .filter(Boolean);
    const completedChallenges = challengeInteractions
      .filter(c => c.interaction_type === "completed")
      .map(c => c.domain_challenge_cards?.challenge_name)
      .filter(Boolean);
    const appliedJobDomains = [...new Set(jobMatches.map(j => j.job_listings?.domain).filter(Boolean))];
    const moodboardThemes = [...new Set(moodboardItems.flatMap(m => m.tags || []))];
    const recentMoods = journalEntries.map(j => j.mood).filter(Boolean);
    const existingRoadmapTitles = existingRoadmaps.map(r => r.title);

    const userSignals = {
      profile: {
        careerStage: profile.career_stage,
        intent: profile.intent,
        shortTermGoals: profile.short_term_goals,
        longTermGoals: profile.long_term_goals,
        areasOfFocus: profile.areas_of_focus,
      },
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

    // ─── Fetch career paths and job roles for context ────────────────────────
    const [careerPathsRes, jobRolesRes] = await Promise.all([
      supabase.from("career_paths").select("title, domain, description, related_skills, demand_level").limit(50),
      supabase.from("job_roles_directory").select("title, domain, description, skills_required, demand_level").limit(50),
    ]);

    const careerPaths = careerPathsRes.data || [];
    const jobRoles = jobRolesRes.data || [];

    // ─── Generate AI suggestions ─────────────────────────────────────────────
    const systemPrompt = `You are a career intelligence engine that analyzes user behavior patterns across a career exploration platform to suggest highly personalized career roadmaps.

You have access to:
1. User's domain affinities (areas they spend most time exploring)
2. Skills they've added and their proficiency levels
3. Career paths they've liked or saved
4. Challenges they've completed
5. Jobs they've applied to or saved
6. Moodboard themes they're collecting
7. Journal mood patterns
8. Their stated goals and career stage

TASK: Analyze all these signals to identify 3-5 career roadmaps that would be most valuable for this user. Each roadmap should:
- Build on their existing strengths while addressing gaps
- Align with their stated and implied interests
- Be distinct from roadmaps they already have
- Match their career stage and goals

Return JSON:
{
  "suggestions": [
    {
      "title": "Roadmap title - specific and actionable",
      "description": "2-3 sentence description of what this roadmap covers and why it's perfect for them",
      "match_score": 85, // 0-100 how well it matches their signals
      "reasoning": ["reason 1", "reason 2", "reason 3"],
      "key_skills": ["skill1", "skill2", "skill3"],
      "target_roles": ["role1", "role2"],
      "estimated_timeline": "3-6 months",
      "phases": ["Phase 1: ...", "Phase 2: ...", "Phase 3: ..."]
    }
  ],
  "analysis_summary": "Brief summary of user's career direction based on their behavior patterns",
  "strongest_signals": ["signal 1", "signal 2", "signal 3"]
}`;

    const userPrompt = `Analyze this user's behavior patterns and suggest personalized career roadmaps:

USER SIGNALS:
${JSON.stringify(userSignals, null, 2)}

AVAILABLE CAREER PATHS IN SYSTEM:
${JSON.stringify(careerPaths.slice(0, 30).map(c => ({ title: c.title, domain: c.domain, skills: c.related_skills })), null, 2)}

AVAILABLE JOB ROLES IN SYSTEM:
${JSON.stringify(jobRoles.slice(0, 30).map(j => ({ title: j.title, domain: j.domain, skills: j.skills_required })), null, 2)}

ROADMAPS USER ALREADY HAS (do not suggest these again):
${existingRoadmapTitles.join(", ") || "None"}

Generate 3-5 highly personalized roadmap suggestions based on the patterns you observe.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
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

    // Store suggestions in database
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
        },
        status: "suggested",
      }));

      // Clear old suggestions first
      await supabase.from("suggested_roadmaps")
        .delete()
        .eq("user_id", user.id)
        .eq("status", "suggested");

      await supabase.from("suggested_roadmaps").insert(inserts);
    }

    return new Response(JSON.stringify({
      ...parsed,
      user_signals_summary: {
        topDomains,
        topSkills: topSkills.slice(0, 5),
        careerStage: profile.career_stage,
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("roadmap-suggestions error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
