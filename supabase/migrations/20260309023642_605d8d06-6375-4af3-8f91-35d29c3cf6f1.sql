
-- Signal snapshots for tracking signal evolution over time
CREATE TABLE public.path_signal_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  path_selection_id UUID REFERENCES public.path_selections(id) ON DELETE CASCADE,
  signals_data JSONB NOT NULL DEFAULT '{}',
  top_areas TEXT[] DEFAULT '{}',
  confidence_delta NUMERIC DEFAULT 0,
  snapshot_type TEXT NOT NULL DEFAULT 'auto',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.path_signal_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own signal snapshots" ON public.path_signal_snapshots FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Reflections for guided reflection prompts
CREATE TABLE public.path_reflections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  path_selection_id UUID REFERENCES public.path_selections(id) ON DELETE CASCADE,
  prompt TEXT NOT NULL,
  response TEXT,
  reflection_type TEXT NOT NULL DEFAULT 'readiness',
  mood TEXT,
  ai_feedback JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.path_reflections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own path reflections" ON public.path_reflections FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Community shares for path sharing & feedback
CREATE TABLE public.path_community_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  path_selection_id UUID REFERENCES public.path_selections(id) ON DELETE CASCADE,
  share_summary TEXT NOT NULL,
  share_type TEXT NOT NULL DEFAULT 'progress',
  feedback_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.path_community_shares ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own shares" ON public.path_community_shares FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "All authenticated can read shares" ON public.path_community_shares FOR SELECT TO authenticated USING (true);

-- Community feedback on shared paths
CREATE TABLE public.path_share_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  share_id UUID REFERENCES public.path_community_shares(id) ON DELETE CASCADE NOT NULL,
  user_id UUID NOT NULL,
  content TEXT NOT NULL,
  feedback_type TEXT NOT NULL DEFAULT 'comment',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.path_share_feedback ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own feedback" ON public.path_share_feedback FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "All authenticated can read feedback" ON public.path_share_feedback FOR SELECT TO authenticated USING (true);
