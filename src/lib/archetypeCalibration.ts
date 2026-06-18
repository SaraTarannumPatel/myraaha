// Real-time career archetype calibration.
//
// Scores the user's actual answer labels against the 40-archetype library in
// `archetypeLibrary.ts`. There is no mock data and no fixed mapping — every
// archetype is computed at call-time from:
//
//   1. Weighted keyword matches over each user answer
//   2. Cosine similarity between the user's inferred RIASEC vector
//      (Realistic / Investigative / Artistic / Social / Enterprising /
//      Conventional) and the archetype's own RIASEC profile
//
// Both signals are normalised and combined. The function returns the top
// archetype, runner-up, and a transparent rationale citing the user's own
// picks so the UI can show "why this archetype" without inventing reasons.

import { ARCHETYPE_LIBRARY, ARCHETYPE_BY_KEY, Archetype } from "./archetypeLibrary";

export type ArchetypeKey = string;

export interface ArchetypeResult {
  key: ArchetypeKey;
  title: string;
  description: string;
  tagline?: string;
  strengths?: string[];
  shadow?: string[];
  careerThemes?: string[];
  runnerUp?: { key: string; title: string; score: number };
  scores: Record<string, number>;
  rationale: string[];
  riasec: [number, number, number, number, number, number];
}

// Simple RIASEC inference table — patterns the user is highly likely to type
// in any of the 3 discovery batteries.
const RIASEC_HINTS: Array<{ rx: RegExp; v: [number, number, number, number, number, number] }> = [
  // R - Realistic
  { rx: /\b(build|hands.?on|fix|mechanic|outdoor|hardware|workshop|repair|fabricat|trade)\b/i, v: [3, 0, 0, 0, 0, 1] },
  // I - Investigative
  { rx: /\b(research|investigat|data|science|analy|theory|experiment|why|root.cause|math)\b/i, v: [0, 3, 0, 0, 0, 1] },
  // A - Artistic
  { rx: /\b(art|design|writ|music|story|creative|aesthet|film|video|perform)\b/i, v: [0, 0, 3, 0, 0, 0] },
  // S - Social
  { rx: /\b(teach|coach|mentor|help|care|counsel|community|people|empath|heal|nurs)\b/i, v: [0, 0, 0, 3, 0, 0] },
  // E - Enterprising
  { rx: /\b(lead|sell|negotia|startup|found|venture|persuad|market|deal|business)\b/i, v: [0, 0, 0, 0, 3, 0] },
  // C - Conventional
  { rx: /\b(organi[sz]e|plan|process|admin|operations|spreadsheet|order|finance|audit|compliance)\b/i, v: [0, 0, 0, 0, 0, 3] },
];

const addVec = (a: number[], b: number[]) => a.map((x, i) => x + (b[i] || 0));
const cosine = (a: number[], b: number[]) => {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) { dot += a[i] * b[i]; na += a[i] * a[i]; nb += b[i] * b[i]; }
  if (na === 0 || nb === 0) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
};

function userRiasec(labels: string[]): [number, number, number, number, number, number] {
  let v: number[] = [0, 0, 0, 0, 0, 0];
  labels.forEach((label) => {
    RIASEC_HINTS.forEach((h) => {
      if (h.rx.test(label)) v = addVec(v, h.v);
    });
  });
  return v as [number, number, number, number, number, number];
}

function keywordScore(archetype: Archetype, labels: string[]): { score: number; hits: string[] } {
  let score = 0;
  const hits: string[] = [];
  labels.forEach((label) => {
    archetype.keywords.forEach((kw) => {
      const m = label.match(kw.rx);
      if (m) {
        score += kw.w;
        if (hits.length < 4) hits.push(`${m[0]} → ${archetype.title}`);
      }
    });
  });
  return { score, hits };
}

export function calibrateArchetype(answerLabels: string[]): ArchetypeResult {
  const labels = answerLabels.filter(Boolean).map(String);
  const uRiasec = userRiasec(labels);

  // Per-archetype score = weighted keyword sum + 5 × cosine(RIASEC).
  const ranked = ARCHETYPE_LIBRARY.map((a) => {
    const { score: kwScore, hits } = keywordScore(a, labels);
    const sim = cosine(uRiasec, a.riasec);
    const total = kwScore + sim * 5;
    return { archetype: a, score: total, kwScore, sim, hits };
  }).sort((x, y) => y.score - x.score);

  // If every score is 0 (e.g. user picked highly abstract labels), fall back
  // to pure RIASEC cosine so we still pick the closest archetype rather than
  // returning a default.
  let top = ranked[0];
  if (top.score === 0) {
    const byCos = [...ARCHETYPE_LIBRARY]
      .map((a) => ({ archetype: a, score: cosine(uRiasec, a.riasec) * 5, kwScore: 0, sim: cosine(uRiasec, a.riasec), hits: [] }))
      .sort((x, y) => y.score - x.score);
    top = byCos[0];
    if (top.score === 0) {
      // Truly no signal — default to Explorer (the safe "still figuring it out" archetype).
      top = ranked.find((r) => r.archetype.key === "the_explorer") || ranked[0];
    }
  }

  const scoresMap: Record<string, number> = {};
  ranked.forEach((r) => { scoresMap[r.archetype.key] = Number(r.score.toFixed(2)); });

  const rationale: string[] = [];
  const picks = labels.slice(0, 4).filter((s) => s && s.length < 80);
  if (picks.length) rationale.push(`Drawn from your picks: "${picks.join('", "')}".`);
  if (top.hits?.length) rationale.push(`Keyword resonance — ${top.hits.slice(0, 3).join("; ")}.`);
  rationale.push(
    `RIASEC alignment ${(top.sim * 100).toFixed(0)}% (you trend ${riasecHighlight(uRiasec).join(" + ")}).`
  );
  const second = ranked.find((r) => r.archetype.key !== top.archetype.key);
  if (second) rationale.push(`Runner-up: ${second.archetype.title} (${second.score.toFixed(1)}).`);

  return {
    key: top.archetype.key,
    title: top.archetype.title,
    description: top.archetype.description,
    tagline: top.archetype.tagline,
    strengths: top.archetype.strengths,
    shadow: top.archetype.shadow,
    careerThemes: top.archetype.careerThemes,
    runnerUp: second
      ? { key: second.archetype.key, title: second.archetype.title, score: Number(second.score.toFixed(2)) }
      : undefined,
    scores: scoresMap,
    rationale,
    riasec: uRiasec,
  };
}

function riasecHighlight(v: number[]): string[] {
  const labels = ["Realistic", "Investigative", "Artistic", "Social", "Enterprising", "Conventional"];
  return v
    .map((val, i) => ({ val, label: labels[i] }))
    .sort((a, b) => b.val - a.val)
    .slice(0, 2)
    .filter((x) => x.val > 0)
    .map((x) => x.label);
}

// Re-export for any code still importing the old names.
export { ARCHETYPE_LIBRARY, ARCHETYPE_BY_KEY };
