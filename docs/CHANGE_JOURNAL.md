# Change Journal

Append-only log of MAJOR changes. Each entry: what / why / before / benefit / files.

---

## 2026-06-23 — Enterprise security hardening layer (additive only)

**What.** Implemented the controls from the three uploaded security briefs (`security_prompts_lovable_ai.md`, `Security Hardening Implementation for Lovable AI.docx`, `Security Implementation Brief for Lovable AI.docx`) without changing any feature, page, route, UI/UX, edge-function business logic, or database schema. New layers: (a) `public/_headers` ships HSTS, X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, COOP/CORP, and CSP in **Report-Only** mode; (b) `index.html` gains meta-fallback security headers; (c) `public/sw.js` now bypasses any request carrying `Authorization`, refuses to cache responses with `Set-Cookie`, and handles a `LOGOUT_PURGE` message to wipe every cache on sign-out; (d) new `src/lib/security/` module with `logger` (PII/JWT/UUID/phone/email scrubber that wraps `console.*` in production), `safeStorage` (sensitive-value guard + `purgeOnLogout()`), `authGuard` (progressive backoff on failed login, 30-min idle + 12-h absolute session timers), `redirectGuard` (open-redirect / `javascript:` / CRLF blocker), `schemas` (zod schemas for email/password/name/phone/OTP/URL/journal/message), `sanitize` (dep-free HTML sanitizer + `escapeHtml`); (e) `src/main.tsx` installs the secure logger; (f) `AuthContext` wires the timers + storage purge into sign-out and `onAuthStateChange`; (g) `Auth.tsx` validates inputs with zod, throttles repeated failures, and routes post-login redirect through `safeRedirect`; (h) new edge-function shared helpers `_shared/{cors,requireUser,logger,validate}.ts` (CORS allow-list, in-code JWT verification, scrubbed logger, zod body parser) — available for opt-in adoption without altering any existing function; (i) `vite.config.ts` build-time assert refuses to bundle any service-role-shaped env; (j) `.npmrc` pins exact versions on future installs; (k) new docs `docs/SECURITY.md` and `docs/INCIDENT_RESPONSE.md`.

**Why.** The three briefs require Defense-in-Depth across transport, auth, authorization, input/output, PWA, storage, logging, supply chain, environment isolation, and IR — under a strict no-feature-change constraint.

**Before.** No CSP / HSTS / security headers. Service worker could in theory cache responses with `Authorization`. No client-side login backoff. No idle/absolute session timeout. Logout cleared only a hand-picked key list and didn't tell the SW. No central PII-scrubbing logger. No reusable input validation schemas. No env-leak guard at build time. Edge functions had no shared CORS allow-list or JWT-verification helper.

**Benefit.** Removes the most common PWA leak paths (cached private responses surviving logout), kills credential-stuffing UX, prevents open redirects, makes inputs uniformly validated, prevents PII from landing in production logs, and gives every future edge function a 3-line path to authenticated + validated + CORS-locked handlers — all without touching a single existing feature.

**Files.** `public/_headers` (new), `public/sw.js` (additive), `index.html`, `src/main.tsx`, `src/contexts/AuthContext.tsx`, `src/pages/Auth.tsx`, `src/lib/security/{index,logger,safeStorage,authGuard,redirectGuard,schemas,sanitize}.ts` (new), `supabase/functions/_shared/{cors,requireUser,logger,validate}.ts` (new), `vite.config.ts`, `.npmrc` (new), `docs/SECURITY.md` (new), `docs/INCIDENT_RESPONSE.md` (new).

**Approval-required follow-ups (NOT implemented).** httpOnly-cookie session via edge proxy; admin MFA UI; promote CSP from Report-Only to enforcing; CAPTCHA/Turnstile on auth; per-IP rate-limit table; force global re-login on password change; self-host fonts for SRI; dependency major upgrades; tightening any `anon SELECT` RLS still in use. See `.lovable/plan.md` §2.

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

## 2026-06-13 — Holistic Interests Assessment + Personalization Pipeline

**What:** Added 3rd Curiosity Compass assessment ("Holistic Interests", 12 Qs from source doc), an 18-sector multi-select in `EducationalStatus` onboarding step, and a unified `runUserPersonalization` pipeline that derives a keyword bag from all 3 assessments + sectors and ranks Explore entities via the new `match_explore_entities_for_user` RPC.

**Why:** Curiosity Compass needed a personalized lens distinct from the global Explore module. Without an interests profile + sector filter the 4 modes (Story, Challenge, Career Cards, Audio/Visual) were generic.

**Before:** Only Discovery + Psychometric existed; Curiosity Compass sections were globally ranked.

**Benefit:** Each user now has a cached `user_personalization_v1` payload feeding Curiosity Compass, Roadmap, Job Matching, Mentor Match, Content Library, SkillStacker. Recomputed on each assessment completion / sector save (6h TTL).

**Files:** `src/lib/personalizationPipeline.ts` (new), `src/components/curiositycompass/InterestsAssessment.tsx` (new), `src/pages/onboarding/EducationalStatus.tsx`, `src/components/curiositycompass/{PsychometricTest,AssessmentGate}.tsx`, `src/pages/career/CuriosityCompass.tsx`, `src/hooks/useAssessmentRewards.ts`, `src/lib/assessmentSignalMap.ts`, migration `20260612035047_…interests…sql`.

## 2026-06-13 (cont) — Compass Curated Edge + Sector-Aware Card Deck

**What:** Added `supabase/functions/curiosity-compass-curated/index.ts` (orchestrator that returns AI-summarized, sector+keyword-ranked entity buckets for each Compass mode) and `src/hooks/useCuratedCompassFilter.ts` (client-side scoring helper). `CareerCardDeck` now re-ranks its global path list by the user's cached personalization so picks matching their chosen sectors and assessment keywords surface first.

**Why:** Without per-user re-ranking, Compass modes felt identical to the global Explore module. The user explicitly requested that Compass be specialised to the individual.

**Before:** Compass card deck displayed `career_paths` in alphabetical title order; no signal from sectors or assessments influenced ordering.

**Benefit:** Foundation for end-to-end personalization across all 4 Compass modes. Falls back gracefully to original ordering when personalization is empty (guests / new users).

**Files:** `supabase/functions/curiosity-compass-curated/index.ts` (new), `src/hooks/useCuratedCompassFilter.ts` (new), `src/components/career/CareerCardDeck.tsx`.

## Curated Compass: Story/Challenge re-rank + Extended Psychometric Battery
- **What:** Wired `useCuratedCompassFilter` into `StoryModeCards` and `ChallengeModeCards` so cards are re-ranked by user sectors + assessment keywords (safe fallback when no personalization).
- **What:** Appended 30 additional psychometric questions (sections R–AN) covering Risk Appetite, Autonomy, Identity Clarity, Future Orientation, Energy/Recovery, Conflict, Self-Awareness, Curiosity Style, Focus, Achievement Drive, Social Comfort, Leadership, Planning, Structure, Skill Breadth, Learning Pace, Communication, Mentorship, Ownership, Exploration Breadth. Each is mapped in `PSYCHOMETRIC_SIGNAL_MAP` to its target modules so answers feed the unified signal engine.
- **Why:** Closes the Curiosity Compass personalization loop across all 4 modes and deepens the psychometric profile feeding SelfGraph, Roadmap, SkillStacker, Mentor Match, Job Matching, etc.
- **Files:** `src/components/career/StoryModeCards.tsx`, `src/components/career/ChallengeModeCards.tsx`, `src/components/curiositycompass/PsychometricTest.tsx`, `src/lib/assessmentSignalMap.ts`.

## 2026-06-16 — Auth OTP archive fix + Roadmap Self-Discovery sync

**What:** Archived the old OTP verification page outside the compiled source tree, redirected legacy `/verify-otp` links back to `/auth`, restored missing onboarding routes, and made auth resume incomplete users from their saved onboarding step instead of restarting at the welcome screen.

**Why:** The OTP flow had been paused but stale OTP code was still compiled, and legacy onboarding statuses could point at routes that were no longer mounted, causing users to bounce back to the start.

**Before:** Onboarding could restart incorrectly after auth/session refresh. AI Roadmaps also lacked a real Step 1 completion signal for “Self-Discovery & Fit”.

**Benefit:** Onboarding now progresses safely, legacy OTP deep links no longer break the flow, and AI Roadmaps Step 1 is marked complete from the three Curiosity Compass assessment completion flags.

**Files:** `src/App.tsx`, `src/pages/Auth.tsx`, `src/components/ProtectedRoute.tsx`, `src/lib/aiRoadmaps.ts`, `src/pages/career/Roadmap.tsx`, `supabase/functions/roadmap-ai/index.ts`, migration adding `has_completed_curiosity_compass` + roadmap self-discovery sync functions/triggers.

---

## 2026-06-17 — Auth flow + Compass gate + Reminder popup hotfixes

**What changed**
- **Sign Up / Sign In intent preserved**: `MyRaahaNavbar` now links to `/auth?mode=signup` and `/auth?mode=signin`; `Auth.tsx` reads the `mode` param and opens the matching form instead of defaulting to login.
- **Email confirmation no longer asks for project access**: `signUp` `emailRedirectTo` now points to the published site (`VITE_PUBLIC_SITE_URL` or `https://myraaha.lovable.app`) with `?mode=signin&verified=1`, so the verification link opens the live app's sign-in page instead of the preview domain (which is gated behind Lovable project access).
- **Hard Curiosity Compass gate**: `ProtectedRoute` now redirects any `/dashboard/*` route (except compass / settings / notifications / dashboard root) back to `/dashboard/curiosity-compass` until all three assessments (`assessment_completed`, `psychometric_completed`, `interests_completed`) are true. This restores the rule that no other feature unlocks before the compass is done, including after a refresh + re-login.
- **Onboarding reminder popup now strict**: only renders when `profile.journey_responses.skipped_steps` explicitly contains a step key. If the array is empty/missing → popup never shows. Removes the "Tell us about yourself" loop for users who completed onboarding through a path that didn't write `user_type`.
- **Curiosity Compass UX**:
  - Removed misleading `journeyMetas[J1].title` ("curiosity unlocked 🔓") subtitle that was rendering as if it were the user's archetype during the Discovery assessment. Subtitle is now neutral ("Tell us how you think, learn, and move"); the real archetype continues to come from `assessment-synthesizer` and shows on the completion card.
  - Added explicit "Continue to Psychometric Test →" CTA on the Discovery completion screen, and made the Psychometric / Interests `onComplete` callbacks auto-advance the user to the next tab (`psychometric` → `interests` → `insights`) with a smooth scroll-to-top. Solves the "I don't know where to click next" problem after each assessment.

**Files**
- `src/pages/Auth.tsx`
- `src/components/MyRaahaNavbar.tsx`
- `src/components/ProtectedRoute.tsx`
- `src/components/OnboardingReminderPopup.tsx`
- `src/pages/career/CuriosityCompass.tsx`

**Still pending (deferred to next pass)**
- Response preview + edit step before final submit on all three assessments.
- `user_progress_snapshots` autosave/restore layer.
- New `archetypeCalibration.ts` client-side instant calibration (currently still relies on the `assessment-synthesizer` edge function — works, just not as a local fallback).

---

## 2026-06-20 — Career Navigator module spun off from Curiosity Compass

**What:** The Career Cards, Story Mode, Challenge Mode and Visual Mode tabs moved out of `CuriosityCompass.tsx` into a new module at `/dashboard/career-navigator`. The Compass "Explore Interests" tab is now a CTA card pointing to the new module.

**Why:** The four exploration modes had outgrown the Compass shell and were buried behind assessments. Giving them their own surface lets us (a) personalize every card from the full Onboarding + Compass signal set, and (b) end the experience with curated trending picks from all 17 sector intel tables.

**Personalization sources** (consumed via `useCuratedCompassFilter` → `runUserPersonalization`):
- Onboarding: sectors, user_type, journey_responses, education status, intent, demographics.
- Curiosity Compass: assessment_conclusion_keywords, discovery/psychometric/interests signals, archetype.
- Visual Mode now pre-selects icons that map to the user's onboarding sectors.

**Trending source:** new `get_sector_trending(_per_sector int)` SECURITY DEFINER SQL function — loops the 17 `career_intel_*` tables and returns the top N most-mentioned `role_name`s per sector. Rendered by `<TrendingSectorRail />` at the bottom of every Navigator tab.

**Benefit:** Compass stays focused on assessment + insights; Navigator becomes the personalized exploration playground; trending picks ground the recommendations in real industry signal.

**Files**
- New: `src/pages/career/CareerNavigator.tsx`, `src/components/career/TrendingSectorRail.tsx`, migration adding `get_sector_trending`.
- Edited: `src/App.tsx` (route), `src/layouts/DashboardLayout.tsx` (sidebar entry), `src/pages/career/CuriosityCompass.tsx` (remove 4-mode tab body and imports, add CTA).

---

## 2026-06-22 — Curiosity Compass: Review-Before-Submit, Combined Conclusion & Best/Force/No Fit engine

**What**
- Pruned 3 redundant psychometric questions (`time_horizon`, `goal_setting`, `role_energy`) — total 50 → 47, signal coverage preserved by merging `usedFor` tags into the retained twins.
- New shared `AssessmentAnswerReview` component: post-test answer preview with per-question Edit + final Submit. Wired into Discovery, Psychometric, and Interests. Final synthesizers + completion flags now fire only on Submit Final, not on the last "Next" click.
- New `AllAssessmentsCompleteDialog`: one-time congratulations modal triggered when all three assessments are complete (gated by `journey_responses.compass_finale_shown`).
- New "Path Map" tab in Curiosity Compass surfacing the Combined Conclusion narrative + Best Fit / Force Fit / No Fit lists across roles, industries, sectors, domains, skills and subjects.

**Why**
- Users needed an explicit checkpoint before locking results.
- The original journey ended at "Interests done" — there was no synthesis that combined onboarding + 3 assessments into a single identity and matched it against the role universe.

**Backend**
- New tables `combined_conclusions`, `compass_fit_results` (RLS scoped to `auth.uid()`, GRANTed to authenticated + service_role).
- New SQL function `compute_compass_fit(_user_id uuid)` — SECURITY DEFINER. Walks `assessment_conclusion_keywords` + `user_onboarding_sectors`, cross-matches against `job_roles_directory`, the 17 `career_intel_*` tables, and the industry/sector/domain/skill/subject directories, scores each entity, and buckets into `best / force / no`.
- New edge function `combined-conclusion-synthesizer` — pulls all signals, calls Gemini 2.5 Flash for the Combined Conclusion JSON, upserts into `combined_conclusions`, then invokes `compute_compass_fit`. Triggered automatically on Interests submit; user can also recompute from the Path Map UI.

**Files**
- New: `src/components/curiositycompass/AssessmentAnswerReview.tsx`, `AllAssessmentsCompleteDialog.tsx`, `CombinedPathMap.tsx`; `supabase/functions/combined-conclusion-synthesizer/index.ts`; migration creating `combined_conclusions`, `compass_fit_results`, `compute_compass_fit`.
- Edited: `src/components/curiositycompass/PsychometricTest.tsx`, `InterestsAssessment.tsx`, `src/pages/career/CuriosityCompass.tsx`.

---

## 2026-06-24 — Security Hardening Wave 2 (Items 2-9 from .lovable/plan.md §2)

**What changed**
- CSP promoted from Report-Only to enforcing in `public/_headers`.
- Poppins font self-hosted under `/public/fonts/poppins-{300..700}.woff2`; `MyRaahaLanding.css` `@import` replaced with local `@font-face` rules. `googleapis.com` / `gstatic.com` removed from CSP `font-src` and `style-src`.
- `ResetPassword.tsx` now calls `supabase.auth.signOut({ scope: "global" })` after `updateUser({ password })` and redirects to `/auth` — forces re-login on every device after a password change.
- New `AdminMfaPanel` component renders ONLY for users with `admin` role in `user_roles`; provides TOTP enrol/verify/unenroll. Mounted at the bottom of `/settings` — invisible to non-admins, no UX impact.
- New `public.rate_limit_log` table + `public.record_rate_limit_hit(identity, endpoint, window_seconds)` RPC, service-role only. Foundation for per-IP/per-user throttling; no edge-function behavior changed yet.
- Leaked-password protection (HIBP) enabled at Auth config level.
- `code--dependency_scan` clean — no high/critical advisories; no major-version upgrades required.

**Why**
Completes all approved items from `.lovable/plan.md` §2 except (a) httpOnly-cookie session migration and (b) Cloudflare Turnstile — both require infra/UX changes that violate the "no behaviour change" constraint without a separate user-driven decision (Turnstile needs a Cloudflare site/secret key the user must supply).

**Before / After**
- Before: CSP advisory only, Google Fonts third-party request, password reset left old sessions valid, no admin MFA surface, no rate-limit primitive, HIBP off.
- After: CSP enforcing same-origin only, no third-party font/style host, global sign-out on password change, admin MFA available, rate-limit table ready, HIBP active.

**Files**
- edited: `public/_headers`, `src/pages/MyRaahaLanding.css`, `src/pages/ResetPassword.tsx`, `src/pages/shared/Settings.tsx`
- created: `public/fonts/poppins-{300,400,500,600,700}.woff2`, `src/components/security/AdminMfaPanel.tsx`, migration for `rate_limit_log` + `record_rate_limit_hit`
