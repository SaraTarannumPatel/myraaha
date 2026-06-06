import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type TestType =
  | "discovery"
  | "psychometric"
  | "skillstacker"
  | "roadmap"
  | "entrep_onboarding";

export interface AssessmentProgress {
  test_type: TestType;
  questions_total: number;
  questions_completed: number;
  progress_percentage: number;
  highest_milestone_reached: number;
  completed_at: string | null;
}

export interface RewardMilestone {
  id: string;
  milestone_key: string;
  test_type: TestType;
  milestone_percent: 25 | 50 | 75 | 100;
  title: string;
  description: string | null;
  reward_emoji: string;
  entitlement_key: string;
  entitlement_type: string;
}

export interface UnlockEvent {
  id: string;
  milestone_key: string;
  test_type: TestType;
  milestone_percent: number;
  title: string;
  description: string;
  reward_emoji: string;
  acknowledged: boolean;
  unlocked_at: string;
}

export const useAssessmentRewards = () => {
  const { user } = useAuth();
  const [progress, setProgress] = useState<Record<TestType, AssessmentProgress | null>>({
    discovery: null,
    psychometric: null,
    skillstacker: null,
    roadmap: null,
    entrep_onboarding: null,
  });
  const [milestones, setMilestones] = useState<RewardMilestone[]>([]);
  const [pendingUnlocks, setPendingUnlocks] = useState<UnlockEvent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAll = useCallback(async () => {
    if (!user) {
      setProgress({ discovery: null, psychometric: null, skillstacker: null, roadmap: null, entrep_onboarding: null });
      setMilestones([]);
      setPendingUnlocks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const [progressRes, milestonesRes, eventsRes] = await Promise.all([
      supabase.from("assessment_progress" as any).select("*").eq("user_id", user.id),
      supabase.from("reward_milestones" as any).select("*").order("milestone_percent"),
      supabase
        .from("reward_unlock_events" as any)
        .select("*")
        .eq("user_id", user.id)
        .eq("acknowledged", false)
        .order("unlocked_at", { ascending: false }),
    ]);

    const progMap: Record<TestType, AssessmentProgress | null> = { discovery: null, psychometric: null, skillstacker: null, roadmap: null, entrep_onboarding: null };
    ((progressRes.data as any[]) || []).forEach((p: any) => {
      const tt = p.test_type as TestType;
      if (tt in progMap) {
        progMap[tt] = p as AssessmentProgress;
      }
    });
    setProgress(progMap);
    setMilestones(((milestonesRes.data as any[]) || []) as RewardMilestone[]);
    setPendingUnlocks(((eventsRes.data as any[]) || []) as UnlockEvent[]);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Real-time pending unlocks subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel(`reward-unlocks-${user.id}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "reward_unlock_events", filter: `user_id=eq.${user.id}` },
        (payload) => {
          const nextEvent = payload.new as UnlockEvent | undefined;
          if (!nextEvent || nextEvent.acknowledged) {
            fetchAll();
            return;
          }
          setPendingUnlocks((prev) => [nextEvent, ...prev.filter((e) => e.id !== nextEvent.id)]);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  /** Update progress and auto-unlock crossed milestones */
  const updateProgress = useCallback(
    async (test_type: TestType, completed: number, total: number) => {
      if (!user) return null;
      const { data, error } = await supabase.rpc("update_assessment_progress" as any, {
        _test_type: test_type,
        _completed: completed,
        _total: total,
      });
      if (error) {
        console.error("Update assessment progress error", error);
        return null;
      }

      // Always refresh after progress writes so milestone cards, entitlement gates,
      // and celebration popups stay consistent for every user/session.
      const result = data as { progress: number; unlocked: any[] };
      await fetchAll();
      return result;
    },
    [user, fetchAll]
  );

  // Race-condition guard: prevent the same unlock from re-appearing if the realtime
  // INSERT event lands after the user has already tapped Continue but before the DB
  // UPDATE (acknowledged=true) has propagated back.
  const ackInFlight = useState<Set<string>>(() => new Set<string>())[0];

  const acknowledgeUnlock = useCallback(
    async (id: string) => {
      if (ackInFlight.has(id)) return;
      ackInFlight.add(id);
      // Optimistic removal first so the popup closes immediately.
      setPendingUnlocks((prev) => prev.filter((u) => u.id !== id));
      try {
        await supabase
          .from("reward_unlock_events" as any)
          .update({ acknowledged: true })
          .eq("id", id);
      } finally {
        // Keep the id in the in-flight set briefly so any late realtime INSERT
        // for the same event id is ignored, then drop it.
        setTimeout(() => ackInFlight.delete(id), 5000);
      }
    },
    [ackInFlight]
  );

  const milestonesForTest = useCallback(
    (t: TestType) => milestones.filter((m) => m.test_type === t).sort((a, b) => a.milestone_percent - b.milestone_percent),
    [milestones]
  );

  return {
    loading,
    progress,
    milestones,
    milestonesForTest,
    pendingUnlocks,
    updateProgress,
    acknowledgeUnlock,
    refresh: fetchAll,
  };
};

/** Gate a feature on a server-side entitlement. */
export const useEntitlement = (entitlementKey: string) => {
  const { user } = useAuth();
  const [active, setActive] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(true);

  const check = useCallback(async () => {
    if (!user) {
      setActive(false);
      setLoading(false);
      return;
    }
    const { data, error } = await supabase.rpc("has_active_entitlement" as any, { _entitlement_key: entitlementKey });
    if (error) console.error("Entitlement check error", error);
    setActive(!!data);
    setLoading(false);
  }, [user, entitlementKey]);

  useEffect(() => {
    check();
  }, [check]);

  const consume = useCallback(async () => {
    const { data } = await supabase.rpc("consume_entitlement" as any, { _entitlement_key: entitlementKey });
    await check();
    return !!data;
  }, [entitlementKey, check]);

  return { active, loading, recheck: check, consume };
};
