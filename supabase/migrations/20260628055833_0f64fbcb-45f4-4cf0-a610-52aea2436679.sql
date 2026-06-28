
-- 1) Add source-role tracking columns (idempotent)
ALTER TABLE public.career_cards
  ADD COLUMN IF NOT EXISTS source_role_name text,
  ADD COLUMN IF NOT EXISTS source_sector text,
  ADD COLUMN IF NOT EXISTS source_table text;
ALTER TABLE public.career_stories
  ADD COLUMN IF NOT EXISTS source_role_name text,
  ADD COLUMN IF NOT EXISTS source_sector text,
  ADD COLUMN IF NOT EXISTS source_table text;
ALTER TABLE public.domain_challenge_cards
  ADD COLUMN IF NOT EXISTS source_role_name text,
  ADD COLUMN IF NOT EXISTS source_sector text,
  ADD COLUMN IF NOT EXISTS source_table text;

CREATE UNIQUE INDEX IF NOT EXISTS career_cards_source_role_uniq
  ON public.career_cards(source_table, source_sector, source_role_name)
  WHERE source_role_name IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS career_stories_source_role_uniq
  ON public.career_stories(source_table, source_sector, source_role_name)
  WHERE source_role_name IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS domain_challenge_cards_source_role_uniq
  ON public.domain_challenge_cards(source_table, source_sector, source_role_name)
  WHERE source_role_name IS NOT NULL;

-- 2) Backfill: one career card, one story, one challenge, plus explore keywords
-- per role for each of the 17 sector intel tables.
DO $migrate$
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
BEGIN
  FOREACH tbl IN ARRAY intel_tables LOOP
    -- career_cards
    EXECUTE format($f$
      INSERT INTO public.career_cards
        (title, description, category, icon_emoji, tags, skills_related, difficulty,
         source_role_name, source_sector, source_table)
      SELECT DISTINCT ON (s.sector_name, s.role_name)
        s.role_name,
        'Explore the ' || s.role_name || ' role in '
          || COALESCE(s.sector_name, 'this sector') || '.'
          || CASE WHEN s.sub_sector_name IS NOT NULL
                  THEN ' Sub-sector: ' || s.sub_sector_name || '.' ELSE '' END,
        COALESCE(s.sector_name, 'general'),
        '🎯',
        ARRAY_REMOVE(ARRAY[s.sector_name, s.sub_sector_name, s.domain_name,
                          s.function_name, s.job_family, s.career_cluster], NULL),
        ARRAY_REMOVE(ARRAY[s.function_name, s.job_family], NULL),
        'beginner',
        s.role_name, s.sector_name, %L
      FROM public.%I s
      WHERE s.role_name IS NOT NULL AND length(trim(s.role_name)) > 0
      ON CONFLICT (source_table, source_sector, source_role_name)
        WHERE source_role_name IS NOT NULL DO NOTHING
    $f$, tbl, tbl);

    -- career_stories
    EXECUTE format($f$
      INSERT INTO public.career_stories
        (title, narrator_name, narrator_role, story_content, day_in_life,
         skills_highlighted, domain, tags, difficulty_level, is_ai_generated, is_active,
         source_role_name, source_sector, source_table)
      SELECT DISTINCT ON (s.sector_name, s.role_name)
        'A day with a ' || s.role_name,
        'A ' || s.role_name,
        s.role_name,
        'Working as a ' || s.role_name || ' in '
          || COALESCE(s.sector_name, 'this field') || ' means contributing to '
          || COALESCE(s.industry_name, COALESCE(s.industry_family, 'real impact'))
          || '. People in this role typically work across '
          || COALESCE(s.career_cluster, COALESCE(s.career_pathway_cluster, s.function_name, 'multiple areas'))
          || '.',
        'A typical day involves tasks tied to ' || COALESCE(s.function_name, s.job_family, 'core role responsibilities') || '.',
        ARRAY_REMOVE(ARRAY[s.function_name, s.job_family, s.career_cluster], NULL),
        COALESCE(s.domain_name, COALESCE(s.sector_name, 'general')),
        ARRAY_REMOVE(ARRAY[s.sector_name, s.sub_sector_name, s.industry_name,
                          s.industry_family, s.domain_name, s.career_pathway_cluster], NULL),
        'beginner', true, true,
        s.role_name, s.sector_name, %L
      FROM public.%I s
      WHERE s.role_name IS NOT NULL AND length(trim(s.role_name)) > 0
      ON CONFLICT (source_table, source_sector, source_role_name)
        WHERE source_role_name IS NOT NULL DO NOTHING
    $f$, tbl, tbl);

    -- domain_challenge_cards
    EXECUTE format($f$
      INSERT INTO public.domain_challenge_cards
        (challenge_name, task_description, difficulty_level, estimated_time,
         tools_used, skills_needed, domain, tags, is_ai_generated, is_active,
         source_role_name, source_sector, source_table)
      SELECT DISTINCT ON (s.sector_name, s.role_name)
        'Try the ' || s.role_name || ' challenge',
        'Take on a mini-task that simulates what a ' || s.role_name
          || ' does day-to-day in ' || COALESCE(s.sector_name, 'this sector')
          || '. Focus area: ' || COALESCE(s.function_name, s.job_family, s.career_cluster, 'core responsibilities') || '.',
        'beginner',
        '1-2 hours',
        ARRAY_REMOVE(ARRAY[s.function_name], NULL),
        ARRAY_REMOVE(ARRAY[s.job_family, s.career_cluster], NULL),
        COALESCE(s.domain_name, COALESCE(s.sector_name, 'general')),
        ARRAY_REMOVE(ARRAY[s.sector_name, s.sub_sector_name, s.industry_name, s.domain_name], NULL),
        true, true,
        s.role_name, s.sector_name, %L
      FROM public.%I s
      WHERE s.role_name IS NOT NULL AND length(trim(s.role_name)) > 0
      ON CONFLICT (source_table, source_sector, source_role_name)
        WHERE source_role_name IS NOT NULL DO NOTHING
    $f$, tbl, tbl);

    -- explore_entity_keywords — one keyword row per attribute for each role
    EXECUTE format($f$
      INSERT INTO public.explore_entity_keywords (entity_type, entity_id, entity_name, keyword, weight)
      SELECT 'role',
             md5(%L || ':' || coalesce(s.role_name,'') || ':' || coalesce(s.sector_name,''))::uuid,
             s.role_name,
             lower(trim(kw)),
             1
      FROM public.%I s,
      LATERAL unnest(ARRAY_REMOVE(ARRAY[
        s.role_name, s.sector_name, s.sub_sector_name, s.industry_family,
        s.industry_name, s.domain_name, s.sub_domain_name, s.function_name,
        s.job_family, s.career_cluster, s.career_pathway_cluster
      ], NULL)) AS kw
      WHERE s.role_name IS NOT NULL AND length(trim(s.role_name)) > 0
        AND kw IS NOT NULL AND length(trim(kw)) > 0
      ON CONFLICT (entity_type, entity_id, keyword) DO NOTHING
    $f$, tbl, tbl);
  END LOOP;
END
$migrate$;
