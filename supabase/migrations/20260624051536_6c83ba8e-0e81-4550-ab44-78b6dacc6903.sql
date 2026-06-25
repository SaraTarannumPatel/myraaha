CREATE TABLE IF NOT EXISTS public.rate_limit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  identity text NOT NULL,
  endpoint text NOT NULL,
  window_started_at timestamptz NOT NULL DEFAULT date_trunc('minute', now()),
  hit_count integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (identity, endpoint, window_started_at)
);

GRANT ALL ON public.rate_limit_log TO service_role;

ALTER TABLE public.rate_limit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service role only" ON public.rate_limit_log
  FOR ALL TO service_role USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS rate_limit_log_lookup_idx
  ON public.rate_limit_log (identity, endpoint, window_started_at DESC);

CREATE OR REPLACE FUNCTION public.record_rate_limit_hit(
  _identity text,
  _endpoint text,
  _window_seconds integer DEFAULT 60
) RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  bucket timestamptz;
  current_count integer;
BEGIN
  bucket := to_timestamp(floor(extract(epoch FROM now()) / _window_seconds) * _window_seconds);

  INSERT INTO public.rate_limit_log (identity, endpoint, window_started_at, hit_count)
  VALUES (_identity, _endpoint, bucket, 1)
  ON CONFLICT (identity, endpoint, window_started_at)
  DO UPDATE SET hit_count = public.rate_limit_log.hit_count + 1
  RETURNING hit_count INTO current_count;

  RETURN current_count;
END;
$$;

REVOKE ALL ON FUNCTION public.record_rate_limit_hit(text, text, integer) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_rate_limit_hit(text, text, integer) TO service_role;