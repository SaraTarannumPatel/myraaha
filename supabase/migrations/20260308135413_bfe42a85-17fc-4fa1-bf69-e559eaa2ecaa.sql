
-- Add scope (local/national/global) and emotion_theme to inspiration_stories
ALTER TABLE public.inspiration_stories 
  ADD COLUMN IF NOT EXISTS scope text DEFAULT 'global',
  ADD COLUMN IF NOT EXISTS emotion_theme text,
  ADD COLUMN IF NOT EXISTS intent text DEFAULT 'both';

-- Add index for filtering by intent and scope
CREATE INDEX IF NOT EXISTS idx_inspiration_stories_intent ON public.inspiration_stories(intent);
CREATE INDEX IF NOT EXISTS idx_inspiration_stories_scope ON public.inspiration_stories(scope);
