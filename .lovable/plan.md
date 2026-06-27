## 1. Landing hero stuck under navbar (≤1024px)

Root cause: `.myraaha-navbar` is `position: fixed`, but `.navbar-spacer` is globally `display: none`. On tablet/mobile, the late `.myraaha-landing section { padding: 60px 1.5rem !important }` rule wins (higher specificity) over `.myraaha-hero { padding-top: 8rem !important }`, leaving only 60px of top padding under a ~60–72px fixed bar.

Fix (CSS-only, no markup changes):
- Re-enable `.navbar-spacer` at ≤1024px with the correct heights (72px tablet / 60px mobile / 50px ≤320px).
- Add a higher-specificity guard `.myraaha-landing .myraaha-hero { padding-top: 8rem !important }` so it always beats the master mobile override.
- Apply the same guarantee to other landing hero variants (`.standard-page-hero`, `.about-hero`, `.careers-hero`, `.services-hero`, `.contact-hero-v2`, `.insights-hero`, `.partnerships-hero-v2`).

## 2. Move Insights & Behavior, Domains, and Quests sections from Curiosity Compass to Career Navigator

- In `CuriosityCompass.tsx`, remove the Insights, Behavior, Domains, and Quests tabs/panels. Keep the assessments, Path Map, Review, and Combined Conclusion.
- Add three new tabs in `CareerNavigator.tsx`: **Insights & Behavior**, **Domains**, **Quests**, sourced from the same hooks (`useUserSignals`, `useCuratedCompassFilter`, `compass_fit_results`, `domain_recommendations`, `curiosity_quests`, `behavior_patterns`) so they react to Career Navigator inputs (which already merge onboarding + compass signals).
- Move the panel components (`InsightsView`, behavior panel, domain widget, quests widget) into `src/components/career/` and re-import from Career Navigator.
- Update any internal links that pointed at Compass tabs to point at the Navigator tabs.

## 3. Reward cards firing late / not at milestones

Root cause: `RewardCelebrationManager` is mounted **only** inside `DashboardLayout`. All onboarding routes (`/onboarding/*`) live outside that layout, so during onboarding the DB writes `reward_unlock_events` rows but nothing renders them — they all flush at once the moment the user first lands on `/dashboard`.

Fix:
- Mount `RewardCelebrationManager` globally inside `AuthProvider` in `App.tsx`, gated to render only when there is an authenticated user, so onboarding + Compass + every other authenticated route shows the card the instant the milestone fires.
- Double-check that each assessment writes progress on **every** answer (Compass discovery, psychometric, interests already do; verify and patch any that batch).
- Also call `update_assessment_progress` once on mount for resumed sessions so a milestone the user already crossed in a previous visit still fires once.

## 4. Real-time "resume where you left off" history

New persistent, auto-saving activity engine — frontend + backend.

### Backend (single migration)
New table `public.user_activity_state`:
- `user_id uuid PK FK → auth.users`
- `last_route text` (full path incl. search/hash)
- `last_module text` (derived: `curiosity-compass`, `roadmap`, etc.)
- `last_context jsonb` (component-supplied: `{ tab, step, scrollY, formDraft, assessmentCursor }`)
- `updated_at timestamptz default now()`
- RLS: user can read/insert/update their own row only; `service_role ALL`.
- `GRANT SELECT, INSERT, UPDATE, DELETE ... TO authenticated; GRANT ALL ... TO service_role`.
- Trigger to bump `updated_at`.
- RPC `upsert_user_activity(_route text, _module text, _context jsonb)` (SECURITY DEFINER) that does an UPSERT on `auth.uid()` — single round-trip, race-safe.
- New table `public.user_activity_events` (append-only breadcrumb log: `user_id`, `route`, `event`, `payload jsonb`, `created_at`). RLS owner-only + service_role. Capped reads via index `(user_id, created_at desc)`. Used for analytics / "recent activity" UI later; we write a row per major action (assessment_answered, reward_unlocked, module_opened) so the trail survives even if `user_activity_state` is overwritten.

### Frontend
- New hook `useActivityTracker()` mounted once inside `AuthProvider`:
  - Subscribes to `react-router` location changes → debounced (500 ms) upsert of `last_route`/`last_module`.
  - Listens to `visibilitychange`, `beforeunload`, and a 15 s heartbeat to flush pending state (with `navigator.sendBeacon` fallback for unload).
  - Captures `window.scrollY` per route.
  - Exposes `recordContext(partial)` so modules push richer state (current assessment question index, current tab, form draft) — written into `last_context` via shallow merge.
- New helper `restoreLastRoute()` called from:
  - `Auth.tsx` after successful sign-in.
  - `DashboardLayout.tsx` when user lands on `/dashboard` with no deep link.
  - Email-verification redirect handler.
  Behavior: if `user_activity_state.last_route` exists and is a safe in-app path (validated via existing `redirectGuard`), `navigate(last_route, { replace: true })` and dispatch a `myraaha:restore-context` event with the saved context. Each module listens and rehydrates its local state (Compass jumps to the saved question, scroll restores, etc.).
- Integration points that opt into context capture this pass: Curiosity Compass (assessment cursor + active tab), Career Navigator (active tab), Roadmap (active stage), Dashboard (scrollY). Others use plain route persistence.
- Replace the existing `localStorage` `myraaha_last_route` shim with a thin wrapper that mirrors to the new hook so nothing regresses while DB writes are in flight.

### Safety
- All writes are owner-scoped via `auth.uid()`; no PII beyond what the user already controls.
- `last_context` size capped at 8 KB client-side before send.
- Tracker disabled for guest sessions (no `user.id`).

## Technical notes / file list

- `src/index.css` (navbar-spacer + landing hero guard)
- `src/pages/MyRaahaLanding.css` (hero guard for ≤768px)
- `src/pages/career/CuriosityCompass.tsx` (remove moved tabs)
- `src/pages/career/CareerNavigator.tsx` (add moved tabs)
- `src/components/career/{InsightsView,BehaviorPanel,DomainsPanel,QuestsPanel}.tsx` (relocated)
- `src/App.tsx` (mount `RewardCelebrationManager` + `ActivityTracker` globally)
- `src/hooks/useActivityTracker.ts` (new)
- `src/lib/activityRestore.ts` (new)
- `src/layouts/DashboardLayout.tsx` (call restore on entry, drop old `myraaha_last_route` once new path proven)
- Single migration: `user_activity_state` + `user_activity_events` + RPC + RLS + GRANTs.

No existing feature, UI, copy, or backend table is removed beyond the tab relocation in §2.
