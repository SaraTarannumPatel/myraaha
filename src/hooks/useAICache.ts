import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

/**
 * useAICache — persist AI-generated outputs per (user, cache_key) so that pages
 * load the same result on every mount until the user explicitly requests a
 * refresh. This eliminates the "everything reloads" feel.
 *
 * Usage:
 *   const { data, loading, refresh, save } = useAICache<MyShape>("roadmap:foryou", "roadmap");
 *   // call save(payload) after a successful AI generation
 *   // call refresh() when the user clicks a Refresh button
 */
export function useAICache<T = any>(cacheKey: string, module: string) {
  const { user } = useAuth();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return null;
    }
    setLoading(true);
    const { data: row } = await supabase
      .from("ai_cache")
      .select("payload")
      .eq("user_id", user.id)
      .eq("cache_key", cacheKey)
      .maybeSingle();
    setData((row?.payload as T) ?? null);
    setLoading(false);
    return (row?.payload as T) ?? null;
  }, [user, cacheKey]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = useCallback(
    async (payload: T, inputsHash?: string) => {
      if (!user) return;
      await supabase
        .from("ai_cache")
        .upsert(
          {
            user_id: user.id,
            cache_key: cacheKey,
            module,
            inputs_hash: inputsHash ?? null,
            payload: payload as any,
          },
          { onConflict: "user_id,cache_key" }
        );
      setData(payload);
    },
    [user, cacheKey, module]
  );

  const clear = useCallback(async () => {
    if (!user) return;
    await supabase.from("ai_cache").delete().eq("user_id", user.id).eq("cache_key", cacheKey);
    setData(null);
  }, [user, cacheKey]);

  return { data, loading, refresh: load, save, clear };
}
