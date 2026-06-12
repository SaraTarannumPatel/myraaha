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
    const { context } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are MyRaaha's Entrepreneurship Dashboard AI — a warm, insightful assistant that generates personalized nudges, recommendations, and goal suggestions for founders.

## User Context
- Name: ${context?.name || "Founder"}
- Stage: ${context?.stage || "Getting Started"}
- Ideas count: ${context?.ideasCount || 0}
- Active ideas: ${context?.activeIdeas || 0}
- Validated ideas: ${context?.validatedIdeas || 0}
- MVPs/Projects: ${context?.projectsCount || 0}
- Challenges completed: ${context?.challengesCompleted || 0}
- Skills count: ${context?.skillsCount || 0}
- Achievements: ${context?.achievementsCount || 0}
- Journal streak: ${context?.streak || 0} days
- Connections: ${context?.connectionsCount || 0}
- Recent mood: ${context?.recentMood || "unknown"}
- Recent ideas: ${JSON.stringify(context?.recentIdeas || [])}

## Instructions
Return a JSON object with these keys:
- "greeting_nudge": A short, warm 1-sentence motivational nudge based on current stage and mood.
- "recommendations": Array of 3 objects with { "title", "description", "module", "icon_hint" } — each a specific next action linking to a module (startup-sparks, mindset-builder, mvp-builder, path-selector, startup-lab, ai-coach, startup-showcase, founder-profile, startup-communities, startup-support, content-library, journal, startup-profiling, inspirations, moodboard, funding-path).
- "goal_suggestions": Array of 2 objects with { "title", "description", "category" } — suggested goals based on current gaps (categories: ideation, validation, building, mindset, community, funding).
- "funding_tip": A short 1-sentence tip about fundraising relevant to their stage.
- "emotional_check": A short empathetic sentence acknowledging their emotional state.

Be specific, actionable, and empathetic. Use Gen Z language naturally. Return ONLY valid JSON.`;

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
          { role: "user", content: "Generate personalized dashboard recommendations for this founder." },
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Payment required." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || "{}";
    
    // Parse JSON from response (handle markdown code blocks)
    let parsed;
    try {
      const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        greeting_nudge: "Keep building — every step counts! 🚀",
        recommendations: [],
        goal_suggestions: [],
        funding_tip: "Start by validating your idea before thinking about funding.",
        emotional_check: "Remember, it's okay to take breaks. You're doing great.",
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("dashboard-ai error:", e);
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
