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

  try {
    const { type, data } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    let systemPrompt = "";
    let userPrompt = "";

    switch (type) {
      case "analyze_traits":
        systemPrompt = `You are an expert psychologist analyzing user behavior patterns to identify personality traits and strengths. Analyze the provided data to generate trait scores.

Return a JSON object with this structure:
{
  "traits": [
    {
      "trait_name": "string",
      "trait_category": "cognitive" | "emotional" | "social" | "professional",
      "score": 0.0-1.0,
      "confidence": 0.0-1.0,
      "evidence": ["reason1", "reason2"]
    }
  ],
  "summary": "Brief personality summary",
  "dominant_traits": ["trait1", "trait2", "trait3"]
}

Analyze traits like: creativity, problem_solving, empathy, leadership, resilience, adaptability, analytical_thinking, communication, collaboration, initiative, attention_to_detail, strategic_thinking.`;
        userPrompt = `Analyze traits from this user data:
Experiences: ${JSON.stringify(data.experiences || [])}
Projects: ${JSON.stringify(data.projects || [])}
Skills: ${JSON.stringify(data.skills || [])}
Interests: ${JSON.stringify(data.interests || [])}
Journal Entries: ${JSON.stringify(data.journalEntries?.slice(0, 10) || [])}
Career Card Interactions: ${JSON.stringify(data.cardInteractions || [])}
Learning Progress: ${JSON.stringify(data.learningProgress || [])}`;
        break;

      case "analyze_patterns":
        systemPrompt = `You are a behavioral analyst identifying recurring patterns in user behavior. Look for habits, preferences, and tendencies.

Return a JSON object with:
{
  "patterns": [
    {
      "pattern_type": "habit" | "preference" | "tendency" | "trigger",
      "pattern_description": "string",
      "frequency": "daily" | "weekly" | "recurring" | "occasional",
      "strength": 0.0-1.0,
      "domains_affected": ["domain1", "domain2"],
      "is_positive": boolean
    }
  ],
  "behavioral_summary": "Overall behavioral profile",
  "growth_opportunities": ["opportunity1", "opportunity2"]
}`;
        userPrompt = `Identify behavioral patterns from:
Actions History: ${JSON.stringify(data.actions || [])}
Energy Zones: ${JSON.stringify(data.energyZones || [])}
Task Completions: ${JSON.stringify(data.tasks || [])}
Mood History: ${JSON.stringify(data.moods || [])}
Time Spent by Domain: ${JSON.stringify(data.timeByDomain || [])}`;
        break;

      case "calculate_clarity":
        systemPrompt = `You are a career clarity advisor calculating how aligned a user feels with their goals and activities.

Return a JSON object with:
{
  "overall_clarity": 0.0-1.0,
  "goal_alignment": 0.0-1.0,
  "interest_alignment": 0.0-1.0,
  "activity_alignment": 0.0-1.0,
  "direction_confidence": 0.0-1.0,
  "factors": {
    "positive": ["factor1", "factor2"],
    "negative": ["factor1", "factor2"]
  },
  "reflection_prompt": "A thoughtful question to help the user reflect",
  "recommendations": ["recommendation1", "recommendation2"]
}`;
        userPrompt = `Calculate clarity score based on:
Profile Goals: ${JSON.stringify(data.goals || {})}
Current Activities: ${JSON.stringify(data.activities || [])}
Interests: ${JSON.stringify(data.interests || [])}
Recent Mood Patterns: ${JSON.stringify(data.moods || [])}
Domain Affinity: ${JSON.stringify(data.domainAffinity || [])}
Completed vs Abandoned Tasks: ${JSON.stringify(data.taskCompletion || {})}`;
        break;

      case "generate_weekly_digest":
        systemPrompt = `You are creating a motivational weekly progress summary for a user's career/entrepreneurship journey.

Return a JSON object with:
{
  "ai_summary": "2-3 paragraph narrative of the week's progress",
  "skills_progress": {
    "improved": ["skill1", "skill2"],
    "practiced": ["skill1"],
    "suggested_focus": ["skill1"]
  },
  "mood_summary": {
    "dominant_mood": "string",
    "energy_trend": "increasing" | "stable" | "decreasing",
    "highlights": ["moment1", "moment2"]
  },
  "energy_patterns": {
    "high_energy_activities": ["activity1"],
    "low_energy_activities": ["activity1"],
    "optimal_times": ["morning", "afternoon", "evening"]
  },
  "domain_shifts": {
    "growing_interest": ["domain1"],
    "declining_interest": ["domain1"],
    "stable_focus": ["domain1"]
  },
  "key_achievements": ["achievement1", "achievement2"],
  "challenges_faced": ["challenge1"],
  "recommendations": [
    { "action": "string", "priority": "high" | "medium" | "low", "reason": "string" }
  ]
}`;
        userPrompt = `Generate weekly digest for week ${data.weekStart} to ${data.weekEnd}:
Activities Completed: ${JSON.stringify(data.activities || [])}
Skills Practiced: ${JSON.stringify(data.skills || [])}
Mood Entries: ${JSON.stringify(data.moods || [])}
Energy Logs: ${JSON.stringify(data.energyLogs || [])}
Achievements Earned: ${JSON.stringify(data.achievements || [])}
Challenges: ${JSON.stringify(data.challenges || [])}
Time by Domain: ${JSON.stringify(data.timeByDomain || [])}`;
        break;

      case "generate_insights":
        systemPrompt = `You are an AI career coach providing personalized insights and nudges based on the user's identity data.

Return a JSON object with:
{
  "insights": [
    {
      "type": "strength" | "opportunity" | "warning" | "encouragement",
      "message": "string",
      "action_suggested": "string",
      "related_to": "trait" | "skill" | "pattern" | "goal"
    }
  ],
  "skill_fit_analysis": [
    {
      "opportunity_type": "job" | "internship" | "project" | "learning",
      "title": "string",
      "match_percentage": 0-100,
      "matching_traits": ["trait1", "trait2"],
      "gaps_to_fill": ["gap1"]
    }
  ],
  "personalized_nudges": [
    {
      "nudge": "string",
      "priority": "high" | "medium" | "low",
      "category": "reflection" | "action" | "learning" | "connection"
    }
  ],
  "next_evaluation_focus": ["trait1", "trait2"]
}`;
        userPrompt = `Generate insights from:
Traits: ${JSON.stringify(data.traits || [])}
Patterns: ${JSON.stringify(data.patterns || [])}
Energy Zones: ${JSON.stringify(data.energyZones || [])}
Clarity Score: ${data.clarityScore || 0.5}
Goals: ${JSON.stringify(data.goals || {})}
Recent Progress: ${JSON.stringify(data.recentProgress || [])}`;
        break;

      case "identity_evaluation":
        systemPrompt = `You are conducting a periodic identity evaluation to assess the user's growth in key traits.

Return a JSON object with:
{
  "confidence_score": 0.0-1.0,
  "resilience_score": 0.0-1.0,
  "adaptability_score": 0.0-1.0,
  "creativity_score": 0.0-1.0,
  "leadership_score": 0.0-1.0,
  "collaboration_score": 0.0-1.0,
  "problem_solving_score": 0.0-1.0,
  "emotional_intelligence_score": 0.0-1.0,
  "overall_growth": -1.0 to 1.0,
  "ai_feedback": {
    "strengths_shown": ["strength1", "strength2"],
    "areas_for_growth": ["area1", "area2"],
    "growth_since_last": "string describing changes",
    "recommended_focus": ["focus1", "focus2"]
  }
}`;
        userPrompt = `Evaluate identity growth based on:
Previous Evaluation: ${JSON.stringify(data.previousEvaluation || {})}
Recent Actions: ${JSON.stringify(data.recentActions || [])}
Challenges Completed: ${JSON.stringify(data.challenges || [])}
Feedback Received: ${JSON.stringify(data.feedback || [])}
Reflection Responses: ${JSON.stringify(data.reflections || [])}
Mood Trends: ${JSON.stringify(data.moodTrends || [])}`;
        break;

      case "reflection_prompt":
        systemPrompt = `You are generating a thoughtful reflection prompt based on a user's recent activity to help them build self-awareness.

Return a JSON object with:
{
  "prompt_text": "A thoughtful, open-ended question",
  "context": "Brief explanation of why this prompt is relevant",
  "follow_up_prompts": ["prompt1", "prompt2"],
  "expected_insights": ["what the user might discover"]
}`;
        userPrompt = `Generate reflection prompt for:
Recent Activity: ${data.activity || "general exploration"}
Activity Type: ${data.activityType || "task"}
Mood: ${data.mood || "neutral"}
Domain: ${data.domain || "general"}
User's Expressed Feelings: ${data.feelings || "none shared"}`;
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
    console.error("SelfGraph AI error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
