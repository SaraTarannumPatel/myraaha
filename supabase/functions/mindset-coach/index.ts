import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");

    let systemPrompt = "";
    let userPrompt = "";

    if (type === "daily_prompt") {
      systemPrompt = `You are a mindset coach for entrepreneurs. Generate a personalized daily mindset prompt based on the user's context. Be warm, motivating, and actionable. Return JSON with: { "prompt": string, "exercise": string, "affirmation": string }`;
      userPrompt = `User context: ${JSON.stringify(context)}. Generate today's mindset prompt.`;
    } else if (type === "reflection_feedback") {
      systemPrompt = `You are an empathetic entrepreneurial mindset coach. Analyze the user's reflection and provide supportive, insightful feedback. Return JSON with: { "insights": string[], "strengths_shown": string[], "growth_areas": string[], "encouragement": string }`;
      userPrompt = `Reflection: "${context.reflection}". Mood: ${context.mood || "not specified"}. Challenge type: ${context.challenge_type || "general"}.`;
    } else if (type === "habit_suggestions") {
      systemPrompt = `You are a habit formation expert for entrepreneurs. Suggest 5 personalized habits based on the user's profile and goals. Return JSON with: { "habits": [{ "title": string, "description": string, "frequency": "daily"|"weekly", "category": string }] }`;
      userPrompt = `User profile: ${JSON.stringify(context)}. Suggest habits to build their entrepreneurial mindset.`;
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
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";

    // Try to parse JSON from response
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
    console.error("mindset-coach error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
