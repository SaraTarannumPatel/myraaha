
-- Career stories: AI-generated first-person narratives from professionals
CREATE TABLE public.career_stories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  career_path_id UUID REFERENCES public.career_paths(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  narrator_name TEXT NOT NULL,
  narrator_role TEXT NOT NULL,
  narrator_experience_years INT,
  story_content TEXT NOT NULL,
  day_in_life TEXT,
  skills_highlighted TEXT[] DEFAULT '{}',
  pros TEXT[] DEFAULT '{}',
  cons TEXT[] DEFAULT '{}',
  advice TEXT,
  domain TEXT NOT NULL DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  difficulty_level TEXT DEFAULT 'beginner',
  is_ai_generated BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.career_stories ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read stories
CREATE POLICY "Authenticated users can read stories" ON public.career_stories
  FOR SELECT TO authenticated USING (true);

-- Story interactions: like/love/bookmark/not_for_me
CREATE TABLE public.career_story_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  story_id UUID NOT NULL REFERENCES public.career_stories(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'love', 'bookmark', 'not_for_me')),
  time_spent_seconds INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, story_id)
);

ALTER TABLE public.career_story_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own story interactions" ON public.career_story_interactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own story interactions" ON public.career_story_interactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own story interactions" ON public.career_story_interactions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own story interactions" ON public.career_story_interactions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Behavioral analysis results from story interactions
CREATE TABLE public.story_behavior_analysis (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  analysis_type TEXT NOT NULL DEFAULT 'story_preferences',
  domains_attracted TEXT[] DEFAULT '{}',
  domains_rejected TEXT[] DEFAULT '{}',
  skills_resonated TEXT[] DEFAULT '{}',
  personality_signals JSONB DEFAULT '{}',
  career_inclinations JSONB DEFAULT '{}',
  ai_summary TEXT,
  confidence_score NUMERIC DEFAULT 0,
  analyzed_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, analysis_type)
);

ALTER TABLE public.story_behavior_analysis ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analysis" ON public.story_behavior_analysis
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can upsert own analysis" ON public.story_behavior_analysis
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own analysis" ON public.story_behavior_analysis
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
