import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import type { TestType } from "./useAssessmentRewards";

/**
 * useModuleProgress — additive helper any module (SkillStacker, Roadmap,
 * Entrepreneurship onboarding, etc.) can call to report progress and trigger
 * the existing 25/50/75/100% reward celebration flow.
 *
 * The RewardCelebrationManager already mounted in DashboardLayout will pick
 * up newly inserted reward_unlock_events via realtime — no per-module UI work.
 */
export function useModuleProgress() {
  const { user } = useAuth();

  const report = useCallback(
    async (testType: TestType, completed: number, total: number) => {
      if (!user || total <= 0) return null;
      const { data, error } = await supabase.rpc("update_assessment_progress" as any, {
        _test_type: testType,
        _completed: completed,
        _total: total,
      });
      if (error) {
        console.warn(`[useModuleProgress] ${testType}`, error);
        return null;
      }
      return data as { progress: number; unlocked: any[] };
    },
    [user]
  );

  return { report };
}
