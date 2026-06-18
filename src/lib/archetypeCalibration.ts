// Client-side career archetype calibration.
// Deterministic mapping from discovery-assessment answer labels to one of the 6
// archetypes defined in assessmentSignalMap. Used as an instant fallback so the
// user never sees a "Calibrating…" placeholder while the edge synthesizer runs.

import { ARCHETYPES } from "./assessmentSignalMap";

export type ArchetypeKey =
  | "the_builder" | "the_strategist" | "the_explorer"
  | "the_connector" | "the_craftsperson" | "the_changemaker";

export interface ArchetypeResult {
  key: ArchetypeKey;
  title: string;
  description: string;
  scores: Record<ArchetypeKey, number>;
  rationale: string[];
}

// Keyword → archetype weights. Matched case-insensitively against any label
// the user picked across the discovery flow (variant + journey questions).
const KEYWORD_WEIGHTS: Array<{ match: RegExp; weights: Partial<Record<ArchetypeKey, number>> }> = [
  // Builder: hands-on, build, make, project, prototype, experiment
  { match: /\b(build|building|make|making|hands.?on|prototype|tinker|experiment|project|workshop|lab)\b/i,
    weights: { the_builder: 3, the_craftsperson: 1 } },
  { match: /\b(code|coding|engineer|engineering|technical|technology|software|hardware)\b/i,
    weights: { the_builder: 2, the_craftsperson: 1, the_strategist: 1 } },

  // Strategist: plan, analyze, strategy, data, system, think, organize
  { match: /\b(strategy|strateg|plan|planning|analy|data|system|organize|research|frame|model)\b/i,
    weights: { the_strategist: 3, the_craftsperson: 1 } },
  { match: /\b(business|market|finance|consult|operations|management)\b/i,
    weights: { the_strategist: 2, the_connector: 1 } },

  // Explorer: explore, curious, new, ideas, discover, open, variety
  { match: /\b(explor|curious|discover|new|ideas|broad|variety|wide.?open|wander|travel)\b/i,
    weights: { the_explorer: 3 } },
  { match: /\b(undecid|not sure|still figuring|many things)\b/i,
    weights: { the_explorer: 2 } },

  // Connector: people, team, lead, mentor, community, talk, collaborate
  { match: /\b(people|team|lead|leading|mentor|community|collab|talk|communicat|social|network)\b/i,
    weights: { the_connector: 3 } },
  { match: /\b(teach|coach|help|service|customer)\b/i,
    weights: { the_connector: 2, the_changemaker: 1 } },

  // Craftsperson: master, deep, depth, focus, specialist, perfect
  { match: /\b(master|mastery|deep|depth|focus|specialist|perfect|craft|detail|quality)\b/i,
    weights: { the_craftsperson: 3 } },
  { match: /\b(art|design|writ|music|creative|story)\b/i,
    weights: { the_craftsperson: 2, the_explorer: 1 } },

  // Changemaker: impact, change, purpose, mission, social, help, world
  { match: /\b(impact|change|purpose|mission|social.change|world|environment|sustain|equity|justice|ngo)\b/i,
    weights: { the_changemaker: 3 } },
  { match: /\b(health|education|inclusion|rural|community)\b/i,
    weights: { the_changemaker: 2, the_connector: 1 } },
];

const ZERO: Record<ArchetypeKey, number> = {
  the_builder: 0, the_strategist: 0, the_explorer: 0,
  the_connector: 0, the_craftsperson: 0, the_changemaker: 0,
};

export function calibrateArchetype(answerLabels: string[]): ArchetypeResult {
  const scores: Record<ArchetypeKey, number> = { ...ZERO };
  const rationale: string[] = [];
  const seenRules = new Set<number>();

  const text = answerLabels.filter(Boolean).join(" | ");
  KEYWORD_WEIGHTS.forEach((rule, i) => {
    if (rule.match.test(text)) {
      seenRules.add(i);
      Object.entries(rule.weights).forEach(([k, v]) => {
        scores[k as ArchetypeKey] += v || 0;
      });
    }
  });

  // Tie-breaker: tiny baseline favors Explorer when nothing matches.
  const total = Object.values(scores).reduce((a, b) => a + b, 0);
  if (total === 0) scores.the_explorer = 1;

  const sorted = (Object.entries(scores) as [ArchetypeKey, number][])
    .sort((a, b) => b[1] - a[1]);
  const [primaryKey] = sorted[0];
  const meta = ARCHETYPES.find((a) => a.key === primaryKey)!;

  // Rationale snippets
  const snippets = answerLabels.slice(0, 3).filter(Boolean);
  if (snippets.length) {
    rationale.push(`Anchored by your picks: "${snippets.join('", "')}".`);
  }
  rationale.push(`${meta.title} edged out the others by ${Math.max(1, sorted[0][1] - (sorted[1]?.[1] || 0))} signal point(s).`);

  return {
    key: primaryKey,
    title: meta.title,
    description: meta.description,
    scores,
    rationale,
  };
}
