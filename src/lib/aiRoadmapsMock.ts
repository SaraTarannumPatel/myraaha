// Mock data layer for AI Roadmaps — used to demo the full experience
// (entities, resources, coach reroute, therapist adjustments) with realistic
// loading delays and real, clickable external links.
import type { Entity, WebResource, RoadmapStep, SubStep } from "@/lib/aiRoadmaps";

export const MOCK_ENTITIES: Entity[] = [
  {
    id: "career:Product Designer",
    label: "Product Designer",
    kind: "career",
    source: "career_cards",
    skills: ["Figma", "User Research", "Prototyping", "Design Systems", "Interaction Design"],
  },
  {
    id: "role:Full-Stack Developer",
    label: "Full-Stack Developer",
    kind: "role",
    source: "story_mode",
    skills: ["React", "Node.js", "PostgreSQL", "TypeScript", "REST APIs"],
  },
  {
    id: "domain:Artificial Intelligence",
    label: "Artificial Intelligence",
    kind: "domain",
    source: "challenge_mode",
    skills: ["Python", "Machine Learning", "Deep Learning", "Math", "Data Wrangling"],
  },
  {
    id: "career:Data Analyst",
    label: "Data Analyst",
    kind: "career",
    source: "career_cards",
    skills: ["SQL", "Excel", "Python", "Tableau", "Statistics"],
  },
  {
    id: "role:Digital Marketer",
    label: "Digital Marketer",
    kind: "role",
    source: "other",
    skills: ["SEO", "Google Ads", "Content Strategy", "Analytics", "Email Marketing"],
  },
];

// Curated, real, clickable resources per entity+step.
// Falls back to a generic per-step pack when an entity is not pre-curated.
type ResourceMap = Record<string, Record<string, WebResource[]>>;

const GENERIC_BY_STEP: Record<string, (label: string) => WebResource[]> = {
  step1: (label) => [
    { title: `${label} — Beginner's Guide (freeCodeCamp)`, link: `https://www.freecodecamp.org/news/search/?query=${encodeURIComponent(label)}`, snippet: `Free, beginner-friendly articles, tutorials and crash courses on ${label}.`, displayLink: "freecodecamp.org" },
    { title: `${label} Crash Course — YouTube`, link: `https://www.youtube.com/results?search_query=${encodeURIComponent(label + " crash course")}`, snippet: `Hand-picked playlists covering the fundamentals of ${label}.`, displayLink: "youtube.com" },
    { title: `${label} on Coursera`, link: `https://www.coursera.org/search?query=${encodeURIComponent(label)}`, snippet: `Beginner specializations and university courses on ${label}.`, displayLink: "coursera.org" },
    { title: `${label} Roadmap — roadmap.sh`, link: `https://roadmap.sh/`, snippet: "Community-curated step-by-step roadmaps.", displayLink: "roadmap.sh" },
  ],
  step2: (label) => [
    { title: `${label} — Official Documentation`, link: `https://www.google.com/search?q=${encodeURIComponent(label + " official documentation")}`, snippet: `Authoritative reference docs for ${label}.`, displayLink: "google.com" },
    { title: `${label} on edX`, link: `https://www.edx.org/search?q=${encodeURIComponent(label)}`, snippet: `Core skills courses from MIT, Harvard and more.`, displayLink: "edx.org" },
    { title: `${label} Tutorials — MDN / W3Schools`, link: `https://developer.mozilla.org/en-US/search?q=${encodeURIComponent(label)}`, snippet: "Hands-on tutorials and reference material.", displayLink: "developer.mozilla.org" },
    { title: `Best ${label} Courses 2025 — Reddit`, link: `https://www.reddit.com/search/?q=${encodeURIComponent("best " + label + " course")}`, snippet: "Community recommendations from practitioners.", displayLink: "reddit.com" },
  ],
  step3: (label) => [
    { title: `${label} Project Ideas — GitHub`, link: `https://github.com/search?q=${encodeURIComponent(label + " projects")}&type=repositories`, snippet: `Curated open-source ${label} project repositories.`, displayLink: "github.com" },
    { title: `Build a ${label} Portfolio — Dev.to`, link: `https://dev.to/search?q=${encodeURIComponent(label + " portfolio")}`, snippet: "Walk-throughs for building portfolio-quality projects.", displayLink: "dev.to" },
    { title: `${label} on Kaggle / Practice Platforms`, link: `https://www.kaggle.com/search?q=${encodeURIComponent(label)}`, snippet: "Real datasets, notebooks and challenges.", displayLink: "kaggle.com" },
    { title: `${label} Capstone Inspirations — Notion`, link: `https://www.notion.so/templates?search=${encodeURIComponent(label)}`, snippet: "Capstone templates and portfolio frameworks.", displayLink: "notion.so" },
  ],
  step4: (label) => [
    { title: `${label} — Advanced Topics on arXiv`, link: `https://arxiv.org/search/?query=${encodeURIComponent(label)}&start=0`, snippet: "Latest research papers and advanced techniques.", displayLink: "arxiv.org" },
    { title: `${label} Deep Dive — Medium`, link: `https://medium.com/search?q=${encodeURIComponent(label + " advanced")}`, snippet: "In-depth articles from senior practitioners.", displayLink: "medium.com" },
    { title: `${label} on Pluralsight`, link: `https://www.pluralsight.com/search?q=${encodeURIComponent(label)}`, snippet: "Advanced specializations and skill paths.", displayLink: "pluralsight.com" },
    { title: `${label} Experts on YouTube`, link: `https://www.youtube.com/results?search_query=${encodeURIComponent(label + " advanced")}`, snippet: "Expert-level talks and conference recordings.", displayLink: "youtube.com" },
  ],
  step5: (label) => [
    { title: `${label} Interview Questions — InterviewBit`, link: `https://www.interviewbit.com/?s=${encodeURIComponent(label)}`, snippet: `Most-asked ${label} interview questions, ranked by frequency.`, displayLink: "interviewbit.com" },
    { title: `${label} Jobs — LinkedIn`, link: `https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(label)}`, snippet: "Live job openings worldwide.", displayLink: "linkedin.com" },
    { title: `${label} Resume Templates`, link: `https://www.canva.com/search?q=${encodeURIComponent(label + " resume")}`, snippet: "ATS-friendly resume templates curated for this role.", displayLink: "canva.com" },
    { title: `${label} Communities — Discord / Slack`, link: `https://www.google.com/search?q=${encodeURIComponent(label + " discord community")}`, snippet: "Active communities for networking and referrals.", displayLink: "google.com" },
  ],
};

const CURATED: ResourceMap = {
  "career:Product Designer": {
    step1: [
      { title: "Google UX Design Professional Certificate", link: "https://www.coursera.org/professional-certificates/google-ux-design", snippet: "Beginner-friendly certificate covering UX fundamentals end-to-end.", displayLink: "coursera.org" },
      { title: "Figma — Getting Started (Official)", link: "https://help.figma.com/hc/en-us/categories/360002051613-Get-started", snippet: "Official Figma tutorials for first-time designers.", displayLink: "help.figma.com" },
      { title: "Refactoring UI (Book)", link: "https://www.refactoringui.com/", snippet: "Practical visual design principles by the Tailwind CSS team.", displayLink: "refactoringui.com" },
      { title: "Laws of UX", link: "https://lawsofux.com/", snippet: "Core psychology principles that every designer must internalize.", displayLink: "lawsofux.com" },
    ],
    step2: [
      { title: "Design Systems by InVision", link: "https://www.designbetter.co/design-systems-handbook", snippet: "Comprehensive handbook on building scalable design systems.", displayLink: "designbetter.co" },
      { title: "Nielsen Norman Group Articles", link: "https://www.nngroup.com/articles/", snippet: "Research-backed UX articles, the gold standard of the industry.", displayLink: "nngroup.com" },
      { title: "Material Design Guidelines", link: "https://m3.material.io/", snippet: "Google's design system documentation.", displayLink: "m3.material.io" },
    ],
    step3: [
      { title: "Daily UI Challenge", link: "https://www.dailyui.co/", snippet: "100 days of design prompts to build a portfolio.", displayLink: "dailyui.co" },
      { title: "Awwwards Site of the Day", link: "https://www.awwwards.com/", snippet: "Inspiration and case studies of top-tier digital products.", displayLink: "awwwards.com" },
      { title: "Behance Portfolios", link: "https://www.behance.net/search/projects?search=product%20design", snippet: "Browse top product design portfolios for inspiration and structure.", displayLink: "behance.net" },
    ],
    step4: [
      { title: "Smashing Magazine — Advanced UX", link: "https://www.smashingmagazine.com/category/ux", snippet: "Deep dives on accessibility, motion, and complex interactions.", displayLink: "smashingmagazine.com" },
      { title: "Interaction Design Foundation", link: "https://www.interaction-design.org/", snippet: "University-grade courses on specialized design topics.", displayLink: "interaction-design.org" },
    ],
    step5: [
      { title: "Product Design Interview Questions", link: "https://www.designerup.co/blog/the-ultimate-guide-to-the-product-design-interview/", snippet: "Comprehensive guide to product design interviews.", displayLink: "designerup.co" },
      { title: "UX Jobs Board", link: "https://www.uxjobsboard.com/", snippet: "Hand-curated UX roles updated daily.", displayLink: "uxjobsboard.com" },
      { title: "Designer Hangout (Slack)", link: "https://www.designerhangout.co/", snippet: "Largest UX community on Slack — referrals & feedback.", displayLink: "designerhangout.co" },
    ],
  },
  "role:Full-Stack Developer": {
    step1: [
      { title: "The Odin Project — Full Stack Path", link: "https://www.theodinproject.com/paths", snippet: "Free, complete full-stack curriculum from zero to hireable.", displayLink: "theodinproject.com" },
      { title: "freeCodeCamp Responsive Web Design", link: "https://www.freecodecamp.org/learn/2022/responsive-web-design/", snippet: "Free certification covering HTML, CSS and responsive design.", displayLink: "freecodecamp.org" },
      { title: "MDN Web Docs", link: "https://developer.mozilla.org/en-US/docs/Learn", snippet: "The canonical reference for web technologies.", displayLink: "developer.mozilla.org" },
    ],
    step2: [
      { title: "React Official Docs", link: "https://react.dev/learn", snippet: "Modern React docs with interactive examples.", displayLink: "react.dev" },
      { title: "Node.js Official Docs", link: "https://nodejs.org/en/learn", snippet: "Server-side JavaScript fundamentals.", displayLink: "nodejs.org" },
      { title: "PostgreSQL Tutorial", link: "https://www.postgresqltutorial.com/", snippet: "Comprehensive PostgreSQL tutorial from basics to advanced.", displayLink: "postgresqltutorial.com" },
    ],
    step3: [
      { title: "Build a SaaS with Next.js — Lee Robinson", link: "https://www.youtube.com/playlist?list=PL6bwFJ82M6FXjyBTVi6WSCWin8q_g_8RR", snippet: "Ship a real product end-to-end on YouTube.", displayLink: "youtube.com" },
      { title: "Frontend Mentor Challenges", link: "https://www.frontendmentor.io/challenges", snippet: "Real-world frontend project briefs with designs.", displayLink: "frontendmentor.io" },
      { title: "GitHub Trending Repos", link: "https://github.com/trending", snippet: "What real teams ship — read their code.", displayLink: "github.com" },
    ],
    step4: [
      { title: "System Design Primer", link: "https://github.com/donnemartin/system-design-primer", snippet: "300k+ star resource for learning large-scale system design.", displayLink: "github.com" },
      { title: "Patterns.dev", link: "https://www.patterns.dev/", snippet: "Modern web patterns by Lydia Hallie & Addy Osmani.", displayLink: "patterns.dev" },
    ],
    step5: [
      { title: "LeetCode", link: "https://leetcode.com/", snippet: "DSA practice for interviews.", displayLink: "leetcode.com" },
      { title: "Tech Interview Handbook", link: "https://www.techinterviewhandbook.org/", snippet: "Free, curated interview prep for SWE roles.", displayLink: "techinterviewhandbook.org" },
      { title: "Hiring Cafe / Wellfound Jobs", link: "https://wellfound.com/jobs", snippet: "Live startup engineering roles.", displayLink: "wellfound.com" },
    ],
  },
  "domain:Artificial Intelligence": {
    step1: [
      { title: "Andrew Ng — AI For Everyone", link: "https://www.coursera.org/learn/ai-for-everyone", snippet: "The friendliest introduction to AI on the internet.", displayLink: "coursera.org" },
      { title: "Elements of AI", link: "https://www.elementsofai.com/", snippet: "Free university-grade AI literacy course.", displayLink: "elementsofai.com" },
      { title: "Python for Everybody", link: "https://www.py4e.com/", snippet: "Free Python course used by 5M+ learners.", displayLink: "py4e.com" },
    ],
    step2: [
      { title: "Machine Learning Specialization — Andrew Ng", link: "https://www.coursera.org/specializations/machine-learning-introduction", snippet: "The most respected ML course in the world.", displayLink: "coursera.org" },
      { title: "fast.ai Practical Deep Learning", link: "https://course.fast.ai/", snippet: "Top-down practical deep learning by Jeremy Howard.", displayLink: "course.fast.ai" },
      { title: "Hugging Face Course", link: "https://huggingface.co/learn", snippet: "NLP and Transformers from the team behind the field.", displayLink: "huggingface.co" },
    ],
    step3: [
      { title: "Kaggle Competitions", link: "https://www.kaggle.com/competitions", snippet: "Real ML competitions with cash prizes and reputation.", displayLink: "kaggle.com" },
      { title: "Papers With Code", link: "https://paperswithcode.com/", snippet: "State-of-the-art ML papers with runnable code.", displayLink: "paperswithcode.com" },
    ],
    step4: [
      { title: "Distill.pub Research", link: "https://distill.pub/", snippet: "Visual explanations of advanced ML topics.", displayLink: "distill.pub" },
      { title: "arXiv cs.LG", link: "https://arxiv.org/list/cs.LG/recent", snippet: "Latest machine learning research, daily.", displayLink: "arxiv.org" },
    ],
    step5: [
      { title: "ML Engineer Interview Guide", link: "https://github.com/khangich/machine-learning-interview", snippet: "Battle-tested ML interview prep.", displayLink: "github.com" },
      { title: "AI/ML Jobs Board", link: "https://ai-jobs.net/", snippet: "Specialized job board for AI/ML roles.", displayLink: "ai-jobs.net" },
    ],
  },
};

export function getMockResourcesForStep(entity: Entity, stepId: string): WebResource[] {
  const curated = CURATED[entity.id]?.[stepId];
  if (curated && curated.length) return curated;
  const gen = GENERIC_BY_STEP[stepId];
  return gen ? gen(entity.label) : [];
}

export function getMockResourcesForSubStep(entity: Entity, stepId: string, sub: SubStep): WebResource[] {
  const stepRes = getMockResourcesForStep(entity, stepId);
  // Return a tighter variation per sub-step (3 items) using the sub-step keywords
  return stepRes.slice(0, 3).map((r) => ({
    ...r,
    title: `${sub.title}: ${r.title}`,
  }));
}

export const MOCK_COACH_NOTE = {
  reason: "You've revisited Step 2 (Core Skills) for Product Designer 4 times in 5 days without completing a sub-step. Let's reroute.",
  topGaps: ["Hands-on Figma practice", "Real user interviews", "Design critique exposure"],
  alignment: { band: "Moderate", score: 62 },
  plan: { summary: "Shift from passive learning to 1 small shipped artifact this week." },
  at: new Date().toISOString(),
};

export const MOCK_THERAPIST_ADJUST = {
  emotionalReadiness: "Slightly fatigued — pace down 20%",
  adjustmentProposals: [
    { title: "Reduce weekly load", detail: "Drop from 10 hrs/wk to 7 hrs/wk for the next 2 weeks." },
    { title: "Add a confidence anchor", detail: "Start each session by listing 1 thing you already know well." },
    { title: "Pair with peer", detail: "Schedule 1 buddy check-in this week — accountability boosts follow-through 38%." },
  ],
};
