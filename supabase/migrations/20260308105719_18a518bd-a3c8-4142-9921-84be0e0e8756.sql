-- Curiosity Compass: Career cards for exploration
CREATE TABLE IF NOT EXISTS public.career_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'general',
  icon_emoji TEXT DEFAULT '🎯',
  tags TEXT[] DEFAULT '{}',
  skills_related TEXT[] DEFAULT '{}',
  difficulty TEXT DEFAULT 'beginner',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User interactions with career cards
CREATE TABLE IF NOT EXISTS public.career_card_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  card_id UUID NOT NULL REFERENCES public.career_cards(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL DEFAULT 'view', -- view, like, save, skip
  time_spent_seconds INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, card_id, interaction_type)
);

-- Curiosity quests (gamified exploration)
CREATE TABLE IF NOT EXISTS public.curiosity_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  quest_type TEXT NOT NULL DEFAULT 'story', -- story, challenge, visual
  category TEXT DEFAULT 'discovery',
  prompts JSONB DEFAULT '[]',
  points INTEGER DEFAULT 10,
  badge_reward TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User progress on curiosity quests
CREATE TABLE IF NOT EXISTS public.curiosity_quest_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  quest_id UUID NOT NULL REFERENCES public.curiosity_quests(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'started', -- started, in_progress, completed
  responses JSONB DEFAULT '{}',
  points_earned INTEGER DEFAULT 0,
  mood_checkpoint TEXT, -- excited, curious, unsure, bored
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at TIMESTAMPTZ,
  UNIQUE(user_id, quest_id)
);

-- Exploration sessions for behavior tracking
CREATE TABLE IF NOT EXISTS public.exploration_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  session_type TEXT NOT NULL DEFAULT 'curiosity_compass',
  mode TEXT DEFAULT 'story', -- story, challenge, visual
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  ended_at TIMESTAMPTZ,
  total_interactions INTEGER DEFAULT 0,
  domains_explored TEXT[] DEFAULT '{}',
  mood_start TEXT,
  mood_end TEXT,
  ai_insights JSONB DEFAULT '{}'
);

-- Domain recommendations based on exploration
CREATE TABLE IF NOT EXISTS public.domain_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  domain_name TEXT NOT NULL,
  description TEXT,
  match_score REAL DEFAULT 0.0,
  reasons TEXT[] DEFAULT '{}',
  status TEXT DEFAULT 'suggested', -- suggested, saved, exploring, dismissed
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS policies
ALTER TABLE public.career_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.career_card_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curiosity_quests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curiosity_quest_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exploration_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.domain_recommendations ENABLE ROW LEVEL SECURITY;

-- Career cards are publicly viewable
CREATE POLICY "Career cards are publicly viewable" ON public.career_cards FOR SELECT USING (true);

-- User interactions policies
CREATE POLICY "Users can CRUD own card interactions" ON public.career_card_interactions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Quests are publicly viewable
CREATE POLICY "Quests are publicly viewable" ON public.curiosity_quests FOR SELECT USING (true);

-- Quest progress policies
CREATE POLICY "Users can CRUD own quest progress" ON public.curiosity_quest_progress FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Exploration sessions policies
CREATE POLICY "Users can CRUD own exploration sessions" ON public.exploration_sessions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Domain recommendations policies
CREATE POLICY "Users can CRUD own domain recommendations" ON public.domain_recommendations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_domain_recommendations_updated_at BEFORE UPDATE ON public.domain_recommendations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed career cards (25 domains)
INSERT INTO public.career_cards (title, description, category, icon_emoji, tags, skills_related) VALUES
('Software Development', 'Build applications and solve problems through code', 'Technology', '💻', ARRAY['coding', 'logic', 'problem-solving'], ARRAY['Programming', 'Algorithms', 'System Design']),
('Data Science', 'Extract insights from data to drive decisions', 'Technology', '📊', ARRAY['analytics', 'statistics', 'ML'], ARRAY['Python', 'Statistics', 'Machine Learning']),
('UX/UI Design', 'Create intuitive and beautiful digital experiences', 'Design', '🎨', ARRAY['creativity', 'empathy', 'visual'], ARRAY['Figma', 'User Research', 'Prototyping']),
('Digital Marketing', 'Connect brands with audiences online', 'Business', '📱', ARRAY['marketing', 'social', 'analytics'], ARRAY['SEO', 'Content Strategy', 'Analytics']),
('Product Management', 'Lead product vision from idea to launch', 'Business', '🚀', ARRAY['strategy', 'leadership', 'tech'], ARRAY['Roadmapping', 'User Research', 'Agile']),
('Content Creation', 'Tell stories that engage and inspire', 'Creative', '✍️', ARRAY['writing', 'storytelling', 'media'], ARRAY['Writing', 'Video Editing', 'Social Media']),
('Healthcare', 'Make a difference in people''s lives and wellbeing', 'Health', '🏥', ARRAY['care', 'science', 'service'], ARRAY['Patient Care', 'Medical Knowledge', 'Empathy']),
('Education', 'Shape minds and inspire the next generation', 'Social Impact', '📚', ARRAY['teaching', 'mentoring', 'learning'], ARRAY['Communication', 'Curriculum Design', 'Psychology']),
('Finance', 'Navigate the world of money and investments', 'Business', '💰', ARRAY['numbers', 'analysis', 'risk'], ARRAY['Financial Analysis', 'Excel', 'Economics']),
('Entrepreneurship', 'Build something from nothing and lead change', 'Business', '🦄', ARRAY['innovation', 'risk', 'vision'], ARRAY['Business Strategy', 'Networking', 'Fundraising']),
('Engineering', 'Design and build solutions to real-world problems', 'STEM', '⚙️', ARRAY['technical', 'design', 'innovation'], ARRAY['CAD', 'Physics', 'Problem Solving']),
('Environmental Science', 'Protect and understand our planet', 'Science', '🌍', ARRAY['sustainability', 'research', 'impact'], ARRAY['Research', 'Data Analysis', 'Environmental Policy']),
('Psychology', 'Understand human behavior and help others thrive', 'Social Science', '🧠', ARRAY['empathy', 'research', 'counseling'], ARRAY['Active Listening', 'Research Methods', 'Therapy Techniques']),
('Law', 'Advocate for justice and navigate complex systems', 'Professional', '⚖️', ARRAY['advocacy', 'analysis', 'ethics'], ARRAY['Legal Research', 'Argumentation', 'Writing']),
('Arts & Entertainment', 'Express creativity and move audiences', 'Creative', '🎭', ARRAY['performance', 'creativity', 'expression'], ARRAY['Performance', 'Creativity', 'Collaboration']),
('Architecture', 'Design spaces that inspire and function beautifully', 'Design', '🏛️', ARRAY['design', 'spatial', 'technical'], ARRAY['CAD', 'Design Principles', 'Project Management']),
('Journalism', 'Uncover truth and inform the public', 'Media', '📰', ARRAY['research', 'writing', 'investigation'], ARRAY['Investigative Research', 'Writing', 'Interviewing']),
('Human Resources', 'Build teams and nurture talent', 'Business', '👥', ARRAY['people', 'organization', 'development'], ARRAY['Recruiting', 'Employee Relations', 'Training']),
('Cybersecurity', 'Protect systems and data from threats', 'Technology', '🔐', ARRAY['security', 'technical', 'analysis'], ARRAY['Network Security', 'Ethical Hacking', 'Risk Assessment']),
('Consulting', 'Solve complex business challenges for clients', 'Business', '💼', ARRAY['strategy', 'analysis', 'communication'], ARRAY['Problem Solving', 'Presentation', 'Industry Knowledge']),
('Research & Academia', 'Push the boundaries of human knowledge', 'Science', '🔬', ARRAY['research', 'analysis', 'discovery'], ARRAY['Research Methods', 'Academic Writing', 'Critical Thinking']),
('Non-Profit & NGO', 'Drive social change and community impact', 'Social Impact', '🤝', ARRAY['service', 'advocacy', 'community'], ARRAY['Fundraising', 'Community Organizing', 'Grant Writing']),
('Sports & Fitness', 'Inspire health and athletic achievement', 'Health', '🏃', ARRAY['fitness', 'coaching', 'wellness'], ARRAY['Training', 'Nutrition', 'Motivation']),
('Hospitality & Tourism', 'Create memorable experiences for travelers', 'Service', '✈️', ARRAY['service', 'travel', 'culture'], ARRAY['Customer Service', 'Event Planning', 'Languages']),
('Agriculture & Food', 'Feed the world sustainably', 'Science', '🌾', ARRAY['sustainability', 'science', 'nature'], ARRAY['Agronomy', 'Supply Chain', 'Sustainability']);

-- Seed curiosity quests
INSERT INTO public.curiosity_quests (title, description, quest_type, category, prompts, points, badge_reward) VALUES
('Discover Your Spark', 'Find what naturally energizes you', 'story', 'self-discovery', '[{"question": "What activities make you lose track of time?", "type": "open"}, {"question": "When do you feel most alive?", "type": "open"}, {"question": "What would you do even without getting paid?", "type": "open"}]', 20, 'spark_finder'),
('Problem Solver Quest', 'Explore how you approach challenges', 'challenge', 'skills', '[{"question": "Describe a recent problem you solved creatively", "type": "open"}, {"question": "Do you prefer working alone or with others on problems?", "type": "choice", "options": ["Alone", "With others", "Depends on the problem"]}, {"question": "What type of problems excite you most?", "type": "multi", "options": ["Technical", "People", "Creative", "Analytical", "Physical"]}]', 25, 'problem_solver'),
('Visual Vibes', 'Discover your aesthetic preferences', 'visual', 'preferences', '[{"question": "Select images that resonate with you", "type": "visual_select"}, {"question": "What colors energize you?", "type": "color_picker"}, {"question": "Choose your ideal work environment", "type": "visual_select"}]', 15, 'visual_thinker'),
('Values Compass', 'Understand what matters most to you', 'story', 'values', '[{"question": "What makes work meaningful to you?", "type": "open"}, {"question": "Rank these values", "type": "ranking", "options": ["Impact", "Creativity", "Stability", "Growth", "Recognition", "Independence"]}, {"question": "Describe your ideal work-life balance", "type": "open"}]', 30, 'values_aligned'),
('Skills Safari', 'Map your natural abilities', 'challenge', 'skills', '[{"question": "What do people often ask for your help with?", "type": "open"}, {"question": "Rate your comfort with these activities", "type": "scale", "options": ["Public speaking", "Writing", "Analysis", "Design", "Organizing", "Teaching"]}, {"question": "Which skills do you want to develop?", "type": "multi", "options": ["Leadership", "Technical", "Creative", "Communication", "Strategic"]}]', 25, 'skill_mapper');
