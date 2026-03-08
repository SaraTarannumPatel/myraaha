import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { type, userData } = await req.json();

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "recommend_projects": {
        systemPrompt = `You are an AI career project advisor for ShuttlEx. Recommend projects based on user data. Return JSON with: { recommendations: [{ title, description, domain, difficulty, duration, skills_to_practice: string[], why_this_project: string }] }. Give 3-5 recommendations.`;
        userPrompt = `User profile:
- Interests: ${JSON.stringify(userData.interests || [])}
- Skills: ${JSON.stringify(userData.skills || [])}
- Current roadmap goals: ${userData.roadmapGoals || "exploring"}
- Energy patterns: ${userData.energyPatterns || "balanced"}
- Completed projects: ${userData.completedCount || 0}
- Mood: ${userData.mood || "neutral"}

Recommend projects that match their profile and push them to grow.`;
        break;
      }

      case "project_feedback": {
        systemPrompt = `You are an AI project coach. Give constructive feedback on a project submission. Return JSON: { strengths: string[], improvements: string[], next_steps: string[], overall_rating: number (1-10), encouragement: string }`;
        userPrompt = `Project: ${userData.projectTitle}
Description: ${userData.projectDescription}
Skills practiced: ${JSON.stringify(userData.skillsPracticed || [])}
Time spent: ${userData.timeSpent || "unknown"}
Reflection: ${userData.reflection || "none provided"}

Give thoughtful, encouraging feedback.`;
        break;
      }

      case "generate_reflection_prompts": {
        systemPrompt = `You are a reflective learning coach. Generate reflection prompts for after completing a project. Return JSON: { prompts: [{ question: string, category: string }] }. Give 4-5 prompts.`;
        userPrompt = `Project: ${userData.projectTitle}
Domain: ${userData.domain || "general"}
Difficulty: ${userData.difficulty || "intermediate"}
Skills involved: ${JSON.stringify(userData.skills || [])}

Generate meaningful reflection prompts that help the user internalize their learning.`;
        break;
      }

      case "ai_nudge": {
        systemPrompt = `You are a motivational AI coach. Based on user activity, generate a nudge to keep them engaged with projects. Return JSON: { nudge_message: string, suggested_action: string, reason: string }`;
        userPrompt = `User state:
- Last project activity: ${userData.lastActivity || "none"}
- Current mood: ${userData.mood || "neutral"}
- Energy level: ${userData.energy || "medium"}
- Active projects: ${userData.activeProjects || 0}
- Stagnation detected: ${userData.isStagnant || false}

Generate a warm, personalized nudge.`;
        break;
      }

      case "challenge_breakdown": {
        systemPrompt = `You are a project planning AI. Break down a challenge into actionable tasks. Return JSON: { tasks: [{ title: string, description: string, priority: "high"|"medium"|"low", estimated_minutes: number, order: number }] }. Give 5-8 tasks.`;
        userPrompt = `Challenge: ${userData.challengeTitle}
Description: ${userData.challengeDescription}
User skill level: ${userData.skillLevel || "beginner"}
Available time: ${userData.availableTime || "flexible"}

Break this into manageable, progressive tasks.`;
        break;
      }

      default:
        return new Response(JSON.stringify({ error: "Unknown type" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
    }

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
      const status = response.status;
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Credits exhausted" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${status}`);
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

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("project-playground-ai error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
