
-- Path selections table
CREATE TABLE public.path_selections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  path_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'exploring',
  confidence_score REAL DEFAULT 0.0,
  signals JSONB DEFAULT '[]'::jsonb,
  roadmap JSONB DEFAULT '[]'::jsonb,
  skills_required TEXT[] DEFAULT '{}'::text[],
  skills_matched TEXT[] DEFAULT '{}'::text[],
  ai_analysis JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.path_selections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own path selections" ON public.path_selections FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
ALTER PUBLICATION supabase_realtime ADD TABLE public.path_selections;
