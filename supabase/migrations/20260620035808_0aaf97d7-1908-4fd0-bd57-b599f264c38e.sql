CREATE OR REPLACE FUNCTION public.get_sector_trending(_per_sector int DEFAULT 5)
RETURNS TABLE(sector text, role_name text, sub_sector text, mentions bigint)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  tbl text;
  intel_tables text[] := ARRAY[
    'career_intel_agri_env_natural_resources',
    'career_intel_education',
    'career_intel_energy_utilities',
    'career_intel_financial_services',
    'career_intel_govt_public_sector',
    'career_intel_healthcare_life_sciences',
    'career_intel_hospitality_tourism_travel',
    'career_intel_legal_prof_services',
    'career_intel_manufacturing_engineering',
    'career_intel_media_ent_creative',
    'career_intel_ngo_development',
    'career_intel_real_estate_construction',
    'career_intel_retail_consumer_goods',
    'career_intel_sports',
    'career_intel_tech_it',
    'career_intel_telecommunications',
    'career_intel_transport_logistics'
  ];
  per_sector int := GREATEST(1, LEAST(_per_sector, 10));
BEGIN
  FOREACH tbl IN ARRAY intel_tables LOOP
    RETURN QUERY EXECUTE format($f$
      SELECT sector_name::text AS sector,
             role_name::text AS role_name,
             COALESCE(MAX(sub_sector_name), '')::text AS sub_sector,
             COUNT(*)::bigint AS mentions
      FROM public.%I
      WHERE role_name IS NOT NULL AND length(trim(role_name)) > 0
      GROUP BY sector_name, role_name
      ORDER BY mentions DESC, role_name ASC
      LIMIT %s
    $f$, tbl, per_sector);
  END LOOP;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_sector_trending(int) TO authenticated, anon;