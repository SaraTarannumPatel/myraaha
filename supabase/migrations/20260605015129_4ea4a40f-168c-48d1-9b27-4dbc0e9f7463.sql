CREATE TABLE IF NOT EXISTS public.career_taxonomy (
  id BIGSERIAL PRIMARY KEY,
  sector_name TEXT NOT NULL,
  sub_sector_name TEXT,
  industry_family TEXT,
  industry_name TEXT,
  domain_name TEXT,
  sub_domain_name TEXT,
  function_name TEXT,
  job_family TEXT,
  career_cluster TEXT,
  career_pathway_cluster TEXT,
  role_name TEXT NOT NULL,
  source_workbook TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT career_taxonomy_unique UNIQUE (sector_name, sub_sector_name, industry_family, industry_name, domain_name, sub_domain_name, function_name, job_family, career_cluster, career_pathway_cluster, role_name)
);

CREATE INDEX IF NOT EXISTS idx_career_taxonomy_sector ON public.career_taxonomy(sector_name);
CREATE INDEX IF NOT EXISTS idx_career_taxonomy_industry ON public.career_taxonomy(industry_name);
CREATE INDEX IF NOT EXISTS idx_career_taxonomy_domain ON public.career_taxonomy(domain_name);
CREATE INDEX IF NOT EXISTS idx_career_taxonomy_role ON public.career_taxonomy(role_name);
CREATE INDEX IF NOT EXISTS idx_career_taxonomy_role_trgm ON public.career_taxonomy USING gin (role_name gin_trgm_ops);

GRANT SELECT ON public.career_taxonomy TO anon, authenticated;
GRANT ALL ON public.career_taxonomy TO service_role;

ALTER TABLE public.career_taxonomy ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read access to career taxonomy"
  ON public.career_taxonomy FOR SELECT
  USING (true);