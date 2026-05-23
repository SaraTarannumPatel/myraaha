
-- Transition plans table
CREATE TABLE public.transition_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'draft',
  reality_mapping jsonb DEFAULT '{}',
  readiness_assessment jsonb DEFAULT '{}',
  readiness_level text,
  timeline_insights jsonb DEFAULT '{}',
  transferable_skills jsonb DEFAULT '[]',
  current_pain_points text[] DEFAULT '{}',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Parallel paths for each transition plan
CREATE TABLE public.transition_paths (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id uuid NOT NULL REFERENCES public.transition_plans(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  path_type text NOT NULL DEFAULT 'pivot',
  title text NOT NULL,
  description text,
  time_required text,
  skills_needed text[] DEFAULT '{}',
  bridge_skills text[] DEFAULT '{}',
  income_risk text,
  lifestyle_impact text,
  demand_data jsonb DEFAULT '{}',
  roadmap_steps jsonb DEFAULT '[]',
  is_selected boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Transition reflections / journal
CREATE TABLE public.transition_reflections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.transition_plans(id) ON DELETE SET NULL,
  reflection_type text NOT NULL DEFAULT 'general',
  content text NOT NULL,
  ai_response jsonb,
  mood text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.transition_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transition_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transition_reflections ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users manage own transition plans" ON public.transition_plans
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own transition paths" ON public.transition_paths
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users manage own transition reflections" ON public.transition_reflections
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Updated_at trigger
CREATE TRIGGER update_transition_plans_updated_at
  BEFORE UPDATE ON public.transition_plans
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
