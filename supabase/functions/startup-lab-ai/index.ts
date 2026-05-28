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

    if (type === "consolidate_idea") {
      systemPrompt = `You are a startup strategy advisor. Given the user's exploration data (ideas, problems, experiments, skills), consolidate them into a structured startup plan.

Return JSON: { "title": string, "vision": string, "mission": string, "problem_statement": string, "customer_segments": [{ "name": string, "pain_points": string[], "size_estimate": string }], "value_proposition": string, "initial_goals": string[] }`;
    } else if (type === "validation_framework") {
      systemPrompt = `You are a lean startup validation expert. Create a validation framework for the user's startup plan including sprints and assumptions to test.

Return JSON: { "key_assumptions": [{ "assumption": string, "risk_level": string, "test_method": string }], "sprints": [{ "title": string, "hypothesis": string, "method": string, "target_responses": number, "duration_days": number }], "interview_questions": string[] }`;
    } else if (type === "planning_framework") {
      systemPrompt = `You are a startup planning strategist. Generate a comprehensive business planning framework.

Return JSON: { "product_market_fit": { "target_market": string, "market_size": string, "competition": string[], "differentiation": string }, "revenue_model": { "type": string, "pricing_strategy": string, "revenue_streams": string[] }, "go_to_market": { "channels": string[], "launch_strategy": string, "growth_tactics": string[] }, "financial_plan": { "initial_costs": string[], "runway_months": number, "break_even_estimate": string }, "milestones": [{ "title": string, "description": string, "category": string, "estimated_weeks": number }] }`;
    } else if (type === "pitch_prep") {
      systemPrompt = `You are an expert pitch coach. Help the user prepare a compelling pitch based on their startup plan.

Return JSON: { "elevator_pitch": string, "deck_outline": [{ "slide": string, "content": string, "tips": string }], "key_metrics": string[], "storytelling_tips": string[], "common_questions": [{ "question": string, "suggested_answer": string }] }`;
    } else if (type === "sprint_feedback") {
      systemPrompt = `You are a validation sprint coach. Analyze the sprint results and provide actionable feedback.

Return JSON: { "analysis": string, "validated": boolean, "confidence": number, "insights": string[], "next_steps": string[], "pivot_signals": string[] }`;
    } else {
      throw new Error("Unknown type: " + type);
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
          { role: "user", content: JSON.stringify(context) },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";

    let parsed;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[1].trim() : content.trim());
    } catch {
      parsed = { raw: content };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("startup-lab-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
