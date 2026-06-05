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
      case "startup_snapshot": {
        systemPrompt = `You are a startup analyst. Analyze the startup's data and provide a comprehensive snapshot. Return JSON: { "health_score": number (0-100), "stage": string, "strengths": string[], "weaknesses": string[], "competitive_advantages": string[], "risk_factors": string[], "summary": string }`;
        userPrompt = `Analyze this startup:\nIdea: ${JSON.stringify(context.idea)}\nLab Plans: ${JSON.stringify(context.labPlans)}\nExperiments: ${JSON.stringify(context.experiments)}\nMilestones: ${JSON.stringify(context.milestones)}\nValidation Sprints: ${JSON.stringify(context.sprints)}\nFounder Profile: ${JSON.stringify(context.founderProfile)}`;
        break;
      }
      case "customer_insights": {
        systemPrompt = `You are a customer research expert for startups. Analyze existing data and generate customer insights. Return JSON: { "primary_segments": [{ "name": string, "pain_points": string[], "needs": string[], "size_estimate": string }], "customer_personas": [{ "name": string, "description": string, "behaviors": string[] }], "value_propositions": string[], "acquisition_channels": string[] }`;
        userPrompt = `Generate customer insights for:\nIdea: ${JSON.stringify(context.idea)}\nProblem Observations: ${JSON.stringify(context.observations)}\nValidation Data: ${JSON.stringify(context.sprints)}\nExperiments: ${JSON.stringify(context.experiments)}`;
        break;
      }
      case "team_mapping": {
        systemPrompt = `You are a startup team strategist. Analyze the founder's skills and suggest optimal team structure. Return JSON: { "current_coverage": [{ "area": string, "strength": string, "owner": string }], "gaps": [{ "role": string, "skills_needed": string[], "priority": string, "reason": string }], "recommended_hires": [{ "title": string, "key_skills": string[], "when": string }], "task_alignment": [{ "task": string, "best_fit_skill": string, "confidence": string }] }`;
        userPrompt = `Analyze team needs:\nFounder Profile: ${JSON.stringify(context.founderProfile)}\nSkills: ${JSON.stringify(context.skills)}\nIdea: ${JSON.stringify(context.idea)}\nLab Plans: ${JSON.stringify(context.labPlans)}\nMilestones: ${JSON.stringify(context.milestones)}`;
        break;
      }
      case "growth_plan": {
        systemPrompt = `You are a startup growth strategist. Create a growth plan based on current progress. Return JSON: { "current_stage": string, "next_stage": string, "funding_readiness": number (0-100), "growth_actions": [{ "action": string, "timeline": string, "impact": string, "category": string }], "funding_strategy": string, "pitch_points": string[], "scaling_risks": string[], "key_metrics_to_track": string[] }`;
        userPrompt = `Create growth plan:\nIdea: ${JSON.stringify(context.idea)}\nLab Plans: ${JSON.stringify(context.labPlans)}\nExperiments: ${JSON.stringify(context.experiments)}\nMilestones: ${JSON.stringify(context.milestones)}\nSprints: ${JSON.stringify(context.sprints)}\nFounder: ${JSON.stringify(context.founderProfile)}`;
        break;
      }
      case "challenges_learning": {
        systemPrompt = `You are a startup learning advisor. Identify challenges and recommend learning resources. Return JSON: { "active_challenges": [{ "challenge": string, "severity": string, "category": string }], "knowledge_gaps": [{ "topic": string, "relevance": string, "suggested_resources": string[] }], "mentor_topics": string[], "peer_collaboration_ideas": string[], "immediate_learning": string[] }`;
        userPrompt = `Identify challenges and learning needs:\nIdea: ${JSON.stringify(context.idea)}\nLab Plans: ${JSON.stringify(context.labPlans)}\nExperiments: ${JSON.stringify(context.experiments)}\nSkills: ${JSON.stringify(context.skills)}\nLearning Progress: ${JSON.stringify(context.learning)}\nFounder: ${JSON.stringify(context.founderProfile)}`;
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
    return new Response(JSON.stringify({ error: e.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
