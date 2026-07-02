
-- 1) compute_compass_fit: add ownership guard
CREATE OR REPLACE FUNCTION public.compute_compass_fit(_user_id uuid DEFAULT auth.uid())
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
  -- Ownership guard: prevent one authenticated user from recomputing another user's fit
  IF auth.uid() IS NOT NULL AND auth.uid() <> uid THEN
    RAISE EXCEPTION 'Cannot recompute another user''s fit results';
  END IF;

  SELECT COALESCE(array_agg(DISTINCT lower(trim(keyword))) FILTER (WHERE keyword IS NOT NULL AND length(trim(keyword)) > 0), '{}')
    INTO user_kws FROM public.assessment_conclusion_keywords WHERE user_id = uid;

  SELECT COALESCE(array_agg(DISTINCT lower(trim(sector))) FILTER (WHERE sector IS NOT NULL), '{}')
    INTO onboarding_sectors FROM public.user_onboarding_sectors WHERE user_id = uid;

  user_kws := array_cat(user_kws, onboarding_sectors);

  IF array_length(user_kws,1) IS NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'no_signals_yet');
  END IF;

  DELETE FROM public.compass_fit_results WHERE user_id = uid;

  INSERT INTO public.compass_fit_results (user_id, entity_type, entity_id, entity_name, bucket, score, reasons, meta)
  SELECT uid, 'role', r.id::text, r.title,
    CASE WHEN matches >= 5 THEN 'best' WHEN matches >= 2 THEN 'force' ELSE 'no' END,
    LEAST(100, matches * 12)::numeric, to_jsonb(matched_terms),
    jsonb_build_object('domain', r.domain, 'sector', r.sector, 'industry', r.industry)
  FROM (
    SELECT r.*,
      ARRAY(SELECT DISTINCT k FROM unnest(
        COALESCE(r.keywords,'{}'::text[]) || COALESCE(r.related_skills,'{}'::text[]) || COALESCE(r.related_subjects,'{}'::text[])
        || COALESCE(r.soft_skills,'{}'::text[]) || COALESCE(r.interests,'{}'::text[]) || COALESCE(r.career_path_keywords,'{}'::text[])
        || COALESCE(ARRAY[r.domain, r.sector, r.industry], '{}'::text[])
      ) AS k WHERE lower(trim(k)) = ANY (user_kws)) AS matched_terms,
      (SELECT count(*)::int FROM unnest(
        COALESCE(r.keywords,'{}'::text[]) || COALESCE(r.related_skills,'{}'::text[]) || COALESCE(r.related_subjects,'{}'::text[])
        || COALESCE(r.soft_skills,'{}'::text[]) || COALESCE(r.interests,'{}'::text[]) || COALESCE(r.career_path_keywords,'{}'::text[])
        || COALESCE(ARRAY[r.domain, r.sector, r.industry], '{}'::text[])
      ) AS k WHERE lower(trim(k)) = ANY (user_kws)) AS matches
    FROM public.job_roles_directory r
  ) r;

  FOREACH intel_tbl IN ARRAY intel_tables LOOP
    EXECUTE format($f$
      INSERT INTO public.compass_fit_results (user_id, entity_type, entity_id, entity_name, bucket, score, reasons, meta)
      SELECT %L::uuid, 'role',
        md5(%L || ':' || coalesce(role_name,'') || ':' || coalesce(sector_name,'')),
        role_name,
        CASE WHEN matches >= 3 THEN 'best' WHEN matches >= 1 THEN 'force' ELSE 'no' END,
        LEAST(100, matches * 18)::numeric, to_jsonb(matched),
        jsonb_build_object('sector', sector_name, 'sub_sector', sub_sector_name,
                           'industry', industry_name, 'industry_family', industry_family,
                           'domain', domain_name, 'source', %L)
      FROM (
        SELECT t.*,
          ARRAY(SELECT DISTINCT k FROM unnest(ARRAY[
            t.sector_name, t.sub_sector_name, t.industry_family, t.industry_name,
            t.domain_name, t.sub_domain_name, t.function_name, t.job_family,
            t.career_cluster, t.career_pathway_cluster, t.role_name
          ]) AS k WHERE k IS NOT NULL AND lower(trim(k)) = ANY ($1)) AS matched,
          (SELECT count(*)::int FROM unnest(ARRAY[
            t.sector_name, t.sub_sector_name, t.industry_family, t.industry_name,
            t.domain_name, t.sub_domain_name, t.function_name, t.job_family,
            t.career_cluster, t.career_pathway_cluster, t.role_name
          ]) AS k WHERE k IS NOT NULL AND lower(trim(k)) = ANY ($1)) AS matches
        FROM public.%I t WHERE role_name IS NOT NULL
      ) s
      ON CONFLICT (user_id, entity_type, entity_id) DO NOTHING
    $f$, uid, intel_tbl, intel_tbl, intel_tbl) USING user_kws;
  END LOOP;

  INSERT INTO public.compass_fit_results (user_id, entity_type, entity_id, entity_name, bucket, score, reasons, meta)
  SELECT uid, 'industry', i.id::text, i.name,
    CASE WHEN matches >= 4 THEN 'best' WHEN matches >= 2 THEN 'force' ELSE 'no' END,
    LEAST(100, matches * 15)::numeric, to_jsonb(matched),
    jsonb_build_object('demand_level', i.demand_level)
  FROM (
    SELECT i.*,
      ARRAY(SELECT DISTINCT k FROM unnest(COALESCE(i.keywords,'{}') || COALESCE(i.soft_skills,'{}') || COALESCE(i.interests,'{}') || ARRAY[i.name]) k WHERE lower(trim(k)) = ANY (user_kws)) AS matched,
      (SELECT count(*)::int FROM unnest(COALESCE(i.keywords,'{}') || COALESCE(i.soft_skills,'{}') || COALESCE(i.interests,'{}') || ARRAY[i.name]) k WHERE lower(trim(k)) = ANY (user_kws)) AS matches
    FROM public.industry_directory i
  ) i;

  INSERT INTO public.compass_fit_results (user_id, entity_type, entity_id, entity_name, bucket, score, reasons, meta)
  SELECT uid, 'sector', s.id::text, s.name,
    CASE WHEN matches >= 3 THEN 'best' WHEN matches >= 1 THEN 'force' ELSE 'no' END,
    LEAST(100, matches * 20)::numeric, to_jsonb(matched), '{}'::jsonb
  FROM (
    SELECT s.*,
      ARRAY(SELECT DISTINCT k FROM unnest(COALESCE(s.keywords,'{}') || ARRAY[s.name]) k WHERE lower(trim(k)) = ANY (user_kws)) AS matched,
      (SELECT count(*)::int FROM unnest(COALESCE(s.keywords,'{}') || ARRAY[s.name]) k WHERE lower(trim(k)) = ANY (user_kws)) AS matches
    FROM public.sector_directory s
  ) s;

  INSERT INTO public.compass_fit_results (user_id, entity_type, entity_id, entity_name, bucket, score, reasons, meta)
  SELECT uid, 'domain', d.id::text, d.name,
    CASE WHEN matches >= 3 THEN 'best' WHEN matches >= 1 THEN 'force' ELSE 'no' END,
    LEAST(100, matches * 18)::numeric, to_jsonb(matched),
    jsonb_build_object('industry', d.industry, 'sector', d.sector)
  FROM (
    SELECT d.*,
      ARRAY(SELECT DISTINCT k FROM unnest(COALESCE(d.keywords,'{}') || COALESCE(d.soft_skills,'{}') || COALESCE(d.interests,'{}') || ARRAY[d.name]) k WHERE lower(trim(k)) = ANY (user_kws)) AS matched,
      (SELECT count(*)::int FROM unnest(COALESCE(d.keywords,'{}') || COALESCE(d.soft_skills,'{}') || COALESCE(d.interests,'{}') || ARRAY[d.name]) k WHERE lower(trim(k)) = ANY (user_kws)) AS matches
    FROM public.domain_directory d
  ) d;

  INSERT INTO public.compass_fit_results (user_id, entity_type, entity_id, entity_name, bucket, score, reasons, meta)
  SELECT uid, 'skill', sk.id::text, sk.name,
    CASE WHEN matches >= 2 THEN 'best' WHEN matches >= 1 THEN 'force' ELSE 'no' END,
    LEAST(100, matches * 30)::numeric, to_jsonb(matched), '{}'::jsonb
  FROM (
    SELECT sk.*,
      ARRAY(SELECT DISTINCT k FROM unnest(COALESCE(sk.keywords,'{}') || ARRAY[sk.name]) k WHERE lower(trim(k)) = ANY (user_kws)) AS matched,
      (SELECT count(*)::int FROM unnest(COALESCE(sk.keywords,'{}') || ARRAY[sk.name]) k WHERE lower(trim(k)) = ANY (user_kws)) AS matches
    FROM public.skills_directory sk
  ) sk;

  INSERT INTO public.compass_fit_results (user_id, entity_type, entity_id, entity_name, bucket, score, reasons, meta)
  SELECT uid, 'subject', sb.id::text, sb.name,
    CASE WHEN matches >= 2 THEN 'best' WHEN matches >= 1 THEN 'force' ELSE 'no' END,
    LEAST(100, matches * 30)::numeric, to_jsonb(matched), '{}'::jsonb
  FROM (
    SELECT sb.*,
      ARRAY(SELECT DISTINCT k FROM unnest(COALESCE(sb.keywords,'{}') || ARRAY[sb.name]) k WHERE lower(trim(k)) = ANY (user_kws)) AS matched,
      (SELECT count(*)::int FROM unnest(COALESCE(sb.keywords,'{}') || ARRAY[sb.name]) k WHERE lower(trim(k)) = ANY (user_kws)) AS matches
    FROM public.subjects_directory sb
  ) sb;

  SELECT count(*) FILTER (WHERE bucket='best'), count(*) FILTER (WHERE bucket='force'), count(*) FILTER (WHERE bucket='no')
  INTO best_cnt, force_cnt, no_cnt FROM public.compass_fit_results WHERE user_id = uid;

  RETURN jsonb_build_object('success', true, 'best', best_cnt, 'force', force_cnt, 'no', no_cnt);
END;
$function$;

-- 2) has_completed_curiosity_compass: add ownership guard
CREATE OR REPLACE FUNCTION public.has_completed_curiosity_compass(_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  is_done boolean;
BEGIN
  IF _user_id IS NULL THEN RETURN false; END IF;
  IF auth.uid() IS NOT NULL AND auth.uid() <> _user_id THEN
    RAISE EXCEPTION 'Cannot check another user''s compass status';
  END IF;
  SELECT COALESCE((p.journey_responses->>'assessment_completed')::boolean, false)
     AND COALESCE((p.journey_responses->>'psychometric_completed')::boolean, false)
     AND COALESCE((p.journey_responses->>'interests_completed')::boolean, false)
  INTO is_done
  FROM public.profiles p WHERE p.user_id = _user_id;
  RETURN COALESCE(is_done, false);
END;
$function$;

-- 3) Revoke EXECUTE on these SECURITY DEFINER functions from anon/authenticated
--    They are only called by service role (edge functions) or other SECURITY DEFINER functions.
REVOKE EXECUTE ON FUNCTION public.compute_compass_fit(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.has_completed_curiosity_compass(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.compute_compass_fit(uuid) TO service_role;
GRANT EXECUTE ON FUNCTION public.has_completed_curiosity_compass(uuid) TO service_role;

-- 4) founder_profiles: restrict SELECT to owner only
DROP POLICY IF EXISTS "Founder profiles viewable by authenticated" ON public.founder_profiles;
CREATE POLICY "Founder profiles viewable by owner" ON public.founder_profiles
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- 5) mentor_reviews: hide anonymous reviewer identity by restricting anonymous rows to their author
DROP POLICY IF EXISTS "Reviews viewable by authenticated" ON public.mentor_reviews;
CREATE POLICY "Reviews viewable (non-anon public, anon self-only)" ON public.mentor_reviews
  FOR SELECT TO authenticated
  USING (
    (COALESCE(is_anonymous, false) = false)
    OR (auth.uid() = reviewer_id)
  );

-- 6) session_participants: restrict SELECT to the participant themselves or the session mentor
DROP POLICY IF EXISTS "Session participants viewable by authenticated" ON public.session_participants;
CREATE POLICY "Session participants viewable by participant or mentor" ON public.session_participants
  FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.mentorship_sessions ms
      JOIN public.mentors m ON m.id = ms.mentor_id
      WHERE ms.id = session_participants.session_id AND m.user_id = auth.uid()
    )
  );
