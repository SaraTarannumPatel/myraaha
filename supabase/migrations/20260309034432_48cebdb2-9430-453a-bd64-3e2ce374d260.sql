
-- Add unique constraint on university name for upsert support
ALTER TABLE public.universities_directory ADD CONSTRAINT universities_directory_name_key UNIQUE (name);
