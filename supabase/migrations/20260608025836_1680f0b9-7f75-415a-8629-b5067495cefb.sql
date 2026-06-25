
-- 1) Stable uuid + 2D map coords + cluster id on career_taxonomy
ALTER TABLE public.career_taxonomy
  ADD COLUMN IF NOT EXISTS role_uuid uuid NOT NULL DEFAULT gen_random_uuid(),
  ADD COLUMN IF NOT EXISTS coord_x double precision,
  ADD COLUMN IF NOT EXISTS coord_y double precision,
  ADD COLUMN IF NOT EXISTS cluster_id smallint;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'career_taxonomy_role_uuid_key'
  ) THEN
    ALTER TABLE public.career_taxonomy
      ADD CONSTRAINT career_taxonomy_role_uuid_key UNIQUE (role_uuid);
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS career_taxonomy_cluster_idx ON public.career_taxonomy (cluster_id);
CREATE INDEX IF NOT EXISTS career_taxonomy_coords_idx  ON public.career_taxonomy (coord_x, coord_y);
CREATE INDEX IF NOT EXISTS career_taxonomy_sector_idx  ON public.career_taxonomy (sector_name);

-- 2) Make sure role_ksao_vectors is reachable by backend writers + signed-in readers
GRANT SELECT ON public.role_ksao_vectors TO authenticated;
GRANT ALL    ON public.role_ksao_vectors TO service_role;

CREATE INDEX IF NOT EXISTS role_ksao_vectors_role_idx ON public.role_ksao_vectors (role_id);
CREATE INDEX IF NOT EXISTS role_ksao_vectors_dim_idx  ON public.role_ksao_vectors (dimension_id);

-- 3) Public read on career_taxonomy for the map UI (taxonomy is non-sensitive reference data)
GRANT SELECT ON public.career_taxonomy TO anon, authenticated;
GRANT ALL    ON public.career_taxonomy TO service_role;
ALTER TABLE public.career_taxonomy ENABLE ROW LEVEL SECURITY;
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Career taxonomy is publicly readable' AND tablename = 'career_taxonomy') THEN
    CREATE POLICY "Career taxonomy is publicly readable"
      ON public.career_taxonomy FOR SELECT
      USING (true);
  END IF;
END $$;
