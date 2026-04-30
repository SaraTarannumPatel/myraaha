CREATE UNIQUE INDEX IF NOT EXISTS reward_unlock_events_user_milestone_idx
ON public.reward_unlock_events (user_id, milestone_key);

CREATE OR REPLACE FUNCTION public.unlock_reward(_milestone_key text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  m record;
  existing_id uuid;
  expiry timestamptz;
  inserted_event_id uuid;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT * INTO m
  FROM public.reward_milestones
  WHERE milestone_key = _milestone_key
    AND is_active = true;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'reason', 'milestone_not_found');
  END IF;

  SELECT id INTO existing_id
  FROM public.user_entitlements
  WHERE user_id = auth.uid()
    AND entitlement_key = m.entitlement_key;

  IF m.duration_hours IS NOT NULL THEN
    expiry := now() + (m.duration_hours || ' hours')::interval;
  END IF;

  IF existing_id IS NULL THEN
    INSERT INTO public.user_entitlements (
      user_id,
      entitlement_key,
      entitlement_type,
      source_milestone_key,
      usage_limit,
      expires_at,
      metadata
    )
    VALUES (
      auth.uid(),
      m.entitlement_key,
      m.entitlement_type,
      m.milestone_key,
      m.usage_limit,
      expiry,
      jsonb_build_object('test_type', m.test_type, 'milestone_percent', m.milestone_percent)
    )
    RETURNING id INTO existing_id;
  ELSE
    UPDATE public.user_entitlements
    SET is_active = true,
        expires_at = CASE
          WHEN m.duration_hours IS NOT NULL AND (expires_at IS NULL OR expires_at < now()) THEN expiry
          ELSE expires_at
        END,
        usage_limit = COALESCE(usage_limit, m.usage_limit),
        metadata = COALESCE(metadata, '{}'::jsonb) || jsonb_build_object('test_type', m.test_type, 'milestone_percent', m.milestone_percent)
    WHERE id = existing_id;
  END IF;

  INSERT INTO public.reward_unlock_events (
    user_id,
    milestone_key,
    test_type,
    milestone_percent,
    title,
    description,
    reward_emoji,
    acknowledged
  )
  VALUES (
    auth.uid(),
    m.milestone_key,
    m.test_type,
    m.milestone_percent,
    m.title,
    m.description,
    m.reward_emoji,
    false
  )
  ON CONFLICT (user_id, milestone_key) DO UPDATE
  SET title = EXCLUDED.title,
      description = EXCLUDED.description,
      reward_emoji = EXCLUDED.reward_emoji,
      test_type = EXCLUDED.test_type,
      milestone_percent = EXCLUDED.milestone_percent,
      acknowledged = CASE
        WHEN public.reward_unlock_events.acknowledged THEN public.reward_unlock_events.acknowledged
        ELSE false
      END
  RETURNING id INTO inserted_event_id;

  RETURN jsonb_build_object(
    'success', true,
    'already_unlocked', existing_id IS NOT NULL,
    'entitlement_key', m.entitlement_key,
    'title', m.title,
    'description', m.description,
    'emoji', m.reward_emoji,
    'expires_at', expiry,
    'event_id', inserted_event_id
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.update_assessment_progress(_test_type text, _completed integer, _total integer)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pct integer;
  prev_milestone integer := 0;
  target_milestone integer := 0;
  unlocked jsonb := '[]'::jsonb;
  m record;
  unlock_result jsonb;
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF _test_type NOT IN ('discovery', 'psychometric') THEN
    RAISE EXCEPTION 'Unsupported test type: %', _test_type;
  END IF;

  IF _total <= 0 THEN
    RETURN jsonb_build_object('progress', 0, 'unlocked', unlocked);
  END IF;

  pct := LEAST(100, GREATEST(0, (_completed::numeric / _total::numeric * 100)::integer));
  target_milestone := CASE
    WHEN pct >= 100 THEN 100
    WHEN pct >= 75 THEN 75
    WHEN pct >= 50 THEN 50
    WHEN pct >= 25 THEN 25
    ELSE 0
  END;

  SELECT COALESCE(highest_milestone_reached, 0)
  INTO prev_milestone
  FROM public.assessment_progress
  WHERE user_id = auth.uid()
    AND test_type = _test_type;

  prev_milestone := COALESCE(prev_milestone, 0);

  INSERT INTO public.assessment_progress (
    user_id,
    test_type,
    questions_total,
    questions_completed,
    progress_percentage,
    highest_milestone_reached,
    last_question_at,
    completed_at
  )
  VALUES (
    auth.uid(),
    _test_type,
    _total,
    LEAST(_completed, _total),
    pct,
    prev_milestone,
    now(),
    CASE WHEN pct >= 100 THEN now() ELSE NULL END
  )
  ON CONFLICT (user_id, test_type) DO UPDATE
  SET questions_total = EXCLUDED.questions_total,
      questions_completed = GREATEST(public.assessment_progress.questions_completed, EXCLUDED.questions_completed),
      progress_percentage = GREATEST(public.assessment_progress.progress_percentage, EXCLUDED.progress_percentage),
      last_question_at = now(),
      completed_at = CASE
        WHEN EXCLUDED.progress_percentage >= 100 AND public.assessment_progress.completed_at IS NULL THEN now()
        ELSE public.assessment_progress.completed_at
      END;

  FOR m IN
    SELECT *
    FROM public.reward_milestones
    WHERE test_type = _test_type
      AND milestone_percent <= pct
      AND is_active = true
    ORDER BY milestone_percent ASC
  LOOP
    SELECT public.unlock_reward(m.milestone_key) INTO unlock_result;
    IF m.milestone_percent > prev_milestone THEN
      unlocked := unlocked || jsonb_build_array(unlock_result);
    END IF;
  END LOOP;

  UPDATE public.assessment_progress
  SET highest_milestone_reached = GREATEST(highest_milestone_reached, target_milestone)
  WHERE user_id = auth.uid()
    AND test_type = _test_type;

  RETURN jsonb_build_object('progress', pct, 'unlocked', unlocked);
END;
$$;