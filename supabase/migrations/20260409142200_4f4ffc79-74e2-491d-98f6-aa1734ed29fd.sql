
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS mobile_number text,
  ADD COLUMN IF NOT EXISTS gender_identity text,
  ADD COLUMN IF NOT EXISTS age_group text,
  ADD COLUMN IF NOT EXISTS life_stage text,
  ADD COLUMN IF NOT EXISTS academic_stream text,
  ADD COLUMN IF NOT EXISTS highest_education text,
  ADD COLUMN IF NOT EXISTS primary_device text,
  ADD COLUMN IF NOT EXISTS digital_comfort text,
  ADD COLUMN IF NOT EXISTS ai_comfort text,
  ADD COLUMN IF NOT EXISTS time_commitment text,
  ADD COLUMN IF NOT EXISTS weekly_hours text,
  ADD COLUMN IF NOT EXISTS location_type text,
  ADD COLUMN IF NOT EXISTS preferred_language text;
