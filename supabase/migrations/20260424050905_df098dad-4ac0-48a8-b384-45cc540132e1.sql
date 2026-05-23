-- Add missing columns to roadmaps table used by the Roadmap module
ALTER TABLE public.roadmaps
  ADD COLUMN IF NOT EXISTS short_term_goals text,
  ADD COLUMN IF NOT EXISTS long_term_goals text,
  ADD COLUMN IF NOT EXISTS current_phase text DEFAULT 'foundation',
  ADD COLUMN IF NOT EXISTS skill_gaps jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS ai_suggestions jsonb;

-- Add unique constraint required by domain_recommendations upserts (on_conflict=user_id,domain_name)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'domain_recommendations_user_domain_unique'
  ) THEN
    ALTER TABLE public.domain_recommendations
      ADD CONSTRAINT domain_recommendations_user_domain_unique UNIQUE (user_id, domain_name);
  END IF;
END $$;