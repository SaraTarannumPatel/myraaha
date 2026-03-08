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

    if (type === "recommend_learning") {
      systemPrompt = `You are a startup learning advisor. Based on the user's profile, suggest 5 personalized learning recommendations. Return JSON: { "recommendations": [{ "title": string, "type": "capsule"|"playbook"|"resource"|"simulation", "reason": string, "priority": "high"|"medium"|"low" }], "learning_focus": string, "advice": string }`;
      userPrompt = `User profile: industry=${context.industry}, skills=${JSON.stringify(context.skills)}, interests=${JSON.stringify(context.interests)}, path=${context.selectedPath}, goals=${context.goals}, capsules_completed=${context.capsulesCompleted}, simulations_done=${context.simulationsDone}.`;
    } else if (type === "skill_mapping") {
      systemPrompt = `You are a startup skill mapping expert. Map the user's skills to entrepreneurial roles and domains. Return JSON: { "mappings": [{ "skill": string, "applicable_roles": string[], "startup_domains": string[], "growth_potential": "high"|"medium"|"low" }], "gaps": string[], "recommended_learning": string[] }`;
      userPrompt = `User skills: ${JSON.stringify(context.skills)}. Industry: ${context.industry}. Path: ${context.selectedPath}.`;
    } else if (type === "quiz") {
      systemPrompt = `You are a startup educator. Generate a 5-question quiz based on the topic. Return JSON: { "questions": [{ "question": string, "options": string[], "correct_index": number, "explanation": string }] }`;
      userPrompt = `Topic: "${context.topic}". Difficulty: ${context.difficulty}. Generate a quiz to test understanding.`;
    } else {
      throw new Error("Unknown type: " + type);
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: userPrompt }],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) return new Response(JSON.stringify({ error: "Rate limited." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (response.status === 402) return new Response(JSON.stringify({ error: "Credits exhausted." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "";
    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { raw: content };
    } catch { parsed = { raw: content }; }

    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("learning-library error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
