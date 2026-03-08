
-- Add new user_type values
ALTER TYPE public.user_type ADD VALUE IF NOT EXISTS 'working_professional';
ALTER TYPE public.user_type ADD VALUE IF NOT EXISTS 'aspiring_entrepreneur';
ALTER TYPE public.user_type ADD VALUE IF NOT EXISTS 'freelancer';
ALTER TYPE public.user_type ADD VALUE IF NOT EXISTS 'other';

-- Add 'both' to user_intent
ALTER TYPE public.user_intent ADD VALUE IF NOT EXISTS 'both';

-- Add new onboarding steps
ALTER TYPE public.onboarding_status ADD VALUE IF NOT EXISTS 'personal_info';
ALTER TYPE public.onboarding_status ADD VALUE IF NOT EXISTS 'consent';

-- Add new profile fields
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS education_level text,
  ADD COLUMN IF NOT EXISTS industry text,
  ADD COLUMN IF NOT EXISTS career_stage text,
  ADD COLUMN IF NOT EXISTS short_term_goals text,
  ADD COLUMN IF NOT EXISTS long_term_goals text,
  ADD COLUMN IF NOT EXISTS consent_data_usage boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS consent_mentor_sharing boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS areas_of_focus text[] DEFAULT '{}';
