/**
 * Personalization Pipeline
 * --------------------------------------------------------------------------
 * Single entry point that walks a user's signals across the three core
 * assessments (Discovery, Psychometric, Interests) plus their onboarding
 * sector picks, derives a flat keyword bag, and stores it in
 * `assessment_conclusion_keywords` so the `match_explore_entities_for_user`
 * RPC can rank Explore taxonomy entities for that user.
 *
 * Results are cached in `ai_cache` under the key `user_personalization_v1`
 * with a 6h TTL. This function is safe to call multiple times — it is
 * idempotent and debounced via the cache freshness check.
 *
 * Consumed by: Curiosity Compass (4 modes), Roadmap, Job Matching,
 * Mentor Matchmaking, Content Library, Skill Stacker.
 */

import { supabase } from "@/integrations/supabase/client";

const CACHE_KEY = "user_personalization_v1";
const FRESH_FOR_HOURS = 6;

interface PersonalizationResult {
  keywords: { keyword: string; weight: number; source: string }[];
  sectors: string[];
  ranked: Record<string, { entity_id: string; entity_name: string; score: number }[]>;
  generated_at: string;
}

const lc = (s: string) =>
  String(s || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

async function isFresh(userId: string): Promise<boolean> {
  const { data } = await (supabase as any)
    .from("ai_cache")
    .select("created_at")
    .eq("user_id", userId)
    .eq("cache_key", CACHE_KEY)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!data?.created_at) return false;
  const ageMs = Date.now() - new Date(data.created_at).getTime();
  return ageMs < FRESH_FOR_HOURS * 60 * 60 * 1000;
}

/**
 * Derives the user's keyword bag from sectors + assessment signals.
 * Returns weight-scored keywords ready to upsert.
 */
async function deriveKeywords(userId: string) {
  const out = new Map<string, { weight: number; source: string }>();
  const add = (kw: string, weight: number, source: string) => {
    const k = lc(kw);
    if (!k) return;
    const prev = out.get(k);
    if (!prev || prev.weight < weight) out.set(k, { weight, source });
  };

  // Sectors → hard signal
  const { data: sectors } = await (supabase as any)
    .from("user_onboarding_sectors")
    .select("sector_slug")
    .eq("user_id", userId);
  (sectors || []).forEach((s: any) => add(s.sector_slug, 1.0, "sector"));

  // Assessment signals (discovery + psychometric + interests)
  const { data: qsig } = await (supabase as any)
    .from("assessment_question_signals")
    .select("signal_tags, test_type, weight")
    .eq("user_id", userId)
    .limit(500);
  (qsig || []).forEach((row: any) => {
    const w = Number(row.weight) || 0.5;
    (row.signal_tags || []).forEach((t: string) => add(t, w, row.test_type));
  });

  // Interest profile constructs as soft keywords
  const { data: prof } = await (supabase as any)
    .from("user_interest_profile")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (prof) {
    const map: Record<string, number | null> = {
      science: prof.science,
      mathematics: prof.mathematics,
      technology: prof.technology,
      business: prof.business,
      humanities: prof.humanities,
      arts: prof.arts,
      experimentation: prof.experimentation,
      exploration: prof.exploration,
      discovery: prof.discovery,
    };
    Object.entries(map).forEach(([k, v]) => {
      if (v != null && Number(v) >= 3.5) add(k, Number(v) / 5, "interest_profile");
    });
    if (prof.problem_style) add(prof.problem_style, 0.9, "interest_profile");
    if (prof.activity_style) add(prof.activity_style, 0.9, "interest_profile");
    if (prof.impact_style) add(prof.impact_style, 0.9, "interest_profile");
  }

  return Array.from(out.entries()).map(([keyword, v]) => ({
    keyword,
    weight: v.weight,
    source: v.source,
  }));
}

const RANKED_ENTITY_TYPES = [
  "sector",
  "industry",
  "domain",
  "role",
  "university",
  "subject",
  "skill",
  "course",
  "path",
];

/**
 * Runs the full personalization pipeline for the given user.
 * Returns cached results when fresh; otherwise recomputes and caches.
 */
export async function runUserPersonalization(
  userId: string,
  opts: { force?: boolean } = {}
): Promise<PersonalizationResult | null> {
  if (!userId) return null;
  try {
    if (!opts.force && (await isFresh(userId))) {
      const { data } = await (supabase as any)
        .from("ai_cache")
        .select("payload")
        .eq("user_id", userId)
        .eq("cache_key", CACHE_KEY)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (data?.payload) return data.payload as PersonalizationResult;
    }

    const keywords = await deriveKeywords(userId);

    // Upsert into assessment_conclusion_keywords (wipe + insert for this user)
    await (supabase as any)
      .from("assessment_conclusion_keywords")
      .delete()
      .eq("user_id", userId);
    if (keywords.length) {
      await (supabase as any).from("assessment_conclusion_keywords").insert(
        keywords.map((k) => ({
          user_id: userId,
          keyword: k.keyword,
          weight: k.weight,
          source_assessment: k.source,
        }))
      );
    }

    // Rank each entity type via the SQL RPC
    const ranked: PersonalizationResult["ranked"] = {};
    await Promise.all(
      RANKED_ENTITY_TYPES.map(async (etype) => {
        try {
          const { data } = await (supabase as any).rpc(
            "match_explore_entities_for_user",
            { _entity_type: etype, _limit: 20 }
          );
          ranked[etype] = (data || []) as any[];
        } catch {
          ranked[etype] = [];
        }
      })
    );

    const sectors = keywords.filter((k) => k.source === "sector").map((k) => k.keyword);

    const result: PersonalizationResult = {
      keywords,
      sectors,
      ranked,
      generated_at: new Date().toISOString(),
    };

    // Cache (6h)
    await (supabase as any).from("ai_cache").upsert(
      {
        user_id: userId,
        cache_key: CACHE_KEY,
        payload: result,
        expires_at: new Date(Date.now() + FRESH_FOR_HOURS * 3600 * 1000).toISOString(),
      },
      { onConflict: "user_id,cache_key" }
    );

    return result;
  } catch (e) {
    console.warn("[personalizationPipeline] failed:", e);
    return null;
  }
}

/** Lightweight read-only helper for components. */
export async function getCachedPersonalization(
  userId: string
): Promise<PersonalizationResult | null> {
  if (!userId) return null;
  const { data } = await (supabase as any)
    .from("ai_cache")
    .select("payload")
    .eq("user_id", userId)
    .eq("cache_key", CACHE_KEY)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (data?.payload as PersonalizationResult) || null;
}
