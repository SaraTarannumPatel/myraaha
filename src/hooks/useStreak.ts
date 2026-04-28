import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type Streak = {
  current_streak: number;
  longest_streak: number;
  last_activity_date: string | null;
};

/**
 * Tracks a daily streak for the given streak_type. Calling `ping()` updates the
 * streak — same day no-op, next day +1, gap > 1 resets to 1.
 */
export function useStreak(streakType: string = "daily_login") {
  const { user } = useAuth();
  const [streak, setStreak] = useState<Streak>({ current_streak: 0, longest_streak: 0, last_activity_date: null });
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    const { data } = await supabase
      .from("user_streaks")
      .select("current_streak,longest_streak,last_activity_date")
      .eq("user_id", user.id)
      .eq("streak_type", streakType)
      .maybeSingle();
    if (data) setStreak(data as Streak);
    setLoading(false);
  }, [user, streakType]);

  useEffect(() => {
    load();
  }, [load]);

  const ping = useCallback(async () => {
    if (!user) return;
    const today = new Date().toISOString().slice(0, 10);
    const last = streak.last_activity_date;
    if (last === today) return; // already counted today

    let next = 1;
    if (last) {
      const lastDate = new Date(last);
      const diff = Math.round((Date.now() - lastDate.getTime()) / 86400000);
      next = diff === 1 ? streak.current_streak + 1 : 1;
    }
    const longest = Math.max(streak.longest_streak || 0, next);

    const { data: existing } = await supabase
      .from("user_streaks")
      .select("id")
      .eq("user_id", user.id)
      .eq("streak_type", streakType)
      .maybeSingle();

    if (existing) {
      await supabase
        .from("user_streaks")
        .update({ current_streak: next, longest_streak: longest, last_activity_date: today, updated_at: new Date().toISOString() })
        .eq("id", existing.id);
    } else {
      await supabase.from("user_streaks").insert({
        user_id: user.id,
        streak_type: streakType,
        current_streak: next,
        longest_streak: longest,
        last_activity_date: today,
      });
    }
    setStreak({ current_streak: next, longest_streak: longest, last_activity_date: today });
  }, [user, streakType, streak]);

  return { streak, loading, ping, reload: load };
}
