
-- MVP Milestones table
CREATE TABLE public.mvp_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  order_index INTEGER NOT NULL DEFAULT 0,
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  metrics JSONB DEFAULT '{}'::jsonb,
  learning_objectives TEXT[] DEFAULT '{}'::text[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- MVP Experiments table
CREATE TABLE public.mvp_experiments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  hypothesis TEXT,
  method TEXT,
  results TEXT,
  iteration_number INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'planned',
  metrics JSONB DEFAULT '{}'::jsonb,
  feedback TEXT[] DEFAULT '{}'::text[],
  learnings TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS for mvp_milestones
ALTER TABLE public.mvp_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own milestones" ON public.mvp_milestones FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RLS for mvp_experiments
ALTER TABLE public.mvp_experiments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own experiments" ON public.mvp_experiments FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.mvp_milestones;
ALTER PUBLICATION supabase_realtime ADD TABLE public.mvp_experiments;
