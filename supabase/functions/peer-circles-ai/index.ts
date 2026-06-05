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
      recommend_circles: `You are a peer learning circle recommendation engine. Based on the user's interests, skills, mood patterns, energy zones, and learning goals, recommend the most relevant peer circles for them. Return JSON: { "recommendations": [{ "circle_name": string, "reason": string, "expected_benefit": string, "match_score": number (0-100), "activity_suggestion": string }], "engagement_tips": string[], "motivation_message": string }`,

      suggest_inspire_post: `You are a community engagement coach for peer learning circles. Help the user craft an inspiring post for the Inspire Wall based on their recent achievements, learnings, or reflections. Return JSON: { "suggested_content": string, "post_type": "achievement"|"tip"|"story"|"milestone"|"question", "suggested_tags": string[], "engagement_tips": string[] }`,

      generate_discussion: `You are a peer learning facilitator. Generate engaging discussion topics and icebreakers for a peer circle based on the circle's domain and current learning focus. Return JSON: { "discussion_topics": [{ "title": string, "description": string, "category": "learning"|"challenge"|"reflection"|"brainstorm"|"feedback" }], "icebreaker": string, "weekly_challenge": { "title": string, "description": string, "difficulty": string } }`,

      engagement_nudge: `You are a supportive peer learning coach. Based on the user's engagement data, mood patterns, and activity history, generate a personalized nudge to re-engage them with their peer circles. Return JSON: { "nudge_message": string, "suggested_action": string, "circles_to_revisit": string[], "mood_based_suggestion": string, "motivation_type": "gentle"|"energetic"|"reflective" }`,

      collaborative_project: `You are a project design facilitator for peer learning circles. Based on the circle's domain, member skills, and learning goals, suggest collaborative projects or challenges. Return JSON: { "projects": [{ "title": string, "description": string, "project_type": "hackathon"|"case-study"|"peer-review"|"research"|"build", "difficulty": string, "skills_targeted": string[], "estimated_duration": string, "max_participants": number }], "team_formation_tips": string[] }`,

      reflection_prompt: `You are a reflective learning coach. After a peer circle activity, generate thoughtful reflection prompts to help users internalize their learning. Return JSON: { "prompts": [{ "question": string, "category": "learning"|"collaboration"|"growth"|"mood"|"next-steps" }], "journal_suggestion": string, "selfgraph_update": string }`,
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
    const parsed = JSON.parse(data.choices?.[0]?.message?.content);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("peer-circles-ai error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
