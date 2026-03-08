import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { type, context } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("Missing API key");

    const systemPrompts: Record<string, string> = {
      suggest_stories: `You are an entrepreneurship inspiration curator. Based on the founder's profile, mood, challenges, and stage, suggest personalized story themes they should read. Return JSON: { "suggestions": [{ "title": string, "category": string, "reason": string, "mood_match": string }], "motivational_message": string }`,

      career_suggest: `You are a career inspiration curator. Based on the user's skills, interests, mood, and career stage, suggest personalized inspirational story themes about career journeys, overcoming fear, self-discovery, career shifts, and skill building. Return JSON: { "suggestions": [{ "title": string, "category": string, "reason": string, "mood_match": string, "emotion_theme": string }], "motivational_message": string }`,

      reflection_prompt: `You are a reflective coaching guide. Based on the story the user just read, generate deep reflection prompts that help them connect the story to their own journey. Include prompts about: what resonates most, one small step they can take today, and who else might benefit. Return JSON: { "prompts": [{ "question": string, "focus_area": string }], "key_takeaway": string, "action_step": string }`,

      generate_story: `You are an expert storyteller. Create an inspiring, realistic story based on the given theme, domain, and stage. The story should feel authentic, include specific details, and offer actionable lessons. Return JSON: { "title": string, "content": string (400-600 words), "summary": string (1-2 sentences), "category": string, "tags": string[], "author_name": string (fictional but realistic), "author_role": string, "key_lessons": string[], "emotion_theme": string, "scope": string }`,

      mood_recommendations: `You are an empathetic career and startup mentor. Based on the user's current mood and recent emotional patterns, recommend types of inspirational content that would be most helpful right now. Return JSON: { "recommended_categories": [{ "category": string, "reason": string, "emotional_benefit": string }], "encouraging_message": string, "self_care_tip": string }`,

      milestone_reminder: `You are a supportive career coach. Based on the user's saved inspirational stories and their current progress, generate a motivational reminder that reconnects them with their aspirations. Return JSON: { "reminder_message": string, "story_connection": string, "next_action": string, "encouragement": string }`,
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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
