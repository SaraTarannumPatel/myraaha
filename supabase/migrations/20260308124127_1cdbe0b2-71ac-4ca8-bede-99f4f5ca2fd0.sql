
-- Job Opportunities
CREATE TABLE public.job_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  company_name TEXT NOT NULL,
  company_logo_url TEXT,
  description TEXT,
  responsibilities TEXT[] DEFAULT '{}',
  required_skills TEXT[] DEFAULT '{}',
  preferred_skills TEXT[] DEFAULT '{}',
  role_type TEXT DEFAULT 'internship',
  location TEXT DEFAULT 'Remote',
  work_mode TEXT DEFAULT 'remote',
  salary_range TEXT,
  duration TEXT,
  experience_level TEXT DEFAULT 'entry',
  domain TEXT DEFAULT 'general',
  application_url TEXT,
  application_deadline TIMESTAMPTZ,
  is_featured BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  posted_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.job_opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active opportunities" ON public.job_opportunities FOR SELECT TO authenticated USING (is_active = true);

-- Career Paths
CREATE TABLE public.career_paths (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  domain TEXT NOT NULL DEFAULT 'general',
  description TEXT,
  day_to_day TEXT,
  tools_certifications TEXT[] DEFAULT '{}',
  salary_range TEXT,
  growth_trajectory TEXT,
  industry_trends TEXT,
  icon_emoji TEXT DEFAULT '💼',
  difficulty TEXT DEFAULT 'intermediate',
  demand_level TEXT DEFAULT 'high',
  related_skills TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.career_paths ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view career paths" ON public.career_paths FOR SELECT TO authenticated USING (true);

-- Company Challenges (paid)
CREATE TABLE public.company_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  problem_statement TEXT,
  required_skills TEXT[] DEFAULT '{}',
  compensation TEXT,
  duration TEXT DEFAULT '1 week',
  max_applicants INTEGER DEFAULT 20,
  current_applicants INTEGER DEFAULT 0,
  domain TEXT DEFAULT 'general',
  status TEXT DEFAULT 'open',
  deadline TIMESTAMPTZ,
  deliverables TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.company_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view open challenges" ON public.company_challenges FOR SELECT TO authenticated USING (status = 'open');

-- Job Applications
CREATE TABLE public.job_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  opportunity_id UUID REFERENCES public.job_opportunities(id) ON DELETE CASCADE,
  company_challenge_id UUID REFERENCES public.company_challenges(id) ON DELETE CASCADE,
  application_type TEXT DEFAULT 'job',
  status TEXT DEFAULT 'applied',
  cover_note TEXT,
  fit_score INTEGER,
  fit_breakdown JSONB,
  applied_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  reminder_date TIMESTAMPTZ,
  notes TEXT
);
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own applications" ON public.job_applications FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Saved Opportunities
CREATE TABLE public.saved_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  opportunity_id UUID REFERENCES public.job_opportunities(id) ON DELETE CASCADE,
  company_challenge_id UUID REFERENCES public.company_challenges(id) ON DELETE CASCADE,
  career_path_id UUID REFERENCES public.career_paths(id) ON DELETE CASCADE,
  save_type TEXT DEFAULT 'bookmark',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, opportunity_id),
  UNIQUE(user_id, company_challenge_id),
  UNIQUE(user_id, career_path_id)
);
ALTER TABLE public.saved_opportunities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own saves" ON public.saved_opportunities FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Opportunity Reflections
CREATE TABLE public.opportunity_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  application_id UUID REFERENCES public.job_applications(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  skills_to_build TEXT[] DEFAULT '{}',
  next_steps TEXT,
  mood TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.opportunity_reflections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reflections" ON public.opportunity_reflections FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Seed Job Opportunities
INSERT INTO public.job_opportunities (title, company_name, description, required_skills, preferred_skills, role_type, location, work_mode, salary_range, duration, experience_level, domain, is_featured) VALUES
('Junior Frontend Developer', 'TechStart Inc.', 'Build modern web interfaces using React and TypeScript. Work with a growing startup team on real products.', ARRAY['React', 'TypeScript', 'CSS', 'Git'], ARRAY['Next.js', 'Tailwind'], 'internship', 'Remote', 'remote', '₹15K-25K/month', '6 months', 'entry', 'tech', true),
('Data Analyst Intern', 'DataCo Analytics', 'Analyze datasets, create dashboards, and present insights to stakeholders. Great learning opportunity.', ARRAY['Python', 'SQL', 'Excel'], ARRAY['Tableau', 'Power BI'], 'internship', 'Bengaluru', 'hybrid', '₹20K-30K/month', '3 months', 'entry', 'data', true),
('UX Design Apprentice', 'DesignLab Studio', 'Join our design team to conduct user research, create wireframes, and build prototypes.', ARRAY['Figma', 'User Research', 'Prototyping'], ARRAY['Adobe XD', 'Sketch'], 'part-time', 'Remote', 'remote', '₹12K-18K/month', '4 months', 'entry', 'design', true),
('Marketing Associate', 'GrowthHub', 'Drive content strategy, manage social campaigns, and track marketing analytics.', ARRAY['Content Writing', 'Analytics', 'SEO'], ARRAY['Google Ads', 'HubSpot'], 'full-time', 'Mumbai', 'onsite', '₹30K-45K/month', 'Permanent', 'mid', 'marketing', false),
('Product Management Fellow', 'BuildIt Labs', 'Work directly with founders on product strategy, user analytics, and feature prioritization.', ARRAY['Strategy', 'Analytics', 'Communication'], ARRAY['Jira', 'SQL'], 'fellowship', 'Hybrid', 'hybrid', '₹25K-35K/month', '6 months', 'entry', 'business', true),
('Full-Stack Developer', 'CodeCraft Solutions', 'Build and maintain web applications using modern full-stack technologies.', ARRAY['Node.js', 'React', 'MongoDB', 'APIs'], ARRAY['Docker', 'AWS'], 'full-time', 'Remote', 'remote', '₹40K-60K/month', 'Permanent', 'mid', 'tech', false),
('Content Writer Intern', 'MediaPulse', 'Create engaging blog posts, social media content, and marketing copy for tech brands.', ARRAY['Writing', 'Research', 'SEO'], ARRAY['WordPress', 'Canva'], 'internship', 'Remote', 'remote', '₹10K-15K/month', '3 months', 'entry', 'marketing', false),
('AI/ML Research Intern', 'DeepMind Labs India', 'Assist with machine learning experiments, data preprocessing, and model evaluation.', ARRAY['Python', 'Machine Learning', 'Statistics'], ARRAY['TensorFlow', 'PyTorch'], 'internship', 'Bengaluru', 'hybrid', '₹25K-40K/month', '6 months', 'entry', 'data', true);

-- Seed Career Paths
INSERT INTO public.career_paths (title, domain, description, day_to_day, tools_certifications, salary_range, growth_trajectory, industry_trends, icon_emoji, difficulty, demand_level, related_skills) VALUES
('Frontend Developer', 'tech', 'Build user-facing web applications with modern frameworks. Focus on performance, accessibility, and beautiful interfaces.', 'Write React/Vue components, collaborate with designers, review PRs, optimize performance, fix bugs.', ARRAY['React', 'TypeScript', 'Figma', 'Git', 'AWS Certified Cloud Practitioner'], '₹4L-20L/year', 'Junior → Mid → Senior → Lead → Principal → CTO', 'High demand for React/Next.js. AI-assisted coding growing. Web3 frontend emerging.', '💻', 'intermediate', 'very-high', ARRAY['HTML', 'CSS', 'JavaScript', 'React', 'TypeScript']),
('Data Scientist', 'data', 'Extract insights from data using statistics, ML, and visualization to drive business decisions.', 'Clean data, build models, create visualizations, present findings, A/B testing, stakeholder meetings.', ARRAY['Python', 'SQL', 'Tableau', 'TensorFlow', 'Google Data Analytics Certificate'], '₹6L-30L/year', 'Analyst → Data Scientist → Senior DS → Lead → Head of Data → CDO', 'GenAI integration, real-time analytics, data mesh architecture gaining traction.', '📊', 'advanced', 'very-high', ARRAY['Python', 'SQL', 'Statistics', 'Machine Learning', 'Visualization']),
('UX Designer', 'design', 'Design intuitive, user-centered digital experiences by combining research, strategy, and visual design.', 'User interviews, wireframing, prototyping, usability testing, design system maintenance, stakeholder presentations.', ARRAY['Figma', 'Adobe XD', 'Miro', 'Google UX Design Certificate'], '₹4L-18L/year', 'Junior Designer → UX Designer → Senior → Lead → Design Director → VP Design', 'AI-powered design tools, voice UI, inclusive design, design systems at scale.', '🎨', 'intermediate', 'high', ARRAY['Figma', 'Research', 'Prototyping', 'Visual Design', 'Interaction Design']),
('Product Manager', 'business', 'Own product strategy, prioritize features, and bridge engineering, design, and business teams.', 'Sprint planning, user story writing, data analysis, stakeholder alignment, roadmap updates, competitor research.', ARRAY['Jira', 'SQL', 'Analytics tools', 'Product School Certification'], '₹8L-35L/year', 'APM → PM → Senior PM → Group PM → Director → VP Product → CPO', 'AI product management, PLG strategies, outcome-driven development.', '🚀', 'advanced', 'very-high', ARRAY['Strategy', 'Analytics', 'Communication', 'SQL', 'User Research']),
('Digital Marketer', 'marketing', 'Plan and execute digital campaigns across channels to drive growth, engagement, and conversions.', 'Campaign management, content creation, analytics review, A/B testing, SEO optimization, social media.', ARRAY['Google Ads', 'HubSpot', 'Google Analytics', 'Meta Blueprint Certificate'], '₹3L-15L/year', 'Intern → Associate → Manager → Senior Manager → Head of Marketing → CMO', 'AI content generation, short-form video dominance, privacy-first marketing.', '📣', 'beginner', 'high', ARRAY['SEO', 'Content', 'Analytics', 'Social Media', 'Copywriting']);

-- Seed Company Challenges
INSERT INTO public.company_challenges (company_name, title, description, problem_statement, required_skills, compensation, duration, max_applicants, domain, deadline, deliverables) VALUES
('EcoTech Solutions', 'Sustainability Dashboard Design', 'Design an intuitive dashboard for tracking carbon footprint metrics for small businesses.', 'Small businesses lack simple tools to monitor and reduce their environmental impact. Design a dashboard that makes sustainability data actionable.', ARRAY['Figma', 'Data Visualization', 'UX Research'], '₹15,000', '2 weeks', 15, 'design', now() + interval '14 days', ARRAY['High-fidelity mockups', 'User flow diagram', 'Design rationale document']),
('HealthBridge AI', 'Patient Data Analysis', 'Analyze anonymized patient data to identify patterns in treatment outcomes across demographics.', 'Healthcare providers need better insights into treatment efficacy across different patient groups. Analyze the dataset and present actionable findings.', ARRAY['Python', 'SQL', 'Statistics', 'Data Visualization'], '₹25,000', '3 weeks', 10, 'data', now() + interval '21 days', ARRAY['Analysis notebook', 'Visualization dashboard', 'Executive summary']),
('StartupGrid', 'Landing Page Optimization', 'Redesign and optimize a SaaS landing page to improve conversion rates using A/B testing principles.', 'Our current landing page has a 2% conversion rate. We need data-driven redesign proposals to improve this to 5%+.', ARRAY['HTML/CSS', 'Copywriting', 'Analytics', 'A/B Testing'], '₹10,000', '1 week', 20, 'marketing', now() + interval '10 days', ARRAY['Redesigned page mockup', 'A/B test plan', 'Copy recommendations']);
