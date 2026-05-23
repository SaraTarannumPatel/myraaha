import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { NavigateFunction } from "react-router-dom";

export type BlueprintCtx = {
  shortTermGoals: string;
  longTermGoals: string;
  interests: string[];
  skills: string[];
  industry: string;
  careerStage: string;
  areasOfFocus: string[];
  sourceContext: string;
};

/**
 * Generate a personalised roadmap from a Curiosity-Compass mode behavioural
 * blueprint, persist it (For You / suggested + active roadmap) and navigate the
 * user to /dashboard/roadmap with the timeline tab.
 *
 * Used by Story / Challenge / Visual / Career-Cards modes.
 */
export async function generateBlueprintRoadmap(
  userId: string,
  ctx: BlueprintCtx,
  titleFallback: string,
  navigate: NavigateFunction,
) {
  // 1. AI roadmap structure
  const { data, error } = await supabase.functions.invoke("roadmap-ai", {
    body: { type: "generate_roadmap", context: ctx },
  });
  if (error) throw error;

  // 2. Persist roadmap as the user's active roadmap (For You section reads this)
  const { data: newRoadmap, error: rmErr } = await supabase
    .from("roadmaps")
    .insert({
      user_id: userId,
      title: data?.title || titleFallback,
      description: data?.description || ctx.longTermGoals || ctx.shortTermGoals,
      intent: "career",
      short_term_goals: ctx.shortTermGoals,
      long_term_goals: ctx.longTermGoals,
      skill_gaps: data?.skill_gaps || [],
      ai_suggestions: { ...data, source: ctx.sourceContext },
      is_active: true,
    })
    .select()
    .single();
  if (rmErr) throw rmErr;

  // Deactivate previously-active roadmaps
  await supabase
    .from("roadmaps")
    .update({ is_active: false })
    .eq("user_id", userId)
    .neq("id", newRoadmap.id);

  // 3. Persist all phase steps
  const allSteps: any[] = [];
  let orderIndex = 0;
  for (const phase of data?.phases || []) {
    for (const step of phase.steps || []) {
      allSteps.push({
        roadmap_id: newRoadmap.id,
        user_id: userId,
        title: step.title,
        description: step.description,
        phase: phase.name,
        category: step.category,
        skill_tags: step.skill_tags || [],
        priority: step.priority || "medium",
        ai_generated: true,
        order_index: orderIndex++,
      });
    }
  }
  if (allSteps.length > 0) {
    await supabase.from("roadmap_steps").insert(allSteps);
  }

  // 4. Also surface as a suggested roadmap so it appears in the For You feed
  try {
    await supabase.from("suggested_roadmaps").insert({
      user_id: userId,
      title: newRoadmap.title,
      description: newRoadmap.description,
      match_score: 95,
      reasoning: [
        `Generated from your ${ctx.sourceContext.replace(/_/g, " ")} blueprint`,
        ...(ctx.areasOfFocus || []).slice(0, 3).map((a) => `Aligned with focus area: ${a}`),
      ],
      source_signals: { interests: ctx.interests, skills: ctx.skills },
      roadmap_data: {
        key_skills: ctx.skills,
        target_roles: ctx.areasOfFocus,
        phases: (data?.phases || []).map((p: any) => p.name),
      },
      status: "accepted",
      source_module: ctx.sourceContext,
    });
  } catch (e) {
    // Non-fatal — the active roadmap is the primary surface
    console.warn("suggested_roadmaps insert skipped:", e);
  }

  toast.success("Personalized roadmap created from your blueprint! 🗺️");

  // 5. Navigate to the actual roadmap route (NOT /career/roadmap)
  navigate("/dashboard/roadmap?tab=suggested", {
    state: {
      context: ctx,
      source: ctx.sourceContext,
      roadmapId: newRoadmap.id,
    },
  });

  return newRoadmap;
}
