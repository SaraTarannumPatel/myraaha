import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { mode, profile, boards, items, theme } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("Missing API key");

    const systemPrompts: Record<string, string> = {
      suggest_items: `You are a creative moodboard coach for entrepreneurs. Based on the user's profile and existing boards, suggest 5 inspirational items they could add. Return JSON: { "suggestions": [{ "title": string, "content": string, "content_type": "quote"|"text"|"link", "tags": string[], "why": string }] }`,
      suggest_boards: `You are a startup moodboard strategist. Suggest 4 new board themes the user should create based on their profile and journey. Return JSON: { "boards": [{ "title": string, "description": string, "theme": string, "suggested_tags": string[] }] }`,
      reflection_prompt: `You are an empathetic entrepreneurship reflection guide. Based on the user's moodboard items and emotional notes, generate a thoughtful reflection prompt. Return JSON: { "prompt": string, "follow_ups": string[], "insight": string }`,
      community_inspiration: `You are a community curator. Generate 5 trending inspiration items that founders commonly find valuable. Return JSON: { "trending": [{ "title": string, "content": string, "content_type": "quote"|"text", "tags": string[], "category": string }] }`,
    };

    const systemPrompt = systemPrompts[mode] || systemPrompts.suggest_items;

    const userContent = JSON.stringify({
      profile: profile || {},
      existing_boards: boards || [],
      existing_items: items || [],
      theme: theme || "general",
    });

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userContent },
        ],
        response_format: { type: "json_object" },
      }),
    });

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content || "{}");

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
