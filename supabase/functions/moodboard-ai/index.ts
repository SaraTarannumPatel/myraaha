const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { mode, context, profile, boards, items, theme, interests, skills, energyZones, reflectionText } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("Missing API key");

    const isCareer = context === "career";
    const domain = isCareer ? "career exploration and professional growth" : "entrepreneurship and startup building";

    const systemPrompts: Record<string, string> = {
      suggest_items: `You are a creative moodboard coach for ${domain}. Based on the user's profile, interests, skills, and existing boards, suggest 5 inspirational items they could add. Return JSON: { "suggestions": [{ "title": string, "content": string, "content_type": "quote"|"text"|"link", "tags": string[], "why": string }] }`,
      suggest_boards: `You are a ${isCareer ? "career" : "startup"} moodboard strategist. Suggest 4 new board themes the user should create based on their profile, interests, and journey. Return JSON: { "boards": [{ "title": string, "description": string, "theme": string, "suggested_tags": string[] }] }`,
      reflection_prompt: `You are an empathetic ${isCareer ? "career" : "entrepreneurship"} reflection guide. Based on the user's moodboard items and emotional notes, generate a thoughtful reflection prompt. Return JSON: { "prompt": string, "follow_ups": string[], "insight": string }`,
      community_inspiration: `You are a community curator for ${domain}. Generate 5 trending inspiration items that ${isCareer ? "professionals and career explorers" : "founders"} commonly find valuable. Return JSON: { "trending": [{ "title": string, "content": string, "content_type": "quote"|"text", "tags": string[], "category": string }] }`,
      emotion_insights: `You are an emotional intelligence analyst for ${domain}. Analyze the user's moodboard items, their emotion tags, and reflection notes to identify patterns. Return JSON: { "dominant_emotions": [{ "emotion": string, "frequency": number, "interpretation": string }], "theme_clusters": [{ "theme": string, "items_count": number, "insight": string }], "growth_narrative": string, "blind_spots": string[], "strengths_revealed": string[], "next_exploration": string }`,
      goal_mapping: `You are a career goal strategist. Based on the user's moodboard themes, items, skills, and interests, map their aspirations to concrete next steps. Return JSON: { "goal_paths": [{ "aspiration": string, "current_alignment": number, "next_steps": [{ "action": string, "type": "learning"|"project"|"explore"|"connect", "priority": "high"|"medium"|"low" }], "suggested_skill": string }], "overall_direction": string, "momentum_score": number }`,
      guided_reflection: `You are a gentle career reflection facilitator. Based on the user's moodboard content and their reflection text, provide deep, empathetic analysis. Return JSON: { "acknowledgment": string, "deeper_questions": string[], "patterns_noticed": string[], "connection_to_goals": string, "affirmation": string, "suggested_action": string }`,
      evolution_analysis: `You are a growth tracker for ${domain}. Analyze how the user's moodboard content has evolved over time based on creation dates and themes. Return JSON: { "evolution_phases": [{ "period": string, "dominant_theme": string, "emotional_tone": string, "key_shift": string }], "growth_trajectory": string, "consistency_score": number, "emerging_interests": string[], "celebration": string }`,
    };

    const systemPrompt = systemPrompts[mode] || systemPrompts.suggest_items;

    const userContent = JSON.stringify({
      profile: profile || {},
      existing_boards: boards || [],
      existing_items: items || [],
      theme: theme || "general",
      interests: interests || [],
      skills: skills || [],
      energy_zones: energyZones || [],
      reflection_text: reflectionText || "",
    });

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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

    if (!res.ok) {
      if (res.status === 429) return new Response(JSON.stringify({ error: "Rate limited, try again later" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (res.status === 402) return new Response(JSON.stringify({ error: "Payment required" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await res.text();
      console.error("AI error:", res.status, t);
      throw new Error("AI gateway error");
    }

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
