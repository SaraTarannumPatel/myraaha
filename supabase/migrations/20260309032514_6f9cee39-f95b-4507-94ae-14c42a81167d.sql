
-- Domain challenge cards: real-world task descriptions from various career paths
CREATE TABLE public.domain_challenge_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  career_path_id UUID REFERENCES public.career_paths(id) ON DELETE CASCADE,
  challenge_name TEXT NOT NULL,
  task_description TEXT NOT NULL,
  difficulty_level TEXT NOT NULL DEFAULT 'beginner',
  estimated_time TEXT NOT NULL DEFAULT '1-2 hours',
  tools_used TEXT[] DEFAULT '{}',
  skills_needed TEXT[] DEFAULT '{}',
  compensation TEXT,
  domain TEXT NOT NULL DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  is_ai_generated BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.domain_challenge_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read challenges" ON public.domain_challenge_cards
  FOR SELECT TO authenticated USING (true);

-- Challenge card interactions
CREATE TABLE public.challenge_card_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id UUID NOT NULL REFERENCES public.domain_challenge_cards(id) ON DELETE CASCADE,
  interaction_type TEXT NOT NULL CHECK (interaction_type IN ('like', 'love', 'bookmark', 'not_for_me')),
  time_spent_seconds INT DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE public.challenge_card_interactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own challenge interactions" ON public.challenge_card_interactions
  FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own challenge interactions" ON public.challenge_card_interactions
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own challenge interactions" ON public.challenge_card_interactions
  FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own challenge interactions" ON public.challenge_card_interactions
  FOR DELETE TO authenticated USING (auth.uid() = user_id);
