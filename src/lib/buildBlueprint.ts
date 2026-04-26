import type { Blueprint } from "@/components/career/BlueprintCard";

type AnyCard = {
  id: string;
  domain?: string | null;
  category?: string | null;
  related_skills?: string[] | null;
  skills_needed?: string[] | null;
  skills_highlighted?: string[] | null;
  soft_skills?: string[] | null;
  tools_used?: string[] | null;
  difficulty?: string | null;
  difficulty_level?: string | null;
  title?: string | null;
  challenge_name?: string | null;
};

type InteractionType = "like" | "love" | "bookmark" | "not_for_me" | "save" | "skip";

/** Build a behavioural blueprint from a set of cards + interactions purely client-side. */
export function buildBlueprintFromInteractions(
  cards: AnyCard[],
  interactions: Record<string, InteractionType>,
  variant: "story" | "challenge" | "visual" | "career-cards",
): Blueprint {
  const positive = new Set<InteractionType>(["like", "love", "bookmark", "save"]);
  const negative = new Set<InteractionType>(["not_for_me", "skip"]);

  const domainScore: Record<string, number> = {};
  const skillScore: Record<string, number> = {};
  const titleScore: Record<string, number> = {};
  const negDomainScore: Record<string, number> = {};
  const toolScore: Record<string, number> = {};
  let easyHits = 0;
  let hardHits = 0;
  let totalRated = 0;

  for (const c of cards) {
    const t = interactions[c.id];
    if (!t) continue;
    totalRated += 1;

    const weight = t === "love" ? 3 : t === "bookmark" || t === "save" ? 2 : t === "like" ? 1 : -2;
    const isPositive = positive.has(t);
    const isNegative = negative.has(t);

    const domain = c.domain || c.category || "general";
    if (isPositive) domainScore[domain] = (domainScore[domain] || 0) + weight;
    else if (isNegative) negDomainScore[domain] = (negDomainScore[domain] || 0) + Math.abs(weight);

    const title = c.title || c.challenge_name;
    if (title && isPositive) titleScore[title] = (titleScore[title] || 0) + weight;

    const skills = [
      ...(c.related_skills || []),
      ...(c.skills_needed || []),
      ...(c.skills_highlighted || []),
      ...(c.soft_skills || []),
    ];
    if (isPositive) {
      for (const s of skills) skillScore[s] = (skillScore[s] || 0) + weight;
    }
    if (isPositive) {
      for (const tool of c.tools_used || []) toolScore[tool] = (toolScore[tool] || 0) + weight;
    }

    const diff = (c.difficulty || c.difficulty_level || "").toLowerCase();
    if (isPositive) {
      if (diff.includes("begin") || diff.includes("easy")) easyHits++;
      if (diff.includes("adv") || diff.includes("hard") || diff.includes("expert")) hardHits++;
    }
  }

  const top = (obj: Record<string, number>, n: number) =>
    Object.entries(obj)
      .filter(([, v]) => v > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)
      .map(([k]) => k);

  const drawnTo = top(domainScore, 6);
  const rejected = top(negDomainScore, 4);
  const topSkills = top(skillScore, 8);
  const topTitles = top(titleScore, 5);

  // Adjacent / blind-spot domains: those present in the deck but not yet rated
  const allDomains = new Set(cards.map((c) => c.domain || c.category).filter(Boolean) as string[]);
  const blindSpots: string[] = [];
  for (const d of allDomains) {
    if (!drawnTo.includes(d) && !rejected.includes(d) && blindSpots.length < 5) blindSpots.push(d);
  }

  const personality_signals: Record<string, string> = {};
  if (totalRated > 0) {
    if (easyHits > hardHits * 1.5) personality_signals.complexity_preference = "approachable";
    else if (hardHits > easyHits * 1.5) personality_signals.complexity_preference = "challenging";
    else personality_signals.complexity_preference = "balanced";

    const lovedRatio = Object.values(interactions).filter((t) => t === "love").length / totalRated;
    personality_signals.engagement_intensity =
      lovedRatio > 0.4 ? "high passion" : lovedRatio > 0.15 ? "selective" : "explorative";

    const exploreBreadth = drawnTo.length;
    personality_signals.exploration_style =
      exploreBreadth >= 4 ? "wide-ranging" : exploreBreadth >= 2 ? "focused" : "narrow";
  }

  // Confidence rises with sample size, capped at 0.9
  const confidence_score = Math.min(0.9, 0.25 + totalRated * 0.05);

  // Variant-specific narrative
  const verbByVariant: Record<typeof variant, string> = {
    story: "the stories that pulled you in",
    challenge: "the real-world tasks that energised you",
    visual: "the visual themes you gravitated toward",
    "career-cards": "the careers you reacted strongly to",
  };
  const summary =
    drawnTo.length === 0
      ? "Keep exploring — once you react to more cards, your blueprint will sharpen."
      : `Based on ${verbByVariant[variant]}, your strongest pull is toward ${drawnTo
          .slice(0, 3)
          .join(", ")}${rejected.length ? `, while ${rejected[0]} doesn't seem to fit your vibe right now.` : "."} ${
          topSkills.length ? `Skills you respond to: ${topSkills.slice(0, 4).join(", ")}.` : ""
        }`;

  return {
    ai_summary: summary,
    domains_attracted: drawnTo,
    domains_rejected: rejected,
    skills_resonated: topSkills,
    personality_signals,
    top_paths: topTitles.length > 0 ? topTitles : drawnTo.slice(0, 3),
    blind_spots: blindSpots,
    confidence_score,
  };
}
