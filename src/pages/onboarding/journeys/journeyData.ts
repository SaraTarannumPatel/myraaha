// Journey Discovery Data — Gen Z style, single/multi choice only
// Grounded in: KSAO Framework, NEP 2020, Psychometric & Assessment Science
//
// Design Principles (from frameworks):
// - KSAO: Questions map to Knowledge, Skills, Abilities, Other characteristics
// - NEP 2020: Learner agency, exploration before specialization, formative (not summative),
//   holistic development, experiential learning, no premature labeling, multiple pathways
// - Psychometrics: Low-stakes behavioral signals, assessments as signals not verdicts,
//   cognitive style detection through task preferences, no rigid taxonomy
//
// Each question is tagged with its psychometric dimension for system use.
// Questions are designed to be NON-EVALUATIVE — there are no "right" answers.

export interface JourneyQuestion {
  id: string;
  question: string;
  type: "single" | "multi";
  options: { label: string; value: string }[];
  maxSelect?: number;
  // Psychometric metadata (used by system, not shown to user)
  dimension?: "K" | "S" | "A" | "O" | "cognitive_style" | "motivation" | "agency" | "resilience" | "values" | "energy" | "learning_transfer" | "ambiguity_tolerance" | "self_regulation" | "curiosity" | "feedback_receptivity";
}

export interface VariantQuestion {
  id: string;
  question: string;
  options: { label: string; value: string; variant: "U" | "R" }[];
  // Maps to psychometric constructs for variant detection
  dimension?: "agency" | "locus_of_control" | "exposure_breadth" | "ambiguity_comfort";
}

// ========== VARIANT DETECTION ==========
// These detect behavioral STATE (not trait) — temporary, contextual, expected to evolve
// Aligned with NEP 2020's principle of formative, non-judgmental assessment

export const schoolVariantQuestions: VariantQuestion[] = [
  {
    id: "sv1",
    question: "when someone asks 'what do u wanna be?', you usually… 👀",
    dimension: "agency",
    options: [
      { label: "blank out ngl 😅 — haven't thought about it much", value: "blank", variant: "U" },
      { label: "say what my parents/family expect me to say", value: "parents", variant: "R" },
      { label: "have a few vague ideas but nothing solid", value: "vague", variant: "U" },
      { label: "already know — it's been decided for a while", value: "decided", variant: "R" },
    ],
  },
  {
    id: "sv2",
    question: "your knowledge about different careers mostly comes from…",
    dimension: "exposure_breadth",
    options: [
      { label: "honestly? movies, reels & youtube 🎬", value: "media", variant: "U" },
      { label: "family discussions & what relatives do", value: "family", variant: "R" },
      { label: "random internet rabbit holes at 2am", value: "internet", variant: "U" },
      { label: "coaching classes, counselors & structured guidance", value: "coaching", variant: "R" },
    ],
  },
  {
    id: "sv3",
    question: "if someone said 'try something completely different from your plan'…",
    dimension: "ambiguity_comfort",
    options: [
      { label: "i'd be curious but lowkey terrified", value: "curious_scared", variant: "U" },
      { label: "my parents would NOT be okay with that", value: "parents_no", variant: "R" },
      { label: "sounds exciting tbh — i'm open", value: "open", variant: "U" },
      { label: "nah fam, i've already committed to a path", value: "committed", variant: "R" },
    ],
  },
  {
    id: "sv4",
    question: "how do you feel when you have to make a big decision about your future?",
    dimension: "locus_of_control",
    options: [
      { label: "overwhelmed — too many unknowns, too little info 😰", value: "overwhelmed", variant: "U" },
      { label: "guided — i trust the people who've planned for me", value: "guided", variant: "R" },
      { label: "excited but directionless — wish someone'd show me options", value: "directionless", variant: "U" },
      { label: "calm — the path is clear, just need to execute", value: "clear", variant: "R" },
    ],
  },
];

export const collegeVariantQuestions: VariantQuestion[] = [
  {
    id: "cv1",
    question: "your current career situation is giving… 💀",
    dimension: "agency",
    options: [
      { label: "main character energy but zero script 🎬", value: "no_script", variant: "U" },
      { label: "linkedin grindset — optimizing every move", value: "grindset", variant: "R" },
      { label: "existential crisis but make it aesthetic ✨", value: "crisis", variant: "U" },
      { label: "resume stacking champion — need more certs 🏆", value: "resume_stack", variant: "R" },
    ],
  },
  {
    id: "cv2",
    question: "what keeps you up at night about your future?",
    dimension: "locus_of_control",
    options: [
      { label: "having literally NO clue what i actually want", value: "no_idea", variant: "U" },
      { label: "not getting placed or landing the right package", value: "placement", variant: "R" },
      { label: "everyone else seems to have it figured out already", value: "comparison", variant: "U" },
      { label: "my skills might not be enough for the market", value: "skills_gap", variant: "R" },
    ],
  },
  {
    id: "cv3",
    question: "when you think about your skills & strengths…",
    dimension: "exposure_breadth",
    options: [
      { label: "idk what i'm even good at fr fr", value: "dont_know", variant: "U" },
      { label: "i have skills but will they actually get me hired?", value: "hired", variant: "R" },
      { label: "interested in way too many things to pick one", value: "too_many", variant: "U" },
      { label: "need more certifications & projects ASAP", value: "certs", variant: "R" },
    ],
  },
  {
    id: "cv4",
    question: "your approach to figuring out your career rn is…",
    dimension: "ambiguity_comfort",
    options: [
      { label: "what career planning? i'm just vibing 🙃", value: "vibing", variant: "U" },
      { label: "optimizing every line on my resume", value: "optimizing", variant: "R" },
      { label: "exploring random things hoping something clicks", value: "exploring", variant: "U" },
      { label: "applying to literally everything that moves", value: "applying", variant: "R" },
    ],
  },
];

export const professionalVariantQuestions: VariantQuestion[] = [
  {
    id: "pv1",
    question: "your current work vibe is…",
    dimension: "agency",
    options: [
      { label: "sunday scaries hit different every single week 😮‍💨", value: "scaries", variant: "U" },
      { label: "stable paycheck but… is this really it?", value: "stable", variant: "R" },
      { label: "quietly questioning my entire trajectory", value: "questioning", variant: "U" },
      { label: "can't risk changing — bills don't pay themselves", value: "bills", variant: "R" },
    ],
  },
  {
    id: "pv2",
    question: "when you imagine switching careers or roles…",
    dimension: "ambiguity_comfort",
    options: [
      { label: "think about it daily but have no idea where to start", value: "daily", variant: "U" },
      { label: "sounds nice but way too risky at this stage", value: "risky", variant: "R" },
      { label: "don't even know what else i'd be good at", value: "dont_know", variant: "U" },
      { label: "maybe later when i have a bigger safety net", value: "later", variant: "R" },
    ],
  },
  {
    id: "pv3",
    question: "what best describes your relationship with your current role?",
    dimension: "locus_of_control",
    options: [
      { label: "golden handcuffs fr fr 🔒 — good money, meh soul", value: "handcuffs", variant: "R" },
      { label: "it pays but my inner world is slowly dying", value: "dying", variant: "U" },
      { label: "i'm skilled at it but it doesn't feel like 'me'", value: "not_me", variant: "U" },
      { label: "invested too much time & identity to start over", value: "invested", variant: "R" },
    ],
  },
  {
    id: "pv4",
    question: "your ideal next career move would look like…",
    dimension: "exposure_breadth",
    options: [
      { label: "a complete 180 into something that genuinely excites me", value: "complete_change", variant: "U" },
      { label: "a promotion or lateral move within my current field", value: "lateral", variant: "R" },
      { label: "honestly i just want to figure out what i actually want", value: "figure_out", variant: "U" },
      { label: "something stable with better growth trajectory", value: "stable_growth", variant: "R" },
    ],
  },
];

// ========== JOURNEY QUESTIONS ==========
// Each journey is designed with psychometric rigor but presented as play/exploration
// No question has a "right" answer — all options generate behavioral signals
// Questions progress from low-stakes curiosity → deeper self-awareness
// Aligned with NEP's "formative assessment for learning" principle

// ===== Journey 1: School — Underconfident / Unexposed =====
// Psychology: Limited exposure, fear of "wrong" answers, needs safety
// NEP alignment: Play-based, story-driven, no evaluation, exploration before specialization
// KSAO focus: Detecting latent Knowledge interests, nascent Abilities, energy patterns
// Psychometric approach: Purely behavioral signals, binary/reversible, zero abstraction
export const journey1Questions: JourneyQuestion[] = [
  {
    id: "j1q1",
    question: "if you could shadow someone for an entire day, who'd it be? 🌟",
    type: "single",
    dimension: "curiosity",
    options: [
      { label: "a game developer building virtual worlds", value: "game_dev" },
      { label: "a doctor in an emergency room", value: "doctor" },
      { label: "a filmmaker directing a movie set", value: "filmmaker" },
      { label: "a scientist running experiments in a lab", value: "scientist" },
    ],
  },
  {
    id: "j1q2",
    question: "which of these saturday activities gives you the most energy? 🔋",
    type: "single",
    dimension: "energy",
    options: [
      { label: "building or fixing something with my hands", value: "building" },
      { label: "drawing, painting, or designing stuff", value: "creative" },
      { label: "solving puzzles, riddles, or brain teasers", value: "analytical" },
      { label: "hanging out with people & learning their stories", value: "social" },
    ],
  },
  {
    id: "j1q3",
    question: "what kinda rabbit holes do you fall into online? 🕳️",
    type: "multi",
    maxSelect: 3,
    dimension: "K",
    options: [
      { label: "tech, gadgets & how things work", value: "tech" },
      { label: "art, animation & design", value: "art" },
      { label: "space, science & the universe", value: "space" },
      { label: "cooking, food & culture", value: "cooking" },
      { label: "sports, fitness & the body", value: "sports" },
      { label: "music, beats & sound", value: "music" },
      { label: "animals, nature & environment", value: "nature" },
      { label: "money, business & entrepreneurship", value: "business" },
    ],
  },
  {
    id: "j1q4",
    question: "in a group project, you naturally end up… 🤝",
    type: "single",
    dimension: "S",
    options: [
      { label: "coming up with the big ideas", value: "ideation" },
      { label: "organizing the plan & keeping everyone on track", value: "organizing" },
      { label: "making the final presentation look amazing", value: "design" },
      { label: "presenting it to the class with confidence", value: "communication" },
    ],
  },
  {
    id: "j1q5",
    question: "if you could have any superpower for your future career… ⚡",
    type: "single",
    dimension: "A",
    options: [
      { label: "understand what anyone is feeling (empathy radar)", value: "empathy" },
      { label: "see every possible future outcome (strategic vision)", value: "strategic" },
      { label: "create anything from imagination (creative power)", value: "creative" },
      { label: "instantly learn any skill (knowledge absorption)", value: "learning" },
    ],
  },
  {
    id: "j1q6",
    question: "what makes you completely lose track of time? ⏰",
    type: "multi",
    maxSelect: 2,
    dimension: "energy",
    options: [
      { label: "gaming, coding, or building digital things", value: "digital_building" },
      { label: "reading stories or writing my own", value: "narrative" },
      { label: "watching documentaries or explainer videos", value: "learning" },
      { label: "making videos, reels, or content", value: "content_creation" },
      { label: "helping friends figure out their problems", value: "mentoring" },
      { label: "tinkering, experimenting, or DIY projects", value: "hands_on" },
    ],
  },
  {
    id: "j1q7",
    question: "if your school had these clubs, which one would you join first? 🏫",
    type: "single",
    dimension: "curiosity",
    options: [
      { label: "robotics & innovation lab", value: "robotics" },
      { label: "debate, model UN & public speaking", value: "debate" },
      { label: "art studio & design thinking", value: "art" },
      { label: "young entrepreneurs club", value: "entrepreneurship" },
    ],
  },
  {
    id: "j1q8",
    question: "which of these worlds fascinates you the most? 🌍",
    type: "multi",
    maxSelect: 3,
    dimension: "K",
    options: [
      { label: "the internet & how digital things work", value: "internet" },
      { label: "the human body, health & medicine", value: "health" },
      { label: "money, markets & how businesses run", value: "business" },
      { label: "climate, sustainability & the planet", value: "environment" },
      { label: "outer space, physics & the universe", value: "space" },
      { label: "fashion, lifestyle & human expression", value: "fashion" },
    ],
  },
  {
    id: "j1q9",
    question: "how do you pick up new things best? 🧠",
    type: "single",
    dimension: "cognitive_style",
    options: [
      { label: "i need to SEE it — diagrams, videos, visuals", value: "visual" },
      { label: "i gotta DO it myself — hands-on trial & error", value: "kinesthetic" },
      { label: "i like reading & thinking deeply about it", value: "reflective" },
      { label: "i learn best when someone explains & i can ask questions", value: "social" },
    ],
  },
  {
    id: "j1q10",
    question: "when you daydream about the future, it usually looks like… 💭",
    type: "single",
    dimension: "motivation",
    options: [
      { label: "traveling the world doing meaningful work", value: "explorer" },
      { label: "building & running my own thing", value: "builder" },
      { label: "being recognized for something incredible", value: "achiever" },
      { label: "honestly idk yet and that's perfectly fine", value: "open" },
    ],
  },
  {
    id: "j1q11",
    question: "pick the vibe that matches where you are right now 🎯",
    type: "single",
    dimension: "agency",
    options: [
      { label: "curious but genuinely don't know where to start", value: "curious_lost" },
      { label: "interested in many things — can't narrow down", value: "multi_interest" },
      { label: "not really excited about anything specific tbh", value: "low_engagement" },
      { label: "kinda know what i like but scared to go all in", value: "hesitant" },
    ],
  },
  {
    id: "j1q12",
    question: "what would make learning about careers way more interesting? 📚",
    type: "multi",
    maxSelect: 2,
    dimension: "learning_transfer",
    options: [
      { label: "real-world projects instead of textbook theory", value: "experiential" },
      { label: "meeting people who actually do cool jobs IRL", value: "mentorship" },
      { label: "learning through games, challenges & competitions", value: "gamified" },
      { label: "choosing what to explore based on MY interests", value: "agency" },
    ],
  },
  {
    id: "j1q13",
    question: "when something doesn't go as planned, you usually… 🔄",
    type: "single",
    dimension: "resilience",
    options: [
      { label: "feel bad for a bit then try something else", value: "adaptive" },
      { label: "need someone to tell me it's gonna be okay", value: "support_seeking" },
      { label: "analyze what went wrong & plan better", value: "analytical" },
      { label: "avoid that thing entirely next time 💀", value: "avoidant" },
    ],
  },
];

// ===== Journey 2: School — Rigid / Parent-Driven =====
// Psychology: Path pre-chosen, fear of deviation, external validation
// NEP alignment: De-rigidification, showing breadth of paths, safe alternatives
// KSAO focus: Revealing hidden Knowledge interests, testing Ability flexibility
// Psychometric approach: Gentle contrast prompts, ambiguity comfort, curiosity openness
export const journey2Questions: JourneyQuestion[] = [
  {
    id: "j2q1",
    question: "the career path you're currently on was mainly shaped by… 🤔",
    type: "single",
    dimension: "O",
    options: [
      { label: "my parents — they know what's best", value: "parents" },
      { label: "me, but heavily influenced by family expectations", value: "influenced" },
      { label: "what everyone around me does — it's the norm", value: "social_norm" },
      { label: "what feels safest & most secure", value: "security" },
    ],
  },
  {
    id: "j2q2",
    question: "if your planned career magically didn't exist, what would you explore? ✨",
    type: "multi",
    maxSelect: 3,
    dimension: "curiosity",
    options: [
      { label: "arts, animation & design", value: "arts" },
      { label: "tech, coding & AI", value: "tech" },
      { label: "sports, fitness & health sciences", value: "sports" },
      { label: "business, startups & entrepreneurship", value: "business" },
      { label: "writing, journalism & storytelling", value: "writing" },
      { label: "social impact, community & development", value: "social" },
      { label: "music, film & performance", value: "performance" },
      { label: "environment, sustainability & climate", value: "environment" },
    ],
  },
  {
    id: "j2q3",
    question: "when you imagine deviating from 'the plan'… 😬",
    type: "single",
    dimension: "ambiguity_tolerance",
    options: [
      { label: "exciting but my family would NOT be okay", value: "family_pressure" },
      { label: "terrifying — what if i completely fail?", value: "fear_of_failure" },
      { label: "lowkey wish i could try — just secretly", value: "secret_wish" },
      { label: "honestly? i'm genuinely happy with the plan", value: "content" },
    ],
  },
  {
    id: "j2q4",
    question: "do you actually know what people DO daily in your chosen career?",
    type: "single",
    dimension: "K",
    options: [
      { label: "kinda? mostly from what i've been told", value: "secondhand" },
      { label: "not really — just know it pays well or is 'prestigious'", value: "prestige_only" },
      { label: "yes — i've researched, watched, or talked to people in it", value: "researched" },
      { label: "i know the textbook version at least", value: "theoretical" },
    ],
  },
  {
    id: "j2q5",
    question: "which of these SURPRISES you? pick the ones you didn't know! 🤯",
    type: "multi",
    maxSelect: 4,
    dimension: "K",
    options: [
      { label: "you can earn really well in design & animation", value: "design_viable" },
      { label: "sports management is an actual booming career", value: "sports_mgmt" },
      { label: "writers & storytellers work at top tech companies", value: "tech_writing" },
      { label: "doctors can also be entrepreneurs & founders", value: "doc_founder" },
      { label: "environmental science has more jobs than ever", value: "env_jobs" },
      { label: "psychology opens doors to 20+ career paths", value: "psych_paths" },
    ],
  },
  {
    id: "j2q6",
    question: "what would make you feel SAFE to explore a different direction?",
    type: "multi",
    maxSelect: 2,
    dimension: "agency",
    options: [
      { label: "if my parents genuinely supported it", value: "parent_support" },
      { label: "if i could see real proof that it works financially", value: "proof" },
      { label: "if i could try without fully committing yet", value: "low_risk_trial" },
      { label: "if someone i admire walked that path", value: "role_model" },
    ],
  },
  {
    id: "j2q7",
    question: "how open are you to discovering your path is wider than you think?",
    type: "single",
    dimension: "feedback_receptivity",
    options: [
      { label: "very open — show me everything! 🙌", value: "very_open" },
      { label: "cautiously curious — i'll listen", value: "cautious" },
      { label: "open but scared of disappointing my family", value: "conflicted" },
      { label: "i'll hear you out but probably stick to my plan", value: "firm" },
    ],
  },
  {
    id: "j2q8",
    question: "what does 'success' look like to your family? 🏠",
    type: "single",
    dimension: "O",
    options: [
      { label: "doctor / engineer / lawyer — the holy trinity", value: "traditional" },
      { label: "stable government job — security above all", value: "govt" },
      { label: "high salary, period — doesn't matter how", value: "salary" },
      { label: "they genuinely just want me to be happy (rare W)", value: "happiness" },
    ],
  },
  {
    id: "j2q9",
    question: "now what does success look like to YOU? ✨",
    type: "single",
    dimension: "values",
    options: [
      { label: "doing work that doesn't feel like 'work'", value: "passion" },
      { label: "making good money while being creative", value: "creative_income" },
      { label: "helping others & making a real difference", value: "impact" },
      { label: "being independent — my own boss, my own rules", value: "autonomy" },
    ],
  },
  {
    id: "j2q10",
    question: "if you could add ONE subject to school that doesn't exist yet…",
    type: "single",
    dimension: "K",
    options: [
      { label: "real-world money, investing & financial literacy", value: "finance" },
      { label: "creative problem-solving & innovation", value: "innovation" },
      { label: "self-awareness, mental health & emotional intelligence", value: "self_awareness" },
      { label: "career exploration, life skills & decision-making", value: "career_skills" },
    ],
  },
  {
    id: "j2q11",
    question: "how do you deal with pressure about your future rn? 😤",
    type: "single",
    dimension: "self_regulation",
    options: [
      { label: "bottle it up & keep pushing forward", value: "suppress" },
      { label: "talk to friends who actually get it", value: "social_support" },
      { label: "distract myself — gaming, reels, music", value: "avoidance" },
      { label: "journal, think, or reflect on my own", value: "self_reflection" },
    ],
  },
  {
    id: "j2q12",
    question: "what would you want MyRaaha to help you with the most?",
    type: "single",
    dimension: "motivation",
    options: [
      { label: "show me careers i literally didn't know existed", value: "discover" },
      { label: "help me navigate conversations with my parents", value: "family_bridge" },
      { label: "prove that my actual interests can become real careers", value: "validate" },
      { label: "find a path that makes BOTH me & my family happy", value: "balance" },
    ],
  },
  {
    id: "j2q13",
    question: "when you see someone doing something unconventional & thriving…",
    type: "single",
    dimension: "curiosity",
    options: [
      { label: "i feel inspired but think 'that could never be me'", value: "inspired_doubtful" },
      { label: "i secretly wish i had the freedom to try that", value: "secretly_envious" },
      { label: "i feel genuinely happy for them & curious about their path", value: "curious" },
      { label: "i think 'cool for them but my situation is different'", value: "dismissive" },
    ],
  },
];

// ===== Journey 3: College — Uncertain / Exploring =====
// Psychology: Identity flux, peer comparison, FOMO, low conviction
// NEP alignment: Experiential, inquiry-driven, multidisciplinary exploration
// KSAO focus: Behavioral discovery (interests, motivation, energy), learning style
// Psychometric approach: Cognitive style, agency, learning transfer, feedback receptivity
export const journey3Questions: JourneyQuestion[] = [
  {
    id: "j3q1",
    question: "your current relationship with your field of study is… 📖",
    type: "single",
    dimension: "agency",
    options: [
      { label: "studying something i'm genuinely not sure about", value: "unsure" },
      { label: "actually curious about my field — just not the career part", value: "curious" },
      { label: "here because i didn't know what else to do", value: "default" },
      { label: "switched once already, might switch again ngl", value: "serial_explorer" },
    ],
  },
  {
    id: "j3q2",
    question: "what domains lowkey fascinate you? pick up to 3 🔥",
    type: "multi",
    maxSelect: 3,
    dimension: "K",
    options: [
      { label: "AI, machine learning & future tech", value: "ai_ml" },
      { label: "content creation, media & storytelling", value: "content" },
      { label: "product design, UX & human-centered design", value: "design" },
      { label: "data science, analytics & pattern recognition", value: "data" },
      { label: "social impact, community development & NGOs", value: "social" },
      { label: "research, academia & deep knowledge", value: "research" },
      { label: "marketing, branding & consumer psychology", value: "marketing" },
      { label: "behavioral science, psychology & the human mind", value: "psychology" },
    ],
  },
  {
    id: "j3q3",
    question: "what's your BIGGEST fear about making career choices rn?",
    type: "single",
    dimension: "ambiguity_tolerance",
    options: [
      { label: "choosing wrong and wasting precious years", value: "wrong_choice" },
      { label: "being average at everything, exceptional at nothing", value: "mediocrity" },
      { label: "missing out on something way better (pure FOMO)", value: "fomo" },
      { label: "not being genuinely passionate about anything", value: "no_passion" },
    ],
  },
  {
    id: "j3q4",
    question: "how do you naturally explore new interests?",
    type: "single",
    dimension: "cognitive_style",
    options: [
      { label: "youtube deep dives & reading at 2am", value: "self_directed" },
      { label: "signing up for random online courses or workshops", value: "structured" },
      { label: "talking to people who do interesting things", value: "social_learning" },
      { label: "jumping in & trying small projects myself", value: "experiential" },
    ],
  },
  {
    id: "j3q5",
    question: "what kinda work environment sounds fire to you? 🔥",
    type: "single",
    dimension: "O",
    options: [
      { label: "startup chaos — fast, messy, exciting, unpredictable", value: "startup" },
      { label: "big company — structured growth, clear ladder", value: "corporate" },
      { label: "freelance — total freedom, variety, my own rules", value: "freelance" },
      { label: "research — deep thinking, real long-term impact", value: "research" },
    ],
  },
  {
    id: "j3q6",
    question: "which of these mini-experiments would you actually try? 🧪",
    type: "multi",
    maxSelect: 3,
    dimension: "S",
    options: [
      { label: "build a small app, website, or digital product", value: "build" },
      { label: "start a blog, newsletter, or content channel", value: "create" },
      { label: "volunteer for a cause i deeply care about", value: "volunteer" },
      { label: "shadow a professional for a week", value: "observe" },
      { label: "enter a hackathon, case comp, or challenge", value: "compete" },
      { label: "take on a real freelance gig for actual money", value: "earn" },
    ],
  },
  {
    id: "j3q7",
    question: "when learning something brand new, you prefer…",
    type: "single",
    dimension: "learning_transfer",
    options: [
      { label: "intense short sprints — crash courses & bootcamps", value: "sprint" },
      { label: "slow & steady deep dives — mastering from ground up", value: "deep" },
      { label: "learning by DOING real things — not theory", value: "practical" },
      { label: "learning with friends, study groups & discussion", value: "collaborative" },
    ],
  },
  {
    id: "j3q8",
    question: "what's your honest relationship with failure?",
    type: "single",
    dimension: "resilience",
    options: [
      { label: "it genuinely terrifies me ngl", value: "fear" },
      { label: "it's fine as long as nobody else sees me fail 💀", value: "private" },
      { label: "i know it's part of the journey — just hard in the moment", value: "accepting" },
      { label: "i've failed before and came back stronger each time", value: "resilient" },
    ],
  },
  {
    id: "j3q9",
    question: "what skills do you wanna level up in the next year? ⬆️",
    type: "multi",
    maxSelect: 3,
    dimension: "S",
    options: [
      { label: "coding, tech & digital tools", value: "technical" },
      { label: "public speaking & confident communication", value: "communication" },
      { label: "creative thinking, design & visual storytelling", value: "creative" },
      { label: "leadership, decision-making & team management", value: "leadership" },
      { label: "writing, storytelling & content creation", value: "writing" },
      { label: "networking, relationships & collaboration", value: "networking" },
    ],
  },
  {
    id: "j3q10",
    question: "where do you realistically see yourself in 2 years?",
    type: "single",
    dimension: "motivation",
    options: [
      { label: "working at a company or org i genuinely admire", value: "employed" },
      { label: "building my own thing — product, brand, or venture", value: "founder" },
      { label: "still exploring & that's perfectly okay with me", value: "exploring" },
      { label: "doing a masters, research, or further specialization", value: "academic" },
    ],
  },
  {
    id: "j3q11",
    question: "pick the quote that hits different for you 💯",
    type: "single",
    dimension: "values",
    options: [
      { label: "\"you don't find your path — you create it\"", value: "creator" },
      { label: "\"done is better than perfect\"", value: "action" },
      { label: "\"the biggest risk is not taking one\"", value: "courage" },
      { label: "\"explore everything, commit when ready\"", value: "patience" },
    ],
  },
  {
    id: "j3q12",
    question: "what would genuinely help you feel more confident about your direction?",
    type: "single",
    dimension: "feedback_receptivity",
    options: [
      { label: "trying different things in a safe, judgment-free space", value: "safe_exploration" },
      { label: "talking to people who've walked similar messy paths", value: "peer_mentors" },
      { label: "seeing real data on what paths actually work", value: "evidence" },
      { label: "having a flexible plan that's allowed to evolve", value: "adaptive_plan" },
    ],
  },
  {
    id: "j3q13",
    question: "how do you feel when someone gives you honest feedback on your work?",
    type: "single",
    dimension: "feedback_receptivity",
    options: [
      { label: "anxious at first but i know it helps me grow", value: "growth_oriented" },
      { label: "depends on who's giving it — trust matters", value: "trust_based" },
      { label: "i actively seek it out — i want to improve", value: "proactive" },
      { label: "lowkey defensive but working on it 😅", value: "defensive" },
    ],
  },
];

// ===== Journey 4: College — Resume-Driven / Outcome-Anxious =====
// Psychology: Placement pressure, skill hoarding, external metrics obsession
// NEP alignment: Shift from rote/accumulation to deep understanding, formative growth
// KSAO focus: Energy patterns (S), delayed gratification, self-regulation (O)
// Psychometric approach: Stress-performance dynamics, self-regulation patterns
export const journey4Questions: JourneyQuestion[] = [
  {
    id: "j4q1",
    question: "be real — your linkedin right now is… 📊",
    type: "single",
    dimension: "self_regulation",
    options: [
      { label: "way more polished than my actual skill level 😅", value: "inflated" },
      { label: "packed with every certification i could grab", value: "hoarding" },
      { label: "honestly pretty accurate — i keep it real", value: "authentic" },
      { label: "i avoid linkedin completely, it stresses me tf out", value: "avoidant" },
    ],
  },
  {
    id: "j4q2",
    question: "what's ACTUALLY driving your career moves right now?",
    type: "single",
    dimension: "motivation",
    options: [
      { label: "placement stats, salary packages & CTC numbers", value: "external_metrics" },
      { label: "what looks impressive on a resume", value: "signaling" },
      { label: "what my peers & batchmates are doing", value: "social_proof" },
      { label: "genuine interest — trying hard to keep it real", value: "intrinsic" },
    ],
  },
  {
    id: "j4q3",
    question: "how many tools/skills have you 'learned' but barely actually use?",
    type: "single",
    dimension: "learning_transfer",
    options: [
      { label: "way too many ngl — collecting badges not skills 💀", value: "many" },
      { label: "a few, but i go deep on what actually matters", value: "focused" },
      { label: "i stack them like pokemon — gotta catch em all", value: "collector" },
      { label: "i only learn what i have an immediate need for", value: "practical" },
    ],
  },
  {
    id: "j4q4",
    question: "which of these do you secretly struggle with? (pick 2, no judgment) 🫂",
    type: "multi",
    maxSelect: 2,
    dimension: "resilience",
    options: [
      { label: "constant comparison with high-achieving peers", value: "comparison" },
      { label: "imposter syndrome — feeling like a fraud", value: "imposter" },
      { label: "burnout from trying to optimize everything", value: "burnout" },
      { label: "genuinely not knowing what excites me", value: "lost_passion" },
      { label: "fear of being 'behind' — everyone seems ahead", value: "behind" },
    ],
  },
  {
    id: "j4q5",
    question: "if money, status, and family expectations didn't exist — you'd be…",
    type: "single",
    dimension: "values",
    options: [
      { label: "doing something wildly creative — art, music, writing", value: "creative" },
      { label: "building products that people genuinely love using", value: "builder" },
      { label: "teaching, mentoring, or helping others grow", value: "educator" },
      { label: "solving massive societal problems nobody else touches", value: "changemaker" },
    ],
  },
  {
    id: "j4q6",
    question: "what ENERGIZES you vs what DRAINS you?",
    type: "single",
    dimension: "energy",
    options: [
      { label: "energized by creating — drained by routine & repetition", value: "creator" },
      { label: "energized by solving hard problems — drained by admin work", value: "solver" },
      { label: "energized by people & collaboration — drained by isolation", value: "connector" },
      { label: "energized by learning new things — drained by doing the same thing", value: "learner" },
    ],
  },
  {
    id: "j4q7",
    question: "when a plan completely falls apart, you usually…",
    type: "single",
    dimension: "self_regulation",
    options: [
      { label: "panic and immediately scramble for a new plan", value: "reactive" },
      { label: "spiral into feeling like a failure for a while", value: "emotional" },
      { label: "pause, adapt, and try a different approach", value: "adaptive" },
      { label: "ask literally everyone i know for advice", value: "external_seeking" },
    ],
  },
  {
    id: "j4q8",
    question: "what's the ONE thing you wish your education actually taught you?",
    type: "single",
    dimension: "K",
    options: [
      { label: "how to actually build relationships & network authentically", value: "networking" },
      { label: "how to discover what genuinely suits ME as a person", value: "self_discovery" },
      { label: "practical, in-demand skills that companies actually want", value: "practical_skills" },
      { label: "how to manage stress, energy, and not burn out", value: "wellbeing" },
    ],
  },
  {
    id: "j4q9",
    question: "your ideal career would involve… (pick 2) ✨",
    type: "multi",
    maxSelect: 2,
    dimension: "values",
    options: [
      { label: "constant learning, growth & intellectual stimulation", value: "growth" },
      { label: "creative freedom & real autonomy over my work", value: "freedom" },
      { label: "high impact — making a visible difference", value: "impact" },
      { label: "financial security & long-term stability", value: "security" },
      { label: "innovation — working on cutting-edge, future stuff", value: "innovation" },
      { label: "flexibility & genuine work-life balance", value: "balance" },
    ],
  },
  {
    id: "j4q10",
    question: "how do you define 'compounding' in career terms?",
    type: "single",
    dimension: "cognitive_style",
    options: [
      { label: "building deep, irreplaceable expertise over time", value: "depth" },
      { label: "stacking diverse skills that connect in unique ways", value: "breadth" },
      { label: "growing a network that keeps opening unexpected doors", value: "network" },
      { label: "all of these — slow wins beat fast hacks", value: "holistic" },
    ],
  },
  {
    id: "j4q11",
    question: "what's your stress level about placements/jobs rn? 📈",
    type: "single",
    dimension: "resilience",
    options: [
      { label: "off the charts 📈📈📈 — it's consuming me", value: "extreme" },
      { label: "moderate — stressful but i'm managing", value: "moderate" },
      { label: "low — i trust the process & my preparation", value: "low" },
      { label: "i've stopped thinking about it (avoidance mode)", value: "avoidant" },
    ],
  },
  {
    id: "j4q12",
    question: "what would actually help you stop over-optimizing & start living?",
    type: "single",
    dimension: "feedback_receptivity",
    options: [
      { label: "knowing that my unique, non-linear path is genuinely valid", value: "validation" },
      { label: "seeing real examples of unconventional paths that worked", value: "social_proof" },
      { label: "a clear plan that still has room for exploration", value: "structured_flex" },
      { label: "mentors who've been exactly where i am right now", value: "mentorship" },
    ],
  },
  {
    id: "j4q13",
    question: "when you look at your skill set honestly, you feel like…",
    type: "single",
    dimension: "A",
    options: [
      { label: "wide but shallow — know a lot of things superficially", value: "wide_shallow" },
      { label: "deep in one area but missing breadth", value: "deep_narrow" },
      { label: "actually well-rounded — mix of depth & breadth", value: "balanced" },
      { label: "genuinely confused about what my real strengths are", value: "unclear" },
    ],
  },
];

// ===== Journey 5: Professional — Unsettled / Questioning =====
// Psychology: "Is this all there is?", identity-work mismatch, quiet burnout
// NEP alignment: Lifelong learning, multiple pathways, no hard separations
// KSAO focus: Values anchoring, decision-making under uncertainty, identity evolution
// Psychometric approach: Values inventories, moral courage, delayed gratification
export const journey5Questions: JourneyQuestion[] = [
  {
    id: "j5q1",
    question: "how long have you been feeling 'off' about your career? ⏳",
    type: "single",
    dimension: "O",
    options: [
      { label: "a few months — it's a recent feeling", value: "months" },
      { label: "about a year — it's been building", value: "year" },
      { label: "honestly? years at this point", value: "years" },
      { label: "i think i always felt this way, just ignored it", value: "always" },
    ],
  },
  {
    id: "j5q2",
    question: "what's the dominant feeling right now?",
    type: "single",
    dimension: "energy",
    options: [
      { label: "restless — like there's something more out there", value: "restless" },
      { label: "stuck — can't seem to move forward or backward", value: "stuck" },
      { label: "burned out — running on fumes, empty tank", value: "burned_out" },
      { label: "confused — don't even know what i want anymore", value: "confused" },
    ],
  },
  {
    id: "j5q3",
    question: "what parts of your current work do you actually enjoy? (pick 2)",
    type: "multi",
    maxSelect: 2,
    dimension: "S",
    options: [
      { label: "solving complex, intellectually stimulating problems", value: "problem_solving" },
      { label: "mentoring, coaching, or leading others", value: "mentoring" },
      { label: "the creative and strategic aspects", value: "creative" },
      { label: "connecting with people, clients & stakeholders", value: "connecting" },
      { label: "honestly? the paycheck 💰 — let's be real", value: "financial" },
      { label: "the expertise & mastery i've built over time", value: "mastery" },
    ],
  },
  {
    id: "j5q4",
    question: "what drains your energy the MOST at work?",
    type: "single",
    dimension: "energy",
    options: [
      { label: "doing work that feels fundamentally meaningless", value: "meaningless" },
      { label: "office politics, bureaucracy & corporate games", value: "politics" },
      { label: "repetitive tasks with zero growth or challenge", value: "stagnation" },
      { label: "feeling like my work makes no real impact", value: "no_impact" },
    ],
  },
  {
    id: "j5q5",
    question: "what's genuinely holding you back from making a change? (pick 2)",
    type: "multi",
    maxSelect: 2,
    dimension: "O",
    options: [
      { label: "financial responsibilities — EMIs, family, savings", value: "financial" },
      { label: "fear of starting completely over at my age/stage", value: "starting_over" },
      { label: "not knowing what else i'd even do", value: "unclear_direction" },
      { label: "family expectations & social obligations", value: "family" },
      { label: "the years i've already invested in this path", value: "sunk_cost" },
    ],
  },
  {
    id: "j5q6",
    question: "if you could redesign your career from scratch right now…",
    type: "single",
    dimension: "A",
    options: [
      { label: "i'd do something completely different", value: "radical_change" },
      { label: "same field, very different role or level", value: "same_field" },
      { label: "i'd add a creative passion project alongside my job", value: "side_project" },
      { label: "i'd go fully entrepreneurial — build my own thing", value: "entrepreneurial" },
    ],
  },
  {
    id: "j5q7",
    question: "what does your IDEAL weekday actually look like? 📅",
    type: "single",
    dimension: "values",
    options: [
      { label: "deep work on things that genuinely matter to me", value: "deep_work" },
      { label: "variety — meetings, creativity, strategy, execution", value: "variety" },
      { label: "flexible hours, remote, at my own pace", value: "flexibility" },
      { label: "collaborating with a team on building something new", value: "collaborative" },
    ],
  },
  {
    id: "j5q8",
    question: "which of these values matter MOST to you at this stage? (pick 2)",
    type: "multi",
    maxSelect: 2,
    dimension: "values",
    options: [
      { label: "purpose & genuine meaning in my work", value: "purpose" },
      { label: "freedom, autonomy & self-direction", value: "freedom" },
      { label: "growth, learning & intellectual stimulation", value: "growth" },
      { label: "stability, predictability & financial security", value: "stability" },
      { label: "creative expression & authentic self", value: "creativity" },
      { label: "impact — contributing to something larger", value: "impact" },
    ],
  },
  {
    id: "j5q9",
    question: "have you actively tried any of these? (pick all that apply)",
    type: "multi",
    dimension: "agency",
    options: [
      { label: "talked to a career coach or therapist", value: "coach" },
      { label: "taken personality or career assessments", value: "assessments" },
      { label: "started learning something completely new", value: "learning" },
      { label: "explored freelancing, consulting, or side hustles", value: "freelancing" },
      { label: "none — genuinely don't know where to start", value: "none" },
    ],
  },
  {
    id: "j5q10",
    question: "what would a career 'transition' ideally look like for you?",
    type: "single",
    dimension: "ambiguity_tolerance",
    options: [
      { label: "gradual — test waters while still employed", value: "gradual" },
      { label: "full send — quit and go all in on the new thing", value: "full_send" },
      { label: "build a solid safety net first, then make the leap", value: "safety_net" },
      { label: "pivot internally within my current company/field", value: "internal" },
    ],
  },
  {
    id: "j5q11",
    question: "what scares you the MOST about making a change?",
    type: "single",
    dimension: "resilience",
    options: [
      { label: "losing income, stability & financial safety", value: "financial_fear" },
      { label: "being judged by family, friends & society", value: "social_judgment" },
      { label: "failing spectacularly at the new thing", value: "failure" },
      { label: "realizing i should've done this years ago", value: "regret" },
    ],
  },
  {
    id: "j5q12",
    question: "what do you need most from MyRaaha right now?",
    type: "single",
    dimension: "motivation",
    options: [
      { label: "clarity on what i actually, genuinely want", value: "clarity" },
      { label: "a safe space to explore options without judgment", value: "safe_space" },
      { label: "a structured, step-by-step transition plan", value: "plan" },
      { label: "real proof that career pivots at my stage actually work", value: "proof" },
    ],
  },
  {
    id: "j5q13",
    question: "how has your relationship with 'identity' changed over the years?",
    type: "single",
    dimension: "self_regulation",
    options: [
      { label: "i used to know who i was — now i'm not so sure", value: "shifting" },
      { label: "i've grown a lot but my career hasn't kept up", value: "outgrown" },
      { label: "i'm discovering new parts of myself i never explored", value: "discovering" },
      { label: "i'm the same person — the world just changed around me", value: "stable" },
    ],
  },
];

// ===== Journey 6: Professional — Risk-Averse / Locked-In =====
// Psychology: Financial security, identity fused with role, fear of loss
// NEP alignment: Lifelong learning, growth within existing frameworks
// KSAO focus: Ambiguity tolerance, agency ramp-up, mastery deepening
// Psychometric approach: Stress-performance patterns, optimization without disruption
export const journey6Questions: JourneyQuestion[] = [
  {
    id: "j6q1",
    question: "if you're being completely honest, your career feels like… 🔒",
    type: "single",
    dimension: "energy",
    options: [
      { label: "golden handcuffs — great comp, mediocre everything else", value: "golden_cuffs" },
      { label: "comfortable but not particularly fulfilling", value: "comfortable" },
      { label: "autopilot — going through the motions daily", value: "autopilot" },
      { label: "actually decent — just want more depth or breadth", value: "want_more" },
    ],
  },
  {
    id: "j6q2",
    question: "what specifically keeps you in your current role? (pick 2)",
    type: "multi",
    maxSelect: 2,
    dimension: "O",
    options: [
      { label: "salary & benefits i genuinely can't afford to lose", value: "compensation" },
      { label: "years of expertise i'd 'waste' by starting over", value: "sunk_expertise" },
      { label: "family financial responsibilities & dependents", value: "family" },
      { label: "reputation, title & professional identity i've built", value: "reputation" },
      { label: "fear of the complete unknown", value: "fear" },
    ],
  },
  {
    id: "j6q3",
    question: "how do you genuinely feel about risk in your career?",
    type: "single",
    dimension: "ambiguity_tolerance",
    options: [
      { label: "avoid it strongly — i need predictability", value: "risk_averse" },
      { label: "calculated risks only — with data & backup plans", value: "calculated" },
      { label: "slowly warming up to the idea of taking more", value: "warming" },
      { label: "would take bigger risks IF i had a solid safety net", value: "conditional" },
    ],
  },
  {
    id: "j6q4",
    question: "what would make personal growth feel SAFE for you?",
    type: "single",
    dimension: "agency",
    options: [
      { label: "growing WITHIN my current field — deeper, not wider", value: "depth" },
      { label: "adding a new skill without disrupting my current role", value: "upskill" },
      { label: "a side project that could quietly become plan B", value: "side_venture" },
      { label: "a mentor who's navigated this exact kind of transition", value: "guided" },
    ],
  },
  {
    id: "j6q5",
    question: "which areas of your field would you love to truly master? (pick 2)",
    type: "multi",
    maxSelect: 2,
    dimension: "S",
    options: [
      { label: "leadership, strategy & organizational thinking", value: "leadership" },
      { label: "deep technical specialization & expertise", value: "technical" },
      { label: "cross-functional skills that bridge different teams", value: "cross_functional" },
      { label: "people management, culture & team building", value: "people" },
      { label: "innovation, R&D & future-forward thinking", value: "innovation" },
      { label: "thought leadership & becoming an industry voice", value: "thought_leadership" },
    ],
  },
  {
    id: "j6q6",
    question: "where do you see the MOST growth potential in your career?",
    type: "single",
    dimension: "motivation",
    options: [
      { label: "going much deeper in my area of expertise", value: "specialist" },
      { label: "moving into senior management or leadership", value: "management" },
      { label: "starting something on the side — exploring independence", value: "side_venture" },
      { label: "becoming an industry expert, consultant, or advisor", value: "authority" },
    ],
  },
  {
    id: "j6q7",
    question: "how well do you handle ambiguity & uncertainty at work?",
    type: "single",
    dimension: "ambiguity_tolerance",
    options: [
      { label: "i need clear goals, structure & defined expectations", value: "needs_structure" },
      { label: "can handle some uncertainty, but prefer clarity", value: "moderate" },
      { label: "getting better at it — still uncomfortable though", value: "improving" },
      { label: "bring it on — i figure things out as i go", value: "comfortable" },
    ],
  },
  {
    id: "j6q8",
    question: "what's your relationship between your identity and your job?",
    type: "single",
    dimension: "self_regulation",
    options: [
      { label: "my job IS my identity — it's deeply intertwined", value: "fused" },
      { label: "mostly separate but people primarily know me for my work", value: "mostly_fused" },
      { label: "i'm consciously more than just my job title", value: "separate" },
      { label: "honestly still figuring out where the line is", value: "exploring" },
    ],
  },
  {
    id: "j6q9",
    question: "which 'growth without chaos' options actually appeal to you? (pick 2)",
    type: "multi",
    maxSelect: 2,
    dimension: "learning_transfer",
    options: [
      { label: "executive coaching & leadership development programs", value: "executive_coaching" },
      { label: "advanced certifications & industry-recognized courses", value: "certifications" },
      { label: "building a personal brand on the side — writing, speaking", value: "personal_brand" },
      { label: "mentoring junior professionals & giving back", value: "mentoring" },
      { label: "publishing, speaking at conferences & thought leadership", value: "publishing" },
    ],
  },
  {
    id: "j6q10",
    question: "how stressed are you about your career trajectory? 📉",
    type: "single",
    dimension: "resilience",
    options: [
      { label: "not stressed — i'm here to optimize & level up", value: "optimize" },
      { label: "mildly stressed — feel like i could be doing more", value: "mild" },
      { label: "moderately — the career plateau is very real", value: "moderate" },
      { label: "very — feeling genuinely stuck & frustrated", value: "high" },
    ],
  },
  {
    id: "j6q11",
    question: "what ONE change would make your current role 10x more fulfilling?",
    type: "single",
    dimension: "values",
    options: [
      { label: "more creative freedom & autonomy over my decisions", value: "freedom" },
      { label: "clearer growth opportunities & a visible path upward", value: "growth" },
      { label: "more meaningful projects that actually create impact", value: "meaning" },
      { label: "a well-defined path to the next level of my career", value: "clarity" },
    ],
  },
  {
    id: "j6q12",
    question: "entrepreneurship as a concept feels like…",
    type: "single",
    dimension: "agency",
    options: [
      { label: "genuinely interesting but just not for me (too risky)", value: "not_for_me" },
      { label: "maybe someday when i'm more financially secure", value: "future" },
      { label: "i've been thinking about it seriously & quietly", value: "considering" },
      { label: "already exploring it on the side — testing waters", value: "active" },
    ],
  },
  {
    id: "j6q13",
    question: "what kind of support would make the biggest difference for you rn?",
    type: "single",
    dimension: "feedback_receptivity",
    options: [
      { label: "a structured growth plan within my current track", value: "structured" },
      { label: "access to peers going through the same career stage", value: "community" },
      { label: "a coach who helps me see blind spots & possibilities", value: "coaching" },
      { label: "real data & frameworks to make better career decisions", value: "data_driven" },
    ],
  },
];

// ========== JOURNEY METADATA ==========
export interface JourneyMeta {
  id: string;
  title: string;
  subtitle: string;
  emoji: string;
  outputMessage: string;
}

export const journeyMetas: Record<string, JourneyMeta> = {
  J1: {
    id: "J1",
    title: "curiosity unlocked 🔓",
    subtitle: "let's explore the world through stories, vibes, and what genuinely sparks your interest — zero pressure, zero judgment.",
    emoji: "🌱",
    outputMessage: "here are four worlds you seem curious about. no labels. no pressure. just vibes ✨",
  },
  J2: {
    id: "J2",
    title: "path expansion mode 🗺️",
    subtitle: "you've got a plan — and that's valid. now let's see how much wider & richer your world actually is.",
    emoji: "🔍",
    outputMessage: "you don't need to change paths — here's how wide your current one really is 🌟",
  },
  J3: {
    id: "J3",
    title: "explore everything era 🧪",
    subtitle: "no commitment needed rn. let's map how you explore, learn, and grow — then match you to what actually fits.",
    emoji: "🎯",
    outputMessage: "here's how you tend to explore, learn, and grow — and where that fits best 🚀",
  },
  J4: {
    id: "J4",
    title: "real talk about your grind 💎",
    subtitle: "you've been optimizing hard. let's find what actually energizes you for the long run — not just what looks good on paper.",
    emoji: "💡",
    outputMessage: "here's how to stop over-optimizing and start compounding for real 📈",
  },
  J5: {
    id: "J5",
    title: "transition loading... 🔄",
    subtitle: "you're not lost — you're evolving. let's map what's changing, what still matters, and what's actually next.",
    emoji: "🦋",
    outputMessage: "you're not lost — you're transitioning. and we've got a map for that 🗺️",
  },
  J6: {
    id: "J6",
    title: "growth without the chaos 🏔️",
    subtitle: "stability is not a weakness. let's find ways to grow, evolve, and level up without burning everything down.",
    emoji: "🎯",
    outputMessage: "growth without chaos — that's the vibe. here's your optimization playbook 🔥",
  },
};

// ========== HELPER FUNCTIONS ==========

export function getVariantQuestions(userType: string): VariantQuestion[] {
  if (userType === "school") return schoolVariantQuestions;
  if (userType === "college") return collegeVariantQuestions;
  return professionalVariantQuestions;
}

export function detectVariant(userType: string, answers: Record<string, string>): "U" | "R" {
  const questions = getVariantQuestions(userType);
  let uCount = 0;
  let rCount = 0;
  for (const q of questions) {
    const answer = answers[q.id];
    if (!answer) continue;
    const option = q.options.find(o => o.value === answer);
    if (option?.variant === "U") uCount++;
    else if (option?.variant === "R") rCount++;
  }
  return uCount >= rCount ? "U" : "R";
}

export function getJourneyId(userType: string, variant: "U" | "R"): string {
  if (userType === "school") return variant === "U" ? "J1" : "J2";
  if (userType === "college") return variant === "U" ? "J3" : "J4";
  return variant === "U" ? "J5" : "J6";
}

export function getJourneyQuestions(journeyId: string): JourneyQuestion[] {
  switch (journeyId) {
    case "J1": return journey1Questions;
    case "J2": return journey2Questions;
    case "J3": return journey3Questions;
    case "J4": return journey4Questions;
    case "J5": return journey5Questions;
    case "J6": return journey6Questions;
    default: return journey1Questions;
  }
}
