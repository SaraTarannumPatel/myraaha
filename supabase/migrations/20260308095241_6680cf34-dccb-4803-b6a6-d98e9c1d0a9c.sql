
-- Coaching sessions to persist conversations
CREATE TABLE public.coaching_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  title text NOT NULL DEFAULT 'New Session',
  messages jsonb NOT NULL DEFAULT '[]'::jsonb,
  topic text,
  mood text DEFAULT 'neutral',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.coaching_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own coaching sessions" ON public.coaching_sessions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Coaching check-ins for periodic reflections
CREATE TABLE public.coaching_checkins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  mood text NOT NULL,
  confidence integer DEFAULT 5,
  energy integer DEFAULT 5,
  reflection text,
  ai_response jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.coaching_checkins ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own checkins" ON public.coaching_checkins FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
