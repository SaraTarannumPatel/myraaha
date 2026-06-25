
CREATE TABLE IF NOT EXISTS public.security_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NULL,
  event_type text NOT NULL,
  severity text NOT NULL DEFAULT 'info',
  ip_hash text NULL,
  user_agent text NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.security_audit_log TO authenticated;
GRANT ALL ON public.security_audit_log TO service_role;

ALTER TABLE public.security_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own audit events"
  ON public.security_audit_log
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS security_audit_log_user_created_idx
  ON public.security_audit_log (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS security_audit_log_event_idx
  ON public.security_audit_log (event_type, created_at DESC);

CREATE OR REPLACE FUNCTION public.log_security_event(
  _event_type text,
  _severity text DEFAULT 'info',
  _metadata jsonb DEFAULT '{}'::jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_id uuid;
BEGIN
  IF _event_type IS NULL OR length(trim(_event_type)) = 0 THEN
    RAISE EXCEPTION 'event_type required';
  END IF;
  INSERT INTO public.security_audit_log (user_id, event_type, severity, metadata)
  VALUES (auth.uid(), _event_type, COALESCE(_severity, 'info'), COALESCE(_metadata, '{}'::jsonb))
  RETURNING id INTO new_id;
  RETURN new_id;
END;
$$;
