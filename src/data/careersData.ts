export type CareerRole = {
  slug: string;
  title: string;
  type: "Full-time" | "Internship" | "Freelance" | "Volunteer" | "Facilitator";
  location: string;
  commitment: string;
  summary: string;
  image: string;
  responsibilities: string[];
  qualifications: string[];
  benefits: string[];
};

export const careerRoles: CareerRole[] = [
  {
    slug: "core-team",
    title: "Core Team",
    type: "Full-time",
    location: "Remote · India",
    commitment: "Full-time",
    summary:
      "Join the founding team building MyRaaha's career and entrepreneurship OS for India's next generation.",
    image: "/career_core_team.png",
    responsibilities: [
      "Own a product or engineering surface end-to-end",
      "Shape strategy, architecture, and culture from the ground up",
      "Work directly with the founders on weekly product decisions",
    ],
    qualifications: [
      "3+ years of relevant experience",
      "Bias to action and high ownership",
      "Comfort with ambiguity and rapid iteration",
    ],
    benefits: [
      "Meaningful equity",
      "Fully remote with quarterly offsites",
      "Health cover and learning stipend",
    ],
  },
  {
    slug: "intern",
    title: "Intern",
    type: "Internship",
    location: "Remote · India",
    commitment: "3–6 months",
    summary:
      "Learn how a mission-driven product gets built. Real work, real mentorship, real outcomes.",
    image: "/career_intern.png",
    responsibilities: [
      "Ship features alongside the core team",
      "Run user interviews and synthesize insights",
      "Contribute to research, content, or engineering depending on track",
    ],
    qualifications: [
      "Currently studying or recent graduate",
      "Strong written communication",
      "Curiosity over credentials",
    ],
    benefits: [
      "Monthly stipend",
      "Mentorship from founders",
      "Letter of recommendation and conversion pathway",
    ],
  },
  {
    slug: "freelance",
    title: "Freelance",
    type: "Freelance",
    location: "Remote · Worldwide",
    commitment: "Project-based",
    summary:
      "Partner with MyRaaha on focused projects across design, content, research, or engineering.",
    image: "/career_freelancer.png",
    responsibilities: [
      "Deliver clearly scoped projects within agreed timelines",
      "Coordinate with the project lead weekly",
      "Document outcomes for future contributors",
    ],
    qualifications: [
      "Proven portfolio in your craft",
      "Self-directed and reliable",
      "Aligned with MyRaaha's values",
    ],
    benefits: [
      "Competitive project rates",
      "Flexible schedule",
      "Long-term retainer opportunities",
    ],
  },
  {
    slug: "volunteer",
    title: "Volunteer",
    type: "Volunteer",
    location: "Remote · India",
    commitment: "Flexible",
    summary:
      "Lend a few hours a week to a mission you believe in. Help thousands of young people find direction.",
    image: "/career_volunteer.png",
    responsibilities: [
      "Support community moderation or content review",
      "Translate or localize resources",
      "Host peer circles or workshops",
    ],
    qualifications: [
      "Empathy and patience",
      "Commitment to show up consistently",
      "Lived experience welcome",
    ],
    benefits: [
      "Public recognition on Contributors wall",
      "Skill development and references",
      "First access to programs",
    ],
  },
  {
    slug: "facilitator",
    title: "Facilitator",
    type: "Facilitator",
    location: "Hybrid · India",
    commitment: "Part-time",
    summary:
      "Run guided sessions, workshops, and mentor circles for cohorts of students and early professionals.",
    image: "/career_facilitator.png",
    responsibilities: [
      "Plan and run weekly cohort sessions",
      "Provide structured feedback to participants",
      "Iterate on curriculum with the content team",
    ],
    qualifications: [
      "Teaching, coaching, or facilitation experience",
      "Strong group facilitation skills",
      "Aligned with our pedagogy",
    ],
    benefits: [
      "Per-session honorarium",
      "Train-the-trainer support",
      "Access to MyRaaha's full toolkit",
    ],
  },
];

export const getRoleBySlug = (slug: string) =>
  careerRoles.find((r) => r.slug === slug);

export interface CareerRoleData {
  id: string;
  title: string;
  department: string;
  location: string;
  type: string;
  classification: "Core Team" | "Intern" | "Volunteer" | "Facilitator" | "Freelancer";
  description: string;
  requirements: string[];
  skills: string[];
}

export const careersData: CareerRoleData[] = [
  {
    id: "core-team-engineer",
    title: "Full Stack Engineer",
    department: "Engineering",
    location: "Remote · India",
    type: "Full-time",
    classification: "Core Team",
    description: "Join the founding team building MyRaaha's career and entrepreneurship OS for India's next generation. Help us architect scalable React, Node, and Supabase systems.",
    requirements: [
      "3+ years of React & Node.js experience",
      "Bias to action and high ownership",
      "Experience with PostgreSQL and Supabase integration"
    ],
    skills: [
      "React/TypeScript",
      "Node.js",
      "PostgreSQL/Supabase",
      "System Architecture"
    ]
  },
  {
    id: "core-team-designer",
    title: "Product Designer",
    department: "Design",
    location: "Remote · India",
    type: "Full-time",
    classification: "Core Team",
    description: "Craft premium, gorgeous user interfaces and interactive visual pathways. Lead our brand identity and design system implementation across all digital surfaces.",
    requirements: [
      "Strong portfolio demonstrating high-fidelity web designs",
      "Proficiency with Figma, CSS transitions, and responsive layouts",
      "Empathy for building intuitive, accessible education products"
    ],
    skills: [
      "Figma UI/UX",
      "CSS/Animations",
      "Design Systems",
      "User Research"
    ]
  },
  {
    id: "intern-ops",
    title: "Growth & Operations Intern",
    department: "Operations",
    location: "Remote · India",
    type: "Internship",
    classification: "Intern",
    description: "Learn how a mission-driven startup operates. Help run user interviews, orchestrate community cohort onboarding, and synthesize product feedback.",
    requirements: [
      "Currently studying or a recent graduate in any discipline",
      "Strong written and verbal communication",
      "Insatiable curiosity and willingness to learn"
    ],
    skills: [
      "Cohort Operations",
      "User Feedback Analysis",
      "Project Coordination",
      "Communication"
    ]
  },
  {
    id: "volunteer-mentor",
    title: "Community Mentor",
    department: "Community",
    location: "Remote · India",
    type: "Volunteer",
    classification: "Volunteer",
    description: "Lend a few hours a week to guide young students from rural and underserved schools, offering peer support, career insights, and confidence building.",
    requirements: [
      "Empathy, patience, and a positive mindset",
      "Commitment of 2-4 hours per week",
      "Passion for social equity and direct student impact"
    ],
    skills: [
      "Active Listening",
      "Mentoring",
      "Group Facilitation",
      "Empathy"
    ]
  },
  {
    id: "facilitator-cohort",
    title: "Session Facilitator",
    department: "Education",
    location: "Hybrid · India",
    type: "Part-time",
    classification: "Facilitator",
    description: "Lead engaging weekly workshop cohorts, guiding participants through the self-discovery process, venture creation exercises, and personality fit mappings.",
    requirements: [
      "Experience in coaching, teaching, or group facilitation",
      "Strong presentation skills and high energy",
      "Ability to guide discussions constructively"
    ],
    skills: [
      "Public Speaking",
      "Pedagogy",
      "Cohort Management",
      "Coaching"
    ]
  }
];
