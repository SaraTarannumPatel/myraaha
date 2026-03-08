-- Learning Tracks table (structured learning paths for Content Library)
CREATE TABLE public.learning_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  domain TEXT DEFAULT 'general',
  difficulty TEXT DEFAULT 'beginner',
  estimated_hours INTEGER DEFAULT 5,
  skills_gained TEXT[] DEFAULT '{}',
  prerequisites TEXT[] DEFAULT '{}',
  format TEXT DEFAULT 'mixed',
  is_starter_pack BOOLEAN DEFAULT false,
  is_certification BOOLEAN DEFAULT false,
  icon_emoji TEXT DEFAULT '📚',
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Learning Track Modules
CREATE TABLE public.learning_track_modules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  track_id UUID NOT NULL REFERENCES public.learning_tracks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  content TEXT,
  module_type TEXT DEFAULT 'lesson',
  duration_minutes INTEGER DEFAULT 15,
  order_index INTEGER DEFAULT 0,
  resources JSONB DEFAULT '[]',
  quiz JSONB DEFAULT '[]',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Content Bookmarks
CREATE TABLE public.content_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  content_type TEXT NOT NULL,
  content_id UUID NOT NULL,
  collection TEXT DEFAULT 'Saved',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_type, content_id)
);

-- Skill Applications
CREATE TABLE public.skill_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_name TEXT NOT NULL,
  applicable_roles TEXT[] DEFAULT '{}',
  applicable_domains TEXT[] DEFAULT '{}',
  project_ideas TEXT[] DEFAULT '{}',
  startup_applications TEXT[] DEFAULT '{}',
  growth_potential TEXT DEFAULT 'medium',
  demand_level TEXT DEFAULT 'moderate',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.learning_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_track_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.content_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_applications ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Learning tracks publicly viewable" ON public.learning_tracks FOR SELECT USING (true);
CREATE POLICY "Learning modules publicly viewable" ON public.learning_track_modules FOR SELECT USING (true);
CREATE POLICY "Users can CRUD own content bookmarks" ON public.content_bookmarks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Skill applications publicly viewable" ON public.skill_applications FOR SELECT USING (true);

-- Seed Learning Tracks
INSERT INTO public.learning_tracks (title, description, category, domain, difficulty, estimated_hours, skills_gained, is_starter_pack, icon_emoji, order_index) VALUES
('Getting Started with Tech Careers', 'A beginner-friendly introduction to various tech career paths', 'starter', 'Tech', 'beginner', 3, ARRAY['career awareness', 'tech basics', 'goal setting'], true, '🚀', 1),
('Design Thinking Fundamentals', 'Learn the human-centered approach to problem solving', 'design', 'Design', 'beginner', 4, ARRAY['empathy mapping', 'ideation', 'prototyping', 'user research'], true, '🎨', 2),
('Leadership Essentials', 'Core leadership skills for emerging professionals', 'leadership', 'Leadership', 'intermediate', 6, ARRAY['communication', 'decision making', 'team building', 'conflict resolution'], false, '👔', 3),
('Startup Foundations', 'Everything you need to know before launching', 'entrepreneurship', 'Entrepreneurship', 'intermediate', 8, ARRAY['business model', 'market research', 'pitching', 'MVP development'], false, '💡', 4),
('Data Literacy Basics', 'Understanding data in the modern workplace', 'tech', 'Tech', 'beginner', 4, ARRAY['data analysis', 'visualization', 'spreadsheets', 'critical thinking'], true, '📊', 5),
('Communication Mastery', 'Written and verbal communication for professionals', 'soft-skills', 'Leadership', 'beginner', 5, ARRAY['writing', 'presentation', 'active listening', 'feedback'], true, '💬', 6),
('Product Management 101', 'Introduction to building products users love', 'tech', 'Tech', 'intermediate', 10, ARRAY['user stories', 'roadmapping', 'prioritization', 'analytics'], false, '📦', 7),
('Marketing Fundamentals', 'Core marketing concepts and strategies', 'marketing', 'Marketing', 'beginner', 6, ARRAY['branding', 'content strategy', 'social media', 'analytics'], true, '📣', 8),
('Financial Literacy for Careers', 'Understanding money, budgets, and career economics', 'finance', 'Finance', 'beginner', 4, ARRAY['budgeting', 'salary negotiation', 'investing basics'], true, '💰', 9),
('Healthcare Career Pathways', 'Exploring opportunities in the health sector', 'healthcare', 'Healthcare', 'beginner', 5, ARRAY['health systems', 'patient care', 'medical ethics'], true, '🏥', 10);

-- Seed Skill Applications
INSERT INTO public.skill_applications (skill_name, applicable_roles, applicable_domains, project_ideas, startup_applications, growth_potential, demand_level) VALUES
('Problem Solving', ARRAY['Product Manager', 'Consultant', 'Engineer', 'Analyst'], ARRAY['Tech', 'Finance', 'Healthcare'], ARRAY['Build a task optimizer', 'Create a decision framework'], ARRAY['Customer pain point analysis', 'MVP prioritization'], 'high', 'very_high'),
('Communication', ARRAY['Marketing Manager', 'Sales Rep', 'HR', 'Manager'], ARRAY['All'], ARRAY['Write a blog series', 'Create presentation deck'], ARRAY['Pitch deck creation', 'Investor updates'], 'high', 'very_high'),
('Data Analysis', ARRAY['Data Analyst', 'Business Analyst', 'Researcher'], ARRAY['Tech', 'Finance', 'Marketing'], ARRAY['Dashboard project', 'Survey analysis'], ARRAY['Market sizing', 'User behavior analysis'], 'very_high', 'very_high'),
('Leadership', ARRAY['Team Lead', 'Manager', 'Director', 'Founder'], ARRAY['All'], ARRAY['Lead a community project', 'Mentor juniors'], ARRAY['Team building', 'Culture definition'], 'high', 'high'),
('Design Thinking', ARRAY['UX Designer', 'Product Manager', 'Innovation Lead'], ARRAY['Tech', 'Design', 'Consulting'], ARRAY['Redesign a local service', 'User research project'], ARRAY['Product ideation', 'Customer journey mapping'], 'high', 'high'),
('Coding Basics', ARRAY['Developer', 'Data Scientist', 'QA Engineer'], ARRAY['Tech'], ARRAY['Build a personal website', 'Automate a task'], ARRAY['MVP development', 'Prototype building'], 'very_high', 'very_high'),
('Marketing', ARRAY['Marketing Manager', 'Content Creator', 'Growth Hacker'], ARRAY['Marketing', 'Entrepreneurship'], ARRAY['Social media campaign', 'Content calendar'], ARRAY['Go-to-market strategy', 'User acquisition'], 'high', 'high'),
('Financial Literacy', ARRAY['Finance Analyst', 'Accountant', 'Entrepreneur'], ARRAY['Finance', 'Entrepreneurship'], ARRAY['Personal budget app', 'Investment tracker'], ARRAY['Financial modeling', 'Fundraising prep'], 'high', 'moderate');