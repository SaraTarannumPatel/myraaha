// AI Roadmaps — rich, entity-specific multi-format mock data.
// Each entity × each of the 5 roadmap steps emits ~12 resources spanning every
// major format: YouTube, video, course, book, article, blog, podcast,
// research paper, interview, image/visual, community, company. All snippets
// are written specifically for the entity + step intent — no generic filler.
import type { Entity, WebResource, RoadmapStep, SubStep, ResourceFormat } from "@/lib/aiRoadmaps";

export const MOCK_ENTITIES: Entity[] = [
  { id: "career:Product Designer", label: "Product Designer", kind: "career", source: "career_cards",
    skills: ["Figma", "User Research", "Prototyping", "Design Systems", "Interaction Design"] },
  { id: "role:Full-Stack Developer", label: "Full-Stack Developer", kind: "role", source: "story_mode",
    skills: ["React", "Node.js", "PostgreSQL", "TypeScript", "REST APIs"] },
  { id: "domain:Artificial Intelligence", label: "Artificial Intelligence", kind: "domain", source: "challenge_mode",
    skills: ["Python", "Machine Learning", "Deep Learning", "Math", "Data Wrangling"] },
  { id: "career:Data Analyst", label: "Data Analyst", kind: "career", source: "career_cards",
    skills: ["SQL", "Excel", "Python", "Tableau", "Statistics"] },
  { id: "role:Digital Marketer", label: "Digital Marketer", kind: "role", source: "other",
    skills: ["SEO", "Google Ads", "Content Strategy", "Analytics", "Email Marketing"] },
];

// ─── Entity context: curated channels, books, podcasts, companies, etc. ───
type EntityContext = {
  youtube: { title: string; channel: string; url: string; duration: string }[];
  course: { title: string; provider: string; url: string }[];
  book: { title: string; author: string; url: string }[];
  podcast: { title: string; show: string; url: string }[];
  paper: { title: string; venue: string; url: string }[];
  interview: { title: string; with: string; url: string }[];
  company: { name: string; about: string; url: string }[];
  community: { name: string; platform: string; url: string }[];
  blog: { title: string; site: string; url: string }[];
  article: { title: string; source: string; url: string }[];
  image: { title: string; source: string; url: string }[];
  video: { title: string; source: string; url: string; duration: string }[];
};

const CTX: Record<string, EntityContext> = {
  "career:Product Designer": {
    youtube: [
      { title: "How to design a product from scratch", channel: "Figma", url: "https://www.youtube.com/@Figma", duration: "42 min" },
      { title: "The anatomy of a great product interview", channel: "AJ&Smart", url: "https://www.youtube.com/@AJSmart", duration: "28 min" },
      { title: "Design critique like a senior designer", channel: "Femke van Schoonhoven", url: "https://www.youtube.com/@FemkesArt", duration: "18 min" },
    ],
    course: [
      { title: "Google UX Design Professional Certificate", provider: "Coursera", url: "https://www.coursera.org/professional-certificates/google-ux-design" },
      { title: "Interaction Design Specialization", provider: "Coursera · UC San Diego", url: "https://www.coursera.org/specializations/interaction-design" },
      { title: "Designing for Accessibility", provider: "Interaction Design Foundation", url: "https://www.interaction-design.org/courses/accessibility-how-to-design-for-all" },
    ],
    book: [
      { title: "The Design of Everyday Things", author: "Don Norman", url: "https://www.basicbooks.com/titles/don-norman/the-design-of-everyday-things/9780465050659/" },
      { title: "Refactoring UI", author: "Adam Wathan & Steve Schoger", url: "https://www.refactoringui.com/" },
      { title: "About Face", author: "Alan Cooper", url: "https://www.wiley.com/en-us/About+Face%3A+The+Essentials+of+Interaction+Design%2C+4th+Edition-p-9781118766576" },
    ],
    podcast: [
      { title: "Design Better Podcast", show: "Dialogue Design", url: "https://www.designbetter.co/podcast" },
      { title: "Layout Podcast", show: "Kevin Clark & Rafael Conde", url: "https://www.layout.fm/" },
      { title: "The Design of Business", show: "Michael Bierut & Jessica Helfand", url: "https://designobserver.com/podcasts" },
    ],
    paper: [
      { title: "Heuristic Evaluation of User Interfaces", venue: "Nielsen Norman Group", url: "https://www.nngroup.com/articles/ten-usability-heuristics/" },
      { title: "Designing for Behaviour Change", venue: "ACM CHI", url: "https://dl.acm.org/doi/10.1145/3025453.3025760" },
    ],
    interview: [
      { title: "Inside the Airbnb design team", with: "Katie Dill", url: "https://www.invisionapp.com/inside-design/airbnb-katie-dill-design-leadership/" },
      { title: "How Notion thinks about product design", with: "Ivan Zhao", url: "https://www.lennysnewsletter.com/p/inside-notion-ivan-zhao" },
    ],
    company: [
      { name: "Figma", about: "Defines the modern collaborative design tool category.", url: "https://www.figma.com/" },
      { name: "Airbnb Design", about: "Industry-leading product design and design systems team.", url: "https://airbnb.design/" },
      { name: "Linear", about: "Reference for craft, speed, and design quality in B2B SaaS.", url: "https://linear.app/method" },
    ],
    community: [
      { name: "Designer Hangout", platform: "Slack", url: "https://www.designerhangout.co/" },
      { name: "Friends of Figma", platform: "Discord/Meetups", url: "https://friends.figma.com/" },
    ],
    blog: [
      { title: "Nielsen Norman Group articles", site: "nngroup.com", url: "https://www.nngroup.com/articles/" },
      { title: "Smashing Magazine UX", site: "smashingmagazine.com", url: "https://www.smashingmagazine.com/category/ux" },
    ],
    article: [
      { title: "The Laws of UX", source: "Jon Yablonski", url: "https://lawsofux.com/" },
      { title: "Refactoring UI principles", source: "refactoringui.com", url: "https://www.refactoringui.com/" },
    ],
    image: [
      { title: "Mobbin — real-world UI patterns", source: "Mobbin", url: "https://mobbin.com/" },
      { title: "Dribbble shots", source: "Dribbble", url: "https://dribbble.com/search/product-design" },
      { title: "Awwwards SOTD", source: "Awwwards", url: "https://www.awwwards.com/" },
    ],
    video: [
      { title: "Config keynote", source: "Figma Config", url: "https://config.figma.com/", duration: "1h 12m" },
      { title: "Design Better Conference talks", source: "InVision", url: "https://www.designbetter.co/conference", duration: "45 min" },
    ],
  },
  "role:Full-Stack Developer": {
    youtube: [
      { title: "Build a full-stack app with Next.js", channel: "Lee Robinson", url: "https://www.youtube.com/@leerob", duration: "1h 04m" },
      { title: "PostgreSQL for application developers", channel: "Hussein Nasser", url: "https://www.youtube.com/@hnasr", duration: "52 min" },
      { title: "Modern TypeScript in 2026", channel: "Matt Pocock", url: "https://www.youtube.com/@mattpocockuk", duration: "38 min" },
    ],
    course: [
      { title: "The Odin Project — Full Stack Path", provider: "The Odin Project", url: "https://www.theodinproject.com/paths" },
      { title: "Full Stack Open", provider: "University of Helsinki", url: "https://fullstackopen.com/en/" },
      { title: "Epic Web", provider: "Kent C. Dodds", url: "https://www.epicweb.dev/" },
    ],
    book: [
      { title: "Designing Data-Intensive Applications", author: "Martin Kleppmann", url: "https://dataintensive.net/" },
      { title: "You Don't Know JS Yet", author: "Kyle Simpson", url: "https://github.com/getify/You-Dont-Know-JS" },
      { title: "Refactoring", author: "Martin Fowler", url: "https://martinfowler.com/books/refactoring.html" },
    ],
    podcast: [
      { title: "Syntax.fm", show: "Wes Bos & Scott Tolinski", url: "https://syntax.fm/" },
      { title: "Software Engineering Daily", show: "SED", url: "https://softwareengineeringdaily.com/" },
      { title: "The Changelog", show: "Adam Stacoviak & Jerod Santo", url: "https://changelog.com/podcast" },
    ],
    paper: [
      { title: "Out of the Tar Pit", venue: "Moseley & Marks", url: "https://curtclifton.net/papers/MoseleyMarks06a.pdf" },
      { title: "Dynamo: Amazon's Highly Available Key-value Store", venue: "SOSP 2007", url: "https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf" },
    ],
    interview: [
      { title: "Guillermo Rauch on building Vercel", with: "Guillermo Rauch", url: "https://www.youtube.com/watch?v=cuoZenpQveQ" },
      { title: "How Stripe scales its engineering team", with: "David Singleton (Stripe CTO)", url: "https://review.firstround.com/the-engineering-leaders-guide-to-aligning-dev-metrics-with-business-strategy/" },
    ],
    company: [
      { name: "Vercel", about: "Frontend cloud — leading edge of full-stack DX.", url: "https://vercel.com/" },
      { name: "Stripe", about: "Reference engineering org for API quality and reliability.", url: "https://stripe.com/blog/engineering" },
      { name: "Supabase", about: "Open-source Firebase alternative — full-stack platform.", url: "https://supabase.com/" },
    ],
    community: [
      { name: "r/webdev", platform: "Reddit", url: "https://www.reddit.com/r/webdev/" },
      { name: "Reactiflux", platform: "Discord", url: "https://www.reactiflux.com/" },
    ],
    blog: [
      { title: "Josh W Comeau", site: "joshwcomeau.com", url: "https://www.joshwcomeau.com/" },
      { title: "Overreacted by Dan Abramov", site: "overreacted.io", url: "https://overreacted.io/" },
    ],
    article: [
      { title: "Patterns.dev", source: "Lydia Hallie & Addy Osmani", url: "https://www.patterns.dev/" },
      { title: "MDN Web Docs", source: "Mozilla", url: "https://developer.mozilla.org/en-US/docs/Learn" },
    ],
    image: [
      { title: "System design diagrams", source: "ByteByteGo", url: "https://blog.bytebytego.com/" },
      { title: "Excalidraw architecture sketches", source: "Excalidraw", url: "https://excalidraw.com/" },
    ],
    video: [
      { title: "Next.js Conf recordings", source: "Vercel", url: "https://nextjs.org/conf", duration: "Multiple" },
      { title: "Frontend Masters workshops", source: "Frontend Masters", url: "https://frontendmasters.com/", duration: "4–8h" },
    ],
  },
  "domain:Artificial Intelligence": {
    youtube: [
      { title: "Intro to large language models", channel: "Andrej Karpathy", url: "https://www.youtube.com/@AndrejKarpathy", duration: "1h" },
      { title: "But what is a neural network?", channel: "3Blue1Brown", url: "https://www.youtube.com/@3blue1brown", duration: "19 min" },
      { title: "MIT 6.S191: Intro to Deep Learning", channel: "Alexander Amini", url: "https://www.youtube.com/@AAmini", duration: "48 min" },
    ],
    course: [
      { title: "Machine Learning Specialization", provider: "Coursera · Andrew Ng", url: "https://www.coursera.org/specializations/machine-learning-introduction" },
      { title: "Practical Deep Learning", provider: "fast.ai", url: "https://course.fast.ai/" },
      { title: "Hugging Face NLP Course", provider: "Hugging Face", url: "https://huggingface.co/learn/nlp-course" },
    ],
    book: [
      { title: "Deep Learning", author: "Goodfellow, Bengio, Courville", url: "https://www.deeplearningbook.org/" },
      { title: "Hands-On Machine Learning", author: "Aurélien Géron", url: "https://www.oreilly.com/library/view/hands-on-machine-learning/9781098125967/" },
      { title: "Designing Machine Learning Systems", author: "Chip Huyen", url: "https://www.oreilly.com/library/view/designing-machine-learning/9781098107956/" },
    ],
    podcast: [
      { title: "Lex Fridman Podcast (AI episodes)", show: "Lex Fridman", url: "https://lexfridman.com/podcast/" },
      { title: "The Gradient Podcast", show: "Daniel Bashir", url: "https://thegradientpub.substack.com/s/podcast" },
      { title: "Practical AI", show: "Changelog", url: "https://changelog.com/practicalai" },
    ],
    paper: [
      { title: "Attention Is All You Need", venue: "NeurIPS 2017", url: "https://arxiv.org/abs/1706.03762" },
      { title: "ImageNet Classification with Deep CNNs", venue: "NeurIPS 2012", url: "https://papers.nips.cc/paper/4824-imagenet-classification-with-deep-convolutional-neural-networks" },
      { title: "GPT-4 Technical Report", venue: "OpenAI", url: "https://arxiv.org/abs/2303.08774" },
    ],
    interview: [
      { title: "Demis Hassabis on the future of AI", with: "Demis Hassabis (DeepMind)", url: "https://www.youtube.com/watch?v=eqXfhejDeqA" },
      { title: "Ilya Sutskever on the science of AI", with: "Ilya Sutskever", url: "https://www.youtube.com/watch?v=SEkGLj0bwAU" },
    ],
    company: [
      { name: "OpenAI", about: "Frontier lab building GPT-class systems.", url: "https://openai.com/research" },
      { name: "Anthropic", about: "Safety-focused frontier lab (Claude).", url: "https://www.anthropic.com/research" },
      { name: "DeepMind", about: "Research lab behind AlphaFold and Gemini.", url: "https://deepmind.google/research/" },
      { name: "Hugging Face", about: "Open-source AI community and model hub.", url: "https://huggingface.co/" },
    ],
    community: [
      { name: "r/MachineLearning", platform: "Reddit", url: "https://www.reddit.com/r/MachineLearning/" },
      { name: "Hugging Face Forums", platform: "Forum", url: "https://discuss.huggingface.co/" },
    ],
    blog: [
      { title: "Distill.pub — visual ML research", site: "distill.pub", url: "https://distill.pub/" },
      { title: "Lil'Log by Lilian Weng", site: "lilianweng.github.io", url: "https://lilianweng.github.io/" },
    ],
    article: [
      { title: "The Illustrated Transformer", source: "Jay Alammar", url: "https://jalammar.github.io/illustrated-transformer/" },
      { title: "Papers With Code — SOTA", source: "paperswithcode.com", url: "https://paperswithcode.com/" },
    ],
    image: [
      { title: "Neural network architecture posters", source: "Asimov Institute", url: "https://www.asimovinstitute.org/neural-network-zoo/" },
      { title: "Transformer visualization", source: "bbycroft.net/llm", url: "https://bbycroft.net/llm" },
    ],
    video: [
      { title: "NeurIPS recorded talks", source: "NeurIPS", url: "https://nips.cc/", duration: "20–60 min" },
      { title: "Stanford CS25: Transformers United", source: "Stanford Online", url: "https://web.stanford.edu/class/cs25/", duration: "1h" },
    ],
  },
  "career:Data Analyst": {
    youtube: [
      { title: "SQL for data analysis (full course)", channel: "Alex The Analyst", url: "https://www.youtube.com/@AlexTheAnalyst", duration: "4h 22m" },
      { title: "Tableau full tutorial", channel: "freeCodeCamp.org", url: "https://www.youtube.com/@freecodecamp", duration: "3h 10m" },
      { title: "Pandas in 1 hour", channel: "Corey Schafer", url: "https://www.youtube.com/@coreyms", duration: "58 min" },
    ],
    course: [
      { title: "Google Data Analytics Certificate", provider: "Coursera", url: "https://www.coursera.org/professional-certificates/google-data-analytics" },
      { title: "IBM Data Analyst Professional Certificate", provider: "Coursera · IBM", url: "https://www.coursera.org/professional-certificates/ibm-data-analyst" },
      { title: "SQL for Data Science", provider: "Coursera · UC Davis", url: "https://www.coursera.org/learn/sql-for-data-science" },
    ],
    book: [
      { title: "Storytelling with Data", author: "Cole Nussbaumer Knaflic", url: "https://www.storytellingwithdata.com/books" },
      { title: "Python for Data Analysis", author: "Wes McKinney", url: "https://wesmckinney.com/book/" },
      { title: "Naked Statistics", author: "Charles Wheelan", url: "https://wwnorton.com/books/Naked-Statistics/" },
    ],
    podcast: [
      { title: "Data Skeptic", show: "Kyle Polich", url: "https://dataskeptic.com/" },
      { title: "SuperDataScience", show: "Jon Krohn", url: "https://www.superdatascience.com/podcast" },
    ],
    paper: [
      { title: "Tidy Data", venue: "Journal of Statistical Software · Hadley Wickham", url: "https://www.jstatsoft.org/article/view/v059i10" },
    ],
    interview: [
      { title: "Inside Airbnb's data team", with: "Elena Grewal", url: "https://medium.com/airbnb-engineering/at-airbnb-data-science-belongs-everywhere-917250c6beba" },
    ],
    company: [
      { name: "Tableau", about: "Industry-standard BI and visualization platform.", url: "https://www.tableau.com/" },
      { name: "Snowflake", about: "Cloud data warehouse powering modern analytics.", url: "https://www.snowflake.com/" },
      { name: "dbt Labs", about: "Defines the modern analytics engineering workflow.", url: "https://www.getdbt.com/" },
    ],
    community: [
      { name: "r/dataanalysis", platform: "Reddit", url: "https://www.reddit.com/r/dataanalysis/" },
      { name: "Locally Optimistic", platform: "Slack (analytics)", url: "https://locallyoptimistic.com/community/" },
    ],
    blog: [
      { title: "Towards Data Science", site: "towardsdatascience.com", url: "https://towardsdatascience.com/" },
      { title: "Mode Analytics blog", site: "mode.com/blog", url: "https://mode.com/blog/" },
    ],
    article: [
      { title: "Kaggle Learn micro-courses", source: "Kaggle", url: "https://www.kaggle.com/learn" },
    ],
    image: [
      { title: "Information is Beautiful gallery", source: "David McCandless", url: "https://informationisbeautiful.net/" },
      { title: "Flowing Data charts", source: "FlowingData", url: "https://flowingdata.com/" },
    ],
    video: [
      { title: "Tableau Conference recordings", source: "Tableau", url: "https://www.tableau.com/events/conference", duration: "30–60 min" },
    ],
  },
  "role:Digital Marketer": {
    youtube: [
      { title: "SEO in 2026 — full course", channel: "Ahrefs", url: "https://www.youtube.com/@AhrefsCom", duration: "2h 18m" },
      { title: "Google Ads tutorial for beginners", channel: "Surfside PPC", url: "https://www.youtube.com/@SurfsidePPC", duration: "1h 30m" },
      { title: "Content marketing strategy", channel: "Neil Patel", url: "https://www.youtube.com/@neilpatel", duration: "45 min" },
    ],
    course: [
      { title: "Google Digital Marketing & E-commerce Certificate", provider: "Coursera", url: "https://www.coursera.org/professional-certificates/google-digital-marketing-ecommerce" },
      { title: "Meta Social Media Marketing Certificate", provider: "Coursera · Meta", url: "https://www.coursera.org/professional-certificates/facebook-social-media-marketing" },
      { title: "HubSpot Inbound Marketing", provider: "HubSpot Academy", url: "https://academy.hubspot.com/courses/inbound-marketing" },
    ],
    book: [
      { title: "Building a StoryBrand", author: "Donald Miller", url: "https://storybrand.com/books/" },
      { title: "Hooked", author: "Nir Eyal", url: "https://www.nirandfar.com/hooked/" },
      { title: "Contagious", author: "Jonah Berger", url: "https://jonahberger.com/books/contagious/" },
    ],
    podcast: [
      { title: "Marketing School", show: "Neil Patel & Eric Siu", url: "https://marketingschool.io/" },
      { title: "Marketing Over Coffee", show: "John Wall & Christopher Penn", url: "https://www.marketingovercoffee.com/" },
    ],
    paper: [
      { title: "The Long and the Short of It", venue: "IPA · Binet & Field", url: "https://ipa.co.uk/knowledge/publications-reports/the-long-and-the-short-of-it" },
    ],
    interview: [
      { title: "How Duolingo grew on TikTok", with: "Zaria Parvez", url: "https://www.lennysnewsletter.com/p/how-duolingo-reignited-its-brand" },
    ],
    company: [
      { name: "HubSpot", about: "Inbound marketing platform and education leader.", url: "https://www.hubspot.com/" },
      { name: "Ahrefs", about: "Leading SEO toolset and content research platform.", url: "https://ahrefs.com/" },
      { name: "Klaviyo", about: "Email/SMS marketing platform for ecommerce.", url: "https://www.klaviyo.com/" },
    ],
    community: [
      { name: "r/marketing", platform: "Reddit", url: "https://www.reddit.com/r/marketing/" },
      { name: "Online Geniuses", platform: "Slack", url: "https://onlinegeniuses.com/" },
    ],
    blog: [
      { title: "Backlinko by Brian Dean", site: "backlinko.com", url: "https://backlinko.com/blog" },
      { title: "Moz Blog", site: "moz.com/blog", url: "https://moz.com/blog" },
    ],
    article: [
      { title: "First Round — marketing playbooks", source: "First Round Review", url: "https://review.firstround.com/marketing/" },
    ],
    image: [
      { title: "Really Good Emails inspiration", source: "Really Good Emails", url: "https://reallygoodemails.com/" },
      { title: "Land-book — landing page gallery", source: "Land-book", url: "https://land-book.com/" },
    ],
    video: [
      { title: "INBOUND conference talks", source: "HubSpot INBOUND", url: "https://www.inbound.com/", duration: "30–60 min" },
    ],
  },
};

// ─── Step intents — used to write entity+step-specific snippets ───────────
const STEP_INTENT: Record<string, { label: string; verb: string; snippetTail: (e: string) => string }> = {
  step1:  { label: "Self-Discovery",       verb: "self-discovery and fit-checking for",          snippetTail: (e) => `to confirm ${e} actually matches who you are.` },
  step2:  { label: "Foundation",           verb: "fundamentals of",                              snippetTail: (e) => `to build a rock-solid foundation in ${e}.` },
  step3:  { label: "Skill Stack",          verb: "designing the core/supporting skill stack for", snippetTail: (e) => `that a working ${e} actually needs.` },
  step4:  { label: "Core Skills",          verb: "daily-practice core skills for",               snippetTail: (e) => `that real ${e}s rely on every single day.` },
  step5:  { label: "Industry Immersion",   verb: "mapping the industry landscape around",        snippetTail: (e) => `— sectors, companies, salaries, geographies for ${e}.` },
  step6:  { label: "Projects",             verb: "portfolio-quality projects for",               snippetTail: (e) => `to ship real, hireable ${e} work.` },
  step7:  { label: "Peer Circles",         verb: "finding peer circles and study groups for",    snippetTail: (e) => `so you don't grow as a ${e} in isolation.` },
  step8:  { label: "Mentorship",           verb: "finding mentors and coaching for",             snippetTail: (e) => `to compress years of ${e} learning into months.` },
  step9:  { label: "Advanced",             verb: "advanced, specialist techniques in",           snippetTail: (e) => `that separate senior ${e}s from the rest.` },
  step10: { label: "Wellbeing & Pace",     verb: "sustaining a healthy pace while becoming a",   snippetTail: (e) => `so you don't burn out on the road to ${e}.` },
  step11: { label: "Inspiration",          verb: "real-life stories and role models of",         snippetTail: (e) => `that prove ${e} is possible for people like you.` },
  step12: { label: "Living Resume",        verb: "building a living resume and showcase for a",  snippetTail: (e) => `so your ${e} work is always job-ready.` },
  step13: { label: "Interviews & Jobs",    verb: "interview prep and job-search tactics for",    snippetTail: (e) => `to land your first (or next) ${e} role.` },
  step14: { label: "Transition Planning",  verb: "planning a safe transition into",              snippetTail: (e) => `with phased pivots and fail-safe backtracks for ${e}.` },
  step15: { label: "Achievements",         verb: "milestone systems and recognition for",        snippetTail: (e) => `to lock in your identity as a ${e}.` },
};

const hostnameOf = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return u; } };
const pick = <T,>(arr: T[], n: number, seed: number): T[] => {
  if (!arr.length) return [];
  const out: T[] = [];
  for (let i = 0; i < n; i++) out.push(arr[(seed + i) % arr.length]);
  return out;
};

// Build N resources of a given format for an (entity, step)
function buildFormat(entity: Entity, stepId: string, format: ResourceFormat, ctx: EntityContext): WebResource[] {
  const intent = STEP_INTENT[stepId];
  const e = entity.label;
  const tail = intent.snippetTail(e);
  const stepSeed = Number(stepId.replace(/\D/g, "")) || 1;

  switch (format) {
    case "youtube": {
      return pick(ctx.youtube, 3, stepSeed).map((y) => ({
        format, platform: "YouTube",
        title: `${y.title} — ${intent.label} for ${e}`,
        link: y.url,
        snippet: `Walks through the ${intent.verb} ${e}, ${tail}`,
        displayLink: hostnameOf(y.url),
        author: y.channel, duration: y.duration, badge: "Video",
      }));
    }
    case "course": {
      return pick(ctx.course, 3, stepSeed).map((c) => ({
        format, platform: c.provider,
        title: `${c.title} · ${intent.label} track for ${e}`,
        link: c.url,
        snippet: `Structured curriculum covering ${intent.verb} ${e}, ${tail}`,
        displayLink: hostnameOf(c.url), badge: "Course",
      }));
    }
    case "book": {
      return pick(ctx.book, 3, stepSeed).map((b) => ({
        format, platform: "Book",
        title: `${b.title}`,
        link: b.url,
        snippet: `${b.author}. A reference every ${e} returns to when working on ${intent.verb} ${e}.`,
        displayLink: hostnameOf(b.url),
        author: b.author, badge: "Book",
      }));
    }
    case "podcast": {
      return pick(ctx.podcast, 2, stepSeed).map((p) => ({
        format, platform: "Podcast",
        title: `${p.title} — episodes on ${intent.label.toLowerCase()} for ${e}`,
        link: p.url,
        snippet: `Conversations with practising ${e}s on ${intent.verb} ${e}, ${tail}`,
        displayLink: hostnameOf(p.url), author: p.show, badge: "Audio",
      }));
    }
    case "research_paper": {
      return pick(ctx.paper, 2, stepSeed).map((p) => ({
        format, platform: p.venue,
        title: `${p.title}`,
        link: p.url,
        snippet: `Foundational reading that informs how modern ${e}s approach ${intent.verb} ${e}.`,
        displayLink: hostnameOf(p.url), badge: "Paper",
      }));
    }
    case "interview": {
      return pick(ctx.interview, 2, stepSeed).map((it) => ({
        format, platform: "Interview",
        title: `${it.title}`,
        link: it.url,
        snippet: `${it.with} on what ${intent.label.toLowerCase()} actually looks like for a working ${e}.`,
        displayLink: hostnameOf(it.url), author: it.with, badge: "Interview",
      }));
    }
    case "company": {
      return pick(ctx.company, 3, stepSeed).map((c) => ({
        format, platform: "Company",
        title: `${c.name} — how they apply this to ${e}`,
        link: c.url,
        snippet: `${c.about} Study how they work to see ${intent.verb} ${e} in production.`,
        displayLink: hostnameOf(c.url), badge: "Company",
      }));
    }
    case "community": {
      return pick(ctx.community, 2, stepSeed).map((co) => ({
        format, platform: co.platform,
        title: `${co.name} — ${e} discussions`,
        link: co.url,
        snippet: `Active community where ${e}s share work, ask for feedback, and discuss ${intent.verb} ${e}.`,
        displayLink: hostnameOf(co.url), badge: "Community",
      }));
    }
    case "blog": {
      return pick(ctx.blog, 2, stepSeed).map((b) => ({
        format, platform: b.site,
        title: `${b.title} — posts on ${intent.label.toLowerCase()} for ${e}`,
        link: b.url,
        snippet: `Long-form writing on ${intent.verb} ${e}, ${tail}`,
        displayLink: hostnameOf(b.url), badge: "Blog",
      }));
    }
    case "article": {
      return pick(ctx.article, 2, stepSeed).map((a) => ({
        format, platform: a.source,
        title: `${a.title}`,
        link: a.url,
        snippet: `Hand-picked article that explains ${intent.verb} ${e} without fluff.`,
        displayLink: hostnameOf(a.url), badge: "Article",
      }));
    }
    case "image": {
      return pick(ctx.image, 2, stepSeed).map((im) => ({
        format, platform: im.source,
        title: `${im.title}`,
        link: im.url,
        snippet: `Visual reference library — see what great ${e} work looks like at the ${intent.label.toLowerCase()} stage.`,
        displayLink: hostnameOf(im.url), badge: "Visual",
      }));
    }
    case "video": {
      return pick(ctx.video, 2, stepSeed).map((v) => ({
        format, platform: v.source,
        title: `${v.title}`,
        link: v.url,
        snippet: `Conference-grade talks on ${intent.verb} ${e}, ${tail}`,
        displayLink: hostnameOf(v.url), duration: v.duration, badge: "Talk",
      }));
    }
  }
  return [];
}

const ALL_FORMATS: ResourceFormat[] = [
  "youtube", "course", "book", "podcast", "research_paper",
  "interview", "company", "community", "blog", "article", "image", "video",
];

// Fallback context for entities not in the curated CTX map — uses real search/listing URLs
function fallbackContextFor(entity: Entity): EntityContext {
  const q = encodeURIComponent(entity.label);
  return {
    youtube: [
      { title: `${entity.label} full tutorial`, channel: "YouTube creators", url: `https://www.youtube.com/results?search_query=${q}+tutorial`, duration: "1–2h" },
      { title: `${entity.label} explained in 10 minutes`, channel: "Top educators", url: `https://www.youtube.com/results?search_query=${q}+explained`, duration: "10 min" },
      { title: `Day in the life of a ${entity.label}`, channel: "Creators", url: `https://www.youtube.com/results?search_query=day+in+the+life+${q}`, duration: "12 min" },
    ],
    course: [
      { title: `${entity.label} on Coursera`, provider: "Coursera", url: `https://www.coursera.org/search?query=${q}` },
      { title: `${entity.label} on edX`, provider: "edX", url: `https://www.edx.org/search?q=${q}` },
      { title: `${entity.label} on Udemy`, provider: "Udemy", url: `https://www.udemy.com/courses/search/?q=${q}` },
    ],
    book: [
      { title: `Top ${entity.label} books`, author: "Various", url: `https://www.goodreads.com/search?q=${q}` },
      { title: `${entity.label} on O'Reilly`, author: "Various", url: `https://www.oreilly.com/search/?q=${q}` },
    ],
    podcast: [
      { title: `${entity.label} podcasts`, show: "Apple Podcasts", url: `https://podcasts.apple.com/us/search?term=${q}` },
      { title: `${entity.label} on Spotify`, show: "Spotify", url: `https://open.spotify.com/search/${q}` },
    ],
    paper: [
      { title: `${entity.label} research on arXiv`, venue: "arXiv", url: `https://arxiv.org/search/?query=${q}` },
      { title: `${entity.label} on Google Scholar`, venue: "Google Scholar", url: `https://scholar.google.com/scholar?q=${q}` },
    ],
    interview: [
      { title: `Interviews with ${entity.label}s`, with: "Lenny's Newsletter / First Round", url: `https://www.google.com/search?q=interview+${q}+lenny+OR+firstround` },
    ],
    company: [
      { title: "Companies hiring", name: `Companies hiring ${entity.label}s`, about: "Active employers in this field.", url: `https://www.linkedin.com/jobs/search/?keywords=${q}` } as any,
      { name: `Top ${entity.label} companies`, about: "Industry leaders working on this.", url: `https://www.crunchbase.com/discover/saved/${q}` },
    ] as any,
    community: [
      { name: `r/${entity.label.replace(/\s+/g, "")}`, platform: "Reddit", url: `https://www.reddit.com/search/?q=${q}` },
      { name: `${entity.label} Discord`, platform: "Discord", url: `https://www.google.com/search?q=${q}+discord+community` },
    ],
    blog: [
      { title: `${entity.label} on Medium`, site: "Medium", url: `https://medium.com/search?q=${q}` },
      { title: `${entity.label} on Dev.to`, site: "Dev.to", url: `https://dev.to/search?q=${q}` },
    ],
    article: [
      { title: `${entity.label} long-reads`, source: "Pocket / Hacker News", url: `https://hn.algolia.com/?q=${q}` },
    ],
    image: [
      { title: `${entity.label} visual references`, source: "Pinterest", url: `https://www.pinterest.com/search/pins/?q=${q}` },
      { title: `${entity.label} infographics`, source: "Behance", url: `https://www.behance.net/search/projects?search=${q}` },
    ],
    video: [
      { title: `${entity.label} conference talks`, source: "TED / Conferences", url: `https://www.ted.com/search?q=${q}`, duration: "15–45 min" },
    ],
  };
}

export function getMockResourcesForStep(entity: Entity, stepId: string): WebResource[] {
  const ctx = CTX[entity.id] || fallbackContextFor(entity);
  const out: WebResource[] = [];
  ALL_FORMATS.forEach((f) => out.push(...buildFormat(entity, stepId, f, ctx)));
  return out;
}

export function getMockResourcesForSubStep(entity: Entity, stepId: string, sub: SubStep): WebResource[] {
  // Sub-step: tighter set (5 formats, 1 each) keyed off the sub-step title
  const ctx = CTX[entity.id] || fallbackContextFor(entity);
  const formats: ResourceFormat[] = ["youtube", "course", "book", "article", "video"];
  return formats.flatMap((f) => {
    const r = buildFormat(entity, stepId, f, ctx).slice(0, 1);
    return r.map((x) => ({ ...x, title: `${sub.title} → ${x.title}` }));
  });
}

// ─── Coach + therapist demo payloads (entity-aware messaging upstream) ────
export const MOCK_COACH_NOTE = {
  reason:
    "You've revisited Core Skills for Product Designer 4 times in 5 days without shipping a sub-step. Let's reroute to one tiny shipped artifact this week.",
  topGaps: ["Hands-on Figma practice", "Real user interviews", "Design critique exposure"],
  alignment: { band: "Moderate", score: 62 },
  plan: { summary: "Shift from passive learning to one small shipped artifact this week." },
  at: new Date().toISOString(),
};

export const MOCK_THERAPIST_ADJUST = {
  emotionalReadiness: "Slightly fatigued — pace down 20%",
  adjustmentProposals: [
    { title: "Reduce weekly load", detail: "Drop from 10 hrs/wk to 7 hrs/wk for the next 2 weeks." },
    { title: "Add a confidence anchor", detail: "Start each session by listing 1 thing you already know well." },
    { title: "Pair with a peer", detail: "Schedule 1 buddy check-in this week — accountability boosts follow-through 38%." },
  ],
};
