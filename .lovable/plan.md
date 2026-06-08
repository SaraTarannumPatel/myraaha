## What you'll get after this slice

- Every one of the **18,033 roles** in `career_taxonomy` has a 325-dimensional sparse KSAO weight vector stored in the database.
- Every role has 2D map coordinates (`coord_x`, `coord_y`) + a `cluster_id` so the CareerMap canvas can render the natural landmasses on day one.
- A reusable backend pipeline so when real role-level KSAO scores arrive later (Option B), we just swap the scoring step — the rest of the map keeps working.

## Current state I verified in the DB

- `career_taxonomy` — **18,033 rows** with full 11-column taxonomy (sector → sub_sector → industry → domain → sub_domain → function → job_family → cluster → pathway_cluster → role_name). Primary key is `bigint id`.
- `ksao_dimensions` — **325 dimensions** already seeded (superset of the 229 in your doc — fine, we'll use all of them).
- `role_ksao_vectors` — **0 rows**, but its `role_id` is `uuid` and points to a different roles table than `career_taxonomy`. **Schema mismatch — has to be reconciled before anything else.**
- `taxonomy_nodes` — 11,747 nodes, separate hierarchy. Untouched by this slice.

## Plan

### Step 1 — Schema reconciliation (migration)
- Add `role_uuid uuid DEFAULT gen_random_uuid() UNIQUE` to `career_taxonomy` so every role has a stable uuid that `role_ksao_vectors.role_id` can point at.
- Add `coord_x double precision`, `coord_y double precision`, `cluster_id smallint` to `career_taxonomy` for 2D placement.
- Add index on `(cluster_id)` and a GiST/BTree on `(coord_x, coord_y)` for spatial-ish queries.
- Confirm `role_ksao_vectors` GRANTs are correct for service_role writes + authenticated reads.

### Step 2 — Approximate KSAO scoring (offline Python script, one-shot)
Run locally via `code--exec` with `psql`. Logic:
1. Pull all 18,033 roles + all 325 ksao_dimensions (name + description).
2. For each role, build a "context bag" from its taxonomy strings (sector + sub_sector + domain + sub_domain + function + job_family + cluster + pathway_cluster + role_name).
3. TF-IDF the context bag against each KSAO dimension's `name + description`. Top-K (≈40) dimensions per role get non-zero weights, normalized to sum=1. This gives a **sparse approximate 325-dim vector per role**.
4. Bulk insert into `role_ksao_vectors` (≈720K rows: 18,033 × 40).

### Step 3 — 2D projection (same script)
1. Build the sparse role×dimension matrix (scipy.sparse).
2. Run **UMAP** (`umap-learn`) → 2D coords. Falls back to PCA if UMAP install fails in sandbox.
3. Run **HDBSCAN** on the 2D coords to detect natural landmasses (your "6–8 continents" insight) → `cluster_id`.
4. Write `coord_x`, `coord_y`, `cluster_id` back to `career_taxonomy` via bulk UPDATE.

### Step 4 — Sanity check
- Quick query: count of roles per cluster, count of distinct sectors per cluster (confirms FinTech/HealthTech-style merging is happening).
- Print 5 sample roles per cluster so you can eyeball that the clustering is meaningful.

### Step 5 — Expose to frontend (tiny)
- Update `CareerMap.tsx` stat card to show **"18,033 roles plotted • N clusters detected"** instead of the current `Building…` placeholder.
- No map canvas yet — that's the next slice you queued behind this one.

## Technical notes

- **Scoring approach trade-off**: pure TF-IDF on taxonomy strings is crude but defensible at this stage. It produces vectors good enough for UMAP to surface real cluster structure (similar role names → similar context bag → nearby in 2D). When Option B (real per-role KSAO matrix) arrives, only Step 2 is replaced — Steps 1, 3, 4, 5 stay identical.
- **Why offline Python, not an edge function**: 18k roles × 325 dims TF-IDF + UMAP + HDBSCAN is heavy; doing it once locally and bulk-inserting is far simpler than streaming through Deno.
- **Idempotency**: script wipes and rewrites `role_ksao_vectors` + the 3 new columns each run, so we can re-tune weights without DB drift.
- **No frontend rewrite this turn** — the map canvas, role deep dive, and PathFinder all sit downstream and depend on this data layer existing first.

## Out of scope (next slices, already queued)

- Map canvas + "You Are Here" dot (slice 2 in your earlier answer)
- 18-tab Role Deep Dive
- Fastest / Safest / No-cost PathFinder routes
- Sector overlay polygons (Voronoi/convex hull rendering)
