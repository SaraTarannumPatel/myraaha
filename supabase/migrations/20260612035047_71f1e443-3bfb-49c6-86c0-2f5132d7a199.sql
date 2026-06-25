
-- 1. Interests assessment responses (per question)
CREATE TABLE public.interests_assessment_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  question_id text NOT NULL,
  question_text text NOT NULL,
  answer_value text NOT NULL,
  answer_label text NOT NULL,
  construct text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.interests_assessment_responses TO authenticated;
GRANT ALL ON public.interests_assessment_responses TO service_role;
ALTER TABLE public.interests_assessment_responses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own interest responses" ON public.interests_assessment_responses
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_iar_user ON public.interests_assessment_responses(user_id);

-- 2. Aggregated interests profile (one row per user)
CREATE TABLE public.user_interest_profile (
  user_id uuid PRIMARY KEY,
  science numeric,
  mathematics numeric,
  technology numeric,
  business numeric,
  humanities numeric,
  arts numeric,
  experimentation numeric,
  exploration numeric,
  discovery numeric,
  problem_style text,
  activity_style text,
  impact_style text,
  raw jsonb NOT NULL DEFAULT '{}'::jsonb,
  last_updated timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_interest_profile TO authenticated;
GRANT ALL ON public.user_interest_profile TO service_role;
ALTER TABLE public.user_interest_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own interest profile" ON public.user_interest_profile
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- 3. Onboarding sector picks (18-sector multi-select)
CREATE TABLE public.user_onboarding_sectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  sector_slug text NOT NULL,
  sector_name text NOT NULL,
  rank int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, sector_slug)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_onboarding_sectors TO authenticated;
GRANT ALL ON public.user_onboarding_sectors TO service_role;
ALTER TABLE public.user_onboarding_sectors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own sectors" ON public.user_onboarding_sectors
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_uos_user ON public.user_onboarding_sectors(user_id);

-- 4. Assessment conclusion keyword bag (per user)
CREATE TABLE public.assessment_conclusion_keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  keyword text NOT NULL,
  weight numeric NOT NULL DEFAULT 1,
  source_assessment text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, keyword, source_assessment)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assessment_conclusion_keywords TO authenticated;
GRANT ALL ON public.assessment_conclusion_keywords TO service_role;
ALTER TABLE public.assessment_conclusion_keywords ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users manage own conclusion keywords" ON public.assessment_conclusion_keywords
  FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE INDEX idx_ack_user_kw ON public.assessment_conclusion_keywords(user_id, keyword);

-- 5. Explore entity keyword index (global, public read)
CREATE TABLE public.explore_entity_keywords (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type text NOT NULL,
  entity_id uuid NOT NULL,
  entity_name text,
  keyword text NOT NULL,
  weight numeric NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (entity_type, entity_id, keyword)
);
GRANT SELECT ON public.explore_entity_keywords TO anon, authenticated;
GRANT ALL ON public.explore_entity_keywords TO service_role;
ALTER TABLE public.explore_entity_keywords ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Public read of explore keywords" ON public.explore_entity_keywords
  FOR SELECT USING (true);
CREATE INDEX idx_eek_keyword ON public.explore_entity_keywords(keyword);
CREATE INDEX idx_eek_entity ON public.explore_entity_keywords(entity_type, entity_id);

-- 6. Extend update_assessment_progress to accept 'interests'
CREATE OR REPLACE FUNCTION public.update_assessment_progress(_test_type text, _completed integer, _total integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  pct integer;
  prev_milestone integer := 0;
  target_milestone integer := 0;
  unlocked jsonb := '[]'::jsonb;
  m record;
  unlock_result jsonb;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF _test_type NOT IN ('discovery','psychometric','interests','skillstacker','roadmap','entrep_onboarding') THEN
    RAISE EXCEPTION 'Unsupported test type: %', _test_type;
  END IF;
  IF _total <= 0 THEN RETURN jsonb_build_object('progress', 0, 'unlocked', unlocked); END IF;

  pct := LEAST(100, GREATEST(0, (_completed::numeric / _total::numeric * 100)::integer));
  target_milestone := CASE WHEN pct >= 100 THEN 100 WHEN pct >= 75 THEN 75 WHEN pct >= 50 THEN 50 WHEN pct >= 25 THEN 25 ELSE 0 END;

  SELECT COALESCE(highest_milestone_reached, 0) INTO prev_milestone
  FROM public.assessment_progress WHERE user_id = auth.uid() AND test_type = _test_type;
  prev_milestone := COALESCE(prev_milestone, 0);

  INSERT INTO public.assessment_progress (user_id, test_type, questions_total, questions_completed, progress_percentage, highest_milestone_reached, last_question_at, completed_at)
  VALUES (auth.uid(), _test_type, _total, LEAST(_completed, _total), pct, prev_milestone, now(), CASE WHEN pct >= 100 THEN now() ELSE NULL END)
  ON CONFLICT (user_id, test_type) DO UPDATE
    SET questions_total = EXCLUDED.questions_total,
        questions_completed = GREATEST(public.assessment_progress.questions_completed, EXCLUDED.questions_completed),
        progress_percentage = GREATEST(public.assessment_progress.progress_percentage, EXCLUDED.progress_percentage),
        last_question_at = now(),
        completed_at = CASE WHEN EXCLUDED.progress_percentage >= 100 AND public.assessment_progress.completed_at IS NULL THEN now() ELSE public.assessment_progress.completed_at END;

  FOR m IN SELECT * FROM public.reward_milestones
    WHERE test_type = _test_type AND milestone_percent <= pct AND is_active = true
    ORDER BY milestone_percent ASC
  LOOP
    SELECT public.unlock_reward(m.milestone_key) INTO unlock_result;
    IF m.milestone_percent > prev_milestone THEN
      unlocked := unlocked || jsonb_build_array(unlock_result);
    END IF;
  END LOOP;

  UPDATE public.assessment_progress SET highest_milestone_reached = GREATEST(highest_milestone_reached, target_milestone)
  WHERE user_id = auth.uid() AND test_type = _test_type;

  RETURN jsonb_build_object('progress', pct, 'unlocked', unlocked);
END;
$function$;

-- 7. Seed interests milestones (mirror discovery/psychometric ladder)
INSERT INTO public.reward_milestones
  (milestone_key, test_type, milestone_percent, title, description, reward_emoji, entitlement_key, entitlement_type, duration_hours, usage_limit, is_active)
VALUES
  ('interests_25', 'interests', 25, 'Spark Snapshot', 'Your first interest patterns are emerging — preview your spark profile.', '✨', 'interests_spark_snapshot', 'feature_unlock', NULL, NULL, true),
  ('interests_50', 'interests', 50, 'Curated Career Cards', 'Unlock a curated Career Card deck tuned to your interests for 24 hours.', '🎴', 'curated_career_cards_24h', 'time_window', 24, NULL, true),
  ('interests_75', 'interests', 75, 'Domain Affinity Map', 'See which domains light you up the most across the world of work.', '🗺️', 'domain_affinity_map', 'feature_unlock', NULL, NULL, true),
  ('interests_100', 'interests', 100, 'Holistic Interest Report', 'Your full interest report — usually a paid test, free on MyRaaha.', '🌟', 'holistic_interest_report', 'feature_unlock', NULL, NULL, true)
ON CONFLICT (milestone_key) DO NOTHING;

-- 8. Recompute trigger for user_interest_profile after each response
CREATE OR REPLACE FUNCTION public.recompute_user_interest_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  uid uuid := NEW.user_id;
BEGIN
  INSERT INTO public.user_interest_profile AS p (user_id, science, mathematics, technology, business, humanities, arts, experimentation, exploration, discovery, problem_style, activity_style, impact_style, raw, last_updated)
  SELECT
    uid,
    AVG(CASE WHEN construct='science_curiosity' THEN answer_value::numeric END),
    AVG(CASE WHEN construct='mathematics_curiosity' THEN answer_value::numeric END),
    AVG(CASE WHEN construct='technology_curiosity' THEN answer_value::numeric END),
    AVG(CASE WHEN construct='business_curiosity' THEN answer_value::numeric END),
    AVG(CASE WHEN construct='humanities_curiosity' THEN answer_value::numeric END),
    AVG(CASE WHEN construct='arts_curiosity' THEN answer_value::numeric END),
    AVG(CASE WHEN construct='experimentation_curiosity' THEN answer_value::numeric END),
    AVG(CASE WHEN construct='exploration_curiosity' THEN answer_value::numeric END),
    AVG(CASE WHEN construct='discovery_curiosity' THEN answer_value::numeric END),
    MAX(CASE WHEN construct='problem_style' THEN answer_label END),
    MAX(CASE WHEN construct='activity_style' THEN answer_label END),
    MAX(CASE WHEN construct='impact_style' THEN answer_label END),
    jsonb_object_agg(question_id, jsonb_build_object('v', answer_value, 'l', answer_label)),
    now()
  FROM public.interests_assessment_responses
  WHERE user_id = uid
  ON CONFLICT (user_id) DO UPDATE
    SET science = EXCLUDED.science, mathematics = EXCLUDED.mathematics, technology = EXCLUDED.technology,
        business = EXCLUDED.business, humanities = EXCLUDED.humanities, arts = EXCLUDED.arts,
        experimentation = EXCLUDED.experimentation, exploration = EXCLUDED.exploration, discovery = EXCLUDED.discovery,
        problem_style = EXCLUDED.problem_style, activity_style = EXCLUDED.activity_style, impact_style = EXCLUDED.impact_style,
        raw = EXCLUDED.raw, last_updated = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_recompute_interest_profile
AFTER INSERT OR UPDATE ON public.interests_assessment_responses
FOR EACH ROW EXECUTE FUNCTION public.recompute_user_interest_profile();

-- 9. Match RPC: rank explore entities for a user by keyword overlap
CREATE OR REPLACE FUNCTION public.match_explore_entities_for_user(_entity_type text, _limit int DEFAULT 20)
RETURNS TABLE (entity_id uuid, entity_name text, score numeric)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT e.entity_id, MAX(e.entity_name) AS entity_name, SUM(e.weight * k.weight)::numeric AS score
  FROM public.explore_entity_keywords e
  JOIN public.assessment_conclusion_keywords k
    ON lower(k.keyword) = lower(e.keyword) AND k.user_id = auth.uid()
  WHERE e.entity_type = _entity_type
  GROUP BY e.entity_id
  ORDER BY score DESC
  LIMIT _limit;
$$;

GRANT EXECUTE ON FUNCTION public.match_explore_entities_for_user(text, int) TO authenticated;
