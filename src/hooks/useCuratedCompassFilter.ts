/**
 * useCuratedCompassFilter
 * --------------------------------------------------------------------------
 * Reads the user's cached personalization (sectors + keyword bag) produced
 * by `runUserPersonalization` and exposes a `scoreEntity` helper that any
 * Curiosity Compass mode can use to rank / filter its content list to the
 * user's sectors and assessment-derived interests.
 *
 * Returns `ready=false` until the cache is loaded. If the user has no
 * sectors picked (e.g. guest), `scoreEntity` falls back to a neutral score
 * so existing UIs keep working unchanged.
 */
import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getCachedPersonalization, runUserPersonalization } from "@/lib/personalizationPipeline";

interface Personalization {
  keywords: { keyword: string; weight: number; source: string }[];
  sectors: string[];
}

const lc = (s: string) =>
  String(s || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");

export function useCuratedCompassFilter() {
  const { user } = useAuth();
  const [data, setData] = useState<Personalization | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!user?.id) {
      setReady(true);
      return;
    }
    (async () => {
      let cached = await getCachedPersonalization(user.id);
      if (!cached) {
        cached = await runUserPersonalization(user.id);
      }
      if (cancelled) return;
      if (cached) setData({ keywords: cached.keywords || [], sectors: cached.sectors || [] });
      setReady(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [user?.id]);

  /**
   * Score an entity against the user's personalization.
   * @param entity Any object — common fields (sector, domain, related_*, tags, skills) are auto-checked.
   * @returns numeric score (higher = better fit). 0 when no signal.
   */
  const scoreEntity = useCallback(
    (entity: Record<string, any>): number => {
      if (!data) return 0;
      const sectorSet = new Set(data.sectors.map(lc));
      const kwMap = new Map(data.keywords.map((k) => [lc(k.keyword), k.weight]));
      let score = 0;

      const sectorFields = [entity.sector, entity.sector_slug, ...(entity.related_sectors || [])];
      sectorFields.filter(Boolean).forEach((s: string) => {
        if (sectorSet.has(lc(s))) score += 5;
      });

      const kwFields = [
        entity.domain,
        ...(entity.related_domains || []),
        ...(entity.tags || []),
        ...(entity.related_skills || []),
        ...(entity.skills_required || []),
        ...(entity.keywords || []),
        entity.title,
      ];
      kwFields.filter(Boolean).forEach((field: string) => {
        const tokens = String(field).toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
        tokens.forEach((tok) => {
          const w = kwMap.get(tok);
          if (w) score += w;
        });
      });

      return score;
    },
    [data]
  );

  const hasPersonalization = !!data && (data.sectors.length > 0 || data.keywords.length > 0);

  return { ready, data, scoreEntity, hasPersonalization };
}
