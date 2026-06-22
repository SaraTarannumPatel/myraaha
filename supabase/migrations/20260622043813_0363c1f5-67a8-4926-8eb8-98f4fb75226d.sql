
-- =========================================================================
-- 1. combined_conclusions
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.combined_conclusions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE,
  identity_summary text,
  dominant_archetype text,
  top_motivations jsonb DEFAULT '[]'::jsonb,
  cognitive_signature text,
  work_preferences jsonb DEFAULT '{}'::jsonb,
  domain_affinities jsonb DEFAULT '{}'::jsonb,
  style_axes jsonb DEFAULT '{}'::jsonb,
  values_anchors jsonb DEFAULT '[]'::jsonb,
  risk_profile text,
  growth_orientation text,
  hard_constraints jsonb DEFAULT '{}'::jsonb,
  red_flag_traits jsonb DEFAULT '[]'::jsonb,
  narrative_long text,
  raw jsonb DEFAULT '{}'::jsonb,
  generated_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.combined_conclusions TO authenticated;
GRANT ALL ON public.combined_conclusions TO service_role;

ALTER TABLE public.combined_conclusions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own combined conclusion"
  ON public.combined_conclusions
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_combined_conclusions_updated_at
  BEFORE UPDATE ON public.combined_conclusions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =========================================================================
-- 2. compass_fit_results
-- =========================================================================
CREATE TABLE IF NOT EXISTS public.compass_fit_results (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  entity_type text NOT NULL,   -- 'role' | 'industry' | 'sector' | 'domain' | 'skill' | 'subject' | 'sub_sector' | 'industry_family'
  entity_id text NOT NULL,
  entity_name text NOT NULL,
  bucket text NOT NULL,        -- 'best' | 'force' | 'no'
  score numeric NOT NULL DEFAULT 0,
  reasons jsonb DEFAULT '[]'::jsonb,
  meta jsonb DEFAULT '{}'::jsonb,
  computed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, entity_type, entity_id)
);

CREATE INDEX IF NOT EXISTS idx_compass_fit_user_bucket
  ON public.compass_fit_results (user_id, bucket, score DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.compass_fit_results TO authenticated;
GRANT ALL ON public.compass_fit_results TO service_role;

ALTER TABLE public.compass_fit_results ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own fit results"
  ON public.compass_fit_results
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users write own fit results"
  ON public.compass_fit_results
  FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- =========================================================================
-- 3. compute_compass_fit  — cross-match user signals against the universe
-- =========================================================================
CREATE OR REPLACE FUNCTION public.compute_compass_fit(_user_id uuid DEFAULT auth.uid())
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := COALESCE(_user_id, auth.uid());
  user_kws text[];
  onboarding_sectors text[];
  intel_tbl text;
  intel_tables text[] := ARRAY[
    'career_intel_agri_env_natural_resources','career_intel_education','career_intel_energy_utilities',
    'career_intel_financial_services','career_intel_govt_public_sector','career_intel_healthcare_life_sciences',
    'career_intel_hospitality_tourism_travel','career_intel_legal_prof_services','career_intel_manufacturing_engineering',
    'career_intel_media_ent_creative','career_intel_ngo_development','career_intel_real_estate_construction',
    'career_intel_retail_consumer_goods','career_intel_sports','career_intel_tech_it',
    'career_intel_telecommunications','career_intel_transport_logistics'
  ];
  best_cnt int := 0;
  force_cnt int := 0;
  no_cnt int := 0;
BEGIN
  IF uid IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Collect lowercased keyword set from assessment + onboarding sectors
  SELECT COALESCE(array_agg(DISTINCT lower(trim(keyword))) FILTER (WHERE keyword IS NOT NULL AND length(trim(keyword)) > 0), '{}')
    INTO user_kws
  FROM public.assessment_conclusion_keywords WHERE user_id = uid;

  SELECT COALESCE(array_agg(DISTINCT lower(trim(sector))) FILTER (WHERE sector IS NOT NULL), '{}')
    INTO onboarding_sectors
  FROM public.user_onboarding_sectors WHERE user_id = uid;

  -- Merge onboarding sectors as keywords too
  user_kws := array_cat(user_kws, onboarding_sectors);

  IF array_length(user_kws,1) IS NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'no_signals_yet');
  END IF;

  -- Wipe prior results for this user
  DELETE FROM public.compass_fit_results WHERE user_id = uid;

  -- ---------- ROLES from job_roles_directory ----------
  INSERT INTO public.compass_fit_results (user_id, entity_type, entity_id, entity_name, bucket, score, reasons, meta)
  SELECT
    uid,
    'role',
    r.id::text,
    r.title,
    CASE
      WHEN matches >= 5 THEN 'best'
      WHEN matches >= 2 THEN 'force'
      ELSE 'no'
    END,
    LEAST(100, matches * 12)::numeric,
    to_jsonb(matched_terms),
    jsonb_build_object('domain', r.domain, 'sector', r.sector, 'industry', r.industry)
  FROM (
    SELECT
      r.*,
      ARRAY(
        SELECT DISTINCT k
        FROM unnest(
          COALESCE(r.keywords,'{}'::text[])
          || COALESCE(r.related_skills,'{}'::text[])
          || COALESCE(r.related_subjects,'{}'::text[])
          || COALESCE(r.soft_skills,'{}'::text[])
          || COALESCE(r.interests,'{}'::text[])
          || COALESCE(r.career_path_keywords,'{}'::text[])
          || COALESCE(ARRAY[r.domain, r.sector, r.industry], '{}'::text[])
        ) AS k
        WHERE lower(trim(k)) = ANY (user_kws)
      ) AS matched_terms,
      (
        SELECT count(*)::int FROM unnest(
          COALESCE(r.keywords,'{}'::text[])
          || COALESCE(r.related_skills,'{}'::text[])
          || COALESCE(r.related_subjects,'{}'::text[])
          || COALESCE(r.soft_skills,'{}'::text[])
          || COALESCE(r.interests,'{}'::text[])
          || COALESCE(r.career_path_keywords,'{}'::text[])
          || COALESCE(ARRAY[r.domain, r.sector, r.industry], '{}'::text[])
        ) AS k
        WHERE lower(trim(k)) = ANY (user_kws)
      ) AS matches
    FROM public.job_roles_directory r
  ) r;

  -- ---------- ROLES from career_intel_* tables (dedup by role_name+sector) ----------
  FOREACH intel_tbl IN ARRAY intel_tables LOOP
    EXECUTE format($f$
      INSERT INTO public.compass_fit_results (user_id, entity_type, entity_id, entity_name, bucket, score, reasons, meta)
      SELECT
        %L::uuid,
        'role',
        md5(%L || ':' || coalesce(role_name,'') || ':' || coalesce(sector_name,'')),
        role_name,
        CASE WHEN matches >= 3 THEN 'best' WHEN matches >= 1 THEN 'force' ELSE 'no' END,
        LEAST(100, matches * 18)::numeric,
        to_jsonb(matched),
        jsonb_build_object('sector', sector_name, 'sub_sector', sub_sector_name,
                           'industry', industry_name, 'industry_family', industry_family,
                           'domain', domain_name, 'source', %L)
      FROM (
        SELECT t.*,
          ARRAY(
            SELECT DISTINCT k FROM unnest(ARRAY[
              t.sector_name, t.sub_sector_name, t.industry_family, t.industry_name,
              t.domain_name, t.sub_domain_name, t.function_name, t.job_family,
              t.career_cluster, t.career_pathway_cluster, t.role_name
            ]) AS k WHERE k IS NOT NULL AND lower(trim(k)) = ANY ($1)
          ) AS matched,
          (
            SELECT count(*)::int FROM unnest(ARRAY[
              t.sector_name, t.sub_sector_name, t.industry_family, t.industry_name,
              t.domain_name, t.sub_domain_name, t.function_name, t.job_family,
              t.career_cluster, t.career_pathway_cluster, t.role_name
            ]) AS k WHERE k IS NOT NULL AND lower(trim(k)) = ANY ($1)
          ) AS matches
        FROM public.%I t
        WHERE role_name IS NOT NULL
      ) s
      ON CONFLICT (user_id, entity_type, entity_id) DO NOTHING
    $f$, uid, intel_tbl, intel_tbl, intel_tbl)
    USING user_kws;
  END LOOP;

  -- ---------- INDUSTRIES ----------
  INSERT INTO public.compass_fit_results (user_id, entity_type, entity_id, entity_name, bucket, score, reasons, meta)
  SELECT uid, 'industry', i.id::text, i.name,
    CASE WHEN matches >= 4 THEN 'best' WHEN matches >= 2 THEN 'force' ELSE 'no' END,
    LEAST(100, matches * 15)::numeric,
    to_jsonb(matched),
    jsonb_build_object('demand_level', i.demand_level)
  FROM (
    SELECT i.*,
      ARRAY(SELECT DISTINCT k FROM unnest(
        COALESCE(i.keywords,'{}') || COALESCE(i.soft_skills,'{}') || COALESCE(i.interests,'{}') || ARRAY[i.name]
      ) k WHERE lower(trim(k)) = ANY (user_kws)) AS matched,
      (SELECT count(*)::int FROM unnest(
        COALESCE(i.keywords,'{}') || COALESCE(i.soft_skills,'{}') || COALESCE(i.interests,'{}') || ARRAY[i.name]
      ) k WHERE lower(trim(k)) = ANY (user_kws)) AS matches
    FROM public.industry_directory i
  ) i;

  -- ---------- SECTORS ----------
  INSERT INTO public.compass_fit_results (user_id, entity_type, entity_id, entity_name, bucket, score, reasons, meta)
  SELECT uid, 'sector', s.id::text, s.name,
    CASE WHEN matches >= 3 THEN 'best' WHEN matches >= 1 THEN 'force' ELSE 'no' END,
    LEAST(100, matches * 20)::numeric,
    to_jsonb(matched), '{}'::jsonb
  FROM (
    SELECT s.*,
      ARRAY(SELECT DISTINCT k FROM unnest(COALESCE(s.keywords,'{}') || ARRAY[s.name]) k
            WHERE lower(trim(k)) = ANY (user_kws)) AS matched,
      (SELECT count(*)::int FROM unnest(COALESCE(s.keywords,'{}') || ARRAY[s.name]) k
            WHERE lower(trim(k)) = ANY (user_kws)) AS matches
    FROM public.sector_directory s
  ) s;

  -- ---------- DOMAINS ----------
  INSERT INTO public.compass_fit_results (user_id, entity_type, entity_id, entity_name, bucket, score, reasons, meta)
  SELECT uid, 'domain', d.id::text, d.name,
    CASE WHEN matches >= 3 THEN 'best' WHEN matches >= 1 THEN 'force' ELSE 'no' END,
    LEAST(100, matches * 18)::numeric,
    to_jsonb(matched),
    jsonb_build_object('industry', d.industry, 'sector', d.sector)
  FROM (
    SELECT d.*,
      ARRAY(SELECT DISTINCT k FROM unnest(COALESCE(d.keywords,'{}') || COALESCE(d.soft_skills,'{}') || COALESCE(d.interests,'{}') || ARRAY[d.name]) k
            WHERE lower(trim(k)) = ANY (user_kws)) AS matched,
      (SELECT count(*)::int FROM unnest(COALESCE(d.keywords,'{}') || COALESCE(d.soft_skills,'{}') || COALESCE(d.interests,'{}') || ARRAY[d.name]) k
            WHERE lower(trim(k)) = ANY (user_kws)) AS matches
    FROM public.domain_directory d
  ) d;

  -- ---------- SKILLS ----------
  INSERT INTO public.compass_fit_results (user_id, entity_type, entity_id, entity_name, bucket, score, reasons, meta)
  SELECT uid, 'skill', sk.id::text, sk.name,
    CASE WHEN matches >= 2 THEN 'best' WHEN matches >= 1 THEN 'force' ELSE 'no' END,
    LEAST(100, matches * 30)::numeric,
    to_jsonb(matched), '{}'::jsonb
  FROM (
    SELECT sk.*,
      ARRAY(SELECT DISTINCT k FROM unnest(COALESCE(sk.keywords,'{}') || ARRAY[sk.name]) k
            WHERE lower(trim(k)) = ANY (user_kws)) AS matched,
      (SELECT count(*)::int FROM unnest(COALESCE(sk.keywords,'{}') || ARRAY[sk.name]) k
            WHERE lower(trim(k)) = ANY (user_kws)) AS matches
    FROM public.skills_directory sk
  ) sk;

  -- ---------- SUBJECTS ----------
  INSERT INTO public.compass_fit_results (user_id, entity_type, entity_id, entity_name, bucket, score, reasons, meta)
  SELECT uid, 'subject', sb.id::text, sb.name,
    CASE WHEN matches >= 2 THEN 'best' WHEN matches >= 1 THEN 'force' ELSE 'no' END,
    LEAST(100, matches * 30)::numeric,
    to_jsonb(matched), '{}'::jsonb
  FROM (
    SELECT sb.*,
      ARRAY(SELECT DISTINCT k FROM unnest(COALESCE(sb.keywords,'{}') || ARRAY[sb.name]) k
            WHERE lower(trim(k)) = ANY (user_kws)) AS matched,
      (SELECT count(*)::int FROM unnest(COALESCE(sb.keywords,'{}') || ARRAY[sb.name]) k
            WHERE lower(trim(k)) = ANY (user_kws)) AS matches
    FROM public.subjects_directory sb
  ) sb;

  -- Aggregate counts for the return summary
  SELECT
    count(*) FILTER (WHERE bucket='best'),
    count(*) FILTER (WHERE bucket='force'),
    count(*) FILTER (WHERE bucket='no')
  INTO best_cnt, force_cnt, no_cnt
  FROM public.compass_fit_results WHERE user_id = uid;

  RETURN jsonb_build_object('success', true, 'best', best_cnt, 'force', force_cnt, 'no', no_cnt);
END;
$$;

GRANT EXECUTE ON FUNCTION public.compute_compass_fit(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.compute_compass_fit(uuid) TO service_role;
