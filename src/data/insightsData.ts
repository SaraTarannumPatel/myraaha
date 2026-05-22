export type InsightBlock =
  | { type: 'h3'; text: string }
  | { type: 'h4'; text: string }
  | { type: 'p'; text: string }
  | { type: 'quote'; text: string }
  | { type: 'list'; items: string[]; text?: string };

export interface InsightArticle {
  slug: string;
  title: string;
  excerpt: string;
  category: 'Industry Analysis' | 'Success Stories' | 'Research' | 'Events';
  date: string;
  author: string;
  readTime: string;
  image: string;
  content: InsightBlock[];
  relatedReadingSlugs?: string[];
  isUserSubmitted?: boolean;
}

export const insightsData: InsightArticle[] = [
  {
    slug: 'the-career-guidance-gap',
    title: "The Career Guidance Gap: Why India's Navigation System is Structurally Broken",
    excerpt:
      "Most career confusion is not a personal failure — it is the predictable result of an outdated guidance infrastructure built for a world that no longer exists.",
    category: 'Industry Analysis',
    date: 'May 12, 2026',
    author: 'MyRaaha Editorial',
    readTime: '9 min',
    image: '/newsletter_insights.png',
    content: [
      { type: 'p', text: "Every year, millions of students in India make career decisions without the information, self-knowledge, or structure required to make them well. The system calls this a personal failure. It isn't." },
      { type: 'h3', text: 'A fragmented infrastructure' },
      { type: 'p', text: "Career guidance, as it exists today, was built for a simpler world — one where careers were linear, industries were stable, and a one-hour counseling session could reasonably cover the options. That world is gone." },
      { type: 'quote', text: "You are expected to connect all of this yourself. And when it doesn't work — you start over." },
      { type: 'h3', text: 'Where the silence is loudest' },
      { type: 'p', text: 'In Tier 3, Tier 4 and rural India, students don\'t just lack guidance — they lack the awareness that guidance is something they deserve. No one asked them what they wanted to become.' },
      { type: 'list', items: [
        'They choose based on proximity, not alignment.',
        'They discover the mismatch years later.',
        'They restart — losing time, money and confidence.',
      ] },
      { type: 'p', text: 'The result isn\'t just career confusion — it\'s a generation of potential that never gets the chance to understand itself.' },
    ],
    relatedReadingSlugs: ['rural-india-curiosity-notes', 'honest-cost-of-career-change'],
  },
  {
    slug: 'rural-india-curiosity-notes',
    title: 'Field Notes: What Rural India Taught Us About Curiosity',
    excerpt: 'Six months of conversations with students across Tier 3 and Tier 4 districts changed how we built MyRaaha.',
    category: 'Research',
    date: 'April 18, 2026',
    author: 'MyRaaha Field Team',
    readTime: '7 min',
    image: '/myraaha_service_compass_v2_1778819596925.png',
    content: [
      { type: 'p', text: 'Curiosity is universal. Access to outlets for it is not.' },
      { type: 'h3', text: 'What we heard' },
      { type: 'p', text: 'In village after village, students described an internal world far richer than the choices being offered to them.' },
      { type: 'quote', text: 'Nobody ever asked me what I wanted to become. Only what I should do.' },
      { type: 'h3', text: 'What it changed' },
      { type: 'p', text: 'We rebuilt the Curiosity Compass to start from interest signals — not test scores.' },
    ],
    relatedReadingSlugs: ['the-career-guidance-gap'],
  },
  {
    slug: 'honest-cost-of-career-change',
    title: 'The Honest Cost of a Career Change',
    excerpt: 'Time, money, identity. Modeling a transition properly before you take the leap.',
    category: 'Industry Analysis',
    date: 'March 27, 2026',
    author: 'MyRaaha Research',
    readTime: '8 min',
    image: '/myraaha_hero_v2_1778819576959.png',
    content: [
      { type: 'p', text: 'Career change costs more than money. It costs time, identity and the comfort of competence.' },
      { type: 'h3', text: 'Model each before you decide' },
      { type: 'list', items: [
        'Skill gap: which skills compound, which depreciate.',
        'Income runway: 12-24 months of realistic numbers.',
        'Identity drift: what you stop being known for.',
      ] },
    ],
    relatedReadingSlugs: ['the-career-guidance-gap'],
  },
  {
    slug: 'founder-spotlight-priya',
    title: 'Founder Spotlight: How Priya Built Her First Venture from a Tier 3 Town',
    excerpt: 'A grounded story of building an MVP without an accelerator, an angel cheque, or a metro address.',
    category: 'Success Stories',
    date: 'March 5, 2026',
    author: 'MyRaaha Storytelling',
    readTime: '6 min',
    image: '/myraaha_service_compass_v2_1778819596925.png',
    content: [
      { type: 'p', text: 'Priya did not start with a deck. She started with a problem she could not stop thinking about.' },
      { type: 'h3', text: 'The first 90 days' },
      { type: 'p', text: 'No code. No app. Just three weeks of conversations with twenty potential users.' },
    ],
    relatedReadingSlugs: ['the-career-guidance-gap'],
  },
  {
    slug: 'campus-summit-2026',
    title: 'MyRaaha Campus Summit 2026: Recap',
    excerpt: 'Highlights from a two-day gathering of educators, students and mentors across India.',
    category: 'Events',
    date: 'February 11, 2026',
    author: 'MyRaaha Events',
    readTime: '5 min',
    image: '/newsletter_insights.png',
    content: [
      { type: 'p', text: 'Two days. Eight cities streaming in. Hundreds of conversations.' },
      { type: 'h3', text: 'Top themes' },
      { type: 'list', items: ['Career literacy in regional languages', 'Mentorship at scale', 'Designing for low-bandwidth schools'] },
    ],
    relatedReadingSlugs: ['the-career-guidance-gap'],
  },
];

// Back-compat exports for any existing imports.
export type Insight = InsightArticle;
export const insights = insightsData;
export const getInsightBySlug = (slug: string) => insightsData.find(i => i.slug === slug);
