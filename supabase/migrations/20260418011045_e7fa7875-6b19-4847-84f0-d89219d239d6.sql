ALTER TABLE public.skills_directory       ADD COLUMN IF NOT EXISTS related_subjects text[];
ALTER TABLE public.universities_directory ADD COLUMN IF NOT EXISTS popular_courses  text[];