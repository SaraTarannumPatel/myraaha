// Journey Discovery Data — Gen Z style, single/multi choice only
// 6 journeys across 3 life stages × 2 behavioral variants

export interface JourneyQuestion {
  id: string;
  question: string;
  type: "single" | "multi";
  options: { label: string; value: string }[];
  maxSelect?: number; // for multi
}

export interface VariantQuestion {
  id: string;
  question: string;
  options: { label: string; value: string; variant: "U" | "R" }[];
}

// ========== VARIANT DETECTION ==========

export const schoolVariantQuestions: VariantQuestion[] = [
  {
    id: "sv1",
    question: "when someone asks 'what do u wanna be?', you usually… 👀",
    options: [
      { label: "blank out ngl 😅", value: "blank", variant: "U" },
      { label: "say what my parents expect", value: "parents", variant: "R" },
      { label: "have a vague idea but nothing solid", value: "vague", variant: "U" },
      { label: "know exactly — it's been decided", value: "decided", variant: "R" },
    ],
  },
  {
    id: "sv2",
    question: "your career knowledge mostly comes from…",
    options: [
      { label: "honestly? movies & youtube 🎬", value: "media", variant: "U" },
      { label: "family discussions & expectations", value: "family", variant: "R" },
      { label: "random internet rabbit holes", value: "internet", variant: "U" },
      { label: "coaching classes & career counselors", value: "coaching", variant: "R" },
    ],
  },
  {
    id: "sv3",
    question: "if someone said 'try something completely different'…",
    options: [
      { label: "i'd be curious but lowkey scared", value: "curious_scared", variant: "U" },
      { label: "my parents would NOT vibe with that", value: "parents_no", variant: "R" },
      { label: "sounds fun tbh, why not?", value: "fun", variant: "U" },
      { label: "nah fam, i already have a plan", value: "plan", variant: "R" },
    ],
  },
  {
    id: "sv4",
    question: "how do you feel about picking a 'career stream'?",
    options: [
      { label: "terrified — too many options, too little info 😰", value: "terrified", variant: "U" },
      { label: "already picked, no going back now", value: "picked", variant: "R" },
      { label: "wish someone would just show me what's out there", value: "wish", variant: "U" },
      { label: "my family and i agreed on the best path", value: "agreed", variant: "R" },
    ],
  },
];

export const collegeVariantQuestions: VariantQuestion[] = [
  {
    id: "cv1",
    question: "your current career situation is giving… 💀",
    options: [
      { label: "main character with no script 🎬", value: "no_script", variant: "U" },
      { label: "linkedin grindset 24/7", value: "grindset", variant: "R" },
      { label: "existential crisis but make it aesthetic", value: "crisis", variant: "U" },
      { label: "resume padding champion 🏆", value: "resume_pad", variant: "R" },
    ],
  },
  {
    id: "cv2",
    question: "what stresses you most about the future?",
    options: [
      { label: "having NO idea what i actually want", value: "no_idea", variant: "U" },
      { label: "not getting placed / getting the right job", value: "placement", variant: "R" },
      { label: "everyone else seems to have it figured out", value: "comparison", variant: "U" },
      { label: "my skills might not be enough", value: "skills", variant: "R" },
    ],
  },
  {
    id: "cv3",
    question: "when you think about your skills, you feel like…",
    options: [
      { label: "idk what i'm even good at fr", value: "dont_know", variant: "U" },
      { label: "i have skills but will they get me hired?", value: "hired", variant: "R" },
      { label: "i'm interested in too many things to pick one", value: "too_many", variant: "U" },
      { label: "need more certifications & projects asap", value: "certs", variant: "R" },
    ],
  },
  {
    id: "cv4",
    question: "your approach to career planning rn is…",
    options: [
      { label: "what career planning? 🙃", value: "none", variant: "U" },
      { label: "optimizing every line on my resume", value: "optimizing", variant: "R" },
      { label: "vibing & hoping it works out", value: "vibing", variant: "U" },
      { label: "applying to everything that moves", value: "applying", variant: "R" },
    ],
  },
];

export const professionalVariantQuestions: VariantQuestion[] = [
  {
    id: "pv1",
    question: "your current work vibe is…",
    options: [
      { label: "sunday scaries hit different every week 😮‍💨", value: "scaries", variant: "U" },
      { label: "stable but… is this it?", value: "stable", variant: "R" },
      { label: "quietly questioning everything", value: "questioning", variant: "U" },
      { label: "can't risk changing, bills don't pay themselves", value: "bills", variant: "R" },
    ],
  },
  {
    id: "pv2",
    question: "when you think about switching careers…",
    options: [
      { label: "i think about it daily ngl", value: "daily", variant: "U" },
      { label: "sounds nice but too risky at this stage", value: "risky", variant: "R" },
      { label: "i don't even know what else i'd do", value: "dont_know", variant: "U" },
      { label: "maybe later when i have more savings", value: "savings", variant: "R" },
    ],
  },
  {
    id: "pv3",
    question: "what describes your relationship with your job?",
    options: [
      { label: "golden handcuffs fr fr 🔒", value: "handcuffs", variant: "R" },
      { label: "it pays but my soul is bored", value: "bored", variant: "U" },
      { label: "i'm good at it but it doesn't feel like 'me'", value: "not_me", variant: "U" },
      { label: "i've invested too much to start over", value: "invested", variant: "R" },
    ],
  },
  {
    id: "pv4",
    question: "your ideal career move would be…",
    options: [
      { label: "a complete 180 into something that excites me", value: "complete_change", variant: "U" },
      { label: "a promotion or lateral move within my field", value: "lateral", variant: "R" },
      { label: "honestly? i just want to figure out what i want", value: "figure_out", variant: "U" },
      { label: "something safe with better growth potential", value: "safe_growth", variant: "R" },
    ],
  },
];

// ========== JOURNEY QUESTIONS ==========

// Journey 1: School — Underconfident / Unexposed
export const journey1Questions: JourneyQuestion[] = [
  {
    id: "j1q1",
    question: "if you could shadow someone for a day, who'd it be? 🌟",
    type: "single",
    options: [
      { label: "a game developer making worlds", value: "game_dev" },
      { label: "a doctor saving lives", value: "doctor" },
      { label: "a filmmaker telling stories", value: "filmmaker" },
      { label: "a scientist in a lab", value: "scientist" },
    ],
  },
  {
    id: "j1q2",
    question: "which of these sounds like a fun weekend? 🎮",
    type: "single",
    options: [
      { label: "building something with my hands", value: "building" },
      { label: "drawing, painting, or designing stuff", value: "creative" },
      { label: "solving puzzles or brain teasers", value: "puzzles" },
      { label: "hanging out & learning from people", value: "social" },
    ],
  },
  {
    id: "j1q3",
    question: "what kinda youtube rabbit holes do you fall into? 🕳️",
    type: "multi",
    maxSelect: 3,
    options: [
      { label: "tech & gadgets", value: "tech" },
      { label: "art & animation", value: "art" },
      { label: "space & science", value: "space" },
      { label: "cooking & food", value: "cooking" },
      { label: "sports & fitness", value: "sports" },
      { label: "music & beats", value: "music" },
      { label: "animals & nature", value: "nature" },
      { label: "business & money", value: "business" },
    ],
  },
  {
    id: "j1q4",
    question: "in a group project, you naturally end up… 🤝",
    type: "single",
    options: [
      { label: "coming up with the ideas", value: "ideas" },
      { label: "organizing everything", value: "organizing" },
      { label: "making it look pretty", value: "design" },
      { label: "presenting to the class", value: "presenting" },
    ],
  },
  {
    id: "j1q5",
    question: "which superpower would you actually pick? ⚡",
    type: "single",
    options: [
      { label: "read minds (understand people)", value: "empathy" },
      { label: "time travel (explore possibilities)", value: "exploration" },
      { label: "create anything from thin air", value: "creation" },
      { label: "know the answer to any question", value: "knowledge" },
    ],
  },
  {
    id: "j1q6",
    question: "what makes you lose track of time? ⏰",
    type: "multi",
    maxSelect: 2,
    options: [
      { label: "gaming or coding", value: "gaming_coding" },
      { label: "reading or writing stories", value: "reading_writing" },
      { label: "watching documentaries", value: "documentaries" },
      { label: "making videos or reels", value: "content" },
      { label: "helping friends with their problems", value: "helping" },
      { label: "tinkering with stuff", value: "tinkering" },
    ],
  },
  {
    id: "j1q7",
    question: "if your school had these clubs, which one? 🏫",
    type: "single",
    options: [
      { label: "robotics & tech club", value: "robotics" },
      { label: "debate & MUN", value: "debate" },
      { label: "art & design studio", value: "art" },
      { label: "entrepreneurship club", value: "entrepreneurship" },
    ],
  },
  {
    id: "j1q8",
    question: "which of these worlds fascinates you? 🌍",
    type: "multi",
    maxSelect: 3,
    options: [
      { label: "the internet & how it works", value: "internet" },
      { label: "the human body & health", value: "health" },
      { label: "money & how businesses run", value: "business" },
      { label: "the environment & sustainability", value: "environment" },
      { label: "outer space & the universe", value: "space" },
      { label: "fashion & lifestyle", value: "fashion" },
    ],
  },
  {
    id: "j1q9",
    question: "what's your energy like when learning new stuff? 🔋",
    type: "single",
    options: [
      { label: "i need to SEE it to get it (visual learner)", value: "visual" },
      { label: "i gotta DO it myself (hands-on)", value: "hands_on" },
      { label: "i like reading & thinking about it", value: "reading" },
      { label: "i learn best when someone explains it to me", value: "auditory" },
    ],
  },
  {
    id: "j1q10",
    question: "when you daydream about the future, it looks like… 💭",
    type: "single",
    options: [
      { label: "traveling the world doing cool work", value: "travel" },
      { label: "running my own thing", value: "entrepreneur" },
      { label: "being famous for something awesome", value: "recognition" },
      { label: "honestly idk yet and that's okay", value: "open" },
    ],
  },
  {
    id: "j1q11",
    question: "pick the vibe that matches you rn 🎯",
    type: "single",
    options: [
      { label: "curious but don't know where to start", value: "curious_lost" },
      { label: "interested in many things, can't pick one", value: "multi_interest" },
      { label: "not really interested in anything tbh", value: "disengaged" },
      { label: "kinda know what i like but scared to commit", value: "scared" },
    ],
  },
  {
    id: "j1q12",
    question: "what would make school way more interesting? 📚",
    type: "multi",
    maxSelect: 2,
    options: [
      { label: "real-world projects instead of theory", value: "projects" },
      { label: "meeting people who actually do cool jobs", value: "mentors" },
      { label: "learning through games & challenges", value: "gamified" },
      { label: "choosing what to study based on my interests", value: "choice" },
    ],
  },
];

// Journey 2: School — Rigid / Parent-Driven
export const journey2Questions: JourneyQuestion[] = [
  {
    id: "j2q1",
    question: "the career path you're currently on was chosen by… 🤔",
    type: "single",
    options: [
      { label: "my parents mostly", value: "parents" },
      { label: "me, but heavily influenced by family", value: "influenced" },
      { label: "what everyone in my circle does", value: "circle" },
      { label: "what seems safest tbh", value: "safe" },
    ],
  },
  {
    id: "j2q2",
    question: "if your chosen path didn't exist, what would you explore?",
    type: "multi",
    maxSelect: 2,
    options: [
      { label: "arts & design", value: "arts" },
      { label: "tech & coding", value: "tech" },
      { label: "sports & fitness", value: "sports" },
      { label: "business & startups", value: "business" },
      { label: "writing & journalism", value: "writing" },
      { label: "social work & community", value: "social" },
    ],
  },
  {
    id: "j2q3",
    question: "when you think about deviating from 'the plan'… 😬",
    type: "single",
    options: [
      { label: "exciting but my parents would flip", value: "parents_flip" },
      { label: "terrifying, what if i fail?", value: "fail" },
      { label: "secretly wish i could", value: "wish" },
      { label: "genuinely happy with the plan", value: "happy" },
    ],
  },
  {
    id: "j2q4",
    question: "do you know what people ACTUALLY do in your chosen career?",
    type: "single",
    options: [
      { label: "kinda? mostly from what i've been told", value: "told" },
      { label: "nope, just know it pays well", value: "pays" },
      { label: "yes, i've researched it properly", value: "researched" },
      { label: "i know the textbook version at least", value: "textbook" },
    ],
  },
  {
    id: "j2q5",
    question: "which of these surprises you? (pick ones you didn't know!) 🤯",
    type: "multi",
    maxSelect: 4,
    options: [
      { label: "you can earn well in design & animation", value: "design_pay" },
      { label: "sports management is a real career", value: "sports_mgmt" },
      { label: "writers can work for tech companies", value: "tech_writing" },
      { label: "you can be a doctor AND an entrepreneur", value: "doc_entrepreneur" },
      { label: "environmental science has booming jobs", value: "env_jobs" },
      { label: "psychology leads to many career paths", value: "psych_paths" },
    ],
  },
  {
    id: "j2q6",
    question: "what would make you feel SAFE exploring a different path?",
    type: "multi",
    maxSelect: 2,
    options: [
      { label: "if my parents supported it", value: "parent_support" },
      { label: "if i could see proof it works", value: "proof" },
      { label: "if i could try without fully committing", value: "try" },
      { label: "if someone i admire did it", value: "role_model" },
    ],
  },
  {
    id: "j2q7",
    question: "how open are you to discovering your path is wider than you think?",
    type: "single",
    options: [
      { label: "very open, show me everything! 🙌", value: "very_open" },
      { label: "cautiously curious", value: "cautious" },
      { label: "open but scared of disappointing people", value: "scared" },
      { label: "i'll listen but probably stick to my plan", value: "stick" },
    ],
  },
  {
    id: "j2q8",
    question: "what does 'success' look like to your family? 🏠",
    type: "single",
    options: [
      { label: "doctor / engineer / lawyer — the classics", value: "classics" },
      { label: "stable government job", value: "govt" },
      { label: "high salary, period", value: "salary" },
      { label: "they just want me to be happy (rare W)", value: "happy" },
    ],
  },
  {
    id: "j2q9",
    question: "what does success look like to YOU? ✨",
    type: "single",
    options: [
      { label: "doing work that doesn't feel like work", value: "passion" },
      { label: "making bank while being creative", value: "creative_money" },
      { label: "helping others & making a difference", value: "impact" },
      { label: "being my own boss", value: "independent" },
    ],
  },
  {
    id: "j2q10",
    question: "if you could add ONE subject to school that doesn't exist…",
    type: "single",
    options: [
      { label: "real-world money & investing", value: "finance" },
      { label: "creative thinking & innovation", value: "innovation" },
      { label: "mental health & self-awareness", value: "mental_health" },
      { label: "career exploration & life skills", value: "career_explore" },
    ],
  },
  {
    id: "j2q11",
    question: "how do you handle pressure about your future? 😤",
    type: "single",
    options: [
      { label: "bottle it up & keep going", value: "bottle" },
      { label: "talk to friends who get it", value: "friends" },
      { label: "distract myself (gaming, reels, etc.)", value: "distract" },
      { label: "journal or reflect on my own", value: "journal" },
    ],
  },
  {
    id: "j2q12",
    question: "what would you want MyRaaha to help you with most?",
    type: "single",
    options: [
      { label: "show me careers i didn't know existed", value: "discover" },
      { label: "help me talk to my parents about options", value: "parents_talk" },
      { label: "prove that my interests can become careers", value: "validate" },
      { label: "find a path that makes BOTH me & my fam happy", value: "balance" },
    ],
  },
];

// Journey 3: College — Uncertain / Exploring
export const journey3Questions: JourneyQuestion[] = [
  {
    id: "j3q1",
    question: "your current academic vibe is… 📖",
    type: "single",
    options: [
      { label: "studying something i'm not sure about", value: "unsure" },
      { label: "genuinely curious about my field", value: "curious" },
      { label: "here because i didn't know what else to do", value: "default" },
      { label: "switched once, might switch again", value: "switcher" },
    ],
  },
  {
    id: "j3q2",
    question: "what domains lowkey fascinate you? (pick up to 3) 🔥",
    type: "multi",
    maxSelect: 3,
    options: [
      { label: "AI & machine learning", value: "ai_ml" },
      { label: "content creation & media", value: "content" },
      { label: "product design & UX", value: "design" },
      { label: "data science & analytics", value: "data" },
      { label: "social entrepreneurship", value: "social_ent" },
      { label: "research & academia", value: "research" },
      { label: "marketing & branding", value: "marketing" },
      { label: "psychology & behavioral science", value: "psychology" },
    ],
  },
  {
    id: "j3q3",
    question: "what's your biggest fear about career choices rn?",
    type: "single",
    options: [
      { label: "choosing wrong and wasting years", value: "wrong_choice" },
      { label: "being average at everything", value: "average" },
      { label: "missing out on something better", value: "fomo" },
      { label: "not being passionate about anything", value: "no_passion" },
    ],
  },
  {
    id: "j3q4",
    question: "how do you usually explore new interests?",
    type: "single",
    options: [
      { label: "youtube deep dives at 2am", value: "youtube" },
      { label: "signing up for random online courses", value: "courses" },
      { label: "talking to people who do cool stuff", value: "networking" },
      { label: "trying small projects on my own", value: "projects" },
    ],
  },
  {
    id: "j3q5",
    question: "what kind of work environment sounds fire? 🔥",
    type: "single",
    options: [
      { label: "startup chaos — fast, messy, exciting", value: "startup" },
      { label: "big company — structured, clear growth", value: "corporate" },
      { label: "freelance — freedom, variety, my rules", value: "freelance" },
      { label: "research — deep thinking, real impact", value: "research" },
    ],
  },
  {
    id: "j3q6",
    question: "which of these mini-experiments would you try? 🧪",
    type: "multi",
    maxSelect: 3,
    options: [
      { label: "build a small app or website", value: "build_app" },
      { label: "start a blog or newsletter", value: "blog" },
      { label: "volunteer for a cause i care about", value: "volunteer" },
      { label: "shadow a professional for a week", value: "shadow" },
      { label: "enter a hackathon or competition", value: "hackathon" },
      { label: "freelance a small project for real money", value: "freelance" },
    ],
  },
  {
    id: "j3q7",
    question: "when you learn something new, you prefer…",
    type: "single",
    options: [
      { label: "short intense sprints (crash courses)", value: "sprints" },
      { label: "slow & steady deep dives", value: "deep_dive" },
      { label: "learning by doing real things", value: "hands_on" },
      { label: "learning with friends & study groups", value: "social" },
    ],
  },
  {
    id: "j3q8",
    question: "what's your relationship with failure?",
    type: "single",
    options: [
      { label: "it lowkey terrifies me", value: "terrified" },
      { label: "it's fine as long as nobody sees 💀", value: "private_fail" },
      { label: "i know it's part of the process", value: "process" },
      { label: "i've failed before and bounced back stronger", value: "resilient" },
    ],
  },
  {
    id: "j3q9",
    question: "what skills do you wanna level up? (pick up to 3) ⬆️",
    type: "multi",
    maxSelect: 3,
    options: [
      { label: "coding & tech", value: "coding" },
      { label: "public speaking & communication", value: "speaking" },
      { label: "creative thinking & design", value: "creative" },
      { label: "leadership & management", value: "leadership" },
      { label: "writing & storytelling", value: "writing" },
      { label: "networking & relationship building", value: "networking" },
    ],
  },
  {
    id: "j3q10",
    question: "where do you see yourself in 2 years?",
    type: "single",
    options: [
      { label: "working at a company i admire", value: "company" },
      { label: "building my own thing", value: "own_thing" },
      { label: "still exploring and that's fine", value: "exploring" },
      { label: "doing a masters / higher studies", value: "masters" },
    ],
  },
  {
    id: "j3q11",
    question: "pick a quote that hits different 💯",
    type: "single",
    options: [
      { label: "\"you don't find your path, you create it\"", value: "create" },
      { label: "\"done is better than perfect\"", value: "done" },
      { label: "\"the biggest risk is not taking one\"", value: "risk" },
      { label: "\"explore everything, commit when ready\"", value: "explore" },
    ],
  },
  {
    id: "j3q12",
    question: "what would make you feel more confident about your direction?",
    type: "single",
    options: [
      { label: "trying different things in a safe space", value: "safe_space" },
      { label: "talking to people who've walked similar paths", value: "mentors" },
      { label: "seeing data on what actually works", value: "data" },
      { label: "having a flexible plan that can change", value: "flex_plan" },
    ],
  },
];

// Journey 4: College — Resume-Driven / Outcome-Anxious
export const journey4Questions: JourneyQuestion[] = [
  {
    id: "j4q1",
    question: "be honest — your linkedin is… 📊",
    type: "single",
    options: [
      { label: "more polished than my actual skills 😅", value: "polished" },
      { label: "packed with every cert i could get", value: "certs" },
      { label: "honestly pretty accurate", value: "accurate" },
      { label: "i avoid linkedin, it stresses me out", value: "avoid" },
    ],
  },
  {
    id: "j4q2",
    question: "what's driving your career moves right now?",
    type: "single",
    options: [
      { label: "placement stats & salary packages", value: "placement" },
      { label: "what looks good on a resume", value: "resume" },
      { label: "what my peers are doing", value: "peers" },
      { label: "genuine interest (trying to keep it real)", value: "genuine" },
    ],
  },
  {
    id: "j4q3",
    question: "how many skills / tools have you 'learned' but barely use?",
    type: "single",
    options: [
      { label: "way too many ngl 💀", value: "too_many" },
      { label: "a few, but i go deep on what matters", value: "focused" },
      { label: "i collect them like pokemon badges", value: "collector" },
      { label: "i only learn what i actually need", value: "practical" },
    ],
  },
  {
    id: "j4q4",
    question: "which of these do you secretly struggle with?",
    type: "multi",
    maxSelect: 2,
    options: [
      { label: "comparison with high-achieving peers", value: "comparison" },
      { label: "imposter syndrome", value: "imposter" },
      { label: "burnout from over-optimizing", value: "burnout" },
      { label: "not knowing what actually excites me", value: "no_excitement" },
      { label: "fear of being 'behind'", value: "behind" },
    ],
  },
  {
    id: "j4q5",
    question: "if money and status didn't matter, you'd be doing…",
    type: "single",
    options: [
      { label: "something creative — art, music, writing", value: "creative" },
      { label: "building products people love", value: "building" },
      { label: "teaching or mentoring others", value: "teaching" },
      { label: "solving big societal problems", value: "impact" },
    ],
  },
  {
    id: "j4q6",
    question: "what energizes you vs what drains you?",
    type: "single",
    options: [
      { label: "energized by creating, drained by routine tasks", value: "creator" },
      { label: "energized by solving problems, drained by admin", value: "solver" },
      { label: "energized by people, drained by isolation", value: "social" },
      { label: "energized by learning, drained by repetition", value: "learner" },
    ],
  },
  {
    id: "j4q7",
    question: "how do you handle it when a plan doesn't work out?",
    type: "single",
    options: [
      { label: "panic and immediately make a new plan", value: "panic_plan" },
      { label: "feel like a failure for a while", value: "failure" },
      { label: "adapt and try something different", value: "adapt" },
      { label: "ask for advice from everyone i know", value: "advice" },
    ],
  },
  {
    id: "j4q8",
    question: "what's ONE thing you wish college taught you?",
    type: "single",
    options: [
      { label: "how to actually network & build relationships", value: "networking" },
      { label: "how to find what genuinely suits me", value: "self_discovery" },
      { label: "practical skills that companies want", value: "practical" },
      { label: "how to manage stress & not burn out", value: "wellness" },
    ],
  },
  {
    id: "j4q9",
    question: "your ideal career would involve… (pick 2) ✨",
    type: "multi",
    maxSelect: 2,
    options: [
      { label: "constant learning & growth", value: "growth" },
      { label: "creative freedom & autonomy", value: "freedom" },
      { label: "high impact & meaning", value: "impact" },
      { label: "financial security & stability", value: "stability" },
      { label: "innovation & cutting-edge work", value: "innovation" },
      { label: "flexibility & work-life balance", value: "balance" },
    ],
  },
  {
    id: "j4q10",
    question: "what does 'compounding' mean to you in career terms?",
    type: "single",
    options: [
      { label: "building deep expertise over time", value: "expertise" },
      { label: "stacking diverse skills that connect", value: "diverse" },
      { label: "growing a network that opens doors", value: "network" },
      { label: "all of the above — slow wins", value: "all" },
    ],
  },
  {
    id: "j4q11",
    question: "what's your stress level about placements / jobs rn? 📈",
    type: "single",
    options: [
      { label: "off the charts 📈📈📈", value: "extreme" },
      { label: "moderate, trying to stay calm", value: "moderate" },
      { label: "low, i trust the process", value: "low" },
      { label: "i've stopped thinking about it (not great)", value: "avoidant" },
    ],
  },
  {
    id: "j4q12",
    question: "what would help you stop over-optimizing & start living?",
    type: "single",
    options: [
      { label: "knowing that my unique path is valid", value: "validation" },
      { label: "seeing that unconventional paths work too", value: "examples" },
      { label: "a clear plan that still allows exploration", value: "structured_flex" },
      { label: "mentors who've been where i am", value: "mentors" },
    ],
  },
];

// Journey 5: Professional — Unsettled / Questioning
export const journey5Questions: JourneyQuestion[] = [
  {
    id: "j5q1",
    question: "how long have you been feeling 'off' about your career? ⏳",
    type: "single",
    options: [
      { label: "a few months — it's recent", value: "months" },
      { label: "about a year now", value: "year" },
      { label: "honestly, years", value: "years" },
      { label: "i think i always felt this way", value: "always" },
    ],
  },
  {
    id: "j5q2",
    question: "what's the main feeling right now?",
    type: "single",
    options: [
      { label: "restless — like there's something more", value: "restless" },
      { label: "stuck — can't move forward or back", value: "stuck" },
      { label: "burned out — running on empty", value: "burned_out" },
      { label: "confused — don't even know what i want", value: "confused" },
    ],
  },
  {
    id: "j5q3",
    question: "what parts of your current work do you actually enjoy?",
    type: "multi",
    maxSelect: 2,
    options: [
      { label: "solving complex problems", value: "problem_solving" },
      { label: "mentoring / leading others", value: "mentoring" },
      { label: "the creative aspects", value: "creative" },
      { label: "connecting with people & clients", value: "connecting" },
      { label: "honestly? payday 💰", value: "money" },
      { label: "the expertise i've built", value: "expertise" },
    ],
  },
  {
    id: "j5q4",
    question: "what drains your energy the most at work?",
    type: "single",
    options: [
      { label: "doing work that feels meaningless", value: "meaningless" },
      { label: "office politics & bureaucracy", value: "politics" },
      { label: "repetitive tasks with no growth", value: "repetitive" },
      { label: "feeling like i'm not making an impact", value: "no_impact" },
    ],
  },
  {
    id: "j5q5",
    question: "what's holding you back from making a change?",
    type: "multi",
    maxSelect: 2,
    options: [
      { label: "financial responsibilities", value: "financial" },
      { label: "fear of starting over", value: "starting_over" },
      { label: "not knowing what else i'd do", value: "unclear" },
      { label: "family expectations & obligations", value: "family" },
      { label: "the time i've already invested", value: "sunk_cost" },
    ],
  },
  {
    id: "j5q6",
    question: "if you could redesign your career from scratch…",
    type: "single",
    options: [
      { label: "i'd do something completely different", value: "different" },
      { label: "same field, different role or level", value: "same_field" },
      { label: "i'd add a creative / passion project on the side", value: "side_project" },
      { label: "i'd go entrepreneurial", value: "entrepreneurial" },
    ],
  },
  {
    id: "j5q7",
    question: "what does your ideal weekday look like? 📅",
    type: "single",
    options: [
      { label: "deep work on things that matter to me", value: "deep_work" },
      { label: "variety — meetings, creativity, strategy", value: "variety" },
      { label: "flexible hours, remote, my pace", value: "flexible" },
      { label: "collaborative team building something new", value: "collaborative" },
    ],
  },
  {
    id: "j5q8",
    question: "which of these values matter MOST to you now?",
    type: "multi",
    maxSelect: 2,
    options: [
      { label: "purpose & meaning", value: "purpose" },
      { label: "freedom & autonomy", value: "freedom" },
      { label: "growth & learning", value: "growth" },
      { label: "stability & security", value: "stability" },
      { label: "creativity & expression", value: "creativity" },
      { label: "impact & contribution", value: "impact" },
    ],
  },
  {
    id: "j5q9",
    question: "have you tried any of these? (pick what applies)",
    type: "multi",
    options: [
      { label: "talked to a career coach", value: "coach" },
      { label: "taken personality/career assessments", value: "assessments" },
      { label: "started learning something new", value: "learning" },
      { label: "explored freelancing or side hustles", value: "freelancing" },
      { label: "none — don't know where to start", value: "none" },
    ],
  },
  {
    id: "j5q10",
    question: "what would 'transition' look like for you ideally?",
    type: "single",
    options: [
      { label: "gradual — test the waters while still employed", value: "gradual" },
      { label: "full send — quit and figure it out", value: "full_send" },
      { label: "build a safety net, then leap", value: "safety_net" },
      { label: "pivot within my current company", value: "internal" },
    ],
  },
  {
    id: "j5q11",
    question: "what scares you most about change?",
    type: "single",
    options: [
      { label: "losing income & financial safety", value: "income" },
      { label: "being judged by others", value: "judgment" },
      { label: "failing at the new thing", value: "failing" },
      { label: "realizing i wasted years", value: "wasted_time" },
    ],
  },
  {
    id: "j5q12",
    question: "what do you need most right now from MyRaaha?",
    type: "single",
    options: [
      { label: "clarity on what i actually want", value: "clarity" },
      { label: "a safe space to explore options", value: "safe_space" },
      { label: "a structured transition plan", value: "plan" },
      { label: "proof that career pivots work", value: "proof" },
    ],
  },
];

// Journey 6: Professional — Risk-Averse / Locked-In
export const journey6Questions: JourneyQuestion[] = [
  {
    id: "j6q1",
    question: "if you're being real, your career feels like… 🔒",
    type: "single",
    options: [
      { label: "golden handcuffs — good money, meh everything else", value: "golden_cuffs" },
      { label: "comfortable but not fulfilling", value: "comfortable" },
      { label: "autopilot — going through the motions", value: "autopilot" },
      { label: "actually pretty decent, just want more", value: "want_more" },
    ],
  },
  {
    id: "j6q2",
    question: "what keeps you in your current role?",
    type: "multi",
    maxSelect: 2,
    options: [
      { label: "salary & benefits i can't afford to lose", value: "salary" },
      { label: "years of expertise i'd 'waste'", value: "expertise" },
      { label: "family financial responsibilities", value: "family" },
      { label: "reputation & title i've built", value: "reputation" },
      { label: "fear of the unknown", value: "fear" },
    ],
  },
  {
    id: "j6q3",
    question: "how do you feel about risk in general?",
    type: "single",
    options: [
      { label: "avoid it — i like predictability", value: "avoid" },
      { label: "calculated risks only", value: "calculated" },
      { label: "slowly warming up to the idea", value: "warming" },
      { label: "would take more risks if i had a safety net", value: "safety_net" },
    ],
  },
  {
    id: "j6q4",
    question: "what would make growth feel safe for you?",
    type: "single",
    options: [
      { label: "growing WITHIN my current field — same domain, new heights", value: "within_field" },
      { label: "adding a new skill without leaving my job", value: "new_skill" },
      { label: "a side project that could become plan B", value: "side_project" },
      { label: "a mentor who's navigated similar waters", value: "mentor" },
    ],
  },
  {
    id: "j6q5",
    question: "what areas of your field would you love to master?",
    type: "multi",
    maxSelect: 2,
    options: [
      { label: "leadership & strategy", value: "leadership" },
      { label: "technical depth & specialization", value: "technical" },
      { label: "cross-functional skills", value: "cross_functional" },
      { label: "people management & culture", value: "people" },
      { label: "innovation & R&D", value: "innovation" },
      { label: "thought leadership & industry voice", value: "thought_leadership" },
    ],
  },
  {
    id: "j6q6",
    question: "where do you see the MOST growth potential in your career?",
    type: "single",
    options: [
      { label: "going deeper in my expertise", value: "deeper" },
      { label: "moving into management / leadership", value: "management" },
      { label: "starting something on the side", value: "side_venture" },
      { label: "becoming an industry expert / consultant", value: "consultant" },
    ],
  },
  {
    id: "j6q7",
    question: "how do you handle ambiguity at work?",
    type: "single",
    options: [
      { label: "i need clear goals & expectations", value: "clear_goals" },
      { label: "i can handle some, but prefer structure", value: "some" },
      { label: "getting better at it, still uncomfortable", value: "improving" },
      { label: "bring it on, i figure things out", value: "comfortable" },
    ],
  },
  {
    id: "j6q8",
    question: "what's your relationship with your work identity?",
    type: "single",
    options: [
      { label: "my job IS my identity tbh", value: "fused" },
      { label: "mostly separate but people know me for my work", value: "mostly_separate" },
      { label: "i'm more than my job title", value: "separate" },
      { label: "still figuring that out", value: "figuring" },
    ],
  },
  {
    id: "j6q9",
    question: "which of these 'growth without chaos' options appeal to you?",
    type: "multi",
    maxSelect: 2,
    options: [
      { label: "executive coaching & leadership development", value: "executive_coaching" },
      { label: "industry certifications & advanced courses", value: "certifications" },
      { label: "building a personal brand on the side", value: "personal_brand" },
      { label: "mentoring junior professionals", value: "mentoring" },
      { label: "writing / speaking about my expertise", value: "writing_speaking" },
    ],
  },
  {
    id: "j6q10",
    question: "how stressed are you about your career trajectory? 📉",
    type: "single",
    options: [
      { label: "not stressed, just want optimization", value: "optimize" },
      { label: "mildly stressed — could be doing more", value: "mild" },
      { label: "moderately — plateau is real", value: "moderate" },
      { label: "very — feel stuck & frustrated", value: "very" },
    ],
  },
  {
    id: "j6q11",
    question: "what's one thing that would make your current role 10x better?",
    type: "single",
    options: [
      { label: "more creative freedom & autonomy", value: "freedom" },
      { label: "better growth opportunities", value: "growth" },
      { label: "more meaningful projects", value: "meaning" },
      { label: "a clear path to the next level", value: "clear_path" },
    ],
  },
  {
    id: "j6q12",
    question: "entrepreneurship as a concept feels like…",
    type: "single",
    options: [
      { label: "interesting but not for me (too risky)", value: "not_for_me" },
      { label: "maybe someday, when i'm more secure", value: "someday" },
      { label: "i've thought about it seriously", value: "serious" },
      { label: "already exploring it quietly", value: "exploring" },
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
    subtitle: "let's explore the world through stories, vibes, and what genuinely sparks your interest — zero pressure.",
    emoji: "🌱",
    outputMessage: "here are four worlds you seem curious about. no labels. no pressure. just vibes ✨",
  },
  J2: {
    id: "J2",
    title: "path expansion mode 🗺️",
    subtitle: "you've got a plan — let's see how much wider your world actually is. you might be surprised.",
    emoji: "🔍",
    outputMessage: "you don't need to change paths — here's how wide your current one really is 🌟",
  },
  J3: {
    id: "J3",
    title: "explore everything era 🧪",
    subtitle: "no commitment needed. let's figure out how you explore, learn, and grow — then match you to what fits.",
    emoji: "🎯",
    outputMessage: "here's how you tend to explore, learn, and grow — and where that fits best 🚀",
  },
  J4: {
    id: "J4",
    title: "real talk about your grind 💎",
    subtitle: "you've been optimizing hard. let's find what actually energizes you long-term, not just what looks good on paper.",
    emoji: "💡",
    outputMessage: "here's how to stop over-optimizing and start compounding for real 📈",
  },
  J5: {
    id: "J5",
    title: "transition loading... 🔄",
    subtitle: "you're not lost — you're evolving. let's map what's changing, what matters, and what's next.",
    emoji: "🦋",
    outputMessage: "you're not lost — you're transitioning. and we've got a plan for that 🗺️",
  },
  J6: {
    id: "J6",
    title: "growth without the chaos 🏔️",
    subtitle: "stability is valid. let's find ways to grow, evolve, and level up without burning everything down.",
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
