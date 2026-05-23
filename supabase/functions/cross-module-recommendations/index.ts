import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader || "" } },
    });

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { target_module, limit } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("Missing API key");

    // Gather all user signals
    const { data: signals } = await supabase
      .from("user_signals")
      .select("signal_value, signal_type, signal_source, strength, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(200);

    // Gather interests, interactions, domain affinities
    const [interestsRes, affinityRes, questRes] = await Promise.all([
      supabase.from("interests").select("name, category, strength").eq("user_id", user.id),
      supabase.from("domain_affinity").select("domain_name, affinity_score").eq("user_id", user.id),
      supabase.from("curiosity_quest_progress").select("responses, analysis_results").eq("user_id", user.id).eq("status", "completed"),
    ]);

    const systemPrompt = `You are a cross-module recommendation engine for a career exploration platform. 
Based on the user's signals (keywords, interactions, preferences, selections) from across ALL modules, 
generate highly personalized recommendations for the "${target_module}" module.

IMPORTANT: All monetary values must be in INR (₹). Convert any USD values to INR (1 USD ≈ 83 INR).

Return JSON based on target module:
- "learning_library": { "recommendations": [{ "title": string, "type": "course"|"video"|"article"|"book"|"research_paper"|"website", "url": string (external link), "reason": string, "relevance_score": number }], "focus_areas": string[] }
- "job_matching": { "recommendations": [{ "role": string, "domain": string, "reason": string, "salary_range_inr": string, "skills_needed": string[] }] }
- "roadmap": { "suggested_roadmaps": [{ "title": string, "domain": string, "match_score": number, "reasoning": string[], "key_skills": string[], "phases": string[] }] }
- "skill_stacker": { "skills_to_develop": [{ "skill": string, "reason": string, "priority": "high"|"medium"|"low", "resources": string[] }] }
- "project_playground": { "projects": [{ "title": string, "description": string, "domain": string, "skills": string[], "difficulty": string }] }
- "mentor_match": { "mentor_traits": [{ "expertise": string, "reason": string }] }
- default: { "insights": string[], "recommendations": string[], "next_actions": string[] }`;

    const userContext = {
      signals: signals || [],
      interests: interestsRes.data || [],
      domain_affinities: affinityRes.data || [],
      quest_results: questRes.data || [],
      target_module,
    };

    const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: JSON.stringify(userContext) },
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
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
