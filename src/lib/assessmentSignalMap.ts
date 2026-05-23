// Maps every assessment question's answer to the modules + signal tags it should feed.
// These are the SAME modules the user sees promised on each question card.

export type ModuleKey =
  | "roadmap"
  | "selfgraph"
  | "career_therapist"
  | "career_coach"
  | "skill_stacker"
  | "transition_planner"
  | "project_playground"
  | "mentor_matchmaking"
  | "job_matching"
  | "content_library"
  | "peer_circles"
  | "moodboard"
  | "mvp_builder"
  | "startup_sparks"
  | "mindset_builder";

export interface SignalMap {
  questionId: string;
  questionText: string;
  targetModules: ModuleKey[];
  signalTagFor: (answer: string) => string[];
}

const lc = (s: string) => s.toLowerCase().trim().replace(/\s+/g, "_");

// ---- Psychometric mapping (22 Q's in PsychometricTest.tsx) ----
export const PSYCHOMETRIC_SIGNAL_MAP: Record<string, { modules: ModuleKey[]; baseTags: string[] }> = {
  cognitive_problem: { modules: ["roadmap", "skill_stacker", "career_coach"], baseTags: ["cognitive_style"] },
  cognitive_decision: { modules: ["selfgraph", "transition_planner"], baseTags: ["decision_style"] },
  adaptability_change: { modules: ["transition_planner", "project_playground"], baseTags: ["adaptability"] },
  agency_outcomes: { modules: ["mentor_matchmaking", "mvp_builder", "selfgraph"], baseTags: ["agency"] },
  agency_initiative: { modules: ["mvp_builder", "startup_sparks", "selfgraph"], baseTags: ["initiative"] },
  ambiguity_preference: { modules: ["roadmap", "mvp_builder", "transition_planner"], baseTags: ["ambiguity_tolerance"] },
  emotion_pressure: { modules: ["career_therapist", "mindset_builder"], baseTags: ["emotional_regulation"] },
  emotion_setback: { modules: ["career_therapist", "mindset_builder"], baseTags: ["emotional_resilience"] },
  growth_skill: { modules: ["skill_stacker", "project_playground"], baseTags: ["growth_orientation"] },
  values_priority: { modules: ["job_matching", "mentor_matchmaking"], baseTags: ["values"] },
  persistence_slow: { modules: ["roadmap", "mvp_builder"], baseTags: ["persistence"] },
  persistence_motivation: { modules: ["skill_stacker", "roadmap"], baseTags: ["motivation_horizon"] },
  feedback_critical: { modules: ["career_coach", "mentor_matchmaking"], baseTags: ["feedback_receptivity"] },
  feedback_style: { modules: ["career_coach", "career_therapist"], baseTags: ["feedback_style"] },
  role_initiative: { modules: ["project_playground", "job_matching", "mvp_builder"], baseTags: ["role_orientation"] },
  role_energy: { modules: ["project_playground", "job_matching"], baseTags: ["energy_source"] },
  moral_risk: { modules: ["job_matching", "selfgraph"], baseTags: ["ethical_signal"] },
  moral_authority: { modules: ["mentor_matchmaking", "selfgraph"], baseTags: ["ethical_signal"] },
  learning_apply: { modules: ["content_library", "project_playground"], baseTags: ["learning_transfer"] },
  learning_best: { modules: ["content_library", "skill_stacker"], baseTags: ["learning_style"] },
  calibration_style: { modules: [], baseTags: ["calibration"] },
  calibration_confidence: { modules: [], baseTags: ["calibration"] },
};

// ---- Discovery / Journey mapping ----
// Discovery answers feed broader interest + domain signals.
export const DISCOVERY_DEFAULT_MODULES: ModuleKey[] = [
  "roadmap",
  "job_matching",
  "skill_stacker",
  "content_library",
  "moodboard",
  "career_coach",
];

export function buildPsychometricSignal(qId: string, answerText: string) {
  const cfg = PSYCHOMETRIC_SIGNAL_MAP[qId] || { modules: [], baseTags: [] };
  return {
    target_modules: cfg.modules,
    signal_tags: [...cfg.baseTags, lc(answerText)],
  };
}

export function buildDiscoverySignal(qId: string, answerText: string | string[]) {
  const tags = Array.isArray(answerText) ? answerText.map(lc) : [lc(answerText)];
  return {
    target_modules: DISCOVERY_DEFAULT_MODULES,
    signal_tags: [`discovery_${qId}`, ...tags],
  };
}

// Map answer-text to coarse archetype + work-style hints used by the synthesizer.
export const ARCHETYPES = [
  { key: "the_builder", title: "The Builder", description: "You learn by doing. Real projects beat theory every time." },
  { key: "the_strategist", title: "The Strategist", description: "You see patterns and design plans. You think before you act." },
  { key: "the_explorer", title: "The Explorer", description: "Curiosity is your engine. You thrive when ideas are still wide open." },
  { key: "the_connector", title: "The Connector", description: "You build with people. Your superpower is energising teams." },
  { key: "the_craftsperson", title: "The Craftsperson", description: "Depth over breadth. You want mastery in your chosen craft." },
  { key: "the_changemaker", title: "The Changemaker", description: "You're driven by purpose and impact, not just titles." },
];
