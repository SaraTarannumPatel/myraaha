CREATE OR REPLACE FUNCTION public.has_completed_curiosity_compass(_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE((p.journey_responses->>'assessment_completed')::boolean, false)
     AND COALESCE((p.journey_responses->>'psychometric_completed')::boolean, false)
     AND COALESCE((p.journey_responses->>'interests_completed')::boolean, false)
  FROM public.profiles p
  WHERE p.user_id = _user_id
$$;

GRANT EXECUTE ON FUNCTION public.has_completed_curiosity_compass(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.has_completed_curiosity_compass(uuid) TO service_role;

CREATE OR REPLACE FUNCTION public.sync_ai_roadmap_self_discovery_stage(
  _user_id uuid DEFAULT auth.uid(),
  _entity_id text DEFAULT 'global:self-discovery',
  _entity_label text DEFAULT 'Self-Discovery & Fit'
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  is_done boolean;
BEGIN
  IF _user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF auth.uid() IS NOT NULL AND auth.uid() <> _user_id THEN
    RAISE EXCEPTION 'Cannot sync another user roadmap stage';
  END IF;

  SELECT public.has_completed_curiosity_compass(_user_id) INTO is_done;
  is_done := COALESCE(is_done, false);

  INSERT INTO public.ai_roadmap_stage_progress (
    user_id,
    entity_id,
    entity_label,
    stage_id,
    status,
    started_at,
    completed_at
  )
  VALUES (
    _user_id,
    COALESCE(NULLIF(_entity_id, ''), 'global:self-discovery'),
    COALESCE(NULLIF(_entity_label, ''), 'Self-Discovery & Fit'),
    'step1',
    CASE WHEN is_done THEN 'completed' ELSE 'not_started' END,
    CASE WHEN is_done THEN now() ELSE NULL END,
    CASE WHEN is_done THEN now() ELSE NULL END
  )
  ON CONFLICT (user_id, entity_id, stage_id) DO UPDATE
  SET entity_label = EXCLUDED.entity_label,
      status = EXCLUDED.status,
      started_at = CASE
        WHEN EXCLUDED.status = 'completed' THEN COALESCE(public.ai_roadmap_stage_progress.started_at, now())
        ELSE public.ai_roadmap_stage_progress.started_at
      END,
      completed_at = CASE
        WHEN EXCLUDED.status = 'completed' THEN COALESCE(public.ai_roadmap_stage_progress.completed_at, now())
        ELSE NULL
      END,
      updated_at = now();

  RETURN is_done;
END;
$$;

GRANT EXECUTE ON FUNCTION public.sync_ai_roadmap_self_discovery_stage(uuid, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.sync_ai_roadmap_self_discovery_stage(uuid, text, text) TO service_role;

CREATE OR REPLACE FUNCTION public.sync_ai_roadmap_self_discovery_stage_from_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.sync_ai_roadmap_self_discovery_stage(
    NEW.user_id,
    'global:self-discovery',
    'Self-Discovery & Fit'
  );
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_ai_roadmap_self_discovery_stage ON public.profiles;
CREATE TRIGGER trg_sync_ai_roadmap_self_discovery_stage
AFTER INSERT OR UPDATE OF journey_responses ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.sync_ai_roadmap_self_discovery_stage_from_profile();