// Comprehensive career archetype library.
// Each entry blends Holland RIASEC (Realistic, Investigative, Artistic, Social,
// Enterprising, Conventional) with established career-typology language. The
// `keywords` arrays are tuned for substring/regex scoring against the labels
// the user actually picks during the Curiosity Compass discovery flow — no
// answer is mapped statically to a single archetype.
//
// RIASEC vector order: [R, I, A, S, E, C], each 0–3.

export interface Archetype {
  key: string;
  title: string;
  tagline: string;
  description: string;
  strengths: string[];
  shadow: string[];
  careerThemes: string[];
  keywords: Array<{ rx: RegExp; w: number }>;
  riasec: [number, number, number, number, number, number];
}

const k = (s: string, w = 2): { rx: RegExp; w: number } => ({
  rx: new RegExp(`\\b(${s})\\b`, "i"),
  w,
});

export const ARCHETYPE_LIBRARY: Archetype[] = [
  {
    key: "the_builder",
    title: "The Builder",
    tagline: "Makers who learn by shipping.",
    description:
      "You learn fastest with your hands on a real problem. Prototypes beat theory; you'd rather break, fix and ship than wait for perfect conditions.",
    strengths: ["Bias to action", "Tinkering", "Resilience under iteration"],
    shadow: ["Skips planning", "Reluctant to document"],
    careerThemes: ["Engineering", "Product", "Skilled trades", "Hardware"],
    keywords: [
      k("build|building|builder|make|making|prototype|tinker|hands.?on|workshop|lab", 3),
      k("hardware|engineer|engineering|fix|assemble|fabricat", 2),
      k("project|experiment", 1),
    ],
    riasec: [3, 2, 1, 0, 1, 1],
  },
  {
    key: "the_strategist",
    title: "The Strategist",
    tagline: "Patterns first, action second.",
    description:
      "You spot leverage points others miss. Frameworks, data and second-order thinking are how you make sense of the world before you move.",
    strengths: ["Systems thinking", "Prioritisation", "Calm in ambiguity"],
    shadow: ["Analysis paralysis", "Cold in groups"],
    careerThemes: ["Strategy", "Consulting", "Operations", "Product strategy"],
    keywords: [
      k("strategy|strategi|plan|planning|framework|model|system|prioriti", 3),
      k("analy|insight|forecast|consult|operations|management", 2),
      k("business|market|finance|economics", 1),
    ],
    riasec: [0, 3, 0, 0, 3, 2],
  },
  {
    key: "the_explorer",
    title: "The Explorer",
    tagline: "Curiosity is the engine.",
    description:
      "You thrive when the map is half-drawn. New ideas, new fields, new cities — variety is fuel, not noise.",
    strengths: ["Breadth", "Reframing", "Beginner's mind"],
    shadow: ["Hard to finish", "Restless"],
    careerThemes: ["Research", "Generalist roles", "Journalism", "Founder"],
    keywords: [
      k("explor|curious|discover|new|broad|variety|wander|travel|fresh", 3),
      k("undecided|figuring|many things|not sure|open", 2),
      k("learn|read|study", 1),
    ],
    riasec: [1, 3, 2, 1, 1, 0],
  },
  {
    key: "the_connector",
    title: "The Connector",
    tagline: "People are the platform.",
    description:
      "You energise rooms and bridge silos. Your superpower is turning relationships into momentum for everyone involved.",
    strengths: ["Networking", "Empathy", "Galvanising teams"],
    shadow: ["Avoids solitary deep work", "Overcommits"],
    careerThemes: ["Partnerships", "Community", "Sales", "Talent"],
    keywords: [
      k("people|team|collab|community|social|network|partner", 3),
      k("talk|communicat|host|gather|connect|bring together", 2),
      k("customer|client|stakeholder", 1),
    ],
    riasec: [0, 0, 1, 3, 3, 1],
  },
  {
    key: "the_craftsperson",
    title: "The Craftsperson",
    tagline: "Depth over breadth.",
    description:
      "You want mastery. Quality, detail and craft matter more than scale; you'd rather make one beautiful thing than ten okay ones.",
    strengths: ["Attention to detail", "Patience", "Standards"],
    shadow: ["Perfectionism", "Narrow lens"],
    careerThemes: ["Design", "Writing", "Specialist engineering", "Artisan trades"],
    keywords: [
      k("master|mastery|deep|depth|focus|specialist|perfect|craft|quality|detail", 3),
      k("art|design|writ|music|creative|story|aesthetic", 2),
      k("polish|refine", 1),
    ],
    riasec: [2, 1, 3, 1, 0, 2],
  },
  {
    key: "the_changemaker",
    title: "The Changemaker",
    tagline: "Purpose pulls the work.",
    description:
      "You're allergic to work without meaning. Impact, equity and the long arc of justice are what get you out of bed.",
    strengths: ["Mission focus", "Stamina for hard problems", "Mobilising others"],
    shadow: ["Burns out", "Black-and-white thinking"],
    careerThemes: ["Social enterprise", "Policy", "NGO", "Climate"],
    keywords: [
      k("impact|change|purpose|mission|world|environment|sustain|equity|justice|ngo|climate", 3),
      k("rural|inclusion|community|underserved|advocacy", 2),
      k("health|education", 1),
    ],
    riasec: [0, 1, 1, 3, 2, 0],
  },
  {
    key: "the_visionary",
    title: "The Visionary",
    tagline: "Sees what isn't there yet.",
    description:
      "You think in decades. Long-horizon bets, future scenarios and 'what if' questions are where you come alive.",
    strengths: ["Imagination", "Story-shaping", "Optimism"],
    shadow: ["Hand-wavy on execution"],
    careerThemes: ["Founder", "Creative direction", "Futures research"],
    keywords: [
      k("vision|future|long.term|imagine|what.if|dream|possibilit", 3),
      k("transform|reinvent|reimagine", 2),
    ],
    riasec: [0, 2, 3, 1, 3, 0],
  },
  {
    key: "the_analyst",
    title: "The Analyst",
    tagline: "Truth lives in the data.",
    description:
      "You trust evidence. You'd rather run the numbers than argue from anecdotes, and you find unexpected joy in clean datasets.",
    strengths: ["Quant rigour", "Pattern recognition", "Skepticism"],
    shadow: ["Misses qualitative context"],
    careerThemes: ["Data", "Research", "Finance", "BI"],
    keywords: [
      k("data|analy|research|stats|statistic|quant|metric|measure|evidence|number", 3),
      k("math|mathematic|spreadsheet|excel", 2),
    ],
    riasec: [1, 3, 0, 0, 1, 3],
  },
  {
    key: "the_diplomat",
    title: "The Diplomat",
    tagline: "Bridges before walls.",
    description:
      "You hold complexity gracefully and find the language different sides actually trust. Negotiation feels natural, not performative.",
    strengths: ["Listening", "Reframing conflict", "Cultural fluency"],
    shadow: ["Avoids hard truths"],
    careerThemes: ["Diplomacy", "HR", "Mediation", "International work"],
    keywords: [
      k("mediate|negotiat|diplom|cross.cultural|listen|understand|empath", 3),
      k("conflict|resolve|peace", 2),
    ],
    riasec: [0, 1, 1, 3, 2, 1],
  },
  {
    key: "the_mentor",
    title: "The Mentor",
    tagline: "Lifts others on the way up.",
    description:
      "You instinctively teach what you learn. The clearest sign of a good day for you is someone else's lightbulb moment.",
    strengths: ["Coaching", "Patience", "Generosity"],
    shadow: ["Over-gives", "Hard to receive"],
    careerThemes: ["Teaching", "Coaching", "People ops", "L&D"],
    keywords: [
      k("teach|coach|mentor|guide|train|develop", 3),
      k("share|explain|help", 2),
      k("educat|workshop", 1),
    ],
    riasec: [0, 1, 1, 3, 1, 1],
  },
  {
    key: "the_pioneer",
    title: "The Pioneer",
    tagline: "First foot in unknown terrain.",
    description:
      "You willingly take the costliest first move so others can follow. Comfort with cold starts is your edge.",
    strengths: ["Risk tolerance", "Initiative", "Frontier instinct"],
    shadow: ["Burns bridges", "Restless once it stabilises"],
    careerThemes: ["0→1 product", "Field operations", "New markets"],
    keywords: [
      k("first|frontier|pioneer|start.up|0.to.1|cold.start|new.market", 3),
      k("risk|bold|brave", 2),
    ],
    riasec: [2, 1, 1, 0, 3, 0],
  },
  {
    key: "the_catalyst",
    title: "The Catalyst",
    tagline: "Speeds reactions in the room.",
    description:
      "You unblock other people's stuck energy. A short conversation with you and the team is moving again.",
    strengths: ["Pace", "Reading momentum", "Cheerleading"],
    shadow: ["Impatient with deep work"],
    careerThemes: ["Program management", "Founder ops", "Facilitation"],
    keywords: [
      k("catalyst|unblock|momentum|energi|spark|ignite|accelerate", 3),
      k("rally|hype|push", 2),
    ],
    riasec: [0, 0, 1, 2, 3, 0],
  },
  {
    key: "the_guardian",
    title: "The Guardian",
    tagline: "Protects what matters.",
    description:
      "You think about risk, integrity and continuity before others do. Reliability is your love language.",
    strengths: ["Diligence", "Risk awareness", "Loyalty"],
    shadow: ["Resists change"],
    careerThemes: ["Compliance", "Security", "Operations", "Healthcare"],
    keywords: [
      k("protect|guard|safety|secure|reliab|trust|stewardship|integrity", 3),
      k("careful|stable|consistent", 2),
    ],
    riasec: [2, 1, 0, 2, 0, 3],
  },
  {
    key: "the_curator",
    title: "The Curator",
    tagline: "Shapes meaning by what they choose.",
    description:
      "You have taste. You know what to leave out, and your selections themselves become the work.",
    strengths: ["Editorial eye", "Taste", "Synthesis"],
    shadow: ["Slow to publish"],
    careerThemes: ["Editorial", "Brand", "Museum/curation", "A&R"],
    keywords: [
      k("curate|edit|select|taste|aesthetic|collection|library", 3),
      k("brand|story", 1),
    ],
    riasec: [0, 1, 3, 1, 1, 2],
  },
  {
    key: "the_storyteller",
    title: "The Storyteller",
    tagline: "Translates ideas into feeling.",
    description:
      "You move people through narrative. Numbers matter, but a well-told story is what makes them act.",
    strengths: ["Narrative arc", "Voice", "Empathy on stage"],
    shadow: ["Style over substance"],
    careerThemes: ["Writing", "Content", "Film", "Marketing"],
    keywords: [
      k("story|narrative|writ|content|video|film|podcast|speak|present", 3),
      k("brand|creative", 1),
    ],
    riasec: [0, 1, 3, 2, 2, 0],
  },
  {
    key: "the_researcher",
    title: "The Researcher",
    tagline: "Goes one layer deeper than asked.",
    description:
      "Footnotes are home for you. You're motivated by getting an answer right, not first.",
    strengths: ["Rigor", "Curiosity-driven depth", "Citation hygiene"],
    shadow: ["Slow to ship"],
    careerThemes: ["Academia", "R&D", "Policy research", "UX research"],
    keywords: [
      k("research|investigat|study|academic|paper|literature|method", 3),
      k("read|learn|deep", 1),
    ],
    riasec: [0, 3, 1, 1, 0, 2],
  },
  {
    key: "the_healer",
    title: "The Healer",
    tagline: "Steady presence in hard moments.",
    description:
      "People bring their hardest feelings to you. You hold space without flinching and help others find their footing.",
    strengths: ["Empathy", "Presence", "Boundaries (when practiced)"],
    shadow: ["Absorbs others' pain"],
    careerThemes: ["Therapy", "Nursing", "Counselling", "Wellness"],
    keywords: [
      k("heal|therap|counsel|wellbeing|mental.health|care|nurs|support", 3),
      k("listen|empath|kind", 2),
    ],
    riasec: [0, 1, 1, 3, 0, 1],
  },
  {
    key: "the_negotiator",
    title: "The Negotiator",
    tagline: "Finds the deal in the disagreement.",
    description:
      "You see what each side actually wants beneath what they say. You design wins that don't feel like compromises.",
    strengths: ["Game theory", "Composure", "Clarity"],
    shadow: ["Transactional reads of relationships"],
    careerThemes: ["Sales", "BD", "Law", "Diplomacy"],
    keywords: [
      k("negotiat|deal|bargain|sales|close|persuad", 3),
      k("client|partner|contract", 2),
    ],
    riasec: [0, 1, 0, 1, 3, 1],
  },
  {
    key: "the_inventor",
    title: "The Inventor",
    tagline: "Original at the source.",
    description:
      "You combine fields no one else thinks to combine. Patents, side-projects and oddly working hacks follow you.",
    strengths: ["Originality", "Cross-domain reasoning", "Mechanical intuition"],
    shadow: ["Reinvents the wheel"],
    careerThemes: ["R&D", "Hardware startups", "Independent inventing"],
    keywords: [
      k("invent|original|novel|patent|prototype|hack|tinker", 3),
      k("idea|create", 2),
    ],
    riasec: [3, 3, 2, 0, 1, 0],
  },
  {
    key: "the_organizer",
    title: "The Organizer",
    tagline: "Order is a creative act.",
    description:
      "Where others see chaos you see a sortable system. You make complicated things obvious and repeatable.",
    strengths: ["Process design", "Tidiness", "Reliability"],
    shadow: ["Rigid", "Resists exceptions"],
    careerThemes: ["Operations", "Project mgmt", "Logistics", "Admin leadership"],
    keywords: [
      k("organi[sz]e|order|process|system|workflow|admin|coordinate|schedule", 3),
      k("plan|structure", 1),
    ],
    riasec: [1, 1, 0, 1, 1, 3],
  },
  {
    key: "the_performer",
    title: "The Performer",
    tagline: "Alive in front of people.",
    description:
      "Spotlight isn't a fear, it's a feedback loop. Your work gets sharper when there's an audience.",
    strengths: ["Stage presence", "Energy", "Memorisation"],
    shadow: ["Validation-seeking"],
    careerThemes: ["Performing arts", "Speaking", "Coaching", "Sales theatre"],
    keywords: [
      k("perform|stage|act|sing|dance|present|speak|audience|spotlight", 3),
    ],
    riasec: [0, 0, 3, 2, 2, 0],
  },
  {
    key: "the_investigator",
    title: "The Investigator",
    tagline: "Won't drop a thread.",
    description:
      "You chase anomalies until they confess. You have a nose for what doesn't add up.",
    strengths: ["Persistence", "Pattern detection", "Skepticism"],
    shadow: ["Suspicious by default"],
    careerThemes: ["Journalism", "Audit", "Forensics", "Security"],
    keywords: [
      k("investigat|detect|forensic|audit|journal|inquir|uncov", 3),
      k("anomal|why|root.cause", 2),
    ],
    riasec: [1, 3, 1, 0, 0, 2],
  },
  {
    key: "the_educator",
    title: "The Educator",
    tagline: "Designs how others learn.",
    description:
      "You don't just explain — you build the scaffold someone can climb on their own. Curriculum is a craft to you.",
    strengths: ["Pedagogy", "Patience", "Structure"],
    shadow: ["Lecture-mode"],
    careerThemes: ["Teaching", "Edtech", "Curriculum design"],
    keywords: [
      k("educat|teach|curricul|pedago|tutor|lesson|workshop", 3),
      k("learn|student|class", 1),
    ],
    riasec: [0, 2, 1, 3, 0, 2],
  },
  {
    key: "the_advocate",
    title: "The Advocate",
    tagline: "Names what others won't.",
    description:
      "You speak up when it's costly and you do it cleanly. You make institutions face the people they serve.",
    strengths: ["Moral courage", "Clarity", "Stamina"],
    shadow: ["Burnout", "Adversarial framing"],
    careerThemes: ["Activism", "Policy", "Civil rights law"],
    keywords: [
      k("advoca|activis|policy|right|equity|justice|reform|voice", 3),
      k("speak.up|change", 2),
    ],
    riasec: [0, 1, 1, 3, 2, 0],
  },
  {
    key: "the_synthesizer",
    title: "The Synthesizer",
    tagline: "Connects three things into one.",
    description:
      "You take messy inputs from different worlds and ship one clean output. You're the person teams DM at 11pm.",
    strengths: ["Synthesis", "Cross-domain fluency", "Clarity"],
    shadow: ["Gets pulled in too many directions"],
    careerThemes: ["Product", "Editorial", "Strategy", "Consulting"],
    keywords: [
      k("synthes|connect|combin|integrate|cross.domain|interdiscip", 3),
      k("clarify|summar", 2),
    ],
    riasec: [0, 2, 2, 1, 2, 2],
  },
  {
    key: "the_operator",
    title: "The Operator",
    tagline: "Turns plans into output.",
    description:
      "You measure your weeks in things shipped. Execution is your craft and process is your favourite tool.",
    strengths: ["Execution", "Reliability", "Calm under load"],
    shadow: ["Heads-down too long"],
    careerThemes: ["Operations", "COO track", "Production"],
    keywords: [
      k("execut|operat|deliver|ship|run|coordinate|production", 3),
      k("manage|process|kpi", 2),
    ],
    riasec: [2, 1, 0, 1, 2, 3],
  },
  {
    key: "the_designer",
    title: "The Designer",
    tagline: "Shapes the experience.",
    description:
      "You move from form to feeling. Pixels, products and rooms all get rearranged in your head until they work.",
    strengths: ["Aesthetic judgement", "Empathy", "Iteration"],
    shadow: ["Resists constraint"],
    careerThemes: ["Product design", "UX", "Industrial design", "Architecture"],
    keywords: [
      k("design|ux|ui|aesthet|visual|architect|interior|prototype.design", 3),
      k("craft|brand", 1),
    ],
    riasec: [1, 1, 3, 1, 1, 1],
  },
  {
    key: "the_entrepreneur",
    title: "The Entrepreneur",
    tagline: "Sees a market in a pain point.",
    description:
      "You translate friction into a business. Resourceful, sales-comfortable, and content to live in uncertainty for a while.",
    strengths: ["Resourcefulness", "Sales", "Risk metabolism"],
    shadow: ["Spread thin"],
    careerThemes: ["Founder", "Small business", "VC", "GTM"],
    keywords: [
      k("entrepreneur|start.up|found|launch|venture|business|sell|market", 3),
      k("hustle|bootstrap|revenue", 2),
    ],
    riasec: [1, 1, 1, 1, 3, 1],
  },
  {
    key: "the_scholar",
    title: "The Scholar",
    tagline: "Lives in the long conversation.",
    description:
      "You see your work as a thread in a centuries-long discussion. Citations, footnotes and original sources are home.",
    strengths: ["Deep reading", "Historical context", "Rigour"],
    shadow: ["Cloistered"],
    careerThemes: ["Academia", "Humanities", "Think tanks"],
    keywords: [
      k("scholar|academic|history|philoso|theology|classics|humanities|literature", 3),
      k("read|book|essay", 1),
    ],
    riasec: [0, 3, 2, 1, 0, 1],
  },
  {
    key: "the_mediator",
    title: "The Mediator",
    tagline: "Lowers the temperature.",
    description:
      "Conflict around you tends to soften. You separate people from positions and find third options.",
    strengths: ["Active listening", "Reframing", "Patience"],
    shadow: ["Conflict-avoidant in self-advocacy"],
    careerThemes: ["HR", "Mediation", "Family law"],
    keywords: [
      k("mediate|conflict|resolve|peacemak|defuse|harmony", 3),
    ],
    riasec: [0, 1, 1, 3, 1, 1],
  },
  {
    key: "the_producer",
    title: "The Producer",
    tagline: "Holds the whole production together.",
    description:
      "You move budgets, talent, timelines and morale in the same week. Things ship because you're in the room.",
    strengths: ["Coordination", "Diplomacy", "Stamina"],
    shadow: ["Invisible in credits"],
    careerThemes: ["Film/TV production", "Events", "Showrunning", "Program mgmt"],
    keywords: [
      k("produc|coordin|schedule|budget|event|show|run.the.room", 3),
    ],
    riasec: [1, 0, 2, 2, 2, 2],
  },
  {
    key: "the_trailblazer",
    title: "The Trailblazer",
    tagline: "Refuses inherited paths.",
    description:
      "You're suspicious of the default. You'd rather invent the route than follow one labelled 'proven'.",
    strengths: ["Independence", "Conviction", "Risk tolerance"],
    shadow: ["Lonely", "Reinvents unnecessarily"],
    careerThemes: ["Founder", "Independent creator", "Frontier work"],
    keywords: [
      k("trailblaz|maverick|independent|unconventional|own.path", 3),
      k("solo|founder", 2),
    ],
    riasec: [2, 2, 2, 0, 3, 0],
  },
  {
    key: "the_steward",
    title: "The Steward",
    tagline: "Inherits things and leaves them better.",
    description:
      "You take care of what already exists — institutions, land, communities — and quietly upgrade them for the next generation.",
    strengths: ["Long-term thinking", "Care", "Institutional memory"],
    shadow: ["Resists fast pivots"],
    careerThemes: ["Family business", "Land/agri", "Public service"],
    keywords: [
      k("steward|inherit|conserv|preserv|heritage|legacy|land|long.term", 3),
    ],
    riasec: [2, 1, 0, 2, 1, 2],
  },
  {
    key: "the_architect",
    title: "The Architect",
    tagline: "Designs the system, not just the feature.",
    description:
      "You think in structures: how parts fit, how they fail, how they scale. You design the thing other people build.",
    strengths: ["Systems design", "Foresight", "Abstraction"],
    shadow: ["Distant from end users"],
    careerThemes: ["Software architecture", "Org design", "Architecture", "Urban planning"],
    keywords: [
      k("architect|system.design|structure|scale|blueprint|infrastruc", 3),
    ],
    riasec: [2, 3, 2, 0, 1, 2],
  },
  {
    key: "the_coach",
    title: "The Coach",
    tagline: "Brings out other people's best work.",
    description:
      "You read potential before performance. You make people braver by being convincingly on their side.",
    strengths: ["Belief in people", "Asking questions", "Accountability"],
    shadow: ["Owns others' outcomes too tightly"],
    careerThemes: ["Executive coaching", "Sports coaching", "L&D"],
    keywords: [
      k("coach|develop.people|grow.others|potential|feedback", 3),
    ],
    riasec: [1, 1, 1, 3, 2, 0],
  },
  {
    key: "the_translator",
    title: "The Translator",
    tagline: "Speaks both sides fluently.",
    description:
      "You sit between two tribes — tech and business, science and public — and make each understand the other.",
    strengths: ["Cross-domain literacy", "Clarity", "Patience"],
    shadow: ["Neither side fully claims you"],
    careerThemes: ["Product mgmt", "Science communication", "Tech writing"],
    keywords: [
      k("translate|bridge|explain|simplify|jargon|interpret", 3),
    ],
    riasec: [0, 2, 2, 2, 1, 2],
  },
  {
    key: "the_composer",
    title: "The Composer",
    tagline: "Arranges parts into one feeling.",
    description:
      "You think in motifs. Whether it's music, code or strategy, you arrange disparate pieces into something that hits as one work.",
    strengths: ["Aesthetic synthesis", "Patience", "Long-form vision"],
    shadow: ["Disappears mid-project"],
    careerThemes: ["Music", "Film scoring", "Brand architecture"],
    keywords: [
      k("compos|arrange|orchestrat|score|score.music|melody", 3),
      k("music|sound", 1),
    ],
    riasec: [0, 2, 3, 1, 0, 1],
  },
  {
    key: "the_optimizer",
    title: "The Optimizer",
    tagline: "Squeezes the last 10%.",
    description:
      "You can't watch a slow workflow. You'd rather rebuild the engine than buy a faster car.",
    strengths: ["Measurement", "Tooling", "Patience for marginal gains"],
    shadow: ["Premature optimisation"],
    careerThemes: ["Growth", "Performance engineering", "Operations"],
    keywords: [
      k("optimi[sz]e|efficien|streamlin|automat|marginal.gain|throughput|kpi", 3),
    ],
    riasec: [1, 3, 0, 0, 1, 3],
  },
  {
    key: "the_networker",
    title: "The Networker",
    tagline: "Knows who to call.",
    description:
      "Your address book is a strategic asset. You move information, opportunities and people across boundaries.",
    strengths: ["Memory for people", "Generosity", "Reach"],
    shadow: ["Transactional"],
    careerThemes: ["BD", "Investor relations", "Recruiting", "Community"],
    keywords: [
      k("network|introduc|connect.people|relationship|community.builder|matchmak", 3),
    ],
    riasec: [0, 0, 0, 2, 3, 1],
  },
  {
    key: "the_reformer",
    title: "The Reformer",
    tagline: "Fixes broken institutions from inside.",
    description:
      "You join the system to change it. You're patient enough for the boring middle work that real reform requires.",
    strengths: ["Institutional patience", "Political literacy", "Conviction"],
    shadow: ["Becomes what it fights"],
    careerThemes: ["Civil service", "Policy", "Reform leadership"],
    keywords: [
      k("reform|institution|govern|public.service|policy|civic|bureaucra", 3),
    ],
    riasec: [0, 2, 0, 3, 3, 2],
  },
];

export const ARCHETYPE_BY_KEY: Record<string, Archetype> = Object.fromEntries(
  ARCHETYPE_LIBRARY.map((a) => [a.key, a])
);
