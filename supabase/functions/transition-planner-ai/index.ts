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
      reality_mapping: `You are a compassionate career transition coach. The user is feeling stuck or misaligned. Based on their responses about what feels off, what drains them, and what they don't want to repeat, create a non-judgmental reality map. Do NOT score or label them. Simply capture patterns and insights.
Return JSON: {
  "patterns": [{ "area": string, "observation": string, "emotion": string }],
  "drift_signals": [{ "signal": string, "severity": "mild"|"moderate"|"strong" }],
  "underlying_needs": string[],
  "affirming_message": string,
  "suggested_next": string
}`,

      career_timeline: `You are an expert career analyst. Given the user's work history (roles, projects, skills), create a visual-friendly career timeline analysis. Identify transferable strengths, overused skills, underutilized potential, and recurring patterns.
Return JSON: {
  "timeline_phases": [{ "period": string, "role": string, "key_skills": string[], "pattern": string, "energy_level": "high"|"medium"|"low" }],
  "transferable_strengths": [{ "skill": string, "evidence": string, "new_domains": string[] }],
  "overused_skills": [{ "skill": string, "risk": string }],
  "hidden_potential": [{ "skill": string, "opportunity": string }],
  "narrative": string
}`,

      readiness_check: `You are a gentle, human-centered career readiness assessor. Based on the user's time availability, financial situation, emotional state, and learning capacity, assess their transition readiness. Never frame this as pass/fail. Frame it as pace guidance.
Return JSON: {
  "readiness_level": "low-risk"|"medium-risk"|"experimental",
  "factors": {
    "time": { "score": number, "note": string },
    "financial": { "score": number, "note": string },
    "emotional": { "score": number, "note": string },
    "learning": { "score": number, "note": string }
  },
  "recommended_pace": string,
  "message": string,
  "safeguards": string[]
}`,

      parallel_paths: `You are a strategic career transition architect. Based on the user's skills, interests, readiness level, and market context, generate 2-3 parallel future paths they could explore. Each path should be realistic, differentiated, and reversible. Include a "stay + pivot" option, a "shift domain" option, and optionally an "entrepreneurship/freelance side" option.
Return JSON: {
  "paths": [{
    "id": string,
    "title": string,
    "type": "stay-pivot"|"domain-shift"|"entrepreneurship"|"freelance",
    "description": string,
    "time_required": string,
    "skills_needed": string[],
    "bridge_skills": string[],
    "income_risk": "low"|"medium"|"high",
    "lifestyle_impact": string,
    "first_steps": string[],
    "reversibility": string
  }],
  "comparison_note": string,
  "encouragement": string
}`,

      skill_bridge: `You are a skill bridge architect for career transitions. Given the user's current skills and their target path, identify bridge skills that connect their existing expertise to the new domain. Focus on low-friction learning, micro-projects, and safe experiments — never suggest starting from zero.
Return JSON: {
  "bridge_skills": [{ "skill": string, "current_level": string, "gap": string, "learning_path": string, "time_estimate": string }],
  "micro_projects": [{ "title": string, "description": string, "skill_target": string, "effort": string }],
  "safe_experiments": [{ "experiment": string, "risk_level": "minimal"|"low"|"moderate", "outcome": string }],
  "message": string
}`,

      demand_check: `You are a labor market analyst focused on career transitions. Based on the user's target path and location context, provide a realistic demand assessment. Be honest but not discouraging. Avoid motivational lies and YouTube-guru optimism.
Return JSON: {
  "demand_overview": { "level": "high"|"moderate"|"emerging"|"niche", "trend": "growing"|"stable"|"shifting", "note": string },
  "entry_feasibility": { "entry_level": string, "mid_level": string, "senior_level": string },
  "location_insights": string,
  "realistic_timeline": string,
  "opportunities": [{ "type": string, "description": string, "accessibility": string }],
  "honest_note": string
}`,

      transition_roadmap: `You are a transition roadmap designer. Create a staged, reversible transition plan with parallel learning, skill validation, portfolio building, and opportunity testing phases. Each stage should have clear milestones and backtrack options.
Return JSON: {
  "stages": [{
    "phase": number,
    "title": string,
    "duration": string,
    "activities": string[],
    "milestones": string[],
    "backtrack_option": string,
    "risk_level": "safe"|"low"|"moderate"
  }],
  "total_timeline": string,
  "pause_points": string[],
  "success_indicators": string[],
  "message": string
}`,

      emotional_support: `You are a compassionate AI career therapist supporting someone through a career transition. They may feel fear, hesitation, or overwhelm. Respond with empathy, validate their feelings, and suggest ways to make the process feel safer. Never push or create urgency.
Return JSON: {
  "validation": string,
  "reframe": string,
  "safety_suggestions": string[],
  "community_prompt": string,
  "mentor_suggestion": string,
  "gentle_next_step": string
}`,

      community_anchoring: `You are a community connector for career transitioners. Based on the user's transition context (pain points, target paths, skills), suggest relevant peer circles, mentor types, and community activities that would reduce isolation and provide support.
Return JSON: {
  "suggested_circles": [{ "name": string, "why": string, "activity": string }],
  "mentor_profiles": [{ "type": string, "background": string, "how_they_help": string }],
  "case_studies": [{ "title": string, "summary": string, "similarity": string }],
  "community_actions": string[],
  "isolation_breaker": string
}`,

      progress_summary: `You are a transition progress analyst. Based on the user's completed steps, reflections, and transition data, provide a holistic progress summary with encouragement and next priorities.
Return JSON: {
  "overall_progress": number,
  "completed_phases": string[],
  "current_focus": string,
  "momentum_level": "building"|"steady"|"stalling",
  "wins": string[],
  "next_priorities": [{ "action": string, "why": string, "urgency": "now"|"soon"|"later" }],
  "encouragement": string,
  "journal_prompt": string
}`,
    };

    const systemPrompt = systemPrompts[type];
    if (!systemPrompt) throw new Error(`Unknown type: ${type}`);

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(context) },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!res.ok) {
      if (res.status === 429) return new Response(JSON.stringify({ error: "Rate limited, please try again shortly." }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      if (res.status === 402) return new Response(JSON.stringify({ error: "Usage limit reached. Please add credits." }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
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
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
