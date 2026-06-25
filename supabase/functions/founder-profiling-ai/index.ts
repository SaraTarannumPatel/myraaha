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

    const { type, context } = await req.json();

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "profile_insights": {
        systemPrompt = `You are an entrepreneurial profiling expert. Analyze the founder's data and provide deep insights about their entrepreneurial identity, strengths, growth areas, and behavioral patterns. Return JSON: { "identity_summary": string, "top_strengths": string[], "growth_areas": string[], "leadership_style": string, "decision_pattern": string, "entrepreneurial_archetype": string, "confidence_level": number (0-100) }`;
        userPrompt = `Analyze this founder's profile data:\n\nProfile: ${JSON.stringify(context.profile)}\nSkills: ${JSON.stringify(context.skills)}\nMindset Habits: ${JSON.stringify(context.habits)}\nChallenges Completed: ${JSON.stringify(context.challenges)}\nProjects: ${JSON.stringify(context.projects)}\nPath Selections: ${JSON.stringify(context.paths)}`;
        break;
      }
      case "skill_evolution": {
        systemPrompt = `You are a skill development analyst for entrepreneurs. Analyze how the founder's skills have evolved through their projects, learning, and experiments. Return JSON: { "skill_trajectory": [{ "skill": string, "current_level": string, "growth_rate": string, "applied_in": string[] }], "emerging_strengths": string[], "skill_gaps": string[], "recommended_focus": string[] }`;
        userPrompt = `Analyze skill evolution:\nSkills: ${JSON.stringify(context.skills)}\nProjects: ${JSON.stringify(context.projects)}\nExperiments: ${JSON.stringify(context.experiments)}\nLearning Progress: ${JSON.stringify(context.learning)}\nMilestones: ${JSON.stringify(context.milestones)}`;
        break;
      }
      case "mindset_analysis": {
        systemPrompt = `You are a behavioral psychologist specializing in entrepreneurship. Analyze the founder's mindset patterns from their habits, challenges, and decision-making history. Return JSON: { "resilience_score": number (0-100), "leadership_traits": string[], "decision_style": string, "risk_tolerance": string, "growth_mindset_indicators": string[], "areas_for_reflection": string[], "behavioral_patterns": [{ "pattern": string, "evidence": string, "impact": string }] }`;
        userPrompt = `Analyze mindset patterns:\nHabits: ${JSON.stringify(context.habits)}\nChallenges: ${JSON.stringify(context.challenges)}\nPath Decisions: ${JSON.stringify(context.paths)}\nExperiments: ${JSON.stringify(context.experiments)}\nProfile: ${JSON.stringify(context.profile)}`;
        break;
      }
      case "next_steps": {
        systemPrompt = `You are a startup mentor providing personalized next-step recommendations. Based on the founder's current progress, suggest concrete actions they should take next. Return JSON: { "immediate_actions": [{ "action": string, "reason": string, "feature": string }], "weekly_goals": string[], "monthly_objectives": string[], "recommended_learning": string[], "collaboration_suggestions": string[] }`;
        userPrompt = `Suggest next steps based on:\nProfile: ${JSON.stringify(context.profile)}\nSkills: ${JSON.stringify(context.skills)}\nProjects: ${JSON.stringify(context.projects)}\nMilestones: ${JSON.stringify(context.milestones)}\nExperiments: ${JSON.stringify(context.experiments)}\nLearning: ${JSON.stringify(context.learning)}\nAchievements: ${JSON.stringify(context.achievements)}`;
        break;
      }
      case "journey_narrative": {
        systemPrompt = `You are a storytelling expert for entrepreneurs. Create a compelling narrative of the founder's journey so far, highlighting key moments, growth, and transformation. Return JSON: { "narrative": string, "key_moments": [{ "title": string, "description": string, "impact": string }], "themes": string[], "growth_story": string }`;
        userPrompt = `Create a journey narrative:\nProfile: ${JSON.stringify(context.profile)}\nAchievements: ${JSON.stringify(context.achievements)}\nProjects: ${JSON.stringify(context.projects)}\nMilestones: ${JSON.stringify(context.milestones)}\nExperiments: ${JSON.stringify(context.experiments)}\nPaths: ${JSON.stringify(context.paths)}\nChallenges: ${JSON.stringify(context.challenges)}`;
        break;
      }
      default:
        return new Response(JSON.stringify({ error: "Invalid type" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
      }),
    });

    if (response.status === 429) {
      return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (response.status === 402) {
      return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    if (!response.ok) {
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: text };

    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("Error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
