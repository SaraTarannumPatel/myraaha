# Change Journal

Append-only log of MAJOR changes. Each entry: what / why / before / benefit / files.

---

## 2026-05-29 — CareerMap-CareerScape: Phase 0 schema + Roadmap archive

**What.** Replaced the AI Roadmaps module with the foundation of the new
CareerMap-CareerScape engine. Phase 0 ships the database backbone (15 new
tables, 5 enums, pg_trgm extension), archives the legacy Roadmap UI without
deleting it, and stands up a placeholder `/dashboard/careermap` route.

**Why.** The legacy Roadmap module only generated a single linear sequence
of steps from a goal title. The user approved a full replacement with a
17-sector, 17,285-role career graph that supports 229-D KSAO matching,
PathFinder routing (Fastest / Safest / No-cost), exam gates, Dream Boards,
Live Hiring Pulse, and pioneer contributions — per the
CareerMap-CareerScape spec.

**Before.**
- `roadmaps`, `roadmap_steps`, `roadmap_step_details`, `suggested_roadmaps`
  drove a flat, AI-only roadmap generator with no graph structure.
- No taxonomy beyond `sector_directory` (single level).
- No KSAO model, exam gates, or PathFinder routing.

**Benefit.**
- 11-level taxonomy (`taxonomy_nodes`) holds the full
  sector→sub-sector→…→role hierarchy from the 17 sector workbooks
  (~18,034 rows combined).
- KSAO engine (`ksao_dimensions`, `role_ksao_vectors`,
  `user_ksao_vectors`) ready for the 229-D matching pipeline.
- Graph edges (`role_role_edges`, `role_education_edges`,
  `role_exam_gate_edges`) ready for PathFinder shortest-path queries.
- User-private tables (`pathfinder_routes`, `pathfinder_milestones`,
  `dream_board_collections`, `dream_board_entries`, `role_views_log`,
  `pioneer_points`) with strict RLS.
- Catalog tables are public-read so guests can explore the map.

**Files.**
- Migration: `supabase/migrations/<phase0>.sql` (new tables + GRANTs + RLS).
- Archived: `src/_archived/roadmap/pages/Roadmap.tsx`,
  `src/_archived/roadmap/components/roadmap/RoadmapStepDetail.tsx`.
- New: `src/pages/career/CareerMap.tsx` (placeholder shell).
- Edited: `src/App.tsx` (route swap), kept `/dashboard/roadmap` redirecting
  to CareerMap to preserve deep links.
- Staged data: `/mnt/documents/careermap-sectors/*.xlsx` (8 of 17 sectors —
  Media, NGO, RealEstate, Retail, Sports, TechIT, Telecom, Transport).

**Next phases.**
1. Seed 17 sector roots + 288 KSAO dimensions + 35 India exam gates.
2. Ingest the Healthcare & Life Sciences sector end-to-end as the vertical
   slice (taxonomy + role_ksao_vectors via Gemini).
3. Edge functions: `ksao-vector-builder`, `role-graph-build`,
   `pathfinder-compute`, `hiring-pulse-ingest`, `roleview-enrich`.
4. Frontend: MapCanvas (react-force-graph), PathFinderPanel, RoleSheet,
   DreamBoardDrawer.

## 2026-05-30 — Phase 0.5: KSAO + sector roots + exam gates seeded

**What.** Loaded foundational reference data on top of the Phase 0 schema.
- 283 KSAO leaf dimensions + 42 cluster headers across 6 families
  (knowledge, skill, cognitive, curiosity, value, personality)
- 17 sector roots in `taxonomy_nodes` (Healthcare, BFSI, Manufacturing,
  Tech & IT, Media, Education, NGO, Real Estate, Retail, Sports, Telecom,
  Transport, Agriculture, Energy, Govt/Defence, Hospitality, Legal)
- 38 India exam gates with eligibility_stage + prep months + difficulty
  (JEE Main/Adv, NEET UG/PG, CLAT, CUET UG/PG, CAT/XAT, GATE, UPSC CSE/ESE,
  SSC CGL, RBI/IBPS/SBI PO, NDA/CDS/AFCAT, NIFT/NID/UCEED/CEED/NATA,
  ICAR AIEEA, CA/CS/CMA Foundation, AIIMS PG/INI CET/FMGE, UGC NET,
  TISSNET, HSEE, IIFT/SNAP/MAT/ATMA).

**Why.** The KSAO matching engine, PathFinder gate banner, and sector
landing pages all read from these tables. Without them the Phase 1
vector builder has nothing to score against.

**Next.** Ingest the 8 staged sector workbooks (~7,945 role rows total)
into `taxonomy_nodes`. The psycopg2 path hit a role-permission error;
will switch to psql-driven ingestion (same role that ran the seeds) and
then start the Tech & IT vertical slice (KSAO vector backfill + RoleSheet).
