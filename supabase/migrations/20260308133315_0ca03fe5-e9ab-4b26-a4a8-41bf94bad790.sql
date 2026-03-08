
-- Mood check-ins table for daily/periodic emotional tracking
CREATE TABLE public.mood_checkins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mood TEXT NOT NULL,
  energy_level INTEGER DEFAULT 5,
  confidence_level INTEGER DEFAULT 5,
  triggers TEXT,
  wins TEXT,
  challenges TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.mood_checkins ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own mood checkins" ON public.mood_checkins
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Journal AI insights table
CREATE TABLE public.journal_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  insight_type TEXT NOT NULL DEFAULT 'weekly',
  period_start TIMESTAMPTZ,
  period_end TIMESTAMPTZ,
  mood_summary JSONB,
  patterns JSONB,
  suggestions TEXT[],
  ai_narrative TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.journal_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own journal insights" ON public.journal_insights
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Journal sharing controls
CREATE TABLE public.journal_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_id UUID NOT NULL REFERENCES public.journal_entries(id) ON DELETE CASCADE,
  shared_with TEXT NOT NULL DEFAULT 'mentor',
  shared_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(entry_id, shared_with)
);

ALTER TABLE public.journal_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own journal shares" ON public.journal_shares
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Add is_private column to journal_entries
ALTER TABLE public.journal_entries ADD COLUMN IF NOT EXISTS is_private BOOLEAN DEFAULT true;

-- Enable realtime for mood_checkins
ALTER PUBLICATION supabase_realtime ADD TABLE public.mood_checkins;
