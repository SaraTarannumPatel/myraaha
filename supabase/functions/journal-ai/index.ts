import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, user_id, data } = await req.json();
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Gather user context
    const [entriesRes, checkinsRes, profileRes] = await Promise.all([
      supabase.from("journal_entries").select("*").eq("user_id", user_id).order("created_at", { ascending: false }).limit(30),
      supabase.from("mood_checkins").select("*").eq("user_id", user_id).order("created_at", { ascending: false }).limit(30),
      supabase.from("profiles").select("*").eq("user_id", user_id).single(),
    ]);

    const entries = entriesRes.data || [];
    const checkins = checkinsRes.data || [];
    const profile = profileRes.data;

    let systemPrompt = "";
    let userPrompt = "";

    if (action === "reflection_prompts") {
      systemPrompt = `You are a compassionate career wellness companion. Generate 5 structured reflection prompts personalized to this user's recent mood patterns and journal entries. Each prompt should have a title, the prompt question, and a category (wins, challenges, feelings, growth, gratitude). Return JSON array: [{title, prompt, category}]`;
      userPrompt = `User profile: ${JSON.stringify({ name: profile?.full_name, intent: profile?.active_intent, stage: profile?.career_stage })}
Recent moods: ${JSON.stringify(checkins.slice(0, 10).map(c => ({ mood: c.mood, energy: c.energy_level, date: c.created_at })))}
Recent journal titles: ${entries.slice(0, 5).map(e => e.title || "untitled").join(", ")}`;
    } else if (action === "weekly_insights") {
      systemPrompt = `You are an emotional intelligence analyst for career development. Analyze this user's mood check-ins and journal entries from the past week. Provide: 1) mood_summary (dominant moods, average energy/confidence), 2) patterns (correlations, triggers, trends), 3) suggestions (3-5 actionable suggestions linked to platform features like Content Library, Project Playground, Curiosity Compass, Mentor Matchmaking), 4) ai_narrative (a warm, 2-3 sentence summary). Return JSON: {mood_summary, patterns, suggestions: string[], ai_narrative}`;
      userPrompt = `Check-ins: ${JSON.stringify(checkins)}
Journal entries: ${JSON.stringify(entries.slice(0, 15).map(e => ({ title: e.title, mood: e.mood, content: e.content?.slice(0, 200), tags: e.tags, date: e.created_at })))}
Profile: ${JSON.stringify({ name: profile?.full_name, intent: profile?.active_intent })}`;
    } else if (action === "action_suggestions") {
      const currentMood = data?.mood || "neutral";
      systemPrompt = `You are a supportive career companion. Based on the user's current emotional state, suggest 4 personalized actions they can take right now. Each action should link to a platform feature. Return JSON array: [{action, description, feature, icon_emoji}]. Features: Content Library, Project Playground, Curiosity Compass, Peer Circles, Mentor Match, Career Coach, Roadmap, SkillStacker.`;
      userPrompt = `Current mood: ${currentMood}
Recent patterns: ${JSON.stringify(checkins.slice(0, 5))}
User intent: ${profile?.active_intent || "career"}`;
    } else if (action === "mood_analysis") {
      systemPrompt = `Analyze this user's mood data and return a brief, warm emotional trend analysis. Include: trend_direction (improving/stable/declining), dominant_emotion, energy_trend, confidence_trend, key_insight (one sentence), encouragement (one sentence). Return JSON.`;
      userPrompt = `Mood data: ${JSON.stringify(checkins)}`;
    } else {
      return new Response(JSON.stringify({ error: "Unknown action" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const aiResp = await fetch("https://ai-gateway.lovable.dev/v1/chat/completions", {
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
        response_format: { type: "json_object" },
      }),
    });

    const aiData = await aiResp.json();
    const content = aiData.choices?.[0]?.message?.content || "{}";
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch {
      parsed = { raw: content };
    }

    // Store weekly insights if generated
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

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
