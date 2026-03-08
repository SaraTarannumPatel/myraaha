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
      case "alignment_score":
        systemPrompt = `You are a career alignment analyst. Calculate a Decision Alignment Score (0-100) based on the user's goals, skills, mood, energy patterns, and recent activities. Break it down by factors.

Return JSON: {
  "overall_score": number (0-100),
  "status": "on_track"|"some_gaps"|"needs_attention",
  "factors": [{
    "name": string,
    "score": number (0-100),
    "status": "green"|"yellow"|"red",
    "detail": string
  }],
  "top_strength": string,
  "biggest_gap": string,
  "recommendation": string,
  "encouragement": string
}`;
        userPrompt = `Skills: ${JSON.stringify(context.skills || [])}
Interests: ${JSON.stringify(context.interests || [])}
Goals: ${context.goals || "exploring"}
Mood: ${context.mood || "neutral"}
Energy: ${context.energy || "moderate"}
Completed tasks: ${context.completedTasks || 0}
Active projects: ${context.activeProjects || 0}
Learning streak: ${context.learningStreak || 0} days
Roadmap progress: ${context.roadmapProgress || 0}%`;
        break;

      case "reroute":
        systemPrompt = `You are a career re-routing advisor. The user's alignment is off. Suggest alternate paths, adjusted milestones, and confidence-building steps. Be empathetic and empowering.

Return JSON: {
  "reroute_summary": string,
  "alternate_paths": [{
    "title": string,
    "description": string,
    "type": "learning"|"project"|"mentor"|"milestone",
    "effort": "light"|"medium"|"deep",
    "expected_impact": string
  }],
  "quick_wins": string[] (3 things they can do today),
  "adjusted_milestones": [{
    "milestone": string,
    "adjusted_timeline": string,
    "reason": string
  }],
  "encouragement": string
}`;
        userPrompt = `Current alignment: ${context.alignmentScore || 50}%
Weak areas: ${JSON.stringify(context.weakAreas || [])}
Skills: ${JSON.stringify(context.skills || [])}
Interests: ${JSON.stringify(context.interests || [])}
Mood: ${context.mood || "uncertain"}
Recent activity: ${context.recentActivity || "low"}`;
        break;

      case "progress_snapshot":
        systemPrompt = `You are a career progress analyst. Create a comprehensive progress snapshot showing the user's growth, achievements, and trajectory.

Return JSON: {
  "growth_summary": string,
  "skills_developed": number,
  "tasks_completed": number,
  "mood_trend": "improving"|"stable"|"declining",
  "highlights": string[] (top 3 achievements),
  "areas_of_growth": string[],
  "next_milestones": [{
    "title": string,
    "progress": number (0-100),
    "steps_remaining": string
  }],
  "weekly_insight": string,
  "motivation_message": string
}`;
        userPrompt = `Skills count: ${context.skillsCount || 0}
Completed skills: ${context.completedSkills || 0}
Projects done: ${context.projectsDone || 0}
Journal entries: ${context.journalEntries || 0}
Achievements: ${context.achievements || 0}
Days active: ${context.daysActive || 0}
Mood data: ${JSON.stringify(context.moodData || [])}
Recent interests: ${JSON.stringify(context.recentInterests || [])}`;
        break;

      case "backtrack_paths":
        systemPrompt = `You are an empathetic career guide. The user feels stuck. Provide safe backtrack options — temporary step-back tasks, re-engagement ideas, and past successes to revisit. Never make them feel like they've failed.

Return JSON: {
  "empathy_message": string,
  "step_back_tasks": [{
    "title": string,
    "description": string,
    "why_it_helps": string,
    "duration": string
  }],
  "re_engagement_ideas": string[],
  "past_wins_to_revisit": string[],
  "gentle_next_step": string
}`;
        userPrompt = `User feels: ${context.feeling || "stuck"}
Last active: ${context.lastActive || "recently"}
Past achievements: ${JSON.stringify(context.pastAchievements || [])}
Skills practiced: ${JSON.stringify(context.skills || [])}
Energy level: ${context.energy || "low"}`;
        break;

      default:
        throw new Error("Unknown type: " + type);
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limited." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: content };
    } catch { parsed = { raw: content }; }

    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("career-coach-insights error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
