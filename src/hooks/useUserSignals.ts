import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type SignalSource =
  | "curiosity_compass"
  | "career_cards"
  | "challenge_mode"
  | "story_mode"
  | "visual_mode"
  | "quests"
  | "roadmap"
  | "job_matching"
  | "skill_stacker"
  | "content_library"
  | "project_playground"
  | "mentor_match"
  | "peer_circles"
  | "career_coach"
  | "career_therapist"
  | "moodboard"
  | "inspirations"
  | "transition_planner"
  | "journal"
  | "self_graph";

type SignalType = "keyword" | "interaction" | "preference" | "selection" | "search" | "domain_interest" | "skill_interest";

export const useUserSignals = () => {
  const { user } = useAuth();

  const recordSignal = useCallback(
    async (
      source: SignalSource,
      value: string,
      type: SignalType = "keyword",
      strength: number = 0.5,
      context: Record<string, any> = {}
    ) => {
      if (!user || !value?.trim()) return;
      try {
        await supabase.from("user_signals").insert({
          user_id: user.id,
          signal_source: source,
          signal_value: value.trim().toLowerCase(),
          signal_type: type,
          strength,
          signal_context: context,
        });
      } catch (e) {
        console.error("Signal recording error:", e);
      }
    },
    [user]
  );

  const recordMultipleSignals = useCallback(
    async (
      source: SignalSource,
      values: string[],
      type: SignalType = "keyword",
      strength: number = 0.5,
      context: Record<string, any> = {}
    ) => {
      if (!user || !values.length) return;
      try {
        const rows = values
          .filter((v) => v?.trim())
          .map((v) => ({
            user_id: user.id,
            signal_source: source,
            signal_value: v.trim().toLowerCase(),
            signal_type: type,
            strength,
            signal_context: context,
          }));
        if (rows.length) await supabase.from("user_signals").insert(rows);
      } catch (e) {
        console.error("Bulk signal recording error:", e);
      }
    },
    [user]
  );

  const extractKeywords = useCallback((text: string): string[] => {
    if (!text) return [];
    const stopWords = new Set([
      "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
      "have", "has", "had", "do", "does", "did", "will", "would", "could",
      "should", "may", "might", "shall", "can", "to", "of", "in", "for",
      "on", "with", "at", "by", "from", "as", "into", "through", "during",
      "before", "after", "above", "below", "between", "and", "but", "or",
      "not", "no", "nor", "so", "yet", "both", "either", "neither", "each",
      "every", "all", "any", "few", "more", "most", "other", "some", "such",
      "than", "too", "very", "just", "about", "up", "out", "if", "then",
      "what", "which", "who", "whom", "this", "that", "these", "those",
      "i", "me", "my", "we", "our", "you", "your", "he", "him", "his",
      "she", "her", "it", "its", "they", "them", "their", "am", "also",
    ]);
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, " ")
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w));
  }, []);

  const recordTextSignals = useCallback(
    async (source: SignalSource, text: string, context: Record<string, any> = {}) => {
      const keywords = extractKeywords(text);
      const unique = [...new Set(keywords)];
      if (unique.length) {
        await recordMultipleSignals(source, unique.slice(0, 20), "keyword", 0.4, context);
      }
    },
    [extractKeywords, recordMultipleSignals]
  );

  const getUserSignals = useCallback(
    async (source?: SignalSource, limit = 100) => {
      if (!user) return [];
      let query = supabase
        .from("user_signals")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(limit);
      if (source) query = query.eq("signal_source", source);
      const { data } = await query;
      return data || [];
    },
    [user]
  );

  const getAggregatedSignals = useCallback(
    async () => {
      if (!user) return { keywords: [], domains: [], skills: [] };
      const { data } = await supabase
        .from("user_signals")
        .select("signal_value, signal_type, strength, signal_source")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(500);

      if (!data) return { keywords: [], domains: [], skills: [] };

      const freq: Record<string, { count: number; totalStrength: number; type: string }> = {};
      data.forEach((s: any) => {
        if (!freq[s.signal_value]) freq[s.signal_value] = { count: 0, totalStrength: 0, type: s.signal_type };
        freq[s.signal_value].count++;
        freq[s.signal_value].totalStrength += Number(s.strength || 0.5);
      });

      const sorted = Object.entries(freq)
        .map(([value, info]) => ({ value, ...info, avgStrength: info.totalStrength / info.count }))
        .sort((a, b) => b.count * b.avgStrength - a.count * a.avgStrength);

      return {
        keywords: sorted.filter((s) => s.type === "keyword").slice(0, 50),
        domains: sorted.filter((s) => s.type === "domain_interest").slice(0, 20),
        skills: sorted.filter((s) => s.type === "skill_interest").slice(0, 30),
        all: sorted.slice(0, 100),
      };
    },
    [user]
  );

  return {
    recordSignal,
    recordMultipleSignals,
    recordTextSignals,
    extractKeywords,
    getUserSignals,
    getAggregatedSignals,
  };
};
