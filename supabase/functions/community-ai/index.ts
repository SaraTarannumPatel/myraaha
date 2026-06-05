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
      recommend_communities: `You are a startup community matching engine. Based on the founder's profile, interests, challenges, and goals, recommend the most relevant communities for them. Return JSON: { "recommendations": [{ "community_name": string, "reason": string, "expected_benefit": string, "match_score": number }], "networking_tips": string[] }`,

      suggest_post: `You are a community engagement coach. Help the founder craft an engaging post for their community. Based on their topic and context, suggest a well-structured post. Return JSON: { "suggested_title": string, "suggested_content": string, "suggested_tags": string[], "engagement_tips": string[] }`,

      icebreaker: `You are a networking facilitator. Generate icebreaker prompts and discussion starters for a startup community. Return JSON: { "icebreakers": [{ "prompt": string, "category": "introduction"|"challenge"|"celebration"|"advice"|"brainstorm" }], "weekly_theme": string, "discussion_topic": string }`,

      engagement_insights: `You are a community analytics advisor. Analyze the founder's community engagement data and suggest improvements. Return JSON: { "engagement_score": number, "strengths": string[], "improvement_areas": string[], "suggested_actions": [{ "action": string, "expected_impact": string }], "motivation": string }`,
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
    console.error("community-ai error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
