ALTER TABLE public.reward_milestones DROP CONSTRAINT IF EXISTS reward_milestones_milestone_percent_check;
ALTER TABLE public.reward_milestones ADD CONSTRAINT reward_milestones_milestone_percent_check CHECK (milestone_percent IN (25, 33, 50, 67, 75, 100));

UPDATE public.reward_milestones
SET is_active = false
WHERE test_type IN ('discovery','psychometric','interests')
  AND milestone_percent IN (25, 50, 75);

INSERT INTO public.reward_milestones
  (milestone_key, test_type, milestone_percent, title, description, reward_emoji, entitlement_key, entitlement_type, duration_hours, usage_limit, is_active)
VALUES
  ('discovery_33',     'discovery',    33,  'Curiosity Sparked',         'You ignited your discovery journey — preview your early signal map.',   '🔍', 'discovery_signal_preview',  'feature_unlock', NULL, NULL, true),
  ('discovery_67',     'discovery',    67,  'Pattern Forming',           'Your archetype is taking shape — unlock the pattern preview.',          '🧩', 'discovery_pattern_preview', 'feature_unlock', NULL, NULL, true),
  ('discovery_100_v2', 'discovery',    100, 'Discovery Decoded',         'Full Discovery Report unlocked — usually paid, free on MyRaaha.',       '🌟', 'free_discovery_test',       'feature_unlock', NULL, NULL, true),
  ('psychometric_33',     'psychometric', 33,  'Mind Scan Begun',        'First slice of your cognitive map is live.',                            '🧠', 'psych_scan_preview',        'feature_unlock', NULL, NULL, true),
  ('psychometric_67',     'psychometric', 67,  'Cognitive Calibrated',   'Mid-depth psychometric calibration unlocked.',                          '🎯', 'psych_calibration_mid',     'feature_unlock', NULL, NULL, true),
  ('psychometric_100_v2', 'psychometric', 100, 'Psychometric Mastered',  'Full Psychometric Report unlocked — usually paid, free on MyRaaha.',    '🏅', 'free_psychometric_test',    'feature_unlock', NULL, NULL, true),
  ('interests_33',     'interests',    33,  'Spark Snapshot',            'Your first interest patterns are emerging — preview your spark profile.', '✨', 'interests_spark_snapshot',  'feature_unlock', NULL, NULL, true),
  ('interests_67',     'interests',    67,  'Domain Affinity Map',       'See which domains light you up the most across the world of work.',       '🗺️', 'domain_affinity_map',       'feature_unlock', NULL, NULL, true),
  ('interests_100_v2', 'interests',    100, 'Holistic Interest Report',  'Your full interest report — usually a paid test, free on MyRaaha.',       '🌟', 'free_interests_assessment', 'feature_unlock', NULL, NULL, true)
ON CONFLICT (milestone_key) DO UPDATE
  SET test_type        = EXCLUDED.test_type,
      milestone_percent= EXCLUDED.milestone_percent,
      title            = EXCLUDED.title,
      description      = EXCLUDED.description,
      reward_emoji     = EXCLUDED.reward_emoji,
      entitlement_key  = EXCLUDED.entitlement_key,
      entitlement_type = EXCLUDED.entitlement_type,
      duration_hours   = EXCLUDED.duration_hours,
      usage_limit      = EXCLUDED.usage_limit,
      is_active        = true;

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

  SELECT COALESCE(MAX(milestone_percent), 0) INTO target_milestone
  FROM public.reward_milestones
  WHERE test_type = _test_type AND is_active = true AND milestone_percent <= pct;

  SELECT COALESCE(highest_milestone_reached, 0) INTO prev_milestone
  FROM public.assessment_progress WHERE user_id = auth.uid() AND test_type = _test_type;
  prev_milestone := COALESCE(prev_milestone, 0);

  INSERT INTO public.assessment_progress (user_id, test_type, questions_total, questions_completed, progress_percentage, highest_milestone_reached, last_question_at, completed_at)
  VALUES (auth.uid(), _test_type, _total, LEAST(_completed, _total), pct, prev_milestone, now(),
          CASE WHEN pct >= 100 THEN now() ELSE NULL END)
  ON CONFLICT (user_id, test_type) DO UPDATE
    SET questions_total      = EXCLUDED.questions_total,
        questions_completed  = GREATEST(public.assessment_progress.questions_completed, EXCLUDED.questions_completed),
        progress_percentage  = GREATEST(public.assessment_progress.progress_percentage, EXCLUDED.progress_percentage),
        last_question_at     = now(),
        completed_at         = CASE WHEN EXCLUDED.progress_percentage >= 100 AND public.assessment_progress.completed_at IS NULL THEN now() ELSE public.assessment_progress.completed_at END;

  FOR m IN SELECT * FROM public.reward_milestones
    WHERE test_type = _test_type AND milestone_percent <= pct AND is_active = true
    ORDER BY milestone_percent ASC
  LOOP
    SELECT public.unlock_reward(m.milestone_key) INTO unlock_result;
    IF m.milestone_percent > prev_milestone THEN
      unlocked := unlocked || jsonb_build_array(unlock_result);
    END IF;
  END LOOP;

  UPDATE public.assessment_progress
  SET highest_milestone_reached = GREATEST(highest_milestone_reached, target_milestone)
  WHERE user_id = auth.uid() AND test_type = _test_type;

  RETURN jsonb_build_object('progress', pct, 'unlocked', unlocked);
END;
$function$;