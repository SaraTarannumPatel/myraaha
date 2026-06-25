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
  // ── Extended battery (30 more) ────────────────────────────────────
  risk_appetite: { modules: ["mvp_builder", "startup_sparks", "transition_planner"], baseTags: ["risk_appetite"] },
  risk_failure: { modules: ["mvp_builder", "career_therapist", "mindset_builder"], baseTags: ["failure_response"] },
  autonomy_pref: { modules: ["job_matching", "peer_circles", "project_playground"], baseTags: ["autonomy_preference"] },
  collab_style: { modules: ["peer_circles", "mentor_matchmaking", "job_matching"], baseTags: ["collaboration_role"] },
  identity_clarity: { modules: ["selfgraph", "career_coach", "roadmap"], baseTags: ["identity_clarity"] },
  future_orientation: { modules: ["roadmap", "transition_planner", "selfgraph"], baseTags: ["future_orientation"] },
  time_horizon: { modules: ["roadmap", "skill_stacker"], baseTags: ["time_horizon"] },
  energy_recovery: { modules: ["career_therapist", "mindset_builder", "moodboard"], baseTags: ["recovery_style"] },
  stress_signal: { modules: ["career_therapist", "mindset_builder"], baseTags: ["stress_signal"] },
  conflict_style: { modules: ["peer_circles", "mentor_matchmaking", "career_coach"], baseTags: ["conflict_style"] },
  self_awareness: { modules: ["selfgraph", "career_therapist"], baseTags: ["self_awareness"] },
  curiosity_style: { modules: ["content_library", "project_playground"], baseTags: ["curiosity_style"] },
  focus_style: { modules: ["skill_stacker", "project_playground"], baseTags: ["focus_style"] },
  multitask_pref: { modules: ["project_playground", "job_matching"], baseTags: ["multitask_pref"] },
  achievement_drive: { modules: ["skill_stacker", "mvp_builder", "mentor_matchmaking"], baseTags: ["achievement_drive"] },
  recognition_pref: { modules: ["mentor_matchmaking", "peer_circles", "selfgraph"], baseTags: ["recognition_pref"] },
  social_comfort: { modules: ["peer_circles", "mentor_matchmaking", "job_matching"], baseTags: ["social_comfort"] },
  leadership_style: { modules: ["mentor_matchmaking", "job_matching", "mvp_builder"], baseTags: ["leadership_style"] },
  planning_style: { modules: ["roadmap", "transition_planner"], baseTags: ["planning_style"] },
  goal_setting: { modules: ["roadmap", "skill_stacker"], baseTags: ["goal_setting"] },
  structure_pref: { modules: ["job_matching", "project_playground"], baseTags: ["structure_preference"] },
  deep_vs_broad: { modules: ["skill_stacker"], baseTags: ["skill_breadth"] },
  learning_pace: { modules: ["content_library", "skill_stacker"], baseTags: ["learning_pace"] },
  async_pref: { modules: ["job_matching", "peer_circles"], baseTags: ["communication_mode"] },
  impact_pref: { modules: ["selfgraph", "mentor_matchmaking"], baseTags: ["impact_preference"] },
  optimism: { modules: ["mindset_builder", "career_therapist", "selfgraph"], baseTags: ["outlook"] },
  communication_style: { modules: ["job_matching", "peer_circles", "career_coach"], baseTags: ["communication_style"] },
  mentorship_pref: { modules: ["mentor_matchmaking", "career_coach"], baseTags: ["mentorship_preference"] },
  ownership_pref: { modules: ["mvp_builder", "project_playground", "job_matching"], baseTags: ["ownership_pref"] },
  exploration_breadth: { modules: ["roadmap", "selfgraph"], baseTags: ["exploration_breadth"] },
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

// =============================================================================
// HOLISTIC INTERESTS ASSESSMENT (12 Qs from doc CURIOSITY/INTEREST section)
// =============================================================================

export interface InterestsQuestion {
  id: string;
  sectionLabel: string;
  construct: string;
  question: string;
  options: { value: string; label: string }[];
  usedFor: string[];
}

const LIKERT: { value: string; label: string }[] = [
  { value: "1", label: "Strongly Disagree" },
  { value: "2", label: "Disagree" },
  { value: "3", label: "Neutral" },
  { value: "4", label: "Agree" },
  { value: "5", label: "Strongly Agree" },
];

export const INTERESTS_QUESTIONS: InterestsQuestion[] = [
  { id: "int_science", sectionLabel: "Curiosity Domains", construct: "science_curiosity",
    question: "I enjoy learning about science and experiments.", options: LIKERT,
    usedFor: ["Career Cards", "Story Mode", "Learning Library"] },
  { id: "int_math", sectionLabel: "Curiosity Domains", construct: "mathematics_curiosity",
    question: "I enjoy mathematics and numerical reasoning.", options: LIKERT,
    usedFor: ["Career Cards", "SkillStacker", "Roadmap"] },
  { id: "int_tech", sectionLabel: "Curiosity Domains", construct: "technology_curiosity",
    question: "I enjoy learning about technology.", options: LIKERT,
    usedFor: ["Career Cards", "Project Playground", "Roadmap"] },
  { id: "int_business", sectionLabel: "Curiosity Domains", construct: "business_curiosity",
    question: "I enjoy understanding business and markets.", options: LIKERT,
    usedFor: ["Startup Sparks", "Career Cards", "MVP Builder"] },
  { id: "int_humanities", sectionLabel: "Curiosity Domains", construct: "humanities_curiosity",
    question: "I enjoy learning about society and human behavior.", options: LIKERT,
    usedFor: ["Career Cards", "Peer Circles", "Career Coach"] },
  { id: "int_arts", sectionLabel: "Curiosity Domains", construct: "arts_curiosity",
    question: "I enjoy creative activities such as art or design.", options: LIKERT,
    usedFor: ["Moodboard", "Career Cards", "Story Mode"] },
  { id: "int_problem_style", sectionLabel: "Working Style", construct: "problem_style",
    question: "Which problems do you enjoy solving?",
    options: [
      { value: "A", label: "Analytical" }, { value: "B", label: "Technical" },
      { value: "C", label: "Business" }, { value: "D", label: "Social" },
      { value: "E", label: "Creative" },
    ],
    usedFor: ["Career Cards", "Challenge Mode", "Job Matching"] },
  { id: "int_activity_style", sectionLabel: "Working Style", construct: "activity_style",
    question: "Which activity excites you most?",
    options: [
      { value: "A", label: "Building things" }, { value: "B", label: "Analyzing information" },
      { value: "C", label: "Leading people" }, { value: "D", label: "Designing ideas" },
      { value: "E", label: "Writing or storytelling" },
    ],
    usedFor: ["Project Playground", "Career Cards", "Roadmap"] },
  { id: "int_impact_style", sectionLabel: "Working Style", construct: "impact_style",
    question: "What kind of impact would you like to create?",
    options: [
      { value: "A", label: "Technological innovation" }, { value: "B", label: "Business growth" },
      { value: "C", label: "Social change" }, { value: "D", label: "Creative expression" },
    ],
    usedFor: ["SelfGraph", "Career Cards", "Mentor Matchmaking"] },
  { id: "int_experimentation", sectionLabel: "Exploration Mode", construct: "experimentation_curiosity",
    question: "I enjoy experimenting with new ideas.", options: LIKERT,
    usedFor: ["Project Playground", "MVP Builder", "Challenge Mode"] },
  { id: "int_exploration", sectionLabel: "Exploration Mode", construct: "exploration_curiosity",
    question: "I enjoy exploring new topics.", options: LIKERT,
    usedFor: ["Career Cards", "Audio/Visual Mode", "Learning Library"] },
  { id: "int_discovery", sectionLabel: "Exploration Mode", construct: "discovery_curiosity",
    question: "I enjoy discovering how things work.", options: LIKERT,
    usedFor: ["Story Mode", "Project Playground", "Learning Library"] },
];

const INTERESTS_TARGET_MODULES: ModuleKey[] = [
  "roadmap", "job_matching", "skill_stacker", "content_library", "moodboard",
  "career_coach", "project_playground", "mvp_builder", "startup_sparks", "mentor_matchmaking",
];

export function buildInterestsSignal(qId: string, answerLabel: string) {
  const q = INTERESTS_QUESTIONS.find((x) => x.id === qId);
  const tags = [
    `interest_${qId}`,
    q?.construct ? `construct_${q.construct}` : null,
    lc(answerLabel),
  ].filter(Boolean) as string[];
  return {
    target_modules: INTERESTS_TARGET_MODULES,
    signal_tags: tags,
  };
}
