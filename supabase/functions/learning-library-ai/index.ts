import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getAuthUser, unauthorized } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const user = await getAuthUser(req);
  if (!user) return unauthorized();


  try {
    const { type, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "recommend_learning":
        systemPrompt = `You are a personalized learning advisor for career development. Based on the user's profile, interests, goals, AND their cross-module signals (keywords from other modules like Curiosity Compass, AI Roadmaps, Job Matching, etc.), suggest 8 highly relevant learning recommendations.

CRITICAL: Recommendations must include REAL external learning resources — actual courses from Coursera, Udemy, Khan Academy, YouTube channels, specific books, research papers, blogs, and websites. Include actual URLs when possible. Do NOT make up random suggestions — they must be grounded in real, popular learning content.

All monetary values must be in INR (₹). Convert any USD values to INR.

Return JSON: { 
  "recommendations": [{ 
    "title": string, 
    "type": "course"|"video"|"article"|"book"|"research_paper"|"website"|"app",
    "reason": string (why this fits them based on their signals),
    "priority": "high"|"medium"|"low",
    "estimated_time": string,
    "skills_gained": string[],
    "source": string (e.g., "Coursera", "YouTube", "Book"),
    "url": string (external link to the resource),
    "cost": string (e.g., "Free", "₹500", "₹3,000")
  }], 
  "learning_focus": string (their primary learning direction derived from ALL module signals),
  "next_milestone": string (what they should aim for),
  "advice": string (motivational guidance),
  "signal_based_insights": string[] (insights derived from their cross-module activity)
}`;
        userPrompt = `User profile:
- Industry interest: ${context.industry || 'exploring'}
- Skills: ${JSON.stringify(context.skills || [])}
- Interests: ${JSON.stringify(context.interests || [])}
- Career stage: ${context.careerStage || 'early'}
- Short-term goals: ${context.shortTermGoals || 'learn and explore'}
- Long-term goals: ${context.longTermGoals || 'build a meaningful career'}
- Tracks completed: ${context.tracksCompleted || 0}
- Capsules completed: ${context.capsulesCompleted || 0}
- Recent domains explored: ${JSON.stringify(context.recentDomains || [])}
- Cross-module signals (keywords from Curiosity Compass, Roadmaps, Job Matching, etc.): ${JSON.stringify(context.crossModuleSignals || [])}
- Active in modules: ${JSON.stringify(context.signalSources || [])}`;
        break;

      case "skill_mapping":
        systemPrompt = `You are a career skill mapping expert. Analyze the user's skills and map them to real-world applications, career roles, and growth opportunities.

Return JSON: { 
  "mappings": [{ 
    "skill": string, 
    "applicable_roles": string[] (3-4 job titles),
    "startup_applications": string[] (2-3 ways to use in entrepreneurship),
    "project_ideas": string[] (2-3 hands-on projects),
    "growth_potential": "high"|"medium"|"low"
  }], 
  "skill_gaps": string[] (important skills they should develop),
  "strongest_combination": string (their unique skill blend),
  "recommended_path": string (suggested career direction)
}`;
        userPrompt = `User skills: ${JSON.stringify(context.skills || [])}
Industry focus: ${context.industry || 'general'}
Career interests: ${JSON.stringify(context.interests || [])}
Experience level: ${context.experienceLevel || 'beginner'}`;
        break;

      case "generate_quiz":
        systemPrompt = `You are an educational content creator. Generate an engaging 5-question quiz to test and reinforce understanding of the given topic. Questions should be practical and applicable, not just theoretical.

Return JSON: { 
  "quiz_title": string,
  "questions": [{ 
    "question": string, 
    "options": string[] (4 options),
    "correct_index": number (0-3),
    "explanation": string (why this answer is correct),
    "skill_tested": string
  }],
  "passing_score": number,
  "completion_message": string
}`;
        userPrompt = `Topic: "${context.topic}"
Difficulty: ${context.difficulty || 'beginner'}
Focus area: ${context.focusArea || 'practical application'}`;
        break;

      case "learning_path_suggestion":
        systemPrompt = `You are a learning path architect. Based on the user's goals and current progress, design a personalized 4-week learning plan with specific milestones.

Return JSON: {
  "path_title": string,
  "path_description": string,
  "weeks": [{
    "week_number": number,
    "theme": string,
    "goals": string[],
    "activities": [{
      "type": "track"|"capsule"|"project"|"reflection",
      "title": string,
      "duration": string,
      "outcome": string
    }]
  }],
  "expected_outcomes": string[],
  "success_metrics": string[]
}`;
        userPrompt = `User goal: ${context.goal || 'career growth'}
Current skills: ${JSON.stringify(context.skills || [])}
Available time per week: ${context.hoursPerWeek || 5} hours
Focus domain: ${context.domain || 'general'}
Learning style preference: ${context.learningStyle || 'mixed'}`;
        break;

      case "content_reflection":
        systemPrompt = `You are a thoughtful learning coach. Based on the content the user just completed, generate personalized reflection prompts and next-step suggestions.

Return JSON: {
  "reflection_prompts": string[] (3 thought-provoking questions),
  "key_takeaways": string[] (3 main learnings),
  "application_ideas": string[] (2-3 ways to apply this),
  "next_content": [{
    "title": string,
    "reason": string
  }],
  "encouragement": string
}`;
        userPrompt = `Content completed: "${context.contentTitle}"
Content type: ${context.contentType || 'track'}
User's current focus: ${context.currentFocus || 'general learning'}
Skills being developed: ${JSON.stringify(context.skills || [])}`;
        break;

      case "challenge_suggestion":
        systemPrompt = `You are a practical learning facilitator. Suggest a real-world challenge or mini-project that helps the user apply what they've learned.

Return JSON: {
  "challenge_title": string,
  "challenge_description": string,
  "difficulty": "easy"|"medium"|"hard",
  "estimated_time": string,
  "steps": string[] (4-6 steps),
  "deliverables": string[],
  "skills_applied": string[],
  "bonus_stretch": string
}`;
        userPrompt = `Skills to apply: ${JSON.stringify(context.skills || [])}
Domain: ${context.domain || 'general'}
User's experience level: ${context.level || 'beginner'}
Available time: ${context.availableTime || '2-3 hours'}`;
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
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limited. Please try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Credits exhausted. Please add funds." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
    console.error("learning-library error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
