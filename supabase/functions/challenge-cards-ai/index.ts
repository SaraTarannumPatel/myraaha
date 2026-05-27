import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getAuthUser, isAdminRequest, unauthorized, forbidden } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-admin-secret, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authedUser = await getAuthUser(req);
    if (!authedUser) return unauthorized();
    const { type, context } = await req.json();
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!apiKey) throw new Error("Missing API key");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (type === "generate_challenges") {
      if (!(await isAdminRequest(req))) return forbidden("Admin only");
      const { data: paths } = await supabase.from("career_paths").select("*");
      const { data: existing } = await supabase.from("domain_challenge_cards").select("career_path_id");
      const existingIds = new Set((existing || []).map((e: any) => e.career_path_id));
      const needsChallenges = (paths || []).filter((p: any) => !existingIds.has(p.id));

      if (needsChallenges.length === 0) {
        return new Response(JSON.stringify({ message: "All paths have challenges", count: 0 }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const batch = needsChallenges.slice(0, 2);
      const generated: string[] = [];

      for (const path of batch) {
        const prompt = `Generate 3 real-world work challenges/tasks for the career path "${path.title}" in the "${path.domain}" domain. These should be ACTUAL tasks that professionals in this role do day-to-day. Make them feel real, specific, and tangible so someone exploring careers can understand what the work actually involves.

Use Gen Z language — casual, real, no corporate fluff.

For each challenge, return:
{
  "challenges": [
    {
      "challenge_name": "A catchy but descriptive task name",
      "task_description": "A detailed 80-120 word description of the task. What exactly do you do? What's the context? What does the output look like? Make it vivid and specific.",
      "difficulty_level": "beginner" | "intermediate" | "advanced",
      "estimated_time": "e.g. '2-3 hours', '1 day', '1 week'",
      "tools_used": ["tool1", "tool2", "tool3"],
      "skills_needed": ["skill1", "skill2", "skill3"],
      "compensation": "What someone gets paid for this type of task (e.g. '₹500-2000 per task', '₹30-50K/month salary component')",
      "tags": ["tag1", "tag2"]
    }
  ]
}

Career Path: ${path.title}
Domain: ${path.domain}
Description: ${path.description || ""}
Related Skills: ${(path.related_skills || []).join(", ")}
Salary Range: ${path.salary_range || ""}`;

        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: "You are a career task designer. Generate realistic, specific work challenges that professionals actually do. Always return valid JSON." },
              { role: "user", content: prompt },
            ],
            response_format: { type: "json_object" },
          }),
        });

        if (!res.ok) {
          if (res.status === 429) return new Response(JSON.stringify({ error: "Rate limited" }), { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } });
          if (res.status === 402) return new Response(JSON.stringify({ error: "Usage limit reached" }), { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } });
          continue;
        }

        const data = await res.json();
        const text = data.choices?.[0]?.message?.content || "";
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (!jsonMatch) continue;

        try {
          const parsed = JSON.parse(jsonMatch[0]);
          const challenges = parsed.challenges || [];
          for (const ch of challenges) {
            await supabase.from("domain_challenge_cards").insert({
              career_path_id: path.id,
              challenge_name: ch.challenge_name || "Untitled Challenge",
              task_description: ch.task_description || "",
              difficulty_level: ch.difficulty_level || "beginner",
              estimated_time: ch.estimated_time || "1-2 hours",
              tools_used: ch.tools_used || [],
              skills_needed: ch.skills_needed || [],
              compensation: ch.compensation || "",
              domain: path.domain || "general",
              tags: ch.tags || [],
            });
          }
          generated.push(path.title);
        } catch { continue; }
      }

      return new Response(JSON.stringify({ generated, remaining: needsChallenges.length - batch.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "analyze_challenge_behavior") {
      const userId = context.user_id;
      if (!userId) throw new Error("user_id required");

      const { data: interactions } = await supabase
        .from("challenge_card_interactions")
        .select("*, domain_challenge_cards(*)")
        .eq("user_id", userId);

      if (!interactions || interactions.length < 3) {
        return new Response(JSON.stringify({ message: "Need at least 3 interactions", current: interactions?.length || 0 }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const loved = interactions.filter((i: any) => i.interaction_type === "love");
      const liked = interactions.filter((i: any) => i.interaction_type === "like");
      const bookmarked = interactions.filter((i: any) => i.interaction_type === "bookmark");
      const rejected = interactions.filter((i: any) => i.interaction_type === "not_for_me");

      const prompt = `Analyze this user's reactions to real-world career challenges/tasks. Build a behavioral profile based on what types of work they're drawn to vs. avoid.

LOVED challenges (strong positive): ${JSON.stringify(loved.map((i: any) => ({ name: i.domain_challenge_cards?.challenge_name, domain: i.domain_challenge_cards?.domain, skills: i.domain_challenge_cards?.skills_needed, difficulty: i.domain_challenge_cards?.difficulty_level, tools: i.domain_challenge_cards?.tools_used })))}

LIKED challenges (positive): ${JSON.stringify(liked.map((i: any) => ({ name: i.domain_challenge_cards?.challenge_name, domain: i.domain_challenge_cards?.domain, skills: i.domain_challenge_cards?.skills_needed })))}

BOOKMARKED challenges (curious): ${JSON.stringify(bookmarked.map((i: any) => ({ name: i.domain_challenge_cards?.challenge_name, domain: i.domain_challenge_cards?.domain })))}

REJECTED challenges (avoidance): ${JSON.stringify(rejected.map((i: any) => ({ name: i.domain_challenge_cards?.challenge_name, domain: i.domain_challenge_cards?.domain, skills: i.domain_challenge_cards?.skills_needed })))}

Return JSON:
{
  "work_style_profile": {
    "preferred_complexity": "simple/moderate/complex",
    "preferred_duration": "quick-tasks/medium-projects/long-term",
    "tool_affinity": ["tools they gravitate toward"],
    "skill_patterns": ["skills they consistently like"],
    "avoidance_patterns": ["types of work they avoid"]
  },
  "domain_fit": [
    {"domain": "string", "fit_score": 0-100, "reason": "why this domain fits based on challenge preferences"}
  ],
  "career_task_profile": "A 2-3 sentence Gen Z style summary of what kind of work this person actually enjoys doing day-to-day",
  "suggested_next_challenges": ["3 specific types of challenges to try next"],
  "roadmap_signals": {
    "ready_for": ["domains/paths they show readiness for"],
    "needs_exploration": ["areas to explore more"],
    "strength_areas": ["where they naturally excel"]
  }
}`;

      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are a career behavioral analyst specializing in work-task preferences. Use Gen Z language." },
            { role: "user", content: prompt },
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
      const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      // Save to behavior analysis table
      await supabase.from("story_behavior_analysis").upsert({
        user_id: userId,
        analysis_type: "challenge_preferences",
        domains_attracted: (analysis.domain_fit || []).filter((d: any) => d.fit_score > 60).map((d: any) => d.domain),
        domains_rejected: (analysis.work_style_profile?.avoidance_patterns || []),
        skills_resonated: (analysis.work_style_profile?.skill_patterns || []),
        personality_signals: analysis.work_style_profile || {},
        career_inclinations: analysis.roadmap_signals || {},
        ai_summary: analysis.career_task_profile || "",
        confidence_score: Math.min(1, (interactions.length / 10)),
      }, { onConflict: "user_id,analysis_type" });

      return new Response(JSON.stringify(analysis), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unknown type: ${type}`);
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
