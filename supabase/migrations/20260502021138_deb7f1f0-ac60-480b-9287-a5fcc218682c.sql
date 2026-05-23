-- Unique source_url for safe upsert
CREATE UNIQUE INDEX IF NOT EXISTS content_library_items_source_url_key
  ON public.content_library_items(source_url)
  WHERE source_url IS NOT NULL;

-- Track seeding runs (admin visibility)
CREATE TABLE IF NOT EXISTS public.content_library_ingest_runs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  run_type text NOT NULL DEFAULT 'cron',
  items_inserted integer NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'success',
  notes text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.content_library_ingest_runs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Admins read ingest runs" ON public.content_library_ingest_runs
    FOR SELECT USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL; END $$;