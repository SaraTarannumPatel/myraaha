
-- Ensure trgm extension first (used by taxonomy_nodes name index)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ============================================================
-- Enums
-- ============================================================
DO $$ BEGIN
  CREATE TYPE public.taxonomy_level AS ENUM (
    'sector','sub_sector','industry_family','industry','domain','sub_domain',
    'function','job_family','career_cluster','career_pathway_cluster','role'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.ksao_family AS ENUM (
    'knowledge','skill','cognitive','curiosity','value','personality'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.role_edge_type AS ENUM (
    'similar','progression','pivot','cluster_mediated'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.pathfinder_flavor AS ENUM ('fastest','safest','no_cost');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.exam_stage AS ENUM ('class_10','class_12','ug','pg','post_pg','any');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============================================================
-- 1. taxonomy_nodes
-- ============================================================
CREATE TABLE public.taxonomy_nodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid REFERENCES public.taxonomy_nodes(id) ON DELETE CASCADE,
  level public.taxonomy_level NOT NULL,
  name text NOT NULL,
  slug text NOT NULL,
  description text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  source text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (parent_id, slug, level)
);
CREATE INDEX idx_taxonomy_nodes_level ON public.taxonomy_nodes(level);
CREATE INDEX idx_taxonomy_nodes_parent ON public.taxonomy_nodes(parent_id);
CREATE INDEX idx_taxonomy_nodes_slug ON public.taxonomy_nodes(slug);
CREATE INDEX idx_taxonomy_nodes_name_trgm ON public.taxonomy_nodes USING gin (name gin_trgm_ops);

GRANT SELECT ON public.taxonomy_nodes TO anon, authenticated;
GRANT ALL ON public.taxonomy_nodes TO service_role;
ALTER TABLE public.taxonomy_nodes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "taxonomy_nodes public read" ON public.taxonomy_nodes FOR SELECT USING (true);
CREATE POLICY "taxonomy_nodes admin write" ON public.taxonomy_nodes FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============================================================
-- 2. ksao_dimensions
-- ============================================================
CREATE TABLE public.ksao_dimensions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  family public.ksao_family NOT NULL,
  name text NOT NULL,
  description text,
  parent_code text,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_ksao_dimensions_family ON public.ksao_dimensions(family);

GRANT SELECT ON public.ksao_dimensions TO anon, authenticated;
GRANT ALL ON public.ksao_dimensions TO service_role;
ALTER TABLE public.ksao_dimensions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ksao_dimensions public read" ON public.ksao_dimensions FOR SELECT USING (true);
CREATE POLICY "ksao_dimensions admin write" ON public.ksao_dimensions FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============================================================
-- 3. role_ksao_vectors
-- ============================================================
CREATE TABLE public.role_ksao_vectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES public.taxonomy_nodes(id) ON DELETE CASCADE,
  dimension_id uuid NOT NULL REFERENCES public.ksao_dimensions(id) ON DELETE CASCADE,
  weight numeric(6,4) NOT NULL DEFAULT 0,
  importance numeric(6,4),
  source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role_id, dimension_id)
);
CREATE INDEX idx_role_ksao_role ON public.role_ksao_vectors(role_id);
CREATE INDEX idx_role_ksao_dim ON public.role_ksao_vectors(dimension_id);

GRANT SELECT ON public.role_ksao_vectors TO anon, authenticated;
GRANT ALL ON public.role_ksao_vectors TO service_role;
ALTER TABLE public.role_ksao_vectors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "role_ksao public read" ON public.role_ksao_vectors FOR SELECT USING (true);
CREATE POLICY "role_ksao admin write" ON public.role_ksao_vectors FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============================================================
-- 4. user_ksao_vectors (private)
-- ============================================================
CREATE TABLE public.user_ksao_vectors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  dimension_id uuid NOT NULL REFERENCES public.ksao_dimensions(id) ON DELETE CASCADE,
  score numeric(6,4) NOT NULL DEFAULT 0,
  confidence numeric(6,4) NOT NULL DEFAULT 0,
  sources jsonb NOT NULL DEFAULT '[]'::jsonb,
  last_signal_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, dimension_id)
);
CREATE INDEX idx_user_ksao_user ON public.user_ksao_vectors(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_ksao_vectors TO authenticated;
GRANT ALL ON public.user_ksao_vectors TO service_role;
ALTER TABLE public.user_ksao_vectors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_ksao own" ON public.user_ksao_vectors FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 5. exam_gates
-- ============================================================
CREATE TABLE public.exam_gates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  full_name text,
  eligibility_stage public.exam_stage NOT NULL DEFAULT 'any',
  frequency text,
  difficulty_score numeric(4,2),
  typical_prep_months integer,
  conducting_body text,
  next_window text,
  official_url text,
  description text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_exam_gates_stage ON public.exam_gates(eligibility_stage);

GRANT SELECT ON public.exam_gates TO anon, authenticated;
GRANT ALL ON public.exam_gates TO service_role;
ALTER TABLE public.exam_gates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "exam_gates public read" ON public.exam_gates FOR SELECT USING (true);
CREATE POLICY "exam_gates admin write" ON public.exam_gates FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============================================================
-- 6. role_exam_gate_edges
-- ============================================================
CREATE TABLE public.role_exam_gate_edges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES public.taxonomy_nodes(id) ON DELETE CASCADE,
  gate_id uuid NOT NULL REFERENCES public.exam_gates(id) ON DELETE CASCADE,
  is_mandatory boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role_id, gate_id)
);
CREATE INDEX idx_rege_role ON public.role_exam_gate_edges(role_id);
CREATE INDEX idx_rege_gate ON public.role_exam_gate_edges(gate_id);

GRANT SELECT ON public.role_exam_gate_edges TO anon, authenticated;
GRANT ALL ON public.role_exam_gate_edges TO service_role;
ALTER TABLE public.role_exam_gate_edges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rege public read" ON public.role_exam_gate_edges FOR SELECT USING (true);
CREATE POLICY "rege admin write" ON public.role_exam_gate_edges FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============================================================
-- 7. role_role_edges
-- ============================================================
CREATE TABLE public.role_role_edges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  from_role_id uuid NOT NULL REFERENCES public.taxonomy_nodes(id) ON DELETE CASCADE,
  to_role_id uuid NOT NULL REFERENCES public.taxonomy_nodes(id) ON DELETE CASCADE,
  edge_type public.role_edge_type NOT NULL,
  weight numeric(6,4) NOT NULL DEFAULT 0,
  rationale text,
  source text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (from_role_id, to_role_id, edge_type),
  CHECK (from_role_id <> to_role_id)
);
CREATE INDEX idx_rre_from ON public.role_role_edges(from_role_id);
CREATE INDEX idx_rre_to ON public.role_role_edges(to_role_id);
CREATE INDEX idx_rre_type ON public.role_role_edges(edge_type);

GRANT SELECT ON public.role_role_edges TO anon, authenticated;
GRANT ALL ON public.role_role_edges TO service_role;
ALTER TABLE public.role_role_edges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rre public read" ON public.role_role_edges FOR SELECT USING (true);
CREATE POLICY "rre admin write" ON public.role_role_edges FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============================================================
-- 8. role_education_edges
-- ============================================================
CREATE TABLE public.role_education_edges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES public.taxonomy_nodes(id) ON DELETE CASCADE,
  program_kind text NOT NULL,
  program_id uuid NOT NULL,
  fit_score numeric(6,4),
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (role_id, program_kind, program_id)
);
CREATE INDEX idx_ree_role ON public.role_education_edges(role_id);
CREATE INDEX idx_ree_program ON public.role_education_edges(program_kind, program_id);

GRANT SELECT ON public.role_education_edges TO anon, authenticated;
GRANT ALL ON public.role_education_edges TO service_role;
ALTER TABLE public.role_education_edges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "ree public read" ON public.role_education_edges FOR SELECT USING (true);
CREATE POLICY "ree admin write" ON public.role_education_edges FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============================================================
-- 9. pathfinder_routes (private)
-- ============================================================
CREATE TABLE public.pathfinder_routes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  target_role_id uuid NOT NULL REFERENCES public.taxonomy_nodes(id) ON DELETE CASCADE,
  flavor public.pathfinder_flavor NOT NULL,
  total_months integer,
  total_cost_inr numeric(12,2),
  success_score numeric(6,4),
  route_data jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean NOT NULL DEFAULT true,
  computed_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_pfr_user ON public.pathfinder_routes(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pathfinder_routes TO authenticated;
GRANT ALL ON public.pathfinder_routes TO service_role;
ALTER TABLE public.pathfinder_routes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pfr own" ON public.pathfinder_routes FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 10. pathfinder_milestones (private)
-- ============================================================
CREATE TABLE public.pathfinder_milestones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id uuid NOT NULL REFERENCES public.pathfinder_routes(id) ON DELETE CASCADE,
  step_order integer NOT NULL,
  kind text NOT NULL,
  ref_id uuid,
  title text NOT NULL,
  description text,
  est_months numeric(5,2),
  est_cost_inr numeric(12,2),
  status text NOT NULL DEFAULT 'pending',
  completed_at timestamptz,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_pfm_route ON public.pathfinder_milestones(route_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pathfinder_milestones TO authenticated;
GRANT ALL ON public.pathfinder_milestones TO service_role;
ALTER TABLE public.pathfinder_milestones ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pfm own" ON public.pathfinder_milestones FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pathfinder_routes r WHERE r.id = route_id AND r.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.pathfinder_routes r WHERE r.id = route_id AND r.user_id = auth.uid()));

-- ============================================================
-- 11. dream_board_collections (private)
-- ============================================================
CREATE TABLE public.dream_board_collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  is_default boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_dbc_user ON public.dream_board_collections(user_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dream_board_collections TO authenticated;
GRANT ALL ON public.dream_board_collections TO service_role;
ALTER TABLE public.dream_board_collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dbc own" ON public.dream_board_collections FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 12. dream_board_entries (private)
-- ============================================================
CREATE TABLE public.dream_board_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  collection_id uuid REFERENCES public.dream_board_collections(id) ON DELETE SET NULL,
  entry_kind text NOT NULL,
  ref_id uuid,
  title text NOT NULL,
  note text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_dbe_user ON public.dream_board_entries(user_id);
CREATE INDEX idx_dbe_collection ON public.dream_board_entries(collection_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.dream_board_entries TO authenticated;
GRANT ALL ON public.dream_board_entries TO service_role;
ALTER TABLE public.dream_board_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "dbe own" ON public.dream_board_entries FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 13. role_views_log (private)
-- ============================================================
CREATE TABLE public.role_views_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role_id uuid NOT NULL REFERENCES public.taxonomy_nodes(id) ON DELETE CASCADE,
  tab text,
  dwell_ms integer,
  source text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_rvl_user ON public.role_views_log(user_id);
CREATE INDEX idx_rvl_role ON public.role_views_log(role_id);
CREATE INDEX idx_rvl_created ON public.role_views_log(created_at DESC);

GRANT SELECT, INSERT ON public.role_views_log TO authenticated;
GRANT ALL ON public.role_views_log TO service_role;
ALTER TABLE public.role_views_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rvl insert own" ON public.role_views_log FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "rvl read own" ON public.role_views_log FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- ============================================================
-- 14. pioneer_points (private)
-- ============================================================
CREATE TABLE public.pioneer_points (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  points integer NOT NULL,
  reason text NOT NULL,
  ref_kind text,
  ref_id uuid,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_pp_user ON public.pioneer_points(user_id);

GRANT SELECT, INSERT ON public.pioneer_points TO authenticated;
GRANT ALL ON public.pioneer_points TO service_role;
ALTER TABLE public.pioneer_points ENABLE ROW LEVEL SECURITY;
CREATE POLICY "pp read own" ON public.pioneer_points FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "pp insert own" ON public.pioneer_points FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 15. hiring_pulse_snapshots
-- ============================================================
CREATE TABLE public.hiring_pulse_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id uuid NOT NULL REFERENCES public.taxonomy_nodes(id) ON DELETE CASCADE,
  snapshot_at timestamptz NOT NULL DEFAULT now(),
  window_hours integer NOT NULL DEFAULT 24,
  open_postings integer NOT NULL DEFAULT 0,
  new_postings integer NOT NULL DEFAULT 0,
  median_salary_inr numeric(12,2),
  top_cities jsonb NOT NULL DEFAULT '[]'::jsonb,
  top_companies jsonb NOT NULL DEFAULT '[]'::jsonb,
  trend text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb
);
CREATE INDEX idx_hps_role ON public.hiring_pulse_snapshots(role_id);
CREATE INDEX idx_hps_snapshot ON public.hiring_pulse_snapshots(snapshot_at DESC);

GRANT SELECT ON public.hiring_pulse_snapshots TO anon, authenticated;
GRANT ALL ON public.hiring_pulse_snapshots TO service_role;
ALTER TABLE public.hiring_pulse_snapshots ENABLE ROW LEVEL SECURITY;
CREATE POLICY "hps public read" ON public.hiring_pulse_snapshots FOR SELECT USING (true);
CREATE POLICY "hps admin write" ON public.hiring_pulse_snapshots FOR ALL TO authenticated USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============================================================
-- updated_at triggers
-- ============================================================
CREATE TRIGGER trg_taxonomy_nodes_updated BEFORE UPDATE ON public.taxonomy_nodes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_role_ksao_updated BEFORE UPDATE ON public.role_ksao_vectors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_exam_gates_updated BEFORE UPDATE ON public.exam_gates FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER trg_dbc_updated BEFORE UPDATE ON public.dream_board_collections FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
