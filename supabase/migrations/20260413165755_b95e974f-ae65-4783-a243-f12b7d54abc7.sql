
-- Industry directory
CREATE TABLE IF NOT EXISTS public.industry_directory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon_emoji TEXT DEFAULT '🏭',
  keywords TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.industry_directory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Industry directory is publicly readable" ON public.industry_directory FOR SELECT USING (true);

-- Sector directory
CREATE TABLE IF NOT EXISTS public.sector_directory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  industry_id UUID REFERENCES public.industry_directory(id) ON DELETE SET NULL,
  industry_name TEXT,
  icon_emoji TEXT DEFAULT '📊',
  keywords TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(name, industry_name)
);
ALTER TABLE public.sector_directory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Sector directory is publicly readable" ON public.sector_directory FOR SELECT USING (true);

-- Skills directory
CREATE TABLE IF NOT EXISTS public.skills_directory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  category TEXT DEFAULT 'general',
  domain TEXT,
  related_job_roles TEXT[] DEFAULT '{}',
  related_domains TEXT[] DEFAULT '{}',
  related_sectors TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.skills_directory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Skills directory is publicly readable" ON public.skills_directory FOR SELECT USING (true);

-- Subjects directory
CREATE TABLE IF NOT EXISTS public.subjects_directory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  domain TEXT,
  related_skills TEXT[] DEFAULT '{}',
  related_universities TEXT[] DEFAULT '{}',
  related_domains TEXT[] DEFAULT '{}',
  keywords TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.subjects_directory ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Subjects directory is publicly readable" ON public.subjects_directory FOR SELECT USING (true);

-- Add cross-mapping columns to career_paths
ALTER TABLE public.career_paths ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE public.career_paths ADD COLUMN IF NOT EXISTS sector TEXT;
ALTER TABLE public.career_paths ADD COLUMN IF NOT EXISTS related_subjects TEXT[] DEFAULT '{}';
ALTER TABLE public.career_paths ADD COLUMN IF NOT EXISTS related_universities TEXT[] DEFAULT '{}';

-- Add cross-mapping columns to job_roles_directory
ALTER TABLE public.job_roles_directory ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE public.job_roles_directory ADD COLUMN IF NOT EXISTS sector TEXT;
ALTER TABLE public.job_roles_directory ADD COLUMN IF NOT EXISTS related_subjects TEXT[] DEFAULT '{}';
ALTER TABLE public.job_roles_directory ADD COLUMN IF NOT EXISTS related_universities TEXT[] DEFAULT '{}';
ALTER TABLE public.job_roles_directory ADD COLUMN IF NOT EXISTS related_domains TEXT[] DEFAULT '{}';

-- Add cross-mapping columns to domain_directory
ALTER TABLE public.domain_directory ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE public.domain_directory ADD COLUMN IF NOT EXISTS sector TEXT;
ALTER TABLE public.domain_directory ADD COLUMN IF NOT EXISTS related_careers TEXT[] DEFAULT '{}';
ALTER TABLE public.domain_directory ADD COLUMN IF NOT EXISTS related_job_roles TEXT[] DEFAULT '{}';
ALTER TABLE public.domain_directory ADD COLUMN IF NOT EXISTS related_universities TEXT[] DEFAULT '{}';
ALTER TABLE public.domain_directory ADD COLUMN IF NOT EXISTS related_skills TEXT[] DEFAULT '{}';
ALTER TABLE public.domain_directory ADD COLUMN IF NOT EXISTS related_subjects TEXT[] DEFAULT '{}';

-- Add cross-mapping columns to universities_directory
ALTER TABLE public.universities_directory ADD COLUMN IF NOT EXISTS related_domains TEXT[] DEFAULT '{}';
ALTER TABLE public.universities_directory ADD COLUMN IF NOT EXISTS related_subjects TEXT[] DEFAULT '{}';
ALTER TABLE public.universities_directory ADD COLUMN IF NOT EXISTS related_sectors TEXT[] DEFAULT '{}';
ALTER TABLE public.universities_directory ADD COLUMN IF NOT EXISTS related_careers TEXT[] DEFAULT '{}';
ALTER TABLE public.universities_directory ADD COLUMN IF NOT EXISTS related_skills TEXT[] DEFAULT '{}';

-- Create GIN indexes for keyword/array search
CREATE INDEX IF NOT EXISTS idx_industry_keywords ON public.industry_directory USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_sector_keywords ON public.sector_directory USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_skills_keywords ON public.skills_directory USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_subjects_keywords ON public.subjects_directory USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_career_industry ON public.career_paths(industry);
CREATE INDEX IF NOT EXISTS idx_career_sector ON public.career_paths(sector);
CREATE INDEX IF NOT EXISTS idx_job_industry ON public.job_roles_directory(industry);
CREATE INDEX IF NOT EXISTS idx_job_sector ON public.job_roles_directory(sector);
CREATE INDEX IF NOT EXISTS idx_domain_industry ON public.domain_directory(industry);
CREATE INDEX IF NOT EXISTS idx_domain_sector ON public.domain_directory(sector);
