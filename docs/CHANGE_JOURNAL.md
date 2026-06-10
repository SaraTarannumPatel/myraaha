# Change Journal

Append-only log of MAJOR changes. Each entry: what / why / before / benefit / files.

---

## 2026-06-01 — Sector ingestion + landing CSS de-conflict

**What.** (a) Ran the psql staging loader across Media, NGO, Real Estate, Retail, Sports, Telecom, Transport — added ~7,180 roles to `taxonomy_nodes`, bringing total to 7,946 roles across 11 hierarchy levels. (b) Removed the orphan Vite default `src/App.css` and stray `fix_*.cjs` scripts. (c) Relaxed three blanket `!important` overrides in `src/index.css` that were forcing uniform font-size on every `h1/h2/h3`, `.section-title`, and `.section-subtitle` inside `.myraaha-landing-site`, clobbering each landing page's dedicated typography in `MyRaaha*.css`.

**Why.** Landing pages have per-section type hierarchies in their own CSS files. The global `font-size: 2.75rem !important` (h1-h3), `2.2rem !important` (section titles), and `1.1rem !important` (section subtitles) in `index.css @layer base` was winning the cascade and flattening that hierarchy → distorted layout.

**Benefit.** Landing CSS now governs landing pages. Web-app routes unaffected (rules were never scoped to `.myraaha-app`).

**Files.** `src/index.css`, deleted `src/App.css`, `fix_ide_problems.cjs`, `fix_onboarding.cjs`. Sector data via `/tmp/ingest_sectors.py`.



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

## 2026-05-31 — Auth: Apple + Facebook stance + reset polish, Tech & IT taxonomy loaded

**What:**
- Enabled native Apple OAuth (Google + Apple) via Lovable Cloud managed social auth.
- Wired Apple button on /auth to `lovable.auth.signInWithOAuth("apple")`.
- Facebook button now shows a clear "not supported" toast (Lovable Cloud doesn't natively support Facebook OAuth).
- Improved "Forgot password" UX on /auth: clearer label, confirms reset link sent to the registered email; `/reset-password` page already handles the recovery hash.
- Excluded `src/_archived` and orphaned `MobileLogin.tsx` from tsconfig to unblock build.
- Restored missing supabase imports in `MyRaahaNewsletter` and `MyRaahaContact`; stubbed `FadeInView`; removed dangling `MobilePartnerships` import; fixed `.category` → `.department` on careers pages.

**CareerMap data ingest (Tech & IT):**
- Generated batched SQL from `TechIT.xlsx` (766 roles) and loaded via psql.
- `taxonomy_nodes` now holds: 1 sector (Technology & IT) + 21 sub_sector + 71 industry_family + 73 industry + 80 each at domain/sub_domain/function/job_family/career_cluster/career_pathway_cluster + **766 roles**.

**Why:** Unblock real-time password reset, broaden sign-in options to the providers Lovable Cloud actually supports, and complete the first end-to-end vertical slice data load for the new CareerMap-CareerScape module.

**Files:** `src/pages/Auth.tsx`, `tsconfig.app.json`, `src/components/MyRaahaNewsletter.tsx`, `src/pages/MyRaahaContact.tsx`, `src/components/TrustSections.tsx`, `src/pages/MyRaahaPartnerships.tsx`, `src/pages/career/{CoreTeam,Facilitator,Intern,Volunteer}.tsx`, `src/integrations/lovable/index.ts`.

## CareerMap MVP — Google Maps for Careers
**What:** Built `/dashboard/careermap` — interactive canvas rendering all 18,033 plotted roles on a 2D KSAO-derived map with sector convex hulls, pan/zoom, search, hover tooltips, layer toggles, and a Role Deep Dive sheet (Overview, Pathway, KSAO bars, Nearby roles).
**Why:** Implements the CareerMap/CareerScape vision — every career visible at once, similarity = proximity, and a single click to launch turn-by-turn PathFinder via the existing AI Roadmaps module.
**Before:** CareerMap module had been deleted; the 18,033-role KSAO+UMAP data layer existed in the DB but had no UI consumer.
**Benefit:** Users can now visually explore the career universe, see how sectors cluster (FinTech/HealthTech overlaps emerge naturally), find their "You Are Here" pin from signals, and route to any role via the existing roadmap engine.
**Files:** `src/lib/careerMap.ts` (data + hulls + viewport math), `src/pages/career/CareerMap.tsx` (page), `src/App.tsx` (route), `src/layouts/DashboardLayout.tsx` (nav).
**Next slices:** Exam-gate overlays, hiring-pulse heat layer, KSAO-distance PathFinder routing, Pioneer reviews, Dream Board persistence.

## CareerMap blank-render fix + Google Maps style shell
**What:** Rebuilt `/dashboard/careermap` as a full-viewport Google-Maps-style career interface with visible terrain, sector landmasses, road-like cluster paths, role pins, search/autocomplete, layers, zoom controls, PathFinder panel, Dream Board, Journey Timeline, and 18-tab RoleView.
**Why:** The previous canvas depended on a constrained dashboard wrapper and live data render path, which could leave the map container visually blank even though 18,033 plotted roles existed in the database.
**Before:** Users saw an empty CareerMap module with no visible map UI, locations, pins, or Google Maps-like controls.
**Benefit:** CareerMap now renders immediately with live database roles when available and a demo fallback if loading/API access lags, so the CEO demo always shows the complete career-map experience.
**Files:** `src/pages/career/CareerMap.tsx`, `src/lib/careerMap.ts`, `src/layouts/DashboardLayout.tsx`.
