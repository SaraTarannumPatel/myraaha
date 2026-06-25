import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getAuthUser, unauthorized } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
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
      smart_match: `You are an AI mentor matching specialist. Given a user's profile data including their interests, skills, goals, mood patterns, and learning history, recommend the best mentors from the available list.
Consider:
1. Domain alignment between user interests and mentor expertise
2. Skill gaps where mentor guidance would be most valuable
3. User's current emotional state and energy levels
4. Learning goals and career roadmap
5. Mentor availability and focus areas

Return JSON: { "matches": [{ "mentor_id": string, "match_score": 0-100, "reasons": string[], "suggested_topics": string[], "compatibility_notes": string }], "match_summary": string }`,

      personalized_feed: `You are an AI that curates mentor recommendations. Based on the user's profile, learning history, and current state, create a personalized feed of mentor suggestions with explanations.
Return JSON: { "featured_mentors": [{ "mentor_id": string, "headline": string, "why_now": string, "topics_to_discuss": string[] }], "categories": [{ "name": string, "mentor_ids": string[], "description": string }], "weekly_pick": { "mentor_id": string, "reason": string } }`,

      generate_nudge: `You are a supportive AI that detects when users need mentor guidance. Based on the user's recent activity, mood patterns, and progress data, determine if a mentor nudge is appropriate.
Trigger conditions:
- Signs of stagnation or indecision
- Burnout or disengagement signals
- New goals requiring expertise
- Skill gaps blocking progress

Return JSON: { "should_nudge": boolean, "nudge_type": "encouragement"|"skill_gap"|"emotional_support"|"goal_alignment"|"opportunity", "message": string, "suggested_mentor_ids": string[], "reason": string, "urgency": "low"|"medium"|"high" }`,

      session_prep: `You are a mentorship session preparation assistant. Given the mentor's expertise, the user's goals, and their history together, suggest discussion topics and preparation points.
Return JSON: { "suggested_topics": [{ "topic": string, "why": string, "questions_to_ask": string[] }], "preparation_tasks": string[], "goals_to_address": string[], "reflection_prompts": string[] }`,

      post_session_insights: `You are a post-mentorship session analyst. Based on the session summary and user reflection, generate insights and next steps.
Return JSON: { "key_takeaways": string[], "skills_discussed": string[], "action_items": [{ "task": string, "priority": "high"|"medium"|"low", "deadline_suggestion": string }], "growth_areas": string[], "follow_up_topics": string[], "mood_impact": string }`,

      pod_recommendations: `You are an AI that recommends group mentorship pods. Based on the user's interests, goals, and learning style, suggest the best pods for collaborative learning.
Return JSON: { "recommended_pods": [{ "pod_id": string, "match_score": 0-100, "reasons": string[], "what_to_expect": string }], "create_pod_suggestion": { "should_create": boolean, "topic": string, "description": string } }`,

      mentor_profile_analysis: `You are an AI that helps users understand mentor profiles deeply. Given a mentor's information, explain how they could help this specific user.
Return JSON: { "fit_assessment": { "score": 0-100, "strengths": string[], "considerations": string[] }, "potential_topics": string[], "ideal_for": string, "session_format_suggestion": string, "intro_message_template": string }`,
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
      if (res.status === 429) return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (res.status === 402) return new Response(JSON.stringify({ error: "Usage limit reached." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${res.status}`);
    }

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content;
    const parsed = JSON.parse(content);

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("mentor-matchmaking-ai error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
