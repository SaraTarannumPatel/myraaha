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
      domain_recommendations: `You are a career exploration AI helping users discover domains that match their interests, skills, and preferences. Based on the user's interactions with career cards (likes, saves, time spent), their quest responses, and interests, recommend 3-5 career domains. Return JSON: { "recommendations": [{ "domain_name": string, "description": string, "match_score": number (0-100), "reasons": string[], "next_steps": string[], "related_skills": string[] }], "insights": { "top_strength": string, "growth_area": string, "pattern_observed": string }, "encouragement": string }`,

      quest_feedback: `You are a supportive career coach analyzing quest responses. Provide personalized feedback on their self-discovery journey. Return JSON: { "acknowledgment": string, "insights": string[], "strengths_detected": string[], "areas_to_explore": string[], "suggested_domains": string[], "reflection_prompt": string, "badge_earned": string | null }`,

      exploration_summary: `You are an AI career guide summarizing an exploration session. Based on the cards viewed, interactions, mood changes, and time patterns, provide a summary. Return JSON: { "session_summary": string, "key_discoveries": string[], "patterns": [{ "pattern": string, "meaning": string }], "domains_to_pursue": string[], "next_session_suggestion": string, "motivational_note": string }`,

      adaptive_prompts: `You are a dynamic prompt generator for career exploration. Based on the user's engagement level and previous responses, generate personalized prompts. Return JSON: { "prompts": [{ "question": string, "type": "open" | "choice" | "scale", "options": string[] | null, "why": string }], "mode_suggestion": "story" | "challenge" | "visual", "energy_level": "high" | "medium" | "low" }`,

      behavior_insights: `You are an AI behavioral analyst for career exploration. Analyze patterns in how users interact with career content to provide deeper self-awareness insights. Return JSON: { "behavioral_patterns": [{ "pattern": string, "interpretation": string, "strength": "strong" | "moderate" | "emerging" }], "cognitive_style": string, "motivation_type": string, "ideal_work_environment": string, "career_archetype": string, "areas_of_resonance": string[], "blind_spots": string[] }`,
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
    console.error("curiosity-compass-ai error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
