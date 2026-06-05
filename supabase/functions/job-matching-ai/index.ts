import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getAuthUser, unauthorized } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const user = await getAuthUser(req);
  if (!user) return unauthorized();


  try {
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    const { type, userData } = await req.json();

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "smart_match": {
        systemPrompt = `You are an AI career matching advisor for MyRaaha. Calculate fit scores and match users to job opportunities. Return JSON: { matches: [{ opportunity_title: string, fit_score: number (0-100), fit_breakdown: { skills_match: number, experience_match: number, energy_fit: number, roadmap_alignment: number }, strengths: string[], gaps: string[], recommendation: string }] }. Analyze 3-5 matches.`;
        userPrompt = `User profile:
- Skills: ${JSON.stringify(userData.skills || [])}
- Interests: ${JSON.stringify(userData.interests || [])}
- Experience level: ${userData.experienceLevel || "entry"}
- Energy patterns: ${userData.energyPatterns || "balanced"}
- Mood: ${userData.mood || "neutral"}
- Completed projects: ${userData.completedProjects || 0}
- Learning history: ${JSON.stringify(userData.learningHistory || [])}

Available opportunities:
${JSON.stringify(userData.opportunities || [])}

Calculate detailed fit scores and provide actionable insights.`;
        break;
      }

      case "career_exploration": {
        systemPrompt = `You are an AI career exploration guide. Provide deep insights into a career path. Return JSON: { insights: { overview: string, day_in_life: string, skills_roadmap: [{ skill: string, importance: string, how_to_learn: string }], salary_progression: string, industry_outlook: string, tips: string[], related_paths: string[] } }`;
        userPrompt = `Career path: ${userData.careerTitle}
Domain: ${userData.domain || "general"}
User's current skills: ${JSON.stringify(userData.currentSkills || [])}
User's interests: ${JSON.stringify(userData.interests || [])}

Provide comprehensive career exploration insights.`;
        break;
      }

      case "problem_solution_match": {
        systemPrompt = `You are a Problem-Solution Matchmaker AI. Match user skills with company challenges. Return JSON: { matches: [{ challenge_title: string, match_score: number (0-100), why_good_fit: string, skills_applied: string[], learning_needed: string[], suggested_mentors_topics: string[] }] }`;
        userPrompt = `User skills: ${JSON.stringify(userData.skills || [])}
User interests: ${JSON.stringify(userData.interests || [])}
User projects: ${JSON.stringify(userData.projects || [])}

Company challenges:
${JSON.stringify(userData.challenges || [])}

Match the user with the most suitable challenges.`;
        break;
      }

      case "application_prep": {
        systemPrompt = `You are an AI application coach. Help users prepare for job applications. Return JSON: { checklist: [{ item: string, status: string, tip: string }], cover_note_suggestions: string[], interview_topics: string[], skills_to_highlight: string[], improvement_areas: string[] }`;
        userPrompt = `Opportunity: ${userData.opportunityTitle}
Required skills: ${JSON.stringify(userData.requiredSkills || [])}
User skills: ${JSON.stringify(userData.userSkills || [])}
User experience: ${userData.experience || "entry level"}

Prepare a comprehensive application guide.`;
        break;
      }

      case "opportunity_nudge": {
        systemPrompt = `You are a career opportunity nudge AI. Generate personalized nudges to encourage users to explore or apply. Return JSON: { nudge_message: string, suggested_opportunity_type: string, reason: string, action: string }`;
        userPrompt = `User state:
- Active applications: ${userData.activeApplications || 0}
- Last activity: ${userData.lastActivity || "none"}
- Mood: ${userData.mood || "neutral"}
- Skills growing: ${JSON.stringify(userData.growingSkills || [])}
- Stagnation: ${userData.isStagnant || false}

Generate a warm, motivating nudge.`;
        break;
      }

      case "reflection_after_apply": {
        systemPrompt = `You are a reflective career coach. Generate reflection prompts after a user applies or explores opportunities. Return JSON: { prompts: [{ question: string, category: string }], next_steps: string[], encouragement: string }`;
        userPrompt = `User applied to: ${userData.opportunityTitle}
Role type: ${userData.roleType || "general"}
Fit score: ${userData.fitScore || "unknown"}
User skills: ${JSON.stringify(userData.skills || [])}

Generate meaningful reflection prompts.`;
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
      if (status === 429) return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (status === 402) return new Response(JSON.stringify({ error: "Credits exhausted, please add funds." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
    console.error("job-matching-ai error:", e);
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
