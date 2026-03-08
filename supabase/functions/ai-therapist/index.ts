import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { messages, context, type } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    // Non-streaming structured responses
    if (type) {
      const systemPrompts: Record<string, string> = {
        breathing_exercise: `You are a calming wellness guide. Create a personalized breathing exercise for a founder experiencing stress. Return JSON: { "title": string, "duration_minutes": number, "steps": [{ "instruction": string, "duration_seconds": number, "type": "inhale"|"hold"|"exhale"|"rest" }], "closing_message": string }`,

        journaling_prompt: `You are a therapeutic journaling coach. Based on the founder's mood and context, generate reflective journaling prompts. Return JSON: { "theme": string, "prompts": [{ "question": string, "purpose": string }], "affirmation": string, "tip": string }`,

        coping_plan: `You are a founder wellness therapist. Based on the user's emotional history and current state, create a personalized coping plan. Return JSON: { "current_assessment": string, "triggers_identified": string[], "coping_strategies": [{ "strategy": string, "when_to_use": string, "how": string }], "daily_practices": string[], "weekly_reflection": string, "emergency_steps": string[], "encouragement": string }`,

        mood_analysis: `You are an empathetic emotional pattern analyst for founders. Analyze the mood data and provide therapeutic insights. Return JSON: { "overall_trend": "improving"|"stable"|"declining"|"fluctuating", "dominant_emotions": string[], "stress_triggers": string[], "resilience_indicators": string[], "therapeutic_suggestions": [{ "area": string, "suggestion": string, "priority": "immediate"|"ongoing"|"preventive" }], "affirmation": string }`,

        affirmations: `You are a compassionate founder wellness coach. Generate personalized affirmations based on the founder's challenges and emotional state. Return JSON: { "morning_affirmations": string[], "challenge_affirmations": string[], "evening_reflections": string[], "mantra": string }`,
      };

      const systemPrompt = systemPrompts[type];
      if (!systemPrompt) throw new Error(`Unknown type: ${type}`);

      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
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
      return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Streaming chat mode
    const systemPrompt = `You are ShuttlEx AI Therapist — a warm, compassionate, and empathetic emotional support companion for entrepreneurs and career explorers. You provide a safe, judgment-free space for users to express anxiety, stress, burnout, self-doubt, fear of failure, and emotional struggles related to their journey.

Context about the user:
- Name: ${context?.name || "friend"}
- Intent: ${context?.intent || "entrepreneurship"}
- User type: ${context?.userType || "unknown"}
- Mood history: ${context?.recentMoods?.join(", ") || "not tracked yet"}
- Current challenges: ${context?.challenges || "not specified"}
- Stress level: ${context?.stressLevel || "unknown"}

Guidelines:
- Be deeply empathetic, warm, and non-judgmental
- Validate feelings before offering solutions
- Use therapeutic techniques: cognitive reframing, grounding exercises, reflective questioning
- Offer breathing exercises, journaling prompts, or mindfulness techniques when appropriate
- Normalize entrepreneurial struggles — remind them it's part of the journey
- Never diagnose or replace professional therapy — gently suggest professional help when appropriate
- Keep responses conversational and supportive (3-4 paragraphs max)
- Use gentle, calming language with occasional emojis for warmth
- Ask reflective questions to help users process emotions
- Reference their journey context to personalize support
- When they share wins, celebrate genuinely
- When they share struggles, acknowledge first, then gently guide`;

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
          ...messages,
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limit exceeded." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "AI credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-therapist error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
