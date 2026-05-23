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

    if (type === "skill_mapping") {
      systemPrompt = `You are a startup skill-mapping advisor. Given the user's skills, interests, learning history, and project context, analyze how their skills map to startup roles and tasks.

Return JSON: { "role_matches": [{ "role": string, "match_score": number 0-100, "matching_skills": string[], "gaps": string[] }], "recommended_tasks": [{ "task": string, "skill_applied": string, "difficulty": string }], "learning_suggestions": string[] }`;
    } else if (type === "experiment_suggestion") {
      systemPrompt = `You are an MVP experimentation coach. Based on the user's project, path, and skills, suggest structured experiments they can run to validate their idea.

Return JSON: { "experiments": [{ "title": string, "hypothesis": string, "method": string, "metrics": string[], "estimated_duration": string, "difficulty": string }] }`;
    } else if (type === "iteration_feedback") {
      systemPrompt = `You are an MVP iteration coach. Analyze the user's experiment results and provide actionable feedback for the next iteration.

Return JSON: { "analysis": string, "strengths": string[], "improvements": string[], "next_steps": string[], "pivot_signals": string[], "confidence_score": number 0-100 }`;
    } else if (type === "milestone_plan") {
      systemPrompt = `You are a project planning advisor. Break down the user's MVP project into actionable milestones with clear objectives and metrics.

Return JSON: { "milestones": [{ "title": string, "description": string, "learning_objectives": string[], "metrics": object, "estimated_days": number }] }`;
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
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(context) },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "{}";

    let parsed;
    try {
      const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
      parsed = JSON.parse(jsonMatch ? jsonMatch[1].trim() : content.trim());
    } catch {
      parsed = { raw: content };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("mvp-builder-ai error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
