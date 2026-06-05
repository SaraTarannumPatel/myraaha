import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { type, context } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("Missing API key");

    const systemPrompts: Record<string, string> = {
      guidance: `You are a compassionate startup mentor. A founder needs help with a specific challenge. Provide:
1. Empathetic acknowledgment of their situation
2. 3-5 actionable steps to address the challenge
3. Relevant frameworks or mental models
4. Emotional encouragement
Return JSON: { "acknowledgment": string, "action_steps": [{ "title": string, "description": string, "priority": "immediate"|"short_term"|"long_term" }], "frameworks": [{ "name": string, "description": string }], "encouragement": string, "recommended_resources": string[] }`,

      action_plan: `You are a strategic startup advisor. Given the founder's challenges, profile data, and current startup state, create a personalized action plan. Return JSON: { "plan_title": string, "timeframe": string, "phases": [{ "name": string, "duration": string, "tasks": [{ "task": string, "category": string, "priority": "high"|"medium"|"low" }] }], "success_metrics": string[], "potential_blockers": string[] }`,

      crisis_support: `You are a compassionate founder wellness coach. A founder is experiencing high stress, burnout, or decision paralysis. Provide gentle, empathetic support. Return JSON: { "validation": string, "breathing_exercise": string, "reframe_prompts": string[], "immediate_actions": [{ "action": string, "why": string }], "affirmations": string[], "when_to_seek_help": string }`,

      encouragement: `You are an encouraging mentor. Based on the founder's recent activity and achievements, generate personalized encouragement nudges. Return JSON: { "nudges": [{ "type": "celebration"|"reflection"|"motivation"|"tip", "message": string, "emoji": string }] }`,

      expert_match: `You are a startup ecosystem connector. Based on the founder's challenge, suggest types of mentors, communities, and resources that would be most helpful. Return JSON: { "mentor_types": [{ "expertise": string, "why_helpful": string, "what_to_ask": string[] }], "community_suggestions": [{ "type": string, "focus": string }], "resource_types": string[] }`,

      wellness_check: `You are a founder wellness analyst. Based on the founder's support history, mood patterns, and activity data, assess their wellbeing and provide insights. Return JSON: { "wellness_score": 0-100, "mood_trend": "improving"|"stable"|"declining", "strengths": string[], "risk_areas": string[], "recommendations": [{ "area": string, "suggestion": string }], "daily_practice": string }`,
    };

    const systemPrompt = systemPrompts[type];
    if (!systemPrompt) throw new Error(`Unknown type: ${type}`);

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(context) },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      if (res.status === 429) return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (res.status === 402) return new Response(JSON.stringify({ error: "Usage limit reached." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${res.status}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("startup-support-ai error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
