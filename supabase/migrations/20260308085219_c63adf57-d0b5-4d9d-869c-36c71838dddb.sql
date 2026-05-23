
-- Lab plans table for structured startup planning
CREATE TABLE public.lab_plans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  vision TEXT,
  mission TEXT,
  problem_statement TEXT,
  customer_segments JSONB DEFAULT '[]'::jsonb,
  value_proposition TEXT,
  revenue_model TEXT,
  go_to_market TEXT,
  financial_plan JSONB DEFAULT '{}'::jsonb,
  pitch_notes TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  ai_feedback JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Validation sprints table
CREATE TABLE public.validation_sprints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.lab_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  hypothesis TEXT,
  method TEXT,
  target_responses INTEGER DEFAULT 5,
  actual_responses INTEGER DEFAULT 0,
  findings TEXT,
  validated BOOLEAN,
  sprint_duration_days INTEGER DEFAULT 7,
  started_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'planned',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Lab milestones
CREATE TABLE public.lab_milestones (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  plan_id UUID NOT NULL REFERENCES public.lab_plans(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT DEFAULT 'general',
  status TEXT NOT NULL DEFAULT 'pending',
  order_index INTEGER DEFAULT 0,
  due_date DATE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.lab_plans ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own lab plans" ON public.lab_plans FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.validation_sprints ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own sprints" ON public.validation_sprints FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

ALTER TABLE public.lab_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can CRUD own lab milestones" ON public.lab_milestones FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.lab_plans;
ALTER PUBLICATION supabase_realtime ADD TABLE public.validation_sprints;
ALTER PUBLICATION supabase_realtime ADD TABLE public.lab_milestones;
