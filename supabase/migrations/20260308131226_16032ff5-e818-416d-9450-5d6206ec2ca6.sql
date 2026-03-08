
-- SkillStacker Tables

-- User's personalized skill stacks
CREATE TABLE public.skill_stacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  domain TEXT NOT NULL DEFAULT 'general',
  based_on_path TEXT, -- career path / startup path reference
  status TEXT NOT NULL DEFAULT 'active', -- active, archived, completed
  ai_generated BOOLEAN DEFAULT true,
  total_skills INTEGER DEFAULT 0,
  completed_skills INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Individual skill items within a stack
CREATE TABLE public.skill_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stack_id UUID NOT NULL REFERENCES public.skill_stacks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  skill_name TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'core', -- core, supporting, exploration
  why_it_matters TEXT,
  where_it_applies TEXT[], -- jobs, startups, freelancing, etc.
  effort_level TEXT DEFAULT 'medium', -- light, medium, deep
  status TEXT NOT NULL DEFAULT 'recommended', -- recommended, accepted, in_progress, applied, validated, postponed
  confidence_score INTEGER, -- 1-10 user self-reported
  energy_feedback TEXT, -- easy, moderate, draining
  learning_capsule_ids TEXT[], -- linked content IDs
  project_ids TEXT[], -- linked project IDs
  order_index INTEGER DEFAULT 0,
  accepted_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Confidence & energy checkpoints
CREATE TABLE public.skill_checkpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  skill_item_id UUID NOT NULL REFERENCES public.skill_items(id) ON DELETE CASCADE,
  confidence_before INTEGER, -- 1-10
  confidence_after INTEGER, -- 1-10
  energy_level TEXT, -- energizing, neutral, draining
  went_deeper BOOLEAN DEFAULT false,
  paused BOOLEAN DEFAULT false,
  reflection TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Skill application tasks (small real-world tasks)
CREATE TABLE public.skill_application_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_item_id UUID NOT NULL REFERENCES public.skill_items(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT DEFAULT 'practice', -- practice, project, challenge, real-world
  status TEXT DEFAULT 'pending', -- pending, in_progress, completed
  outcome TEXT,
  time_spent_minutes INTEGER,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Skill opportunity readiness mapping
CREATE TABLE public.skill_opportunity_map (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  skill_item_id UUID NOT NULL REFERENCES public.skill_items(id) ON DELETE CASCADE,
  opportunity_type TEXT NOT NULL, -- job, internship, freelance, startup_role
  opportunity_title TEXT NOT NULL,
  readiness_score INTEGER DEFAULT 0, -- 0-100
  missing_skills TEXT[],
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.skill_stacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_checkpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_application_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_opportunity_map ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own skill stacks" ON public.skill_stacks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own skill items" ON public.skill_items FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own checkpoints" ON public.skill_checkpoints FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own application tasks" ON public.skill_application_tasks FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own opportunity map" ON public.skill_opportunity_map FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Update triggers
CREATE TRIGGER update_skill_stacks_updated_at BEFORE UPDATE ON public.skill_stacks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_skill_items_updated_at BEFORE UPDATE ON public.skill_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_skill_opportunity_map_updated_at BEFORE UPDATE ON public.skill_opportunity_map FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
