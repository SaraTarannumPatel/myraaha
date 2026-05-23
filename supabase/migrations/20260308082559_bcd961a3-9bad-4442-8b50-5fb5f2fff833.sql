
-- Mindset habits table for tracking daily/weekly routines
CREATE TABLE public.mindset_habits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  frequency TEXT NOT NULL DEFAULT 'daily',
  category TEXT NOT NULL DEFAULT 'discipline',
  is_active BOOLEAN DEFAULT true,
  streak INTEGER DEFAULT 0,
  best_streak INTEGER DEFAULT 0,
  last_completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habit completions log
CREATE TABLE public.habit_completions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  habit_id UUID NOT NULL REFERENCES public.mindset_habits(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  notes TEXT
);

-- Learning tracks for personalized mindset paths
CREATE TABLE public.mindset_learning_tracks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'growth_mindset',
  difficulty TEXT DEFAULT 'beginner',
  modules JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User progress on learning tracks
CREATE TABLE public.learning_track_progress (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  track_id UUID NOT NULL REFERENCES public.mindset_learning_tracks(id) ON DELETE CASCADE,
  current_module INTEGER DEFAULT 0,
  status TEXT DEFAULT 'not_started',
  started_at TIMESTAMPTZ DEFAULT now(),
  completed_at TIMESTAMPTZ,
  notes TEXT
);

-- RLS
ALTER TABLE public.mindset_habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mindset_learning_tracks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_track_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can CRUD own habits" ON public.mindset_habits FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can CRUD own completions" ON public.habit_completions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Learning tracks are publicly viewable" ON public.mindset_learning_tracks FOR SELECT USING (true);
CREATE POLICY "Users can CRUD own track progress" ON public.learning_track_progress FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.mindset_habits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.habit_completions;

-- Seed learning tracks
INSERT INTO public.mindset_learning_tracks (title, description, category, difficulty, modules) VALUES
('Building Confidence for Entrepreneurs', 'Learn to overcome self-doubt and build unshakeable confidence in your entrepreneurial journey.', 'confidence', 'beginner', '[{"title":"Understanding Self-Doubt","type":"lesson","content":"Self-doubt is normal. Learn why entrepreneurs experience it and how to recognize it."},{"title":"Reframing Negative Thoughts","type":"exercise","content":"Practice turning negative self-talk into empowering statements."},{"title":"Small Wins Journal","type":"activity","content":"Document 3 small wins each day for a week to build momentum."},{"title":"Confidence Reflection","type":"reflection","content":"Reflect on how your confidence has shifted after completing these exercises."}]'),
('Handling Rejection and Setbacks', 'Develop resilience to bounce back from rejection, failure, and unexpected challenges.', 'resilience', 'intermediate', '[{"title":"The Anatomy of Rejection","type":"lesson","content":"Understand why rejection stings and how successful founders handle it."},{"title":"Failure Post-Mortem","type":"exercise","content":"Analyze a past failure objectively: what happened, what you learned, what you would do differently."},{"title":"The 30-Day Rejection Challenge","type":"activity","content":"Deliberately seek out situations where you might be rejected to build tolerance."},{"title":"Resilience Mapping","type":"reflection","content":"Map your emotional journey through setbacks and identify your coping strategies."}]'),
('Thinking Like a Founder', 'Shift your perspective to see opportunities, solve problems, and think strategically.', 'growth_mindset', 'beginner', '[{"title":"Opportunity Recognition","type":"lesson","content":"Train your mind to spot problems that are actually business opportunities."},{"title":"First Principles Thinking","type":"exercise","content":"Break down a complex problem into its fundamental truths and rebuild solutions."},{"title":"Customer Empathy Walk","type":"activity","content":"Spend a day observing and talking to potential customers about their pain points."},{"title":"Founder Mindset Assessment","type":"reflection","content":"Evaluate how your thinking patterns have shifted toward entrepreneurial problem-solving."}]'),
('Ethical Decision-Making in Startups', 'Navigate complex ethical dilemmas that arise when building ventures.', 'ethics', 'advanced', '[{"title":"Ethics in Innovation","type":"lesson","content":"Explore real cases where startups faced ethical crossroads and their outcomes."},{"title":"Stakeholder Impact Analysis","type":"exercise","content":"Map all stakeholders affected by a business decision and weigh the impacts."},{"title":"Values-Driven Decision Framework","type":"activity","content":"Create your personal ethical framework for making tough business decisions."},{"title":"Ethical Leadership Reflection","type":"reflection","content":"Reflect on how ethical considerations shape your vision as a founder."}]'),
('Emotional Resilience for Founders', 'Build emotional strength to handle the rollercoaster of entrepreneurship.', 'resilience', 'intermediate', '[{"title":"The Founder Emotional Cycle","type":"lesson","content":"Understand the typical emotional highs and lows of building a startup."},{"title":"Stress Response Toolkit","type":"exercise","content":"Build a personal toolkit of techniques for managing acute stress."},{"title":"Mindfulness for Entrepreneurs","type":"activity","content":"Practice 10 minutes of mindfulness daily for two weeks and track the impact."},{"title":"Emotional Intelligence Check-in","type":"reflection","content":"Assess how your emotional awareness has grown through these practices."}]'),
('Self-Discipline and Time Management', 'Master the art of focus, prioritization, and consistent execution.', 'discipline', 'beginner', '[{"title":"The Discipline Myth","type":"lesson","content":"Discipline is not willpower—it is systems. Learn to build systems that work."},{"title":"Time Audit","type":"exercise","content":"Track how you spend every hour for 3 days and identify patterns and waste."},{"title":"Deep Work Blocks","type":"activity","content":"Schedule and protect 2-hour deep work blocks for your most important startup tasks."},{"title":"Productivity Reflection","type":"reflection","content":"Review what changed when you introduced structure and focus into your routine."}]');
