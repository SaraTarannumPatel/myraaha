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

    if (type === "detect_signals") {
      systemPrompt = `You are an entrepreneurial path advisor. Analyze the user's exploration data and detect signals indicating promising entrepreneurial directions. Return JSON: { "signals": [{ "area": string, "strength": number (0-1), "evidence": string, "suggested_path": string }], "top_recommendation": string, "reasoning": string }`;
      userPrompt = `User data: Ideas interacted with: ${JSON.stringify(context.ideas)}. Problems observed: ${JSON.stringify(context.problems)}. Skills: ${JSON.stringify(context.skills)}. Interests: ${JSON.stringify(context.interests)}. Challenges completed: ${context.challengesCompleted}. Industry: ${context.industry}. Goals: ${context.goals}.`;
    } else if (type === "generate_roadmap") {
      systemPrompt = `You are a startup roadmap generator. Create a detailed, actionable 8-step roadmap for the chosen entrepreneurial path. Each step should be specific and achievable. Return JSON: { "steps": [{ "title": string, "description": string, "duration": string, "category": "learning"|"building"|"networking"|"validating", "resources": string[] }], "estimated_timeline": string, "key_milestones": string[] }`;
      userPrompt = `Path chosen: ${context.pathType} - "${context.pathTitle}". User skills: ${JSON.stringify(context.skills)}. Industry: ${context.industry}. Experience level: ${context.experienceLevel}.`;
    } else if (type === "evaluate_alignment") {
      systemPrompt = `You are a career-path alignment evaluator. Assess how well the user's profile aligns with their chosen path. Return JSON: { "alignment_score": number (0-100), "strengths_match": string[], "gaps": string[], "risk_level": "low"|"medium"|"high", "advice": string, "next_actions": string[] }`;
      userPrompt = `Path: ${context.pathType} - "${context.pathTitle}". User profile: industry=${context.industry}, skills=${JSON.stringify(context.skills)}, interests=${JSON.stringify(context.interests)}, experience=${context.experienceLevel}, goals=${context.goals}.`;
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
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limited. Try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const t = await response.text();
      console.error("AI error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: content };
    } catch {
      parsed = { raw: content };
    }

    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("path-selector error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
