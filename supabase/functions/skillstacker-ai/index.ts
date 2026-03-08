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

    const prompts: Record<string, { system: string; user: string }> = {
      generate_stack: {
        system: `You are an adaptive skill engine for career and entrepreneurship development. Generate a personalized skill stack based on the user's interests, goals, current capabilities, and career stage. Group skills into core (must-have), supporting (nice-to-have), and exploration (test before committing).

Return JSON: {
  "stack_title": string,
  "domain": string,
  "confidence_message": string (reassuring, anxiety-reducing message),
  "skills": [{
    "skill_name": string (plain language),
    "category": "core"|"supporting"|"exploration",
    "why_it_matters": string (1-2 sentences),
    "where_it_applies": string[] (jobs, startups, freelancing, real problems),
    "effort_level": "light"|"medium"|"deep",
    "learning_suggestions": string[] (2-3 specific resources/topics),
    "application_tasks": [{
      "title": string,
      "description": string,
      "task_type": "practice"|"project"|"challenge"|"real-world"
    }]
  }],
  "readiness_insights": string,
  "next_milestone": string
}`,
        user: `User profile:
- Interests: ${JSON.stringify(context.interests || [])}
- Current skills: ${JSON.stringify(context.currentSkills || [])}
- Career stage: ${context.careerStage || 'exploring'}
- Selected domains: ${JSON.stringify(context.domains || [])}
- Goals: ${context.goals || 'build capability'}
- Active intent: ${context.intent || 'career'}
- Energy patterns: ${context.energyPatterns || 'unknown'}
- Confidence level: ${context.confidenceLevel || 'moderate'}`,
      },

      restack: {
        system: `You are a skill re-prioritization engine. The user's interests or direction have changed. Re-evaluate their current skill stack and suggest updates: re-prioritize, archive irrelevant skills, and suggest new skill clusters. Nothing should be deleted — only evolved.

Return JSON: {
  "updated_skills": [{
    "skill_name": string,
    "action": "keep"|"reprioritize"|"archive"|"new",
    "new_category": "core"|"supporting"|"exploration",
    "reason": string,
    "new_effort_level": "light"|"medium"|"deep"
  }],
  "new_skills": [{
    "skill_name": string,
    "category": "core"|"supporting"|"exploration",
    "why_it_matters": string,
    "where_it_applies": string[],
    "effort_level": "light"|"medium"|"deep",
    "learning_suggestions": string[],
    "application_tasks": [{ "title": string, "description": string, "task_type": "practice"|"project"|"challenge"|"real-world" }]
  }],
  "pivot_summary": string,
  "encouragement": string
}`,
        user: `Current skills: ${JSON.stringify(context.currentSkills || [])}
New interests: ${JSON.stringify(context.newInterests || [])}
New direction: ${context.newDirection || 'exploring'}
Previous domain: ${context.previousDomain || 'general'}
Reason for change: ${context.reason || 'natural evolution'}
Skill statuses: ${JSON.stringify(context.skillStatuses || [])}`,
      },

      confidence_analysis: {
        system: `You are a skill confidence and energy coach. Analyze the user's checkpoint data and provide insights on their learning patterns, energy zones, and skill-confidence trajectory.

Return JSON: {
  "overall_confidence_trend": "rising"|"stable"|"declining",
  "energy_summary": string,
  "strengths": string[],
  "growth_areas": string[],
  "recommendations": [{ "skill": string, "suggestion": string, "priority": "high"|"medium"|"low" }],
  "encouragement": string,
  "next_checkpoint_focus": string
}`,
        user: `Checkpoints: ${JSON.stringify(context.checkpoints || [])}
Skills in progress: ${JSON.stringify(context.skillsInProgress || [])}
Recent energy patterns: ${JSON.stringify(context.energyPatterns || [])}
Days active: ${context.daysActive || 0}`,
      },

      skill_fit_analysis: {
        system: `You are a skill vs fit analyzer. Compare the user's skill progress against real-world role requirements and industry demand. Show where they're strong, where gaps exist, and what opportunities become viable.

Return JSON: {
  "fit_scores": [{
    "role_or_opportunity": string,
    "fit_percentage": number (0-100),
    "matching_skills": string[],
    "missing_skills": string[],
    "estimated_time_to_ready": string
  }],
  "strongest_fit": string,
  "biggest_gap": string,
  "action_plan": string[],
  "market_insight": string
}`,
        user: `User skills: ${JSON.stringify(context.skills || [])}
Skill levels: ${JSON.stringify(context.skillLevels || [])}
Target domain: ${context.domain || 'general'}
Career stage: ${context.careerStage || 'early'}
Intent: ${context.intent || 'career'}`,
      },

      application_task_suggest: {
        system: `You are a practical skill application facilitator. Suggest 3 real-world micro-tasks that help the user practice and apply a specific skill. Tasks should be achievable in 30-90 minutes each.

Return JSON: {
  "tasks": [{
    "title": string,
    "description": string,
    "task_type": "practice"|"project"|"challenge"|"real-world",
    "estimated_minutes": number,
    "expected_outcome": string,
    "skill_reinforced": string
  }],
  "motivation": string
}`,
        user: `Skill: ${context.skillName || 'general'}
User level: ${context.level || 'beginner'}
Domain: ${context.domain || 'general'}
Previous tasks completed: ${context.tasksCompleted || 0}`,
      },

      opportunity_readiness: {
        system: `You are an opportunity readiness analyst. Based on the user's validated and in-progress skills, determine which career/startup/freelance opportunities they are becoming ready for. Be specific and encouraging.

Return JSON: {
  "ready_now": [{ "opportunity": string, "type": "job"|"freelance"|"startup"|"project", "confidence": number, "key_skills": string[] }],
  "almost_ready": [{ "opportunity": string, "type": string, "missing": string[], "time_to_ready": string }],
  "emerging": [{ "opportunity": string, "skills_building": string[], "potential": string }],
  "readiness_score": number (0-100),
  "next_unlock": string,
  "message": string
}`,
        user: `Validated skills: ${JSON.stringify(context.validatedSkills || [])}
In-progress skills: ${JSON.stringify(context.inProgressSkills || [])}
Domain: ${context.domain || 'general'}
Career stage: ${context.careerStage || 'early'}
Intent: ${context.intent || 'career'}
Total skills: ${context.totalSkills || 0}`,
      },

      resume_sync: {
        system: `You are a resume narrative builder. Given the user's validated skills and their context, generate a concise professional skill narrative and key highlights suitable for a living resume.

Return JSON: {
  "skill_narrative": string (2-3 sentences summarizing capability),
  "highlights": [{ "skill": string, "achievement": string, "impact": string }],
  "suggested_headline_update": string,
  "growth_story": string (1-2 sentences about learning journey)
}`,
        user: `Validated skills: ${JSON.stringify(context.validatedSkills || [])}
Applied skills: ${JSON.stringify(context.appliedSkills || [])}
Domain: ${context.domain || 'general'}
Checkpoints completed: ${context.checkpointsCount || 0}
Tasks completed: ${context.tasksCompleted || 0}`,
      },
    };

    const prompt = prompts[type];
    if (!prompt) throw new Error("Unknown type: " + type);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: prompt.system }, { role: "user", content: prompt.user }],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limited. Please try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Credits exhausted. Please add funds." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI gateway error: " + response.status);
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
    console.error("skillstacker error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
