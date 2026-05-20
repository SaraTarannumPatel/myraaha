export type Insight = {
  slug: string;
  title: string;
  excerpt: string;
  category: "Research" | "Playbook" | "Story" | "Essay";
  readTime: string;
  date: string;
  author: string;
  image?: string;
  body: string[];
};

export const insights: Insight[] = [
  {
    slug: "why-career-confusion-is-not-your-fault",
    title: "Why career confusion is not your fault",
    excerpt:
      "The systems that were supposed to give you direction quietly stopped working. Here's what to do about it.",
    category: "Essay",
    readTime: "6 min",
    date: "2026-04-22",
    author: "MyRaaha Editorial",
    image: "/newsletter_insights.png",
    body: [
      "Most of us were handed a map for a country that no longer exists.",
      "We were told that if you study hard, pick a stream, and follow the steps, the rest will take care of itself. It doesn't anymore.",
      "This essay is about what changed, and what to do instead.",
    ],
  },
  {
    slug: "the-honest-cost-of-a-career-change",
    title: "The honest cost of a career change",
    excerpt:
      "Time, money, identity. Modeling a transition properly before you take the leap.",
    category: "Playbook",
    readTime: "9 min",
    date: "2026-04-08",
    author: "MyRaaha Research",
    body: [
      "Career change costs more than money. It costs time, identity, and the comfort of competence.",
      "Here's how to model each before you decide.",
    ],
  },
  {
    slug: "what-rural-india-taught-us-about-curiosity",
    title: "What rural India taught us about curiosity",
    excerpt:
      "Field notes from six months of conversations with students across Tier 3 and Tier 4 districts.",
    category: "Research",
    readTime: "7 min",
    date: "2026-03-19",
    author: "MyRaaha Field Team",
    body: [
      "Curiosity is universal. Access to outlets for it is not.",
      "What we heard, what we saw, and what it changed about how we built MyRaaha.",
    ],
  },
];

export const getInsightBySlug = (slug: string) =>
  insights.find((i) => i.slug === slug);
