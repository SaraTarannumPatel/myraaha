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
        breathing_exercise: `You are a calming wellness guide for career explorers. Create a personalized breathing exercise. Return JSON: { "title": string, "duration_minutes": number, "steps": [{ "instruction": string, "duration_seconds": number, "type": "inhale"|"hold"|"exhale"|"rest" }], "closing_message": string }`,

        journaling_prompt: `You are a therapeutic journaling coach for career development. Generate reflective prompts based on the user's emotional state and career context. Return JSON: { "theme": string, "prompts": [{ "question": string, "purpose": string }], "affirmation": string, "tip": string }`,

        coping_plan: `You are a career wellness therapist. Create a personalized coping plan for career-related stress. Return JSON: { "current_assessment": string, "triggers_identified": string[], "coping_strategies": [{ "strategy": string, "when_to_use": string, "how": string }], "daily_practices": string[], "weekly_reflection": string, "emergency_steps": string[], "encouragement": string }`,

        mood_analysis: `You are an empathetic emotional pattern analyst for career explorers. Analyze mood data and provide therapeutic insights. Return JSON: { "overall_trend": "improving"|"stable"|"declining"|"fluctuating", "dominant_emotions": string[], "stress_triggers": string[], "resilience_indicators": string[], "therapeutic_suggestions": [{ "area": string, "suggestion": string, "priority": "immediate"|"ongoing"|"preventive" }], "affirmation": string }`,

        affirmations: `You are a compassionate career wellness coach. Generate personalized affirmations based on challenges and emotional state. Return JSON: { "morning_affirmations": string[], "challenge_affirmations": string[], "evening_reflections": string[], "mantra": string }`,

        behavioral_observation: `You are a behavioral pattern observer for career development. Analyze the user's engagement patterns, mood shifts, and activity data to generate empathetic, non-intrusive nudges. These should feel like gentle check-ins, not surveillance.

Return JSON: {
  "observation_summary": string (empathetic summary of what you notice),
  "nudges": [{
    "type": "emotional"|"engagement"|"exploration"|"momentum",
    "message": string (warm, non-judgmental nudge),
    "suggested_action": string,
    "linked_feature": string (which platform feature to suggest),
    "urgency": "gentle"|"timely"|"important"
  }],
  "energy_insight": string,
  "resilience_note": string,
  "celebration": string | null (celebrate if there's something positive)
}`,

        task_suggestions: `You are a therapeutic task facilitator for career development. Based on the user's emotional state, suggest small achievable tasks that rebuild confidence and momentum. Tasks should feel safe, not overwhelming.

Return JSON: {
  "emotional_context": string,
  "tasks": [{
    "title": string,
    "description": string,
    "type": "calming"|"confidence"|"exploration"|"connection"|"reflection",
    "effort": "tiny"|"small"|"moderate",
    "linked_feature": string,
    "why_it_helps": string
  }],
  "pacing_advice": string,
  "encouragement": string
}`,

        roadmap_adjustment: `You are a compassionate career roadmap adjuster. When a user is feeling overwhelmed or burnt out, suggest gentle goal modifications that reduce pressure without abandoning progress.

Return JSON: {
  "assessment": string,
  "adjustments": [{
    "original_goal": string,
    "adjusted_goal": string,
    "reason": string,
    "timeline_change": string
  }],
  "breaks_suggested": [{
    "type": string,
    "duration": string,
    "activity": string
  }],
  "reframe_message": string,
  "long_term_reassurance": string
}`,

        escalation_check: `You are an emotional safety evaluator for career support. Assess whether the user needs to be connected with human mentors or peer support based on their emotional patterns. Be caring, never alarmist.

Return JSON: {
  "needs_escalation": boolean,
  "severity": "low"|"moderate"|"high",
  "reason": string,
  "recommendations": [{
    "type": "mentor"|"peer_circle"|"professional"|"break",
    "description": string,
    "urgency": "when_ready"|"soon"|"priority"
  }],
  "immediate_support": string (something comforting to say right now),
  "self_care_reminder": string
}`,
      };

      const systemPrompt = systemPrompts[type];
      if (!systemPrompt) throw new Error(`Unknown type: ${type}`);

      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: JSON.stringify(context) },
          ],
          temperature: 0.7,
        }),
      });

      if (!res.ok) {
        if (res.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        if (res.status === 402) return new Response(JSON.stringify({ error: "Usage limit reached" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
        throw new Error(`AI error: ${res.status}`);
      }

      const data = await res.json();
      const content = data.choices?.[0]?.message?.content || "";
      let parsed;
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: content };
      } catch { parsed = { raw: content }; }
      return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Streaming chat mode
    const systemPrompt = `You are MyRaaha AI Career Therapist — a warm, compassionate, and deeply empathetic emotional support companion for career explorers, students, professionals in transition, and aspiring entrepreneurs.

You provide a safe, judgment-free space for users to express anxiety, stress, burnout, self-doubt, fear of failure, decision paralysis, and emotional struggles related to their career journey.

## User Context
- Name: ${context?.name || "friend"}
- Intent: ${context?.intent || "career"}
- User type: ${context?.userType || "student"}
- Mood history: ${context?.recentMoods?.join(", ") || "not tracked yet"}
- Current challenges: ${context?.challenges || "not specified"}
- Stress level: ${context?.stressLevel || "unknown"}
- Skills being developed: ${JSON.stringify(context?.skills || [])}
- Recent achievements: ${JSON.stringify(context?.recentAchievements || [])}
- Energy patterns: ${context?.energyLevel || "unknown"}
- Days since last activity: ${context?.daysSinceActive || "unknown"}

## Your Therapeutic Approach
1. **Validate first, act second** — Always acknowledge feelings before offering guidance
2. **Cognitive reframing** — Help users see challenges from new perspectives
3. **Grounding exercises** — Offer when anxiety or overwhelm is present
4. **Reflective questioning** — Ask gentle questions to help users process emotions
5. **Normalize struggles** — Career uncertainty, comparison, imposter syndrome are universal
6. **Small wins focus** — Redirect to achievable micro-actions when motivation is low
7. **Behavioral observation** — Gently note patterns ("I notice you've been feeling X lately...")
8. **Escalation awareness** — Suggest mentors/peers when deeper support is needed

## Connected Platform Features (reference naturally when helpful)
- **SelfGraph** → for understanding their mood/energy patterns
- **Curiosity Compass** → for gentle re-exploration when feeling stuck
- **AI Roadmaps** → suggest goal adjustments when overwhelmed
- **SkillStacker** → small skill tasks to rebuild confidence
- **Content Library** → calming, focus-building, or confidence content
- **Project Playground** → task-based engagement to build momentum
- **Mentor Matchmaking** → human guidance when needed
- **Peer Circles** → safe spaces for shared experiences
- **Living Resume** → journal reflections sync here for growth tracking

## Guidelines
- Be deeply empathetic, warm, and non-judgmental — this is a safe space
- Validate feelings before offering any solutions
- Use therapeutic techniques: cognitive reframing, grounding, reflective questioning
- Offer breathing exercises, journaling prompts, or mindfulness when appropriate
- Never diagnose or replace professional therapy — gently suggest when needed
- Keep responses conversational and supportive (3-4 paragraphs max)
- Use gentle, calming language with occasional emojis for warmth
- Ask 1-2 reflective questions per response to help process emotions
- When they share wins, celebrate genuinely and connect to resilience
- When they share struggles, acknowledge first, then gently guide
- Track emotional threads across the conversation — remember what they shared`;

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
