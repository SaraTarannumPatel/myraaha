import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user from token
    const token = authHeader.replace("Bearer ", "");
    const anonClient = createClient(supabaseUrl, Deno.env.get("SUPABASE_ANON_KEY")!);
    const { data: { user }, error: authError } = await anonClient.auth.getUser(token);
    if (authError || !user) throw new Error("Unauthorized");

    const userId = user.id;

    // Fetch user activity data in parallel
    const [profileRes, skillsRes, journalRes, achievementsRes, interestsRes, roadmapRes, notificationsRes] = await Promise.all([
      supabase.from("profiles").select("*").eq("user_id", userId).single(),
      supabase.from("skills").select("id, name, proficiency, created_at").eq("user_id", userId),
      supabase.from("journal_entries").select("id, created_at, mood, tags").eq("user_id", userId).order("created_at", { ascending: false }).limit(30),
      supabase.from("achievements").select("id, title, earned_at").eq("user_id", userId),
      supabase.from("interests").select("id, name, category, strength").eq("user_id", userId),
      supabase.from("roadmap_steps").select("id, status, title").eq("user_id", userId),
      supabase.from("notifications").select("id").eq("user_id", userId).eq("is_read", false),
    ]);

    const profile = profileRes.data;
    const skills = skillsRes.data || [];
    const journals = journalRes.data || [];
    const achievements = achievementsRes.data || [];
    const interests = interestsRes.data || [];
    const roadmapSteps = roadmapRes.data || [];

    // Calculate inactivity
    const lastJournal = journals[0]?.created_at;
    const daysSinceLastActivity = lastJournal
      ? Math.floor((Date.now() - new Date(lastJournal).getTime()) / 86400000)
      : 999;

    // Calculate career readiness score
    const profileCompletion = profile?.completion_percentage || 0;
    const skillScore = Math.min(skills.length * 5, 25);
    const interestScore = Math.min(interests.length * 3, 15);
    const resumeScore = skills.length > 3 ? 15 : skills.length * 5;
    const activityScore = daysSinceLastActivity < 3 ? 15 : daysSinceLastActivity < 7 ? 10 : 5;
    const goalScore = (profile?.short_term_goals ? 10 : 0) + (profile?.long_term_goals ? 5 : 0);
    const roadmapProgress = roadmapSteps.filter(s => s.status === "completed").length;
    const roadmapScore = Math.min(roadmapProgress * 3, 15);

    const readinessScore = Math.min(
      skillScore + interestScore + resumeScore + activityScore + goalScore + roadmapScore,
      100
    );

    // Determine readiness level
    let readinessLevel = "Getting Started";
    if (readinessScore >= 80) readinessLevel = "Career Ready";
    else if (readinessScore >= 60) readinessLevel = "Building Momentum";
    else if (readinessScore >= 40) readinessLevel = "Finding Direction";
    else if (readinessScore >= 20) readinessLevel = "Exploring";

    // Build nudges based on behavior
    const nudges: any[] = [];

    if (daysSinceLastActivity > 7) {
      nudges.push({
        type: "re_engagement",
        title: "We miss you! 🌟",
        message: "It looks like you haven't explored career resources this week. Ready to pick up where you left off?",
        action_url: "/dashboard/curiosity-compass",
        priority: "high",
      });
    }

    if (skills.length === 0) {
      nudges.push({
        type: "onboarding",
        title: "Map your first skill 🎯",
        message: "Adding skills helps us personalize your job recommendations and career roadmaps.",
        action_url: "/dashboard/skill-stacker",
        priority: "high",
      });
    }

    if (interests.length > 2 && skills.length < 3) {
      nudges.push({
        type: "contextual",
        title: `You've explored ${interests.length} interest areas ✨`,
        message: "Would you like to build skills in these areas? SkillStacker can help you get started.",
        action_url: "/dashboard/skill-stacker",
        priority: "medium",
      });
    }

    if (achievements.length > 0 && achievements.length % 3 === 0) {
      nudges.push({
        type: "celebration",
        title: `🏆 ${achievements.length} badges earned!`,
        message: "You're making great progress! Check the leaderboard to see where you rank.",
        action_url: "/dashboard/leaderboard",
        priority: "low",
      });
    }

    if (roadmapSteps.length > 0 && roadmapSteps.filter(s => s.status === "in_progress").length === 0) {
      nudges.push({
        type: "nudge",
        title: "Your roadmap awaits 🗺️",
        message: "You have roadmap tasks waiting. Starting the next step keeps momentum going.",
        action_url: "/dashboard/roadmap",
        priority: "medium",
      });
    }

    if (!profile?.short_term_goals) {
      nudges.push({
        type: "profile",
        title: "Set your career goals 🎯",
        message: "Defining goals helps our AI create better recommendations and track your progress.",
        action_url: "/dashboard/settings",
        priority: "medium",
      });
    }

    // Use AI for personalized recommendations
    const apiKey = Deno.env.get("LOVABLE_API_KEY");
    let aiRecommendations: any = null;

    if (apiKey) {
      try {
        const aiRes = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-lite",
            messages: [
              {
                role: "system",
                content: `You are a career advisor AI for MyRaaha. Generate personalized career recommendations based on user data. Return JSON:
{
  "next_steps": [{ "title": string, "description": string, "action_url": string, "category": "learning"|"networking"|"skills"|"experience"|"reflection", "priority": "high"|"medium"|"low" }],
  "career_insight": string,
  "encouragement": string,
  "suggested_communities": [string],
  "skill_gaps": [string],
  "resume_tips": [string]
}
Keep recommendations specific, actionable, and empathetic. Max 5 next_steps.`
              },
              {
                role: "user",
                content: JSON.stringify({
                  profile: {
                    user_type: profile?.user_type,
                    industry: profile?.industry,
                    education: profile?.education_level,
                    career_stage: profile?.career_stage,
                    short_term_goals: profile?.short_term_goals,
                    long_term_goals: profile?.long_term_goals,
                    areas_of_focus: profile?.areas_of_focus,
                  },
                  skills: skills.map(s => ({ name: s.name, proficiency: s.proficiency })),
                  interests: interests.map(i => ({ name: i.name, category: i.category, strength: i.strength })),
                  stats: {
                    skillsCount: skills.length,
                    interestsCount: interests.length,
                    achievementsCount: achievements.length,
                    journalCount: journals.length,
                    readinessScore,
                    daysSinceLastActivity,
                    roadmapStepsCompleted: roadmapSteps.filter(s => s.status === "completed").length,
                    roadmapStepsTotal: roadmapSteps.length,
                  }
                })
              }
            ],
            response_format: { type: "json_object" },
          }),
        });

        if (aiRes.ok) {
          const aiData = await aiRes.json();
          aiRecommendations = JSON.parse(aiData.choices?.[0]?.message?.content);
        }
      } catch (e) {
        console.error("AI recommendations error:", e);
      }
    }

    // Store high-priority nudges as notifications
    const highPriorityNudges = nudges.filter(n => n.priority === "high");
    if (highPriorityNudges.length > 0) {
      const existingNotifs = await supabase
        .from("notifications")
        .select("title")
        .eq("user_id", userId)
        .eq("is_read", false);

      const existingTitles = new Set((existingNotifs.data || []).map(n => n.title));

      const newNotifs = highPriorityNudges
        .filter(n => !existingTitles.has(n.title))
        .map(n => ({
          user_id: userId,
          title: n.title,
          message: n.message,
          notification_type: n.type,
          action_url: n.action_url,
        }));

      if (newNotifs.length > 0) {
        await supabase.from("notifications").insert(newNotifs);
      }
    }

    // Build auto-resume data
    const autoResume = {
      skills_summary: skills.slice(0, 10).map(s => ({ name: s.name, level: s.proficiency })),
      interests_summary: interests.slice(0, 8).map(i => i.name),
      achievements_summary: achievements.slice(0, 5).map(a => a.title),
      completedSteps: roadmapSteps.filter(s => s.status === "completed").length,
      totalSteps: roadmapSteps.length,
    };

    return new Response(JSON.stringify({
      readiness: {
        score: readinessScore,
        level: readinessLevel,
        breakdown: {
          skills: skillScore,
          interests: interestScore,
          resume: resumeScore,
          activity: activityScore,
          goals: goalScore,
          roadmap: roadmapScore,
        },
      },
      nudges,
      recommendations: aiRecommendations,
      autoResume,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("career-insights error:", error);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
