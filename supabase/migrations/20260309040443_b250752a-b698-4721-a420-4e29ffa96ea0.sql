CREATE TABLE IF NOT EXISTS public.roadmap_step_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  step_id UUID NOT NULL REFERENCES public.roadmap_steps(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  overview TEXT,
  total_time_estimate TEXT,
  difficulty_level TEXT,
  sub_steps JSONB DEFAULT '[]'::jsonb,
  time_breakdown JSONB DEFAULT '{}'::jsonb,
  learning_resources JSONB DEFAULT '{}'::jsonb,
  career_context JSONB DEFAULT '{}'::jsonb,
  guidance JSONB DEFAULT '{}'::jsonb,
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (step_id)
);

ALTER TABLE public.roadmap_step_details ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own step details" ON public.roadmap_step_details FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own step details" ON public.roadmap_step_details FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own step details" ON public.roadmap_step_details FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own step details" ON public.roadmap_step_details FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_roadmap_step_details_step_id ON public.roadmap_step_details(step_id);
CREATE INDEX idx_roadmap_step_details_user_id ON public.roadmap_step_details(user_id);