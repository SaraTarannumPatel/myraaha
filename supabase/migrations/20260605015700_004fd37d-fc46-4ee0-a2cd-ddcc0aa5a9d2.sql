CREATE TABLE IF NOT EXISTS public.career_intel_agri_env_natural_resources (id BIGSERIAL PRIMARY KEY, sector_name TEXT, sub_sector_name TEXT, industry_family TEXT, industry_name TEXT, domain_name TEXT, sub_domain_name TEXT, function_name TEXT, job_family TEXT, career_cluster TEXT, career_pathway_cluster TEXT, role_name TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
GRANT SELECT ON public.career_intel_agri_env_natural_resources TO anon, authenticated; GRANT ALL ON public.career_intel_agri_env_natural_resources TO service_role;
ALTER TABLE public.career_intel_agri_env_natural_resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read agri" ON public.career_intel_agri_env_natural_resources FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.career_intel_education (id BIGSERIAL PRIMARY KEY, sector_name TEXT, sub_sector_name TEXT, industry_family TEXT, industry_name TEXT, domain_name TEXT, sub_domain_name TEXT, function_name TEXT, job_family TEXT, career_cluster TEXT, career_pathway_cluster TEXT, role_name TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
GRANT SELECT ON public.career_intel_education TO anon, authenticated; GRANT ALL ON public.career_intel_education TO service_role;
ALTER TABLE public.career_intel_education ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read edu" ON public.career_intel_education FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.career_intel_energy_utilities (id BIGSERIAL PRIMARY KEY, sector_name TEXT, sub_sector_name TEXT, industry_family TEXT, industry_name TEXT, domain_name TEXT, sub_domain_name TEXT, function_name TEXT, job_family TEXT, career_cluster TEXT, career_pathway_cluster TEXT, role_name TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
GRANT SELECT ON public.career_intel_energy_utilities TO anon, authenticated; GRANT ALL ON public.career_intel_energy_utilities TO service_role;
ALTER TABLE public.career_intel_energy_utilities ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read energy" ON public.career_intel_energy_utilities FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.career_intel_financial_services (id BIGSERIAL PRIMARY KEY, sector_name TEXT, sub_sector_name TEXT, industry_family TEXT, industry_name TEXT, domain_name TEXT, sub_domain_name TEXT, function_name TEXT, job_family TEXT, career_cluster TEXT, career_pathway_cluster TEXT, role_name TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
GRANT SELECT ON public.career_intel_financial_services TO anon, authenticated; GRANT ALL ON public.career_intel_financial_services TO service_role;
ALTER TABLE public.career_intel_financial_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read fin" ON public.career_intel_financial_services FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.career_intel_govt_public_sector (id BIGSERIAL PRIMARY KEY, sector_name TEXT, sub_sector_name TEXT, industry_family TEXT, industry_name TEXT, domain_name TEXT, sub_domain_name TEXT, function_name TEXT, job_family TEXT, career_cluster TEXT, career_pathway_cluster TEXT, role_name TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
GRANT SELECT ON public.career_intel_govt_public_sector TO anon, authenticated; GRANT ALL ON public.career_intel_govt_public_sector TO service_role;
ALTER TABLE public.career_intel_govt_public_sector ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read govt" ON public.career_intel_govt_public_sector FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.career_intel_healthcare_life_sciences (id BIGSERIAL PRIMARY KEY, sector_name TEXT, sub_sector_name TEXT, industry_family TEXT, industry_name TEXT, domain_name TEXT, sub_domain_name TEXT, function_name TEXT, job_family TEXT, career_cluster TEXT, career_pathway_cluster TEXT, role_name TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
GRANT SELECT ON public.career_intel_healthcare_life_sciences TO anon, authenticated; GRANT ALL ON public.career_intel_healthcare_life_sciences TO service_role;
ALTER TABLE public.career_intel_healthcare_life_sciences ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read health" ON public.career_intel_healthcare_life_sciences FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.career_intel_hospitality_tourism_travel (id BIGSERIAL PRIMARY KEY, sector_name TEXT, sub_sector_name TEXT, industry_family TEXT, industry_name TEXT, domain_name TEXT, sub_domain_name TEXT, function_name TEXT, job_family TEXT, career_cluster TEXT, career_pathway_cluster TEXT, role_name TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
GRANT SELECT ON public.career_intel_hospitality_tourism_travel TO anon, authenticated; GRANT ALL ON public.career_intel_hospitality_tourism_travel TO service_role;
ALTER TABLE public.career_intel_hospitality_tourism_travel ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read hosp" ON public.career_intel_hospitality_tourism_travel FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.career_intel_legal_prof_services (id BIGSERIAL PRIMARY KEY, sector_name TEXT, sub_sector_name TEXT, industry_family TEXT, industry_name TEXT, domain_name TEXT, sub_domain_name TEXT, function_name TEXT, job_family TEXT, career_cluster TEXT, career_pathway_cluster TEXT, role_name TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
GRANT SELECT ON public.career_intel_legal_prof_services TO anon, authenticated; GRANT ALL ON public.career_intel_legal_prof_services TO service_role;
ALTER TABLE public.career_intel_legal_prof_services ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read legal" ON public.career_intel_legal_prof_services FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.career_intel_manufacturing_engineering (id BIGSERIAL PRIMARY KEY, sector_name TEXT, sub_sector_name TEXT, industry_family TEXT, industry_name TEXT, domain_name TEXT, sub_domain_name TEXT, function_name TEXT, job_family TEXT, career_cluster TEXT, career_pathway_cluster TEXT, role_name TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
GRANT SELECT ON public.career_intel_manufacturing_engineering TO anon, authenticated; GRANT ALL ON public.career_intel_manufacturing_engineering TO service_role;
ALTER TABLE public.career_intel_manufacturing_engineering ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read mfg" ON public.career_intel_manufacturing_engineering FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.career_intel_media_ent_creative (id BIGSERIAL PRIMARY KEY, sector_name TEXT, sub_sector_name TEXT, industry_family TEXT, industry_name TEXT, domain_name TEXT, sub_domain_name TEXT, function_name TEXT, job_family TEXT, career_cluster TEXT, career_pathway_cluster TEXT, role_name TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
GRANT SELECT ON public.career_intel_media_ent_creative TO anon, authenticated; GRANT ALL ON public.career_intel_media_ent_creative TO service_role;
ALTER TABLE public.career_intel_media_ent_creative ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read media" ON public.career_intel_media_ent_creative FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.career_intel_ngo_development (id BIGSERIAL PRIMARY KEY, sector_name TEXT, sub_sector_name TEXT, industry_family TEXT, industry_name TEXT, domain_name TEXT, sub_domain_name TEXT, function_name TEXT, job_family TEXT, career_cluster TEXT, career_pathway_cluster TEXT, role_name TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
GRANT SELECT ON public.career_intel_ngo_development TO anon, authenticated; GRANT ALL ON public.career_intel_ngo_development TO service_role;
ALTER TABLE public.career_intel_ngo_development ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read ngo" ON public.career_intel_ngo_development FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.career_intel_real_estate_construction (id BIGSERIAL PRIMARY KEY, sector_name TEXT, sub_sector_name TEXT, industry_family TEXT, industry_name TEXT, domain_name TEXT, sub_domain_name TEXT, function_name TEXT, job_family TEXT, career_cluster TEXT, career_pathway_cluster TEXT, role_name TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
GRANT SELECT ON public.career_intel_real_estate_construction TO anon, authenticated; GRANT ALL ON public.career_intel_real_estate_construction TO service_role;
ALTER TABLE public.career_intel_real_estate_construction ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read re" ON public.career_intel_real_estate_construction FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.career_intel_retail_consumer_goods (id BIGSERIAL PRIMARY KEY, sector_name TEXT, sub_sector_name TEXT, industry_family TEXT, industry_name TEXT, domain_name TEXT, sub_domain_name TEXT, function_name TEXT, job_family TEXT, career_cluster TEXT, career_pathway_cluster TEXT, role_name TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
GRANT SELECT ON public.career_intel_retail_consumer_goods TO anon, authenticated; GRANT ALL ON public.career_intel_retail_consumer_goods TO service_role;
ALTER TABLE public.career_intel_retail_consumer_goods ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read retail" ON public.career_intel_retail_consumer_goods FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.career_intel_sports (id BIGSERIAL PRIMARY KEY, sector_name TEXT, sub_sector_name TEXT, industry_family TEXT, industry_name TEXT, domain_name TEXT, sub_domain_name TEXT, function_name TEXT, job_family TEXT, career_cluster TEXT, career_pathway_cluster TEXT, role_name TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
GRANT SELECT ON public.career_intel_sports TO anon, authenticated; GRANT ALL ON public.career_intel_sports TO service_role;
ALTER TABLE public.career_intel_sports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read sports" ON public.career_intel_sports FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.career_intel_tech_it (id BIGSERIAL PRIMARY KEY, sector_name TEXT, sub_sector_name TEXT, industry_family TEXT, industry_name TEXT, domain_name TEXT, sub_domain_name TEXT, function_name TEXT, job_family TEXT, career_cluster TEXT, career_pathway_cluster TEXT, role_name TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
GRANT SELECT ON public.career_intel_tech_it TO anon, authenticated; GRANT ALL ON public.career_intel_tech_it TO service_role;
ALTER TABLE public.career_intel_tech_it ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read tech" ON public.career_intel_tech_it FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.career_intel_telecommunications (id BIGSERIAL PRIMARY KEY, sector_name TEXT, sub_sector_name TEXT, industry_family TEXT, industry_name TEXT, domain_name TEXT, sub_domain_name TEXT, function_name TEXT, job_family TEXT, career_cluster TEXT, career_pathway_cluster TEXT, role_name TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
GRANT SELECT ON public.career_intel_telecommunications TO anon, authenticated; GRANT ALL ON public.career_intel_telecommunications TO service_role;
ALTER TABLE public.career_intel_telecommunications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read tel" ON public.career_intel_telecommunications FOR SELECT USING (true);

CREATE TABLE IF NOT EXISTS public.career_intel_transport_logistics (id BIGSERIAL PRIMARY KEY, sector_name TEXT, sub_sector_name TEXT, industry_family TEXT, industry_name TEXT, domain_name TEXT, sub_domain_name TEXT, function_name TEXT, job_family TEXT, career_cluster TEXT, career_pathway_cluster TEXT, role_name TEXT NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
GRANT SELECT ON public.career_intel_transport_logistics TO anon, authenticated; GRANT ALL ON public.career_intel_transport_logistics TO service_role;
ALTER TABLE public.career_intel_transport_logistics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read tlog" ON public.career_intel_transport_logistics FOR SELECT USING (true);