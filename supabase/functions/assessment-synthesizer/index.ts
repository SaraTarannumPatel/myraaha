import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    if (!apiKey) throw new Error("Missing LOVABLE_API_KEY");

    const authHeader = req.headers.get("Authorization") || "";
    const userClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: authHeader } },
    });
    const admin = createClient(supabaseUrl, serviceKey);

    const { data: { user } } = await userClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Not authenticated" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json().catch(() => ({}));
    const test_type: "discovery" | "psychometric" | "combined" = body?.test_type || "combined";

    // Pull the user's signals + interests for synthesis
    const [signalsRes, interestsRes, profileRes] = await Promise.all([
      admin.from("assessment_question_signals").select("*").eq("user_id", user.id).limit(500),
      admin.from("interests").select("*").eq("user_id", user.id).limit(100),
      admin.from("profiles").select("user_type,active_intent,journey_responses,full_name").eq("user_id", user.id).maybeSingle(),
    ]);

    const signals = signalsRes.data || [];
    const interests = interestsRes.data || [];
    const profile = profileRes.data || {};

    const systemPrompt = `You are MyRaaha's career-intelligence synthesizer. You read a user's assessment signals + interests and output a JSON personality+career conclusion.
Return STRICT JSON ONLY in this exact shape:
{
  "archetype": one of ["The Builder","The Strategist","The Explorer","The Connector","The Craftsperson","The Changemaker"],
  "archetype_description": "1-2 sentences in second person, warm + specific.",
  "top_domains": ["3-5 career domains best matched to the user"],
  "top_skills": ["5-8 concrete skills the user should sharpen"],
  "work_style": "1 short phrase like 'Deep-focus, project-driven'",
  "motivation_type": "intrinsic | mastery | impact | recognition | autonomy",
  "cognitive_style": "1 phrase",
  "ideal_environment": "1 sentence on team size, structure, pace",
  "strengths": ["4-6 specific strengths"],
  "growth_areas": ["2-4 honest growth edges"],
  "recommended_modules": [
    { "module_key": "roadmap|skill_stacker|job_matching|mentor_matchmaking|project_playground|career_therapist|career_coach|content_library|peer_circles|mvp_builder|moodboard|transition_planner|selfgraph", "reason": "1 sentence why" }
  ],
  "recommended_career_paths": ["3-5 specific job titles"],
  "confidence_score": number 0-1
}
No prose, no markdown, JSON object only.`;

    const userPrompt = JSON.stringify({
      profile: { user_type: profile.user_type, active_intent: profile.active_intent, journey_responses: profile.journey_responses },
      signals: signals.map((s: any) => ({
        test_type: s.test_type,
        question_id: s.question_id,
        answer: s.answer_label || s.answer_value,
        target_modules: s.target_modules,
        signal_tags: s.signal_tags,
      })),
      interests: interests.map((i: any) => ({ name: i.name, category: i.category, strength: i.strength })),
      requested_test_type: test_type,
    });

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      if (aiRes.status === 429)
        return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (aiRes.status === 402)
        return new Response(JSON.stringify({ error: "Usage limit reached" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      throw new Error(`AI gateway error: ${aiRes.status}`);
    }

    const aiData = await aiRes.json();
    const text = aiData.choices?.[0]?.message?.content || "{}";
    let parsed: any;
    try {
      parsed = JSON.parse(text);
    } catch {
      const m = text.match(/\{[\s\S]*\}/);
      parsed = m ? JSON.parse(m[0]) : {};
    }

    const conclusion = {
      user_id: user.id,
      test_type,
      archetype: parsed.archetype || "The Explorer",
      archetype_description: parsed.archetype_description || "",
      top_domains: parsed.top_domains || [],
      top_skills: parsed.top_skills || [],
      work_style: parsed.work_style || null,
      motivation_type: parsed.motivation_type || null,
      cognitive_style: parsed.cognitive_style || null,
      ideal_environment: parsed.ideal_environment || null,
      strengths: parsed.strengths || [],
      growth_areas: parsed.growth_areas || [],
      recommended_modules: parsed.recommended_modules || [],
      recommended_career_paths: parsed.recommended_career_paths || [],
      raw_signals: { signal_count: signals.length, interest_count: interests.length },
      confidence_score: parsed.confidence_score ?? 0.7,
      generated_at: new Date().toISOString(),
    };

    await admin.from("assessment_conclusions").upsert(conclusion, { onConflict: "user_id,test_type" });

    return new Response(JSON.stringify(conclusion), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("assessment-synthesizer error", err);
    return new Response(JSON.stringify({ error: err?.message || "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
