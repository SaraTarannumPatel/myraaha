import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getAuthUser, unauthorized } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const user = await getAuthUser(req);
  if (!user) return unauthorized();



  try {
    const { type, data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "skill_fit_analysis":
        systemPrompt = `You are an expert career advisor analyzing skill-to-role fit. Analyze the user's skills against potential roles and provide actionable insights.

Return a JSON array of role analyses with this structure:
{
  "analyses": [
    {
      "role_type": "job" | "internship" | "startup_task",
      "role_name": "string",
      "match_score": 0-100,
      "skills_matched": ["skill1", "skill2"],
      "skills_missing": ["skill1", "skill2"],
      "is_eligible": boolean,
      "recommendations": ["action1", "action2"]
    }
  ]
}`;
        userPrompt = `Analyze skill fit for this user:
Skills: ${JSON.stringify(data.skills || [])}
Experiences: ${JSON.stringify(data.experiences || [])}
Interests: ${JSON.stringify(data.interests || [])}
Career Goals: ${data.goals || "Not specified"}

Provide analysis for at least 5 relevant roles (mix of jobs, internships, and startup tasks).`;
        break;

      case "generate_insights":
        systemPrompt = `You are an AI career insights generator. Analyze the user's complete profile and provide personalized insights and recommendations.

Return JSON with this structure:
{
  "profile_summary": "2-3 sentence summary of user's strengths and direction",
  "key_strengths": ["strength1", "strength2", "strength3"],
  "growth_areas": ["area1", "area2"],
  "recommended_next_steps": [
    { "action": "string", "priority": "high" | "medium" | "low", "impact": "string" }
  ],
  "skill_gaps": ["skill1", "skill2"],
  "career_readiness_score": 0-100,
  "personalized_nudges": ["nudge1", "nudge2", "nudge3"]
}`;
        userPrompt = `Generate career insights for this user:
Profile: ${JSON.stringify(data.profile || {})}
Skills: ${JSON.stringify(data.skills || [])}
Experiences: ${JSON.stringify(data.experiences || [])}
Projects: ${JSON.stringify(data.projects || [])}
Achievements: ${JSON.stringify(data.achievements || [])}
Learning Progress: ${JSON.stringify(data.learningProgress || [])}
Journal Entries: ${JSON.stringify(data.journalEntries?.slice(0, 5) || [])}`;
        break;

      case "decision_mirror":
        systemPrompt = `You are an AI that analyzes a user's past decisions and actions to show how they've shaped their current position. Provide reflective insights.

Return JSON with this structure:
{
  "journey_narrative": "2-3 paragraph narrative of how decisions led to current state",
  "pivotal_moments": [
    { "action": "string", "impact": "string", "date": "string" }
  ],
  "patterns_identified": ["pattern1", "pattern2"],
  "strengths_revealed": ["strength1", "strength2"],
  "suggested_adjustments": ["adjustment1", "adjustment2"],
  "confidence_score": 0-100
}`;
        userPrompt = `Analyze the decision history for this user:
Actions: ${JSON.stringify(data.actions || [])}
Experiences: ${JSON.stringify(data.experiences || [])}
Projects: ${JSON.stringify(data.projects || [])}
Skills Gained Over Time: ${JSON.stringify(data.skills || [])}
Mood Patterns: ${JSON.stringify(data.moodPatterns || [])}`;
        break;

      case "generate_resume_summary":
        systemPrompt = `You are a professional resume writer. Create a compelling, concise professional summary based on the user's data.

Return JSON with:
{
  "summary": "3-4 sentence professional summary",
  "headline": "Professional headline (e.g., 'Data Analyst | Problem Solver | Tech Enthusiast')",
  "key_achievements": ["achievement1", "achievement2", "achievement3"],
  "value_proposition": "1 sentence unique value proposition"
}`;
        userPrompt = `Generate a professional resume summary for:
Name: ${data.name || "User"}
Skills: ${JSON.stringify(data.skills || [])}
Experiences: ${JSON.stringify(data.experiences || [])}
Projects: ${JSON.stringify(data.projects || [])}
Achievements: ${JSON.stringify(data.achievements || [])}
Goals: ${data.goals || "Career growth"}`;
        break;

      case "eligible_opportunities":
        systemPrompt = `You are a career opportunity matcher. Based on the user's profile, suggest specific opportunities they're eligible for.

Return JSON with:
{
  "opportunities": [
    {
      "type": "job" | "internship" | "startup" | "project" | "mentorship",
      "title": "string",
      "description": "string",
      "match_percentage": 0-100,
      "required_skills": ["skill1", "skill2"],
      "user_has_skills": ["skill1"],
      "next_steps": ["step1", "step2"]
    }
  ]
}`;
        userPrompt = `Find opportunities for this user:
Skills: ${JSON.stringify(data.skills || [])}
Experience Level: ${data.experienceLevel || "entry"}
Interests: ${JSON.stringify(data.interests || [])}
Preferred Domains: ${JSON.stringify(data.domains || [])}
Location: ${data.location || "Remote"}`;
        break;

      default:
        throw new Error(`Unknown analysis type: ${type}`);
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
          { role: "user", content: userPrompt },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again later." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required. Please add credits." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "";
    
    // Parse JSON from response
    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        parsed = { raw: content };
      }
    } catch {
      parsed = { raw: content };
    }

    return new Response(JSON.stringify({ success: true, data: parsed }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Living Resume AI error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
