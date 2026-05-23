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
Roadmap progress: ${context.roadmapProgress || 0}%
Journal entries: ${context.journalEntries || 0}
Energy zones: ${JSON.stringify(context.energyZones || [])}
Career stage: ${context.careerStage || "early"}`;
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
Recent interests: ${JSON.stringify(context.recentInterests || [])}
Energy zones: ${JSON.stringify(context.energyZones || [])}
Roadmap milestones completed: ${context.roadmapMilestonesCompleted || 0}
Total roadmap milestones: ${context.totalRoadmapMilestones || 0}`;
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

      case "reflection_analysis":
        systemPrompt = `You are an empathetic career reflection coach. Analyze the user's reflection after a coaching session. Identify patterns, strengths shown, and suggest concrete next actions. Be warm and encouraging.

Return JSON: {
  "reflection_insights": string[],
  "strengths_identified": string[],
  "skills_to_build": string[],
  "next_actions": [{
    "action": string,
    "category": "learning"|"project"|"connection"|"exploration",
    "priority": "high"|"medium"|"low"
  }],
  "growth_note": string,
  "encouragement": string
}`;
        userPrompt = `Reflection: "${context.reflection}"
What excites them: "${context.excitement || "not specified"}"
Action they'll take today: "${context.todayAction || "not specified"}"
What helped them move forward: "${context.whatHelped || "not specified"}"
Current mood: ${context.mood || "neutral"}
Skills: ${JSON.stringify(context.skills || [])}
Goals: ${context.goals || "exploring"}`;
        break;

      case "learning_suggestions":
        systemPrompt = `You are a personalized learning advisor. Based on the user's skills, gaps, interests, and current journey, suggest specific learning resources, courses, certifications, and project ideas. Include mentorship and peer learning suggestions.

Return JSON: {
  "learning_paths": [{
    "title": string,
    "description": string,
    "type": "course"|"certification"|"project"|"workshop",
    "relevance": string,
    "effort": "1 week"|"2 weeks"|"1 month"|"ongoing"
  }],
  "skill_gaps_to_address": [{
    "skill": string,
    "current_level": "beginner"|"intermediate"|"advanced",
    "recommended_action": string
  }],
  "mentor_topics": string[] (topics to discuss with a mentor),
  "peer_activities": string[] (activities to do with peers),
  "encouragement": string
}`;
        userPrompt = `Skills: ${JSON.stringify(context.skills || [])}
Skills in progress: ${JSON.stringify(context.skillsInProgress || [])}
Interests: ${JSON.stringify(context.interests || [])}
Career stage: ${context.careerStage || "early"}
Goals: ${context.goals || "exploring"}
Industry: ${context.industry || "general"}
Recent learning: ${JSON.stringify(context.recentLearning || [])}
Roadmap phase: ${context.roadmapPhase || "exploration"}`;
        break;

      case "decision_dialogue":
        systemPrompt = `You are a career decision facilitator. Help the user weigh their options using structured pros/cons analysis based on their skills, interests, mood data, and career goals. Be balanced, thoughtful, and encouraging.

Return JSON: {
  "decision_summary": string,
  "options_analysis": [{
    "option": string,
    "pros": string[],
    "cons": string[],
    "fit_score": number (0-100),
    "fit_reason": string
  }],
  "recommendation": string,
  "key_questions": string[] (2-3 clarifying questions for the user),
  "encouragement": string
}`;
        userPrompt = `Decision to make: "${context.decision}"
Options: ${JSON.stringify(context.options || [])}
Skills: ${JSON.stringify(context.skills || [])}
Interests: ${JSON.stringify(context.interests || [])}
Mood: ${context.mood || "neutral"}
Career stage: ${context.careerStage || "early"}
Goals: ${context.goals || "exploring"}`;
        break;

      case "mood_energy_insights":
        systemPrompt = `You are a behavioral wellness analyst. Analyze the user's mood and energy patterns to provide personalized insights about their engagement, productivity cycles, and emotional well-being as it relates to career growth.

Return JSON: {
  "mood_summary": string,
  "energy_patterns": [{
    "domain": string,
    "avg_energy": number (1-10),
    "trend": "rising"|"stable"|"declining",
    "insight": string
  }],
  "peak_performance": string,
  "low_energy_advice": string,
  "emotional_strengths": string[],
  "wellbeing_tips": string[],
  "encouragement": string
}`;
        userPrompt = `Recent moods: ${JSON.stringify(context.moodData || [])}
Energy zones: ${JSON.stringify(context.energyZones || [])}
Checkins: ${JSON.stringify(context.checkins || [])}
Skills: ${JSON.stringify(context.skills || [])}
Current mood: ${context.mood || "neutral"}
Current energy: ${context.energy || "moderate"}`;
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
