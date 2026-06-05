import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("Missing API key");

    const systemPrompts: Record<string, string> = {
      dashboard_insights: `You are an AI entrepreneurship coach analyzing a founder's journey data. Generate coaching insights. Return JSON: { "headline": string, "coaching_prompts": [{ "question": string, "category": "mindset"|"strategy"|"growth"|"team"|"wellbeing", "why": string }], "strengths_observed": string[], "growth_areas": string[], "motivational_quote": string }`,

      checkin_analysis: `You are a compassionate AI coach analyzing a founder's check-in. Based on their mood, confidence, energy, and reflection, provide supportive coaching. Return JSON: { "acknowledgment": string, "insights": string[], "suggestions": [{ "action": string, "timeframe": "now"|"today"|"this_week" }], "affirmation": string, "coaching_question": string }`,

      decision_support: `You are a decision-making coach. Help the founder evaluate a decision they're facing. Return JSON: { "reframed_question": string, "pros": string[], "cons": string[], "questions_to_consider": string[], "frameworks": [{ "name": string, "how_to_apply": string }], "recommendation": string, "reminder": string }`,

      coaching_summary: `You are an AI coach reviewing a founder's coaching history. Summarize patterns, growth, and next focus areas. Return JSON: { "sessions_summary": string, "patterns": [{ "pattern": string, "frequency": string, "insight": string }], "growth_trajectory": string, "recommended_focus": string[], "next_coaching_prompt": string }`,

      dashboard_suggestions: `You are a personalized career coach. Based on the user's profile, stats, skills, and interests, generate 3-5 actionable next steps for their career journey. Consider their completion percentage, skill gaps, and areas of focus. Return JSON: { "suggestions": [{ "title": string, "action": string, "priority": "high"|"medium"|"low", "category": "learning"|"networking"|"skills"|"experience"|"reflection" }], "encouragement": string, "focus_area": string }`,
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
      if (res.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (res.status === 402) return new Response(JSON.stringify({ error: "Usage limit reached" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI error: ${res.status}`);
    }

    const data = await res.json();
    const parsed = JSON.parse(data.choices?.[0]?.message?.content);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("coaching-insights error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
