
-- Project Challenges (Challenge Vault)
CREATE TABLE public.project_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  domain TEXT NOT NULL DEFAULT 'general',
  difficulty TEXT DEFAULT 'beginner',
  duration_estimate TEXT DEFAULT '1 week',
  learning_objectives TEXT[] DEFAULT '{}',
  expected_outcomes TEXT[] DEFAULT '{}',
  tools_resources TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  points INTEGER DEFAULT 10,
  icon_emoji TEXT DEFAULT '🎯',
  is_featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.project_challenges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view challenges" ON public.project_challenges FOR SELECT TO authenticated USING (true);

-- Hackathons & Competitions
CREATE TABLE public.project_hackathons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  domain TEXT DEFAULT 'general',
  start_date TIMESTAMPTZ,
  end_date TIMESTAMPTZ,
  max_participants INTEGER DEFAULT 50,
  current_participants INTEGER DEFAULT 0,
  difficulty TEXT DEFAULT 'intermediate',
  prizes TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'upcoming',
  is_team_based BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.project_hackathons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view hackathons" ON public.project_hackathons FOR SELECT TO authenticated USING (true);

-- Hackathon Participants
CREATE TABLE public.hackathon_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  hackathon_id UUID REFERENCES public.project_hackathons(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  team_name TEXT,
  role TEXT DEFAULT 'participant',
  joined_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.hackathon_participants ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own participation" ON public.hackathon_participants FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users join hackathons" ON public.hackathon_participants FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users leave hackathons" ON public.hackathon_participants FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Project Tasks (sub-tasks within a project)
CREATE TABLE public.project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'todo',
  priority TEXT DEFAULT 'medium',
  due_date TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own tasks" ON public.project_tasks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Project Collaborators
CREATE TABLE public.project_collaborators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  role TEXT DEFAULT 'collaborator',
  invited_by UUID,
  status TEXT DEFAULT 'active',
  joined_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.project_collaborators ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view collaborators" ON public.project_collaborators FOR SELECT TO authenticated USING (auth.uid() = user_id OR auth.uid() = invited_by);
CREATE POLICY "Users add collaborators" ON public.project_collaborators FOR INSERT TO authenticated WITH CHECK (auth.uid() = invited_by);

-- Project Reflections
CREATE TABLE public.project_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  reflection_type TEXT DEFAULT 'post_task',
  content TEXT NOT NULL,
  challenges_faced TEXT,
  lessons_learned TEXT,
  skills_developed TEXT[] DEFAULT '{}',
  mood TEXT,
  energy_level INTEGER,
  ai_feedback JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.project_reflections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own reflections" ON public.project_reflections FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Project Feedback (from mentors/peers)
CREATE TABLE public.project_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID NOT NULL,
  reviewee_id UUID NOT NULL,
  feedback_type TEXT DEFAULT 'peer',
  rating INTEGER,
  strengths TEXT,
  improvements TEXT,
  comments TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.project_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view own feedback" ON public.project_feedback FOR SELECT TO authenticated USING (auth.uid() = reviewee_id OR auth.uid() = reviewer_id);
CREATE POLICY "Users give feedback" ON public.project_feedback FOR INSERT TO authenticated WITH CHECK (auth.uid() = reviewer_id);

-- Project Progress Logs
CREATE TABLE public.project_progress_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  log_type TEXT DEFAULT 'update',
  description TEXT,
  time_spent_minutes INTEGER DEFAULT 0,
  skills_practiced TEXT[] DEFAULT '{}',
  mood TEXT,
  energy_level INTEGER,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.project_progress_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own logs" ON public.project_progress_logs FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Challenge Enrollments
CREATE TABLE public.challenge_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID REFERENCES public.project_challenges(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  status TEXT DEFAULT 'enrolled',
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  reflection TEXT,
  points_earned INTEGER DEFAULT 0,
  UNIQUE(challenge_id, user_id)
);

ALTER TABLE public.challenge_enrollments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own enrollments" ON public.challenge_enrollments FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Seed Challenge Vault
INSERT INTO public.project_challenges (title, description, domain, difficulty, duration_estimate, learning_objectives, tools_resources, tags, points, icon_emoji, is_featured) VALUES
('Build a Portfolio Website', 'Design and develop a personal portfolio showcasing your skills, projects, and learning journey.', 'tech', 'beginner', '1 week', ARRAY['HTML/CSS basics', 'Responsive design', 'Personal branding'], ARRAY['Figma', 'VS Code', 'GitHub Pages'], ARRAY['web', 'design', 'portfolio'], 15, '🌐', true),
('Data Analysis Dashboard', 'Analyze a real dataset and create an interactive dashboard to present insights and patterns.', 'data', 'intermediate', '2 weeks', ARRAY['Data cleaning', 'Visualization', 'Statistical analysis'], ARRAY['Python', 'Pandas', 'Tableau'], ARRAY['data', 'analytics', 'visualization'], 25, '📊', true),
('Mobile App Prototype', 'Design and prototype a mobile app solving a real user problem using design thinking principles.', 'design', 'advanced', '3 weeks', ARRAY['User research', 'Wireframing', 'Prototyping', 'Usability testing'], ARRAY['Figma', 'Marvel', 'User interviews'], ARRAY['mobile', 'UX', 'prototype'], 35, '📱', true),
('Social Impact Campaign', 'Plan and execute a social media campaign for a cause you care about, tracking engagement metrics.', 'marketing', 'beginner', '1 week', ARRAY['Content strategy', 'Social media marketing', 'Analytics'], ARRAY['Canva', 'Buffer', 'Google Analytics'], ARRAY['marketing', 'social', 'impact'], 15, '📣', false),
('Business Model Canvas', 'Develop a complete business model canvas for a startup idea, validating assumptions with research.', 'business', 'intermediate', '2 weeks', ARRAY['Business modeling', 'Market research', 'Value proposition'], ARRAY['Lean Canvas', 'Google Forms', 'Notion'], ARRAY['business', 'startup', 'strategy'], 25, '💼', true),
('AI Chatbot Builder', 'Build a simple AI-powered chatbot that answers FAQs for a fictional or real organization.', 'tech', 'advanced', '3 weeks', ARRAY['NLP basics', 'API integration', 'Conversation design'], ARRAY['Python', 'OpenAI API', 'Streamlit'], ARRAY['AI', 'chatbot', 'automation'], 35, '🤖', false),
('Community Research Project', 'Conduct user research in your local community to identify problems and propose solutions.', 'research', 'beginner', '1 week', ARRAY['Interview techniques', 'Survey design', 'Problem framing'], ARRAY['Google Forms', 'Miro', 'Notion'], ARRAY['research', 'community', 'UX'], 15, '🔍', false),
('Financial Literacy Toolkit', 'Create an educational toolkit teaching financial basics to young adults.', 'education', 'intermediate', '2 weeks', ARRAY['Content creation', 'Financial concepts', 'Instructional design'], ARRAY['Canva', 'Notion', 'Google Slides'], ARRAY['education', 'finance', 'toolkit'], 25, '💰', false);

-- Seed Hackathons
INSERT INTO public.project_hackathons (title, description, domain, start_date, end_date, max_participants, difficulty, prizes, tags, status, is_team_based) VALUES
('Innovation Sprint 2026', 'A 48-hour sprint to build solutions for urban sustainability challenges.', 'social-impact', now() + interval '7 days', now() + interval '9 days', 100, 'intermediate', ARRAY['Featured on platform', 'Mentor sessions', 'Certificate'], ARRAY['sustainability', 'innovation', 'teamwork'], 'upcoming', true),
('Design Thinking Challenge', 'Apply human-centered design to solve real user problems in healthcare.', 'design', now() + interval '14 days', now() + interval '16 days', 60, 'beginner', ARRAY['Portfolio feature', 'Skill badges', 'Peer recognition'], ARRAY['design', 'healthcare', 'UX'], 'upcoming', true),
('Data for Good Hackathon', 'Use open datasets to create visualizations and insights for social good.', 'data', now() + interval '21 days', now() + interval '23 days', 80, 'advanced', ARRAY['Industry mentorship', 'Internship referrals', 'Certificates'], ARRAY['data', 'social-good', 'analytics'], 'upcoming', false);
