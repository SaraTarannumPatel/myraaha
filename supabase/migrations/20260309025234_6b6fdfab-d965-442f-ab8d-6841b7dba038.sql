
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS journey_variant text,
ADD COLUMN IF NOT EXISTS journey_responses jsonb DEFAULT '{}';
