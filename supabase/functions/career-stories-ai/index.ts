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

    if (type === "generate_stories") {
      if (!(await isAdminRequest(req))) return forbidden("Admin only");
      // Generate career stories for paths that don't have stories yet
      const { data: paths } = await supabase.from("career_paths").select("*");
      const { data: existingStories } = await supabase.from("career_stories").select("career_path_id");
      const existingPathIds = new Set((existingStories || []).map((s: any) => s.career_path_id));
      const pathsNeedingStories = (paths || []).filter((p: any) => !existingPathIds.has(p.id));

      if (pathsNeedingStories.length === 0) {
        return new Response(JSON.stringify({ message: "All paths have stories", count: 0 }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Generate stories in batches of 3
      const batch = pathsNeedingStories.slice(0, 3);
      const generated = [];

      for (const path of batch) {
        const prompt = `Generate a first-person career story for the following career path. Write it as if a real professional is telling their story to a young person exploring careers. Use Gen Z friendly language - casual, relatable, authentic.

Career Path: ${path.title}
Domain: ${path.domain}
Description: ${path.description || ""}
Day to Day: ${path.day_to_day || ""}
Skills: ${(path.related_skills || []).join(", ")}
Salary Range: ${path.salary_range || ""}
Demand Level: ${path.demand_level || ""}

Return a JSON object with these fields:
{
  "narrator_name": "A realistic Indian name",
  "narrator_role": "Their current job title",
  "narrator_experience_years": number,
  "title": "A catchy story title like 'From confused college kid to leading a design team at Google'",
  "story_content": "A 200-300 word first-person narrative. Start with how they discovered this path, what surprised them, what a typical day looks like, how they use their skills. Make it real, raw, and relatable. Include moments of doubt and breakthrough. Use casual Gen Z language.",
  "day_in_life": "A vivid 100-word description of their typical workday, hour by hour highlights",
  "skills_highlighted": ["skill1", "skill2", ...],
  "pros": ["pro1", "pro2", "pro3", "pro4"],
  "cons": ["con1", "con2", "con3"],
  "advice": "One powerful piece of advice for someone considering this path",
  "tags": ["tag1", "tag2", "tag3"]
}`;

        const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: [
              { role: "system", content: "You are a career storytelling AI. Generate authentic, relatable first-person career narratives. Always return valid JSON." },
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
          const story = JSON.parse(jsonMatch[0]);
          const { error } = await supabase.from("career_stories").insert({
            career_path_id: path.id,
            title: story.title || `Life as a ${path.title}`,
            narrator_name: story.narrator_name || "Anonymous",
            narrator_role: story.narrator_role || path.title,
            narrator_experience_years: story.narrator_experience_years || 5,
            story_content: story.story_content || "",
            day_in_life: story.day_in_life || "",
            skills_highlighted: story.skills_highlighted || path.related_skills || [],
            pros: story.pros || [],
            cons: story.cons || [],
            advice: story.advice || "",
            domain: path.domain || "general",
            tags: story.tags || [],
            difficulty_level: path.difficulty || "beginner",
          });
          if (!error) generated.push(path.title);
        } catch { continue; }
      }

      return new Response(JSON.stringify({ generated, remaining: pathsNeedingStories.length - batch.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (type === "analyze_behavior") {
      // Always use the authenticated user's id, never trust client input
      const userId = authedUser.id;

      const { data: interactions } = await supabase
        .from("career_story_interactions")
        .select("*, career_stories(*)")
        .eq("user_id", userId);

      if (!interactions || interactions.length < 3) {
        return new Response(JSON.stringify({ 
          message: "Need at least 3 interactions for analysis",
          current: interactions?.length || 0 
        }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const loved = interactions.filter((i: any) => i.interaction_type === "love");
      const liked = interactions.filter((i: any) => i.interaction_type === "like");
      const bookmarked = interactions.filter((i: any) => i.interaction_type === "bookmark");
      const rejected = interactions.filter((i: any) => i.interaction_type === "not_for_me");

      const analysisPrompt = `Analyze this user's career story interactions and build a behavioral profile.

LOVED stories (strongest signal): ${JSON.stringify(loved.map((i: any) => ({
  title: i.career_stories?.title,
  domain: i.career_stories?.domain,
  skills: i.career_stories?.skills_highlighted,
  time_spent: i.time_spent_seconds
})))}

LIKED stories (positive signal): ${JSON.stringify(liked.map((i: any) => ({
  title: i.career_stories?.title,
  domain: i.career_stories?.domain,
  skills: i.career_stories?.skills_highlighted
})))}

BOOKMARKED stories (curiosity signal): ${JSON.stringify(bookmarked.map((i: any) => ({
  title: i.career_stories?.title,
  domain: i.career_stories?.domain,
  skills: i.career_stories?.skills_highlighted
})))}

REJECTED stories (avoidance signal): ${JSON.stringify(rejected.map((i: any) => ({
  title: i.career_stories?.title,
  domain: i.career_stories?.domain,
  skills: i.career_stories?.skills_highlighted
})))}

Return JSON:
{
  "domains_attracted": ["domain1", "domain2"],
  "domains_rejected": ["domain1"],
  "skills_resonated": ["skill1", "skill2", "skill3"],
  "personality_signals": {
    "work_style": "creative/analytical/social/structured",
    "risk_appetite": "high/medium/low",
    "autonomy_preference": "high/medium/low",
    "people_orientation": "high/medium/low",
    "creativity_drive": "high/medium/low"
  },
  "career_inclinations": {
    "top_3_paths": ["path1", "path2", "path3"],
    "emerging_interests": ["interest1", "interest2"],
    "blind_spots": ["area they might enjoy but haven't explored"]
  },
  "ai_summary": "A 2-3 sentence Gen Z style summary of what their choices reveal about them",
  "confidence_score": 0.0-1.0,
  "roadmap_seeds": [
    {"domain": "string", "reason": "why this fits", "entry_point": "where to start"}
  ]
}`;

      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are a career behavioral analyst. Analyze interaction patterns to understand career preferences. Be insightful but never judgmental. Use Gen Z language." },
            { role: "user", content: analysisPrompt },
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

      // Save analysis
      await supabase.from("story_behavior_analysis").upsert({
        user_id: userId,
        analysis_type: "story_preferences",
        domains_attracted: analysis.domains_attracted || [],
        domains_rejected: analysis.domains_rejected || [],
        skills_resonated: analysis.skills_resonated || [],
        personality_signals: analysis.personality_signals || {},
        career_inclinations: analysis.career_inclinations || {},
        ai_summary: analysis.ai_summary || "",
        confidence_score: analysis.confidence_score || 0,
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
