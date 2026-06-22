import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * combined-conclusion-synthesizer
 *
 * Aggregates onboarding + discovery + psychometric + interests signals for the
 * authenticated user, asks Lovable AI Gemini for a unified identity summary,
 * upserts it into `combined_conclusions`, then runs the `compute_compass_fit`
 * RPC so the Path Map view has fresh best/force/no buckets.
 */
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

    // ---------- Gather signals ----------
    const [profileRes, conclusionsRes, interestProfileRes, keywordsRes, onboardingRes] = await Promise.all([
      admin.from("profiles").select("user_type, journey_responses, demographics, public_uid").eq("user_id", user.id).maybeSingle(),
      admin.from("assessment_conclusions").select("*").eq("user_id", user.id),
      admin.from("user_interest_profile").select("*").eq("user_id", user.id).maybeSingle(),
      admin.from("assessment_conclusion_keywords").select("keyword, weight, source_assessment").eq("user_id", user.id),
      admin.from("user_onboarding_sectors").select("sector").eq("user_id", user.id),
    ]);

    const profile = profileRes.data || {};
    const conclusions = conclusionsRes.data || [];
    const interestProfile = interestProfileRes.data || {};
    const keywords = (keywordsRes.data || []).map((k: any) => k.keyword).filter(Boolean);
    const sectors = (onboardingRes.data || []).map((s: any) => s.sector).filter(Boolean);

    const journey = (profile as any)?.journey_responses || {};

    // ---------- Build prompt for Gemini ----------
    const systemPrompt = `You are MyRaaha's identity synthesizer. Take a user's onboarding data plus three completed assessments (Discovery, Psychometric, Interests) and produce a single Combined Conclusion as strict JSON.

The voice is warm, direct, jargon-free, slightly Gen Z (no slang dump). The audience is age 13+, including Tier 3/4 rural India — keep language accessible.

Return ONLY valid JSON with this exact shape:
{
  "identity_summary": "string, 2–3 sentences capturing who this person is right now",
  "dominant_archetype": "short label",
  "cognitive_signature": "short label (e.g. 'Analytical Synthesizer')",
  "risk_profile": "Bold | Calculated | Cautious | Avoidant",
  "growth_orientation": "Stretch-Driven | Steady Builder | Reflective Learner | Reluctant",
  "top_motivations": ["string", "string", "string"],
  "values_anchors": ["string", "string", "string"],
  "domain_affinities": { "science": 0-1, "math": 0-1, "tech": 0-1, "business": 0-1, "humanities": 0-1, "arts": 0-1 },
  "work_preferences": { "autonomy": "high|medium|low", "structure": "high|medium|low", "collab": "solo|pair|team|community" },
  "style_axes": { "problem": "string", "activity": "string", "impact": "string" },
  "hard_constraints": { "life_stage": "string", "intent": "string", "education_stage": "string" },
  "red_flag_traits": ["string"],
  "narrative_long": "4–6 sentence longer narrative the user can read in 'see the full identity narrative'"
}

Never invent assessments the user didn't take. Use the signals exactly as provided.`;

    const userPayload = {
      onboarding: {
        user_type: (profile as any)?.user_type || null,
        journey_id: journey.journey_id || null,
        variant: journey.variant || null,
        intent: journey.intent || null,
        education_stage: journey.education_stage || null,
        life_stage: journey.life_stage || null,
        sectors,
        demographics: (profile as any)?.demographics || null,
      },
      assessment_conclusions: conclusions,
      interest_profile: interestProfile,
      top_keywords: keywords.slice(0, 80),
    };

    const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(userPayload) },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      console.error("AI gateway error", aiRes.status, txt);
      if (aiRes.status === 429 || aiRes.status === 402) {
        return new Response(JSON.stringify({ error: "ai_rate_or_credit", status: aiRes.status }), {
          status: aiRes.status,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway returned ${aiRes.status}`);
    }

    const aiJson = await aiRes.json();
    const content = aiJson?.choices?.[0]?.message?.content || "{}";
    let parsed: any = {};
    try { parsed = JSON.parse(content); } catch (e) { parsed = { identity_summary: content }; }

    // ---------- Upsert combined_conclusions ----------
    const { error: upsertErr } = await admin
      .from("combined_conclusions")
      .upsert({
        user_id: user.id,
        identity_summary: parsed.identity_summary || null,
        dominant_archetype: parsed.dominant_archetype || null,
        cognitive_signature: parsed.cognitive_signature || null,
        risk_profile: parsed.risk_profile || null,
        growth_orientation: parsed.growth_orientation || null,
        top_motivations: parsed.top_motivations || [],
        values_anchors: parsed.values_anchors || [],
        domain_affinities: parsed.domain_affinities || {},
        work_preferences: parsed.work_preferences || {},
        style_axes: parsed.style_axes || {},
        hard_constraints: parsed.hard_constraints || {},
        red_flag_traits: parsed.red_flag_traits || [],
        narrative_long: parsed.narrative_long || null,
        raw: parsed,
        generated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

    if (upsertErr) {
      console.error("upsert combined_conclusions failed", upsertErr);
      throw upsertErr;
    }

    // ---------- Run fit engine ----------
    const { data: fitData, error: fitErr } = await admin.rpc("compute_compass_fit", { _user_id: user.id });
    if (fitErr) console.warn("compute_compass_fit failed", fitErr);

    return new Response(
      JSON.stringify({ success: true, conclusion: parsed, fit: fitData || null }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e: any) {
    console.error("combined-conclusion-synthesizer error", e);
    return new Response(JSON.stringify({ error: e?.message || "unknown" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
