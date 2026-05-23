
-- Mentors table (can be platform users or external experts)
CREATE TABLE public.mentors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  bio TEXT,
  expertise_areas TEXT[] DEFAULT '{}',
  industries TEXT[] DEFAULT '{}',
  experience_years INTEGER DEFAULT 0,
  availability TEXT DEFAULT 'flexible',
  focus_areas TEXT[] DEFAULT '{}',
  mentee_focus TEXT DEFAULT 'all',
  past_projects JSONB DEFAULT '[]',
  achievements TEXT[] DEFAULT '{}',
  rating REAL DEFAULT 5.0,
  total_reviews INTEGER DEFAULT 0,
  total_sessions INTEGER DEFAULT 0,
  is_verified BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  profile_image_url TEXT,
  linkedin_url TEXT,
  calendar_link TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Mentorship requests
CREATE TABLE public.mentorship_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  message TEXT,
  goals TEXT,
  preferred_topics TEXT[] DEFAULT '{}',
  urgency TEXT DEFAULT 'normal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Mentorship sessions (1:1 or group)
CREATE TABLE public.mentorship_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE NOT NULL,
  session_type TEXT NOT NULL DEFAULT 'one_on_one',
  title TEXT NOT NULL,
  description TEXT,
  topics TEXT[] DEFAULT '{}',
  scheduled_at TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 30,
  meeting_link TEXT,
  status TEXT DEFAULT 'scheduled',
  max_participants INTEGER DEFAULT 1,
  current_participants INTEGER DEFAULT 0,
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Session participants
CREATE TABLE public.session_participants (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.mentorship_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'registered',
  joined_at TIMESTAMPTZ DEFAULT now(),
  notes TEXT,
  UNIQUE(session_id, user_id)
);

-- Mentor reviews/feedback
CREATE TABLE public.mentor_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  session_id UUID REFERENCES public.mentorship_sessions(id) ON DELETE SET NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  helpfulness_score INTEGER CHECK (helpfulness_score >= 1 AND helpfulness_score <= 5),
  communication_score INTEGER CHECK (communication_score >= 1 AND communication_score <= 5),
  expertise_score INTEGER CHECK (expertise_score >= 1 AND expertise_score <= 5),
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Mentor bookmarks (saved mentors)
CREATE TABLE public.mentor_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mentor_id UUID REFERENCES public.mentors(id) ON DELETE CASCADE NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, mentor_id)
);

-- Group mentorship pods
CREATE TABLE public.mentorship_pods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  mentor_id UUID REFERENCES public.mentors(id) ON DELETE SET NULL,
  domain TEXT DEFAULT 'general',
  topics TEXT[] DEFAULT '{}',
  max_members INTEGER DEFAULT 10,
  member_count INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  is_moderated BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Pod members
CREATE TABLE public.pod_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_id UUID REFERENCES public.mentorship_pods(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(pod_id, user_id)
);

-- Pod discussions
CREATE TABLE public.pod_discussions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pod_id UUID REFERENCES public.mentorship_pods(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  discussion_type TEXT DEFAULT 'question',
  replies_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  is_pinned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Mentorship interaction logs (for Living Resume integration)
CREATE TABLE public.mentorship_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  mentor_id UUID REFERENCES public.mentors(id) ON DELETE SET NULL,
  session_id UUID REFERENCES public.mentorship_sessions(id) ON DELETE SET NULL,
  interaction_type TEXT NOT NULL,
  summary TEXT,
  skills_discussed TEXT[] DEFAULT '{}',
  outcomes TEXT[] DEFAULT '{}',
  mood_before TEXT,
  mood_after TEXT,
  reflection TEXT,
  ai_insights JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AI mentor nudges
CREATE TABLE public.mentor_nudges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  nudge_type TEXT NOT NULL,
  message TEXT NOT NULL,
  suggested_mentor_ids UUID[] DEFAULT '{}',
  reason TEXT,
  is_read BOOLEAN DEFAULT false,
  is_actioned BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.mentors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_pods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pod_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pod_discussions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentorship_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_nudges ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Mentors are publicly viewable" ON public.mentors FOR SELECT USING (is_active = true);
CREATE POLICY "Users can manage own mentor profile" ON public.mentors FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own mentorship requests" ON public.mentorship_requests FOR ALL USING (auth.uid() = mentee_id) WITH CHECK (auth.uid() = mentee_id);
CREATE POLICY "Mentors can view requests to them" ON public.mentorship_requests FOR SELECT USING (EXISTS (SELECT 1 FROM public.mentors WHERE id = mentor_id AND user_id = auth.uid()));

CREATE POLICY "Sessions are publicly viewable" ON public.mentorship_sessions FOR SELECT USING (true);
CREATE POLICY "Mentors can manage own sessions" ON public.mentorship_sessions FOR ALL USING (EXISTS (SELECT 1 FROM public.mentors WHERE id = mentor_id AND user_id = auth.uid()));

CREATE POLICY "Users can CRUD own session participations" ON public.session_participants FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Session participants are viewable" ON public.session_participants FOR SELECT USING (true);

CREATE POLICY "Reviews are publicly viewable" ON public.mentor_reviews FOR SELECT USING (true);
CREATE POLICY "Users can create reviews" ON public.mentor_reviews FOR INSERT WITH CHECK (auth.uid() = reviewer_id);
CREATE POLICY "Users can update own reviews" ON public.mentor_reviews FOR UPDATE USING (auth.uid() = reviewer_id);

CREATE POLICY "Users can CRUD own bookmarks" ON public.mentor_bookmarks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Pods are publicly viewable" ON public.mentorship_pods FOR SELECT USING (is_active = true);

CREATE POLICY "Users can CRUD own pod memberships" ON public.pod_members FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Pod members are viewable" ON public.pod_members FOR SELECT USING (true);

CREATE POLICY "Pod discussions are viewable by members" ON public.pod_discussions FOR SELECT USING (true);
CREATE POLICY "Members can create discussions" ON public.pod_discussions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authors can update discussions" ON public.pod_discussions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Authors can delete discussions" ON public.pod_discussions FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can CRUD own interactions" ON public.mentorship_interactions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own nudges" ON public.mentor_nudges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can create nudges" ON public.mentor_nudges FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own nudges" ON public.mentor_nudges FOR UPDATE USING (auth.uid() = user_id);

-- Triggers for updated_at
CREATE TRIGGER update_mentors_updated_at BEFORE UPDATE ON public.mentors FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mentorship_requests_updated_at BEFORE UPDATE ON public.mentorship_requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mentorship_sessions_updated_at BEFORE UPDATE ON public.mentorship_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_mentorship_pods_updated_at BEFORE UPDATE ON public.mentorship_pods FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_pod_discussions_updated_at BEFORE UPDATE ON public.pod_discussions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Seed initial mentors
INSERT INTO public.mentors (name, bio, expertise_areas, industries, experience_years, availability, focus_areas, mentee_focus, rating, is_verified) VALUES
('Dr. Sarah Chen', '10+ years in machine learning research. Loves helping newcomers break into AI.', ARRAY['AI/ML', 'Data Science', 'Python'], ARRAY['Tech', 'Research'], 12, 'weekly', ARRAY['Career Planning', 'Skill Building'], 'beginners', 4.9, true),
('Raj Patel', 'Ex-Google PM, now advising early-stage startups on product strategy.', ARRAY['Product Management', 'Startups', 'Strategy'], ARRAY['Tech', 'Startups'], 8, 'bi-weekly', ARRAY['Startup Guidance', 'Product Strategy'], 'all', 4.8, true),
('Maya Johnson', 'Design leader passionate about mentoring the next generation of UX professionals.', ARRAY['UX Design', 'Research', 'Design Thinking'], ARRAY['Design', 'Tech'], 10, 'monthly', ARRAY['Skill Building', 'Portfolio Review'], 'all', 4.7, true),
('Alex Kim', 'CTO at a Series B startup. Open to mentoring aspiring engineers on architecture and leadership.', ARRAY['Full-Stack Dev', 'Cloud', 'System Design'], ARRAY['Tech', 'Startups'], 15, 'weekly', ARRAY['Technical Guidance', 'Career Planning'], 'intermediate', 4.9, true),
('Priya Sharma', 'Growth marketer who scaled 3 startups from 0 to 1M users.', ARRAY['Marketing', 'Growth', 'Analytics'], ARRAY['Marketing', 'Startups'], 7, 'bi-weekly', ARRAY['Startup Guidance', 'Marketing Strategy'], 'all', 4.6, true),
('Tom Roberts', 'Angel investor and CFO mentor for early-stage founders.', ARRAY['Finance', 'Fundraising', 'Business Strategy'], ARRAY['Finance', 'Startups'], 20, 'monthly', ARRAY['Fundraising', 'Financial Planning'], 'founders', 4.8, true),
('Emily Zhang', 'Senior Software Engineer at Meta. Passionate about helping women in tech.', ARRAY['Frontend', 'React', 'Career Growth'], ARRAY['Tech'], 9, 'weekly', ARRAY['Career Planning', 'Interview Prep'], 'all', 4.9, true),
('James Wilson', 'Serial entrepreneur with 3 successful exits. Focus on B2B SaaS.', ARRAY['Entrepreneurship', 'Sales', 'B2B'], ARRAY['Startups', 'SaaS'], 18, 'bi-weekly', ARRAY['Startup Guidance', 'Sales Strategy'], 'founders', 4.7, true);

-- Seed mentorship pods
INSERT INTO public.mentorship_pods (name, description, domain, topics, max_members) VALUES
('AI Explorers Circle', 'A collaborative group for those exploring AI and machine learning careers.', 'Tech', ARRAY['AI', 'Machine Learning', 'Career Planning'], 15),
('Founder''s Journey', 'Peer support and mentorship for early-stage startup founders.', 'Startups', ARRAY['Entrepreneurship', 'Product', 'Fundraising'], 12),
('Design Thinkers Hub', 'Learn and grow together in UX design and product thinking.', 'Design', ARRAY['UX', 'Product Design', 'Research'], 10),
('Career Changers Support', 'A safe space for professionals navigating career transitions.', 'Career', ARRAY['Career Change', 'Skill Building', 'Networking'], 20);
