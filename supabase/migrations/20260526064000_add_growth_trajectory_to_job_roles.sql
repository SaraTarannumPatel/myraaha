-- Add growth_trajectory column to job_roles_directory table to resolve CSV import mismatch
ALTER TABLE public.job_roles_directory ADD COLUMN IF NOT EXISTS growth_trajectory text;
