
-- Badge Templates (system-defined)
CREATE TABLE public.badge_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon_emoji TEXT DEFAULT '🏆',
  points INTEGER DEFAULT 10,
  category TEXT NOT NULL DEFAULT 'exploration',
  unlock_criteria JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.badge_templates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view badge templates" ON public.badge_templates FOR SELECT TO authenticated USING (true);

-- User Streaks
CREATE TABLE public.user_streaks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  streak_type TEXT DEFAULT 'daily_activity',
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_activity_date DATE,
  started_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, streak_type)
);
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own streaks" ON public.user_streaks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Leaderboard Entries (aggregated)
CREATE TABLE public.leaderboard_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  scope TEXT DEFAULT 'global',
  scope_id TEXT,
  total_points INTEGER DEFAULT 0,
  badge_count INTEGER DEFAULT 0,
  streak_days INTEGER DEFAULT 0,
  projects_completed INTEGER DEFAULT 0,
  learning_hours NUMERIC DEFAULT 0,
  rank_position INTEGER,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, scope, scope_id)
);
ALTER TABLE public.leaderboard_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view leaderboard" ON public.leaderboard_entries FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users update own entries" ON public.leaderboard_entries FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users modify own entries" ON public.leaderboard_entries FOR UPDATE TO authenticated USING (auth.uid() = user_id);

-- Peer Endorsements
CREATE TABLE public.peer_endorsements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endorser_id UUID NOT NULL,
  endorsed_id UUID NOT NULL,
  achievement_id UUID REFERENCES public.achievements(id) ON DELETE CASCADE,
  message TEXT,
  endorsement_type TEXT DEFAULT 'shoutout',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.peer_endorsements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users view endorsements" ON public.peer_endorsements FOR SELECT TO authenticated USING (auth.uid() = endorser_id OR auth.uid() = endorsed_id);
CREATE POLICY "Users create endorsements" ON public.peer_endorsements FOR INSERT TO authenticated WITH CHECK (auth.uid() = endorser_id);

-- Milestone Celebrations
CREATE TABLE public.milestone_celebrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  milestone_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  celebration_data JSONB,
  is_seen BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.milestone_celebrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own celebrations" ON public.milestone_celebrations FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Enable realtime for achievements and leaderboard
ALTER PUBLICATION supabase_realtime ADD TABLE public.leaderboard_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.milestone_celebrations;

-- Seed badge templates
INSERT INTO public.badge_templates (type, title, description, icon_emoji, points, category) VALUES
('first_interest', 'Curiosity Spark', 'Added your first interest', '🧭', 10, 'exploration'),
('ten_interests', 'Explorer', 'Mapped 10+ interests', '🌟', 25, 'exploration'),
('first_observation', 'Problem Spotter', 'Logged your first problem observation', '🔍', 15, 'exploration'),
('first_idea_card', 'Idea Collector', 'Interacted with your first idea card', '💡', 10, 'exploration'),
('first_startup_idea', 'Visionary', 'Created your first startup idea', '🎯', 20, 'exploration'),
('first_journal', 'Reflector', 'Wrote your first journal entry', '📝', 10, 'learning'),
('five_journals', 'Deep Thinker', 'Wrote 5 journal entries', '📓', 30, 'learning'),
('first_learning_track', 'Student', 'Started a learning track', '📚', 15, 'learning'),
('first_capsule', 'Knowledge Seeker', 'Completed a learning capsule', '🎓', 15, 'learning'),
('first_project', 'Creator', 'Started your first project', '🚀', 20, 'building'),
('first_lab_plan', 'Lab Scientist', 'Created your first lab plan', '🧪', 20, 'building'),
('first_experiment', 'Experimenter', 'Ran your first MVP experiment', '⚗️', 25, 'building'),
('first_milestone', 'Milestone Maker', 'Completed your first milestone', '🏁', 20, 'building'),
('first_validation', 'Validator', 'Completed a validation sprint', '✅', 30, 'building'),
('first_connection', 'Networker', 'Made your first connection', '🤝', 15, 'collaboration'),
('five_connections', 'Connector', 'Made 5 connections', '🌐', 35, 'collaboration'),
('first_community_join', 'Community Member', 'Joined your first community', '👥', 10, 'community'),
('first_post', 'Voice Found', 'Published your first community post', '📢', 15, 'community'),
('five_posts', 'Thought Leader', 'Published 5 community posts', '🎤', 35, 'community'),
('first_checkin', 'Self-Aware', 'Completed your first mood check-in', '🧘', 10, 'resilience'),
('five_checkins', 'Emotionally Intelligent', 'Completed 5 mood check-ins', '💪', 30, 'resilience'),
('first_habit', 'Habit Former', 'Created your first mindset habit', '🌱', 15, 'resilience'),
('first_challenge', 'Challenge Accepted', 'Started a mindset challenge', '⚔️', 20, 'resilience'),
('first_roadmap', 'Pathfinder', 'Created your first roadmap', '🗺️', 15, 'leadership'),
('founder_profile', 'Founder Identity', 'Completed your founder profile', '👤', 20, 'leadership'),
('first_path', 'Direction Set', 'Selected your first entrepreneurial path', '🧭', 20, 'leadership'),
('first_moodboard', 'Vision Architect', 'Created your first moodboard', '🎨', 15, 'leadership'),
('five_skills', 'Skill Builder', 'Added 5 skills', '🎯', 25, 'learning'),
('ten_skills', 'Skill Master', 'Added 10 skills', '🏅', 50, 'learning'),
('streak_3', 'Consistent', '3-day activity streak', '🔥', 30, 'resilience'),
('streak_7', 'Dedicated', '7-day activity streak', '⚡', 50, 'resilience'),
('streak_14', 'Unstoppable', '14-day activity streak', '💎', 75, 'resilience'),
('streak_30', 'Iron Will', '30-day activity streak', '🏆', 100, 'resilience'),
('hundred_points', 'Centurion', 'Earned 100 total points', '💯', 25, 'leadership'),
('five_hundred_points', 'Legend', 'Earned 500 total points', '👑', 50, 'leadership'),
('first_application', 'Go-Getter', 'Submitted your first job application', '📮', 15, 'exploration'),
('first_mentor_session', 'Guided', 'Completed your first mentor session', '🎓', 20, 'collaboration'),
('first_peer_circle', 'Circle Joiner', 'Joined your first peer circle', '⭕', 15, 'community'),
('first_challenge_complete', 'Challenge Champion', 'Completed a project challenge', '🏅', 30, 'building'),
('first_reflection', 'Thoughtful', 'Wrote your first project reflection', '💭', 10, 'learning');
