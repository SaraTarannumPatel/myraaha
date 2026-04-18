-- Add unique constraint to online_courses_directory.name to enable upserts
DO $$ BEGIN
  ALTER TABLE public.online_courses_directory ADD CONSTRAINT online_courses_directory_name_key UNIQUE (name);
EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL; END $$;