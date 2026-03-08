
-- Support requests for tracking founder challenges
CREATE TABLE public.support_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  category text NOT NULL,
  challenge text NOT NULL,
  ai_guidance jsonb DEFAULT '{}'::jsonb,
  action_plan jsonb DEFAULT '[]'::jsonb,
  status text NOT NULL DEFAULT 'open',
  mood text DEFAULT 'neutral',
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);
ALTER TABLE public.support_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own support requests" ON public.support_requests FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Encouragement nudges
CREATE TABLE public.support_nudges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  nudge_type text NOT NULL DEFAULT 'encouragement',
  message text NOT NULL,
  is_read boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.support_nudges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own nudges" ON public.support_nudges FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.support_nudges;
