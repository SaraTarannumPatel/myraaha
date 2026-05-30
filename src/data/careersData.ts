export interface CareerRoleData {
  id: string;
  title: string;
  department: string;
  classification: 'Core Team' | 'Intern' | 'Volunteer' | 'Facilitator';
  location: string;
  type: string;
  description: string;
  requirements: string[];
  skillsLabel: string;
  skills: string[];
}

export const careersData: CareerRoleData[] = [
  {
    id: 'pm-career-navigation',
    title: 'Product Manager — Career Navigation',
    department: 'Product & Design',
    classification: 'Core Team',
    location: 'Remote (India)',
    type: 'Full-time',
    description: 'Career-focused features, student-to-professional journey, job matching systems',
    requirements: [
      'Understanding of career development psychology',
      'Experience with assessment tools, skill mapping, career pathways',
      'Knowledge of Indian education system (Class 8 → College → Job)',
      'Data-driven feature prioritization'
    ],
    skillsLabel: 'Focus Areas',
    skills: [
      'Curiosity Compass (exploration system)',
      'Living Resume architecture',
      'AI Career Coach conversational design',
      'Mentor matching algorithms',
      'Job/internship matching system'
    ]
  },
  {
    id: 'pm-entrepreneurship',
    title: 'Product Manager — Entrepreneurship',
    department: 'Product & Design',
    classification: 'Core Team',
    location: 'Hybrid (Bangalore)',
    type: 'Full-time',
    description: 'Entrepreneurship journey features, founder support systems, validation tools',
    requirements: [
      'Experience in startup ecosystem (founder or early employee)',
      'Understanding of idea validation, MVP development, fundraising',
      'Knowledge of Indian startup landscape',
      'Community building experience'
    ],
    skillsLabel: 'Focus Areas',
    skills: [
      'Entrepreneurship path design',
      'Idea validation frameworks',
      'MVP development support',
      'Funding readiness systems',
      'Co-founder matching'
    ]
  },
  {
    id: 'senior-product-designer',
    title: 'Senior Product Designer (UI/UX)',
    department: 'Product & Design',
    classification: 'Core Team',
    location: 'Remote (India)',
    type: 'Full-time',
    description: 'Design system, user flows, interface design, brand expression in product',
    requirements: [
      '4+ years designing consumer apps',
      'Experience with mobile-first, Gen Z/Alpha UX patterns',
      'Strong understanding of information architecture',
      'Ability to design for emotional intelligence (Raaha principles)',
      'Portfolio showing systems thinking, not just screens'
    ],
    skillsLabel: 'Design Philosophy Alignment',
    skills: [
      'Editorial layouts, clear hierarchy',
      'Calm, institutional visual language',
      'Dignity-first, not charity-coded',
      'Data visibility and progress tracking',
      'Reflection space before commitment'
    ]
  },
  {
    id: 'behavioral-design-specialist',
    title: 'Behavioral Design Specialist',
    department: 'Product & Design',
    classification: 'Facilitator',
    location: 'Remote (India)',
    type: 'Part-time',
    description: 'Gamification, engagement loops, habit formation, behavioral nudges',
    requirements: [
      'Background in behavioral science/psychology',
      'Experience designing habit-forming products (ethically)',
      'Understanding of motivation systems (intrinsic vs extrinsic)',
      'Gamification expertise without "game-ifying" serious decisions'
    ],
    skillsLabel: 'Focus Areas',
    skills: [
      'SelfGraph™ design (identity tracking)',
      'Engagement mechanics that respect user pace',
      'Progress visualization',
      'Nudge systems for decision-making',
      'Energy zone tracking'
    ]
  },
  {
    id: 'content-designer-ux-writer',
    title: 'Content Designer / UX Writer',
    department: 'Product & Design',
    classification: 'Core Team',
    location: 'Remote (India)',
    type: 'Full-time',
    description: 'All product copy, microcopy, error states, onboarding, voice & tone consistency',
    requirements: [
      'Experience writing for product interfaces',
      'Understanding of MyRaaha\'s tone: emotionally aware, cognitively clear, calm confidence',
      'Ability to simplify complex concepts',
      'Multilingual capability (English + Hindi minimum)'
    ],
    skillsLabel: 'Writing Principles',
    skills: [
      'Clear, not cold',
      'Reflective, not indecisive',
      'Human, not performative',
      'Reality-anchored hope',
      'No hustle/grind/hype language'
    ]
  },
  {
    id: 'lead-full-stack-engineer',
    title: 'Lead Full-Stack Engineer',
    department: 'Engineering & Technology',
    classification: 'Core Team',
    location: 'Remote (India)',
    type: 'Full-time',
    description: 'Core platform development, system architecture, technical decisions',
    requirements: [
      '5+ years full-stack development',
      'Expertise in modern web frameworks (React, Next.js, Node.js)',
      'PWA development experience',
      'Database design and optimization',
      'API design and microservices architecture'
    ],
    skillsLabel: 'Tech Stack Decisions',
    skills: [
      'Progressive Web App architecture',
      'Real-time data sync',
      'Offline-first capabilities',
      'Cross-platform consistency'
    ]
  },
  {
    id: 'senior-ai-ml-engineer',
    title: 'Senior AI/ML Engineer',
    department: 'Engineering & Technology',
    classification: 'Core Team',
    location: 'Remote (India)',
    type: 'Full-time',
    description: 'Build proprietary recommendation engines, behavioral models, personalization algorithms',
    requirements: [
      '4+ years in AI/ML development',
      'Experience building recommendation systems from scratch',
      'Knowledge of NLP for conversational AI (Career Coach, AI Therapist)',
      'Understanding of behavioral data modeling',
      'NOT just fine-tuning GPT — building domain-specific models'
    ],
    skillsLabel: 'Critical Systems',
    skills: [
      '3A Intelligence Engine (Aptitude, Attitude, Articulation)',
      'SelfGraph™ identity modeling',
      'AI Career Therapist (emotion-aware guidance)',
      'Skill-to-opportunity matching',
      'Mentor-user pairing algorithms'
    ]
  },
  {
    id: 'data-engineer',
    title: 'Data Engineer',
    department: 'Engineering & Technology',
    classification: 'Core Team',
    location: 'Remote (India)',
    type: 'Full-time',
    description: 'Data pipelines, behavioral tracking infrastructure, data quality, analytics infrastructure',
    requirements: [
      '3+ years building data pipelines',
      'Experience with event tracking and behavioral analytics',
      'ETL/ELT systems design',
      'Data warehouse design',
      'Real-time data processing'
    ],
    skillsLabel: 'Focus Areas',
    skills: [
      'Living Resume data capture',
      'Behavioral tracking (clicks, time spent, patterns)',
      'Cross-module data consistency',
      'Privacy-compliant data handling'
    ]
  },
  {
    id: 'backend-engineer-integrations',
    title: 'Backend Engineer — Integrations',
    department: 'Engineering & Technology',
    classification: 'Core Team',
    location: 'Remote (India)',
    type: 'Full-time',
    description: 'Third-party integrations, job boards, learning platforms, payment systems',
    requirements: [
      'API integration expertise',
      'Experience with OAuth, webhooks, REST/GraphQL',
      'Payment gateway integration (Razorpay, Stripe)',
      'LMS/course platform integrations'
    ],
    skillsLabel: 'Integration Priorities',
    skills: [
      'Job boards (Naukri, LinkedIn, Indeed)',
      'Learning platforms (Coursera, Udemy, YouTube)',
      'Industry data sources',
      'Communication tools (email, SMS, WhatsApp)'
    ]
  },
  {
    id: 'mobile-pwa-developer',
    title: 'Mobile/PWA Developer',
    department: 'Engineering & Technology',
    classification: 'Core Team',
    location: 'Remote (India)',
    type: 'Full-time',
    description: 'Mobile-optimized experience, offline functionality, app-like behavior',
    requirements: [
      'PWA development expertise',
      'React Native or similar cross-platform experience',
      'Mobile UX optimization',
      'Performance optimization for low-bandwidth networks'
    ],
    skillsLabel: 'Critical Features',
    skills: [
      'Offline-first architecture',
      'Push notifications',
      'Home screen installation',
      'Low data consumption mode (Tier 3/4 focus)'
    ]
  },
  {
    id: 'devops-engineer',
    title: 'DevOps Engineer',
    department: 'Engineering & Technology',
    classification: 'Core Team',
    location: 'Remote (India)',
    type: 'Full-time',
    description: 'Infrastructure, deployment, monitoring, security, uptime',
    requirements: [
      '3+ years DevOps experience',
      'CI/CD pipeline management',
      'Cloud infrastructure (AWS/GCP/Azure)',
      'Security best practices',
      'Performance monitoring'
    ],
    skillsLabel: 'Critical Skills',
    skills: [
      'CI/CD pipeline implementation',
      'Cloud infrastructure auto-scaling',
      'Data security and compliance auditing',
      'High availability and server response optimization'
    ]
  },
  {
    id: 'ai-research-scientist',
    title: 'AI Research Scientist / Applied AI Lead',
    department: 'AI & Intelligence Systems',
    classification: 'Core Team',
    location: 'Remote (India)',
    type: 'Full-time',
    description: 'Proprietary model development, research into career/entrepreneurship-specific AI',
    requirements: [
      'PhD or equivalent in ML/AI (preferred)',
      'Published research in recommendation systems, behavioral modeling, or NLP',
      'Ability to translate research into production systems',
      'Understanding of human decision-making models'
    ],
    skillsLabel: 'Research Areas',
    skills: [
      'Identity modeling over time (SelfGraph™)',
      'Emotion detection in text (AI Career Therapist)',
      'Career path prediction models',
      'Skill gap analysis algorithms',
      'Founder mindset modeling'
    ]
  },
  {
    id: 'conversational-ai-designer',
    title: 'Conversational AI Designer',
    department: 'AI & Intelligence Systems',
    classification: 'Core Team',
    location: 'Remote (India)',
    type: 'Full-time',
    description: 'AI Career Coach, AI Therapist personality, conversation flows, escalation logic',
    requirements: [
      'Experience building chatbots/conversational systems',
      'Understanding of therapy/counseling principles (without being a therapist)',
      'NLP and dialogue management expertise',
      'Emotional intelligence in AI design'
    ],
    skillsLabel: 'Systems to Build',
    skills: [
      'AI Career Coach (question-answering, guidance)',
      'AI Career Therapist (emotion-aware, escalates to humans)',
      'Onboarding conversational flows',
      'Decision support dialogues'
    ]
  },
  {
    id: 'data-scientist-user-intelligence',
    title: 'Data Scientist — User Intelligence',
    department: 'AI & Intelligence Systems',
    classification: 'Core Team',
    location: 'Remote (India)',
    type: 'Full-time',
    description: 'Behavioral analysis, pattern recognition, user segmentation, outcome prediction',
    requirements: [
      '3+ years in data science',
      'Expertise in clustering, classification, regression',
      'Behavioral analytics and cohort analysis',
      'Experimentation and A/B testing'
    ],
    skillsLabel: 'Analysis Focus',
    skills: [
      'User journey analysis (drop-offs, progressions)',
      'Career outcome prediction',
      'Mentor-mentee match quality',
      'Content effectiveness measurement'
    ]
  },
  {
    id: 'head-career-domain-intelligence',
    title: 'Head of Career Domain Intelligence',
    department: 'Content & Domain Expertise',
    classification: 'Facilitator',
    location: 'Remote (India)',
    type: 'Part-time',
    description: 'Map all career domains, roles, skills, pathways; maintain real-time industry data',
    requirements: [
      '5+ years in career counseling, HR, or talent development',
      'Deep knowledge of Indian job market across industries',
      'Understanding of skill frameworks (technical + soft skills)',
      'Data-driven approach to career mapping'
    ],
    skillsLabel: 'Deliverables',
    skills: [
      'Comprehensive career domain taxonomy',
      'Role-to-skill mappings',
      'Salary benchmarks by geography',
      'Career progression pathways',
      'Industry trend tracking'
    ]
  },
  {
    id: 'head-entrepreneurship-domain-intelligence',
    title: 'Head of Entrepreneurship Domain Intelligence',
    department: 'Content & Domain Expertise',
    classification: 'Facilitator',
    location: 'Remote (India)',
    type: 'Part-time',
    description: 'Map entrepreneurship pathways, startup ecosystems, validation frameworks, funding landscape',
    requirements: [
      'Founder experience OR deep startup ecosystem involvement',
      'Understanding of validation, MVP, GTM, fundraising stages',
      'Network across VC, accelerators, startup programs',
      'Problem-first thinking (not pitch-deck driven)'
    ],
    skillsLabel: 'Deliverables',
    skills: [
      'Entrepreneurship journey maps',
      'Idea validation frameworks',
      'Funding readiness checklists',
      'Startup ecosystem partnerships',
      'Founder skill development paths'
    ]
  },
  {
    id: 'content-curator',
    title: 'Content Curator — Learning Pathways',
    department: 'Content & Domain Expertise',
    classification: 'Intern',
    location: 'Remote',
    type: 'Internship',
    description: 'Curate learning resources (YouTube, courses, certifications) aligned with career/startup paths',
    requirements: [
      'Experience in educational content curation',
      'Understanding of learning design principles',
      'Quality assessment capabilities',
      'Knowledge of MOOCs, online learning platforms'
    ],
    skillsLabel: 'Curation Approach',
    skills: [
      'Domain-specific learning paths',
      'Skill-based resource mapping',
      'Quality-first (not quantity)',
      'Multiple learning styles (video, text, hands-on)'
    ]
  },
  {
    id: 'technical-writer',
    title: 'Technical Writer — Documentation',
    department: 'Content & Domain Expertise',
    classification: 'Intern',
    location: 'Remote',
    type: 'Internship',
    description: 'Create user guides, help documentation, knowledge base, API documentation',
    requirements: [
      'Technical writing experience',
      'Ability to simplify complex concepts',
      'User-centric documentation approach',
      'SEO and discoverability optimization'
    ],
    skillsLabel: 'Critical Skills',
    skills: [
      'API technical documentation',
      'Help center structuring',
      'SEO-friendly technical articles',
      'Gen Z friendly onboarding guides'
    ]
  },
  {
    id: 'community-manager',
    title: 'Community Manager',
    department: 'Operations & Community',
    classification: 'Volunteer',
    location: 'Remote (India)',
    type: 'Volunteer',
    description: 'Build and nurture user communities, moderate discussions, gather feedback',
    requirements: [
      '2+ years community management experience',
      'Understanding of Gen Z/Alpha communication styles',
      'Empathy and conflict resolution skills',
      'Data-driven community health tracking'
    ],
    skillsLabel: 'Community Types',
    skills: [
      'Domain-based communities (engineering, design, marketing, etc.)',
      'Peer learning groups',
      'Founder circles',
      'Alumni networks'
    ]
  },
  {
    id: 'mentor-network-manager',
    title: 'Mentor Network Manager',
    department: 'Operations & Community',
    classification: 'Facilitator',
    location: 'Remote (India)',
    type: 'Part-time',
    description: 'Recruit, onboard, train, and manage mentor network; ensure quality and engagement',
    requirements: [
      'Experience in mentor program management',
      'Network in professional and startup communities',
      'Quality control and feedback mechanisms',
      'Understanding of matching algorithms (work with AI team)'
    ],
    skillsLabel: 'Key Tasks',
    skills: [
      'Mentor recruitment strategy',
      'Onboarding and training',
      'Quality assurance',
      'Engagement and retention',
      'Performance tracking'
    ]
  },
  {
    id: 'partnerships-manager-institutional',
    title: 'Partnerships Manager — Institutional',
    department: 'Operations & Community',
    classification: 'Core Team',
    location: 'Remote (India)',
    type: 'Full-time',
    description: 'Partner with schools, colleges, corporates, NGOs for scale and access',
    requirements: [
      '3+ years in B2B partnerships or institutional sales',
      'Understanding of education sector',
      'Network in schools/colleges/corporate L&D',
      'Deal structuring and contract negotiation'
    ],
    skillsLabel: 'Partnership Types',
    skills: [
      'Schools and colleges (access to students)',
      'Corporate L&D programs (employee career development)',
      'NGOs (reach underserved communities)',
      'Government programs (skill development initiatives)'
    ]
  },
  {
    id: 'partnerships-manager-industry',
    title: 'Partnerships Manager — Industry',
    department: 'Operations & Community',
    classification: 'Core Team',
    location: 'Remote (India)',
    type: 'Full-time',
    description: 'Partner with companies for job placements, internships, projects, hiring pipelines',
    requirements: [
      'Experience in campus recruitment or talent acquisition',
      'Network across industries',
      'Understanding of hiring needs and skill requirements',
      'Deal closing skills'
    ],
    skillsLabel: 'Partnership Types',
    skills: [
      'Companies (hiring partners)',
      'Startups (internships, projects)',
      'Freelance platforms (gig opportunities)',
      'Venture capital firms (funding connections for entrepreneurs)'
    ]
  },
  {
    id: 'growth-lead',
    title: 'Growth Lead',
    department: 'Marketing & Growth',
    classification: 'Core Team',
    location: 'Remote (India)',
    type: 'Full-time',
    description: 'User acquisition, retention, activation; data-driven growth experimentation',
    requirements: [
      '3+ years in growth marketing',
      'Experience with PLG (product-led growth)',
      'Data analytics and experimentation mindset',
      'Understanding of virality loops and referral systems'
    ],
    skillsLabel: 'Growth Channels',
    skills: [
      'Organic (SEO, content, word-of-mouth)',
      'Paid (Google, Meta, performance marketing)',
      'Partnerships (schools, colleges)',
      'Community-led growth'
    ]
  },
  {
    id: 'content-marketing-manager',
    title: 'Content Marketing Manager',
    department: 'Marketing & Growth',
    classification: 'Core Team',
    location: 'Remote (India)',
    type: 'Full-time',
    description: 'Thought leadership content, SEO, blog, social media, brand storytelling',
    requirements: [
      'Strong writing and storytelling skills',
      'Understanding of MyRaaha\'s voice and tone',
      'SEO and content distribution expertise',
      'Ability to translate complex ideas into accessible content'
    ],
    skillsLabel: 'Content Pillars',
    skills: [
      'Career navigation insights',
      'Entrepreneurship education',
      'Student success stories (real outcomes)',
      'Research and data insights'
    ]
  },
  {
    id: 'social-media-manager',
    title: 'Social Media Manager',
    department: 'Marketing & Growth',
    classification: 'Intern',
    location: 'Remote',
    type: 'Internship',
    description: 'Build brand presence on Instagram, LinkedIn, Twitter/X; engage Gen Z/Alpha audience',
    requirements: [
      'Experience managing social for Gen Z/Alpha brands',
      'Understanding of platform-specific content strategies',
      'Community engagement skills',
      'Data-driven content optimization'
    ],
    skillsLabel: 'Platform Strategy',
    skills: [
      'Instagram (visual storytelling, reels, student journeys)',
      'LinkedIn (thought leadership, B2B partnerships)',
      'Twitter/X (real-time engagement, conversations)',
      'YouTube (long-form content, tutorials)'
    ]
  },
  {
    id: 'performance-marketer',
    title: 'Performance Marketer',
    department: 'Marketing & Growth',
    classification: 'Core Team',
    location: 'Remote (India)',
    type: 'Full-time',
    description: 'Paid acquisition campaigns, CAC optimization, conversion funnel optimization',
    requirements: [
      '2+ years in performance marketing',
      'Expertise in Google Ads, Meta Ads, programmatic',
      'Conversion rate optimization (CRO)',
      'Budget management and ROI tracking'
    ],
    skillsLabel: 'Focus Areas',
    skills: [
      'Student acquisition (Tier 3/4 focus)',
      'B2B lead generation (institutional partnerships)',
      'Retargeting and lifecycle campaigns',
      'Attribution modeling'
    ]
  },
  {
    id: 'user-researcher',
    title: 'User Researcher',
    department: 'Research & Insights',
    classification: 'Intern',
    location: 'Remote',
    type: 'Internship',
    description: 'Conduct qualitative and quantitative research; inform product and design decisions',
    requirements: [
      '3+ years in UX research or behavioral research',
      'Mixed methods expertise (interviews, surveys, usability testing)',
      'Empathy for users at all stages',
      'Data synthesis and storytelling'
    ],
    skillsLabel: 'Research Focus',
    skills: [
      'User journey mapping',
      'Pain point identification',
      'Feature validation',
      'Usability testing',
      'Outcome tracking'
    ]
  },
  {
    id: 'data-analyst-product-analytics',
    title: 'Data Analyst — Product Analytics',
    department: 'Research & Insights',
    classification: 'Intern',
    location: 'Remote',
    type: 'Internship',
    description: 'Track product metrics, user behavior, feature performance, experiment analysis',
    requirements: [
      '2+ years in product analytics',
      'Proficiency in SQL, Python, BI tools (Tableau, Looker)',
      'Experimentation design and analysis',
      'Dashboard creation and data storytelling'
    ],
    skillsLabel: 'Key Metrics',
    skills: [
      'User activation and retention',
      'Feature adoption and usage',
      'Conversion funnels',
      'Outcome achievement rates'
    ]
  },
  {
    id: 'outcomes-researcher',
    title: 'Outcomes Researcher',
    department: 'Research & Insights',
    classification: 'Volunteer',
    location: 'Remote',
    type: 'Volunteer',
    description: 'Track real-world outcomes (jobs, internships, startups launched); measure long-term impact',
    requirements: [
      'Background in impact evaluation or social research',
      'Longitudinal study design experience',
      'Survey design and data collection',
      'Qualitative and quantitative analysis'
    ],
    skillsLabel: 'Outcome Tracking',
    skills: [
      'Job placements and quality',
      'Internship conversions',
      'Entrepreneurship success (MVPs, funding, revenue)',
      'Career transitions and pivots',
      'User satisfaction and NPS'
    ]
  },
  {
    id: 'cfo-finance-manager',
    title: 'Chief Financial Officer (CFO) / Finance Manager',
    department: 'Finance & Administration',
    classification: 'Core Team',
    location: 'Remote (India)',
    type: 'Full-time',
    description: 'Financial planning, budgeting, fundraising support, revenue management',
    requirements: [
      '5+ years in finance (startup or high-growth environment)',
      'Understanding of non-profit accounting AND revenue models',
      'Fundraising and investor relations experience',
      'Financial modeling and forecasting'
    ],
    skillsLabel: 'Responsibilities',
    skills: [
      'Budget management',
      'Revenue tracking (subscriptions, B2B, grants)',
      'Cost optimization',
      'Investor reporting',
      'Compliance and audits'
    ]
  },
  {
    id: 'hr-manager-people-ops',
    title: 'HR Manager / People Operations',
    department: 'Finance & Administration',
    classification: 'Core Team',
    location: 'Remote (India)',
    type: 'Full-time',
    description: 'Hiring, onboarding, culture building, performance management, employee engagement',
    requirements: [
      '3+ years in HR or people ops',
      'Experience in startup environments',
      'Culture-building expertise',
      'Understanding of remote/hybrid work models'
    ],
    skillsLabel: 'Focus Areas',
    skills: [
      'Talent acquisition',
      'Onboarding and training',
      'Performance management',
      'Employee engagement and retention',
      'Compensation and benefits'
    ]
  },
  {
    id: 'administrative-manager',
    title: 'Administrative Manager',
    department: 'Finance & Administration',
    classification: 'Core Team',
    location: 'Remote (India)',
    type: 'Full-time',
    description: 'Office operations, vendor management, legal compliance, logistics',
    requirements: [
      '2+ years in administration or operations',
      'Vendor negotiation and management',
      'Legal and compliance understanding',
      'Multi-tasking and problem-solving'
    ],
    skillsLabel: 'Critical Skills',
    skills: [
      'Vendor negotiation & contract management',
      'Office space logistics & scheduling',
      'Corporate governance and filings',
      'Internal events logistics & facilitation'
    ]
  },
  {
    id: 'legal-counsel',
    title: 'Legal Counsel / Compliance Officer',
    department: 'Legal & Compliance',
    classification: 'Facilitator',
    location: 'Remote (India)',
    type: 'Part-time',
    description: 'Contracts, data privacy, regulatory compliance, IP protection',
    requirements: [
      'Law degree with 3+ years experience',
      'Understanding of Indian laws (IT Act, data privacy, education regulations)',
      'Contract drafting and negotiation',
      'IP and trademark management'
    ],
    skillsLabel: 'Focus Areas',
    skills: [
      'User data privacy (GDPR, DPDP Act)',
      'Terms of service and privacy policy',
      'Partnership agreements',
      'IP protection (trademarks, copyrights)',
      'Regulatory compliance'
    ]
  },
  {
    id: 'head-customer-success',
    title: 'Head of Customer Success',
    department: 'Customer Success & Support',
    classification: 'Core Team',
    location: 'Remote (India)',
    type: 'Full-time',
    description: 'Ensure user success, reduce churn, drive engagement, gather feedback',
    requirements: [
      '4+ years in customer success or account management',
      'Understanding of SaaS metrics (churn, LTV, health scores)',
      'Empathy and problem-solving skills',
      'Data-driven approach to success planning'
    ],
    skillsLabel: 'Responsibilities',
    skills: [
      'Onboarding optimization',
      'User journey monitoring',
      'Proactive outreach (burnout detection, disengagement prevention)',
      'Success story documentation',
      'Escalation management'
    ]
  },
  {
    id: 'customer-support-lead',
    title: 'Customer Support Lead',
    department: 'Customer Success & Support',
    classification: 'Intern',
    location: 'Remote (India)',
    type: 'Internship',
    description: 'Handle user queries, troubleshooting, feedback collection, support ticket management',
    requirements: [
      '2+ years in customer support',
      'Empathy and patience',
      'Multi-channel support experience (email, chat, phone)',
      'Knowledge base management'
    ],
    skillsLabel: 'Support Channels',
    skills: [
      'In-app chat',
      'Email support',
      'WhatsApp support (India-specific)',
      'Help center and FAQs'
    ]
  },
  {
    id: 'qa-engineer',
    title: 'QA Engineer',
    department: 'Quality Assurance',
    classification: 'Intern',
    location: 'Remote (India)',
    type: 'Internship',
    description: 'Test product features, identify bugs, ensure quality before release',
    requirements: [
      '2+ years in QA/testing',
      'Manual and automated testing experience',
      'Understanding of mobile/PWA testing',
      'Bug tracking and documentation'
    ],
    skillsLabel: 'Testing Focus',
    skills: [
      'Functional testing',
      'Usability testing',
      'Performance testing',
      'Security testing',
      'Regression testing'
    ]
  }
];
