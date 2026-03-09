
-- Domain Directory: All professional/academic domains
CREATE TABLE public.domain_directory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  category text NOT NULL DEFAULT 'General',
  description text,
  icon_emoji text,
  parent_domain text,
  keywords text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Job Roles Directory: All job titles/roles globally
CREATE TABLE public.job_roles_directory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  domain text NOT NULL DEFAULT 'General',
  description text,
  seniority_levels text[] DEFAULT '{}',
  avg_salary_usd text,
  demand_level text,
  skills_required text[] DEFAULT '{}',
  education_required text,
  certifications text[] DEFAULT '{}',
  keywords text[] DEFAULT '{}',
  career_path_keywords text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Universities Directory
CREATE TABLE public.universities_directory (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  country text NOT NULL,
  city text,
  continent text,
  type text DEFAULT 'Public',
  ranking_tier text,
  website text,
  keywords text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- University Programs
CREATE TABLE public.university_programs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  university_id uuid REFERENCES public.universities_directory(id) ON DELETE CASCADE NOT NULL,
  program_name text NOT NULL,
  degree_type text NOT NULL DEFAULT 'Bachelor',
  department text,
  duration_years integer,
  career_path_keywords text[] DEFAULT '{}',
  domain_keywords text[] DEFAULT '{}',
  job_role_keywords text[] DEFAULT '{}',
  keywords text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Add keywords column to career_paths for cross-linking
ALTER TABLE public.career_paths ADD COLUMN IF NOT EXISTS keywords text[] DEFAULT '{}';
ALTER TABLE public.career_paths ADD COLUMN IF NOT EXISTS job_role_keywords text[] DEFAULT '{}';

-- Enable RLS
ALTER TABLE public.domain_directory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_roles_directory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.universities_directory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.university_programs ENABLE ROW LEVEL SECURITY;

-- Public read access for all directories
CREATE POLICY "Anyone can read domains" ON public.domain_directory FOR SELECT USING (true);
CREATE POLICY "Anyone can read job roles" ON public.job_roles_directory FOR SELECT USING (true);
CREATE POLICY "Anyone can read universities" ON public.universities_directory FOR SELECT USING (true);
CREATE POLICY "Anyone can read programs" ON public.university_programs FOR SELECT USING (true);

-- Create indexes for keyword search
CREATE INDEX idx_domain_keywords ON public.domain_directory USING gin(keywords);
CREATE INDEX idx_job_roles_keywords ON public.job_roles_directory USING gin(keywords);
CREATE INDEX idx_job_roles_career_keywords ON public.job_roles_directory USING gin(career_path_keywords);
CREATE INDEX idx_university_keywords ON public.universities_directory USING gin(keywords);
CREATE INDEX idx_programs_career_keywords ON public.university_programs USING gin(career_path_keywords);
CREATE INDEX idx_programs_domain_keywords ON public.university_programs USING gin(domain_keywords);
CREATE INDEX idx_career_paths_keywords ON public.career_paths USING gin(keywords);
CREATE INDEX idx_career_paths_job_keywords ON public.career_paths USING gin(job_role_keywords);
