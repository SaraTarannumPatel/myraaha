import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getAuthUser, unauthorized } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authedUser = await getAuthUser(req);
    if (!authedUser) return unauthorized();
    const { action, data } = await req.json();
    const user_id = authedUser.id; // ignore any client-supplied user_id
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const [entriesRes, checkinsRes, profileRes, skillsRes, energyRes, achieveRes] = await Promise.all([
      supabase.from("journal_entries").select("*").eq("user_id", user_id).order("created_at", { ascending: false }).limit(30),
      supabase.from("mood_checkins").select("*").eq("user_id", user_id).order("created_at", { ascending: false }).limit(30),
      supabase.from("profiles").select("*").eq("user_id", user_id).single(),
      supabase.from("skill_items").select("name, category, proficiency_level").eq("user_id", user_id).limit(20),
      supabase.from("energy_zones").select("domain, energy_level, mood_before, mood_after, recorded_at").eq("user_id", user_id).order("recorded_at", { ascending: false }).limit(15),
      supabase.from("achievements").select("title, achievement_type, earned_at").eq("user_id", user_id).order("earned_at", { ascending: false }).limit(10),
    ]);

    const entries = entriesRes.data || [];
    const checkins = checkinsRes.data || [];
    const profile = profileRes.data;
    const skills = skillsRes.data || [];
    const energyZones = energyRes.data || [];
    const achievements = achieveRes.data || [];

    const userContext = `User: ${profile?.full_name || "friend"}, intent: ${profile?.active_intent || "career"}, type: ${profile?.user_type || "student"}, skills: ${skills.map(s => s.name).join(", ") || "none tracked"}, recent achievements: ${achievements.slice(0, 3).map(a => a.title).join(", ") || "none yet"}, energy patterns: ${energyZones.slice(0, 3).map(e => `${e.domain}:${e.energy_level}`).join(", ") || "not tracked"}`;

    let systemPrompt = "";
    let userPrompt = "";

    if (action === "reflection_prompts") {
      systemPrompt = `You are a compassionate career wellness companion. Generate 5 structured reflection prompts personalized to this user's recent mood patterns, journal entries, skills, and achievements. Each prompt should have a title, the prompt question, and a category (wins, challenges, feelings, growth, gratitude). Return JSON array: [{title, prompt, category}]`;
      userPrompt = `${userContext}
Recent moods: ${JSON.stringify(checkins.slice(0, 10).map(c => ({ mood: c.mood, energy: c.energy_level, date: c.created_at })))}
Recent journal titles: ${entries.slice(0, 5).map(e => e.title || "untitled").join(", ")}`;

    } else if (action === "weekly_insights") {
      systemPrompt = `You are an emotional intelligence analyst for career development. Analyze this user's mood check-ins and journal entries from the past week. Provide:
1) mood_summary: { dominant_moods: string[], avg_energy: number, avg_confidence: number }
2) patterns: { correlations: string[], triggers: string[], positive_signals: string[] }
3) suggestions: string[] (3-5 actionable suggestions linked to platform features like Content Library, Project Playground, Curiosity Compass, Mentor Matchmaking, SkillStacker, Roadmap)
4) ai_narrative: a warm, 2-3 sentence summary
5) celebration: string | null (celebrate progress if any)
Return JSON.`;
      userPrompt = `${userContext}
Check-ins: ${JSON.stringify(checkins)}
Journal entries: ${JSON.stringify(entries.slice(0, 15).map(e => ({ title: e.title, mood: e.mood, content: e.content?.slice(0, 200), tags: e.tags, date: e.created_at })))}`;

    } else if (action === "action_suggestions") {
      const currentMood = data?.mood || "neutral";
      systemPrompt = `You are a supportive career companion. Based on the user's current emotional state and context, suggest 4-5 personalized actions. Each should link to a platform feature and include a path. Return JSON array: [{action, description, feature, icon_emoji, path}].
Features and paths: Content Library (/dashboard/content-library), Project Playground (/dashboard/project-playground), Curiosity Compass (/dashboard/curiosity-compass), Peer Circles (/dashboard/peer-circles), Mentor Match (/dashboard/mentor-matchmaking), Career Coach (/dashboard/virtual-career-coach), Roadmap (/dashboard/roadmap), SkillStacker (/dashboard/skill-stacker), Career Therapist (/dashboard/ai-career-therapist).`;
      userPrompt = `${userContext}
Current mood: ${currentMood}
Recent patterns: ${JSON.stringify(checkins.slice(0, 5))}`;

    } else if (action === "mood_analysis") {
      systemPrompt = `Analyze this user's mood data comprehensively. Return JSON: {
  trend_direction: "improving"|"stable"|"declining"|"fluctuating",
  dominant_emotion: string,
  energy_trend: string,
  confidence_trend: string,
  key_insight: string,
  correlations: [{ observation: string, implication: string }],
  resilience_score: number (0-100),
  encouragement: string,
  recommended_feature: { name: string, path: string, reason: string }
}`;
      userPrompt = `${userContext}
Mood data: ${JSON.stringify(checkins)}
Energy zones: ${JSON.stringify(energyZones)}`;

    } else if (action === "correlation_insights") {
      systemPrompt = `You are a behavioral pattern analyst. Find meaningful correlations between the user's moods, activities, achievements, and journal entries. Return JSON: {
  correlations: [{ pattern: string, evidence: string, actionable_tip: string }],
  positive_triggers: string[],
  warning_signs: string[],
  growth_narrative: string
}`;
      userPrompt = `${userContext}
Moods: ${JSON.stringify(checkins.slice(0, 20))}
Entries: ${JSON.stringify(entries.slice(0, 10).map(e => ({ title: e.title, mood: e.mood, tags: e.tags, date: e.created_at })))}
Energy: ${JSON.stringify(energyZones)}
Achievements: ${JSON.stringify(achievements)}`;

    } else if (action === "monthly_summary") {
      systemPrompt = `Create a warm, comprehensive monthly emotional wellness summary. Return JSON: {
  summary_title: string,
  emotional_journey: string (2-3 paragraph narrative),
  top_moods: string[],
  growth_areas: string[],
  resilience_moments: string[],
  next_month_focus: string[],
  affirmation: string
}`;
      userPrompt = `${userContext}
All check-ins: ${JSON.stringify(checkins)}
All entries: ${JSON.stringify(entries.slice(0, 20).map(e => ({ title: e.title, mood: e.mood, tags: e.tags, content: e.content?.slice(0, 150), date: e.created_at })))}
Achievements: ${JSON.stringify(achievements)}`;

    } else {
      return new Response(JSON.stringify({ error: "Unknown action" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const aiResp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
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

    if (!aiResp.ok) {
      if (aiResp.status === 429) return new Response(JSON.stringify({ error: "Rate limited, try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiResp.status === 402) return new Response(JSON.stringify({ error: "Usage limit reached." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI error: ${aiResp.status}`);
    }

    const aiData = await aiResp.json();
    const content = aiData.choices?.[0]?.message?.content || "{}";
    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: content };
    } catch {
      parsed = { raw: content };
    }

    // Store weekly insights
    if (action === "weekly_insights" && parsed.ai_narrative) {
      await supabase.from("journal_insights").insert({
        user_id,
        insight_type: "weekly",
        period_start: new Date(Date.now() - 7 * 86400000).toISOString(),
        period_end: new Date().toISOString(),
        mood_summary: parsed.mood_summary || {},
        patterns: parsed.patterns || {},
        suggestions: parsed.suggestions || [],
        ai_narrative: parsed.ai_narrative,
      });
    }

    // Store monthly summary
    if (action === "monthly_summary" && parsed.emotional_journey) {
      await supabase.from("journal_insights").insert({
        user_id,
        insight_type: "monthly",
        period_start: new Date(Date.now() - 30 * 86400000).toISOString(),
        period_end: new Date().toISOString(),
        ai_narrative: parsed.emotional_journey,
        suggestions: parsed.next_month_focus || [],
      });
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
