
-- Idea Cards: curated prompts for exploration
CREATE TABLE public.idea_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  sector TEXT NOT NULL DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  difficulty TEXT DEFAULT 'beginner',
  source TEXT DEFAULT 'system',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.idea_cards ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Idea cards are publicly viewable" ON public.idea_cards FOR SELECT USING (true);

-- User interactions with idea cards (like, save, reject, notes)
CREATE TABLE public.idea_card_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  idea_card_id UUID REFERENCES public.idea_cards(id) ON DELETE CASCADE,
  startup_idea_id UUID REFERENCES public.startup_ideas(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL DEFAULT 'view',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.idea_card_interactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own interactions" ON public.idea_card_interactions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Problem spotting entries
CREATE TABLE public.problem_observations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  observation TEXT NOT NULL,
  category TEXT,
  scale TEXT DEFAULT 'local',
  feasibility TEXT DEFAULT 'medium',
  relevance_score REAL DEFAULT 0.0,
  ai_analysis JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.problem_observations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own observations" ON public.problem_observations FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Exploration quests (gamified challenges)
CREATE TABLE public.exploration_quests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  quest_type TEXT NOT NULL DEFAULT 'creative',
  difficulty TEXT DEFAULT 'beginner',
  points INTEGER DEFAULT 10,
  sector TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.exploration_quests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Quests are publicly viewable" ON public.exploration_quests FOR SELECT USING (true);

-- User quest progress
CREATE TABLE public.quest_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  quest_id UUID NOT NULL REFERENCES public.exploration_quests(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'started',
  response TEXT,
  completed_at TIMESTAMPTZ,
  points_earned INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, quest_id)
);

ALTER TABLE public.quest_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own quest progress" ON public.quest_progress FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Enable realtime on new tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.idea_card_interactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.problem_observations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.quest_progress;
