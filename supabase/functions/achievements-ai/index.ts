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
      next_steps: `You are a gamification coach. Based on the user's earned achievements, activity data, and stage, suggest the next 3-5 achievable milestones. Return JSON: { "suggestions": [{ "badge_type": string, "title": string, "description": string, "action": string, "estimated_effort": string, "motivation": string }], "encouragement": string, "streak_tip": string }`,

      progress_analysis: `You are an achievement analyst. Analyze the user's badge collection, points, and activity patterns. Return JSON: { "strength_areas": string[], "growth_areas": string[], "achievement_pace": string, "comparison_percentile": number (0-100), "next_milestone_points": number, "personalized_challenge": string, "celebration_message": string }`,

      celebrate: `You are a celebratory coach. The user just earned a new achievement. Generate a personalized celebration message. Return JSON: { "headline": string, "message": string, "fun_fact": string, "next_suggestion": string }`,

      motivation_nudge: `You are a motivational coach on a career and entrepreneurship platform. Based on the user's current streak, points, level, and badge count, provide a personalized motivational nudge. Return JSON: { "nudge_message": string, "suggested_activity": string, "energy_boost": string, "streak_advice": string }`,

      leaderboard_insights: `You are a competitive insights coach. Analyze the user's ranking, points, and badges relative to the leaderboard. Return JSON: { "position_insight": string, "improvement_tips": string[], "peer_comparison": string, "motivational_quote": string, "next_rank_strategy": string }`,

      celebrate_milestone: `You are a milestone celebration specialist. The user hit a significant milestone. Generate an inspiring celebration. Return JSON: { "headline": string, "message": string, "achievement_context": string, "share_suggestion": string, "next_goal": string }`,
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
    const text = data.choices?.[0]?.message?.content || "";
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: text };

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("achievements-ai error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
