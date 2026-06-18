# Fix Plan — 6 Issues

## 1. Sign Up → Intro Slides First
- Update landing/navbar "Sign Up" CTA to navigate to `/intro?next=signup` instead of `/auth?mode=signup`.
- In `IntroSlides.tsx`, on the final slide, read `next` query param and route to `/auth?mode=signup` when `next=signup`. Existing flows unaffected.
- "Sign In" CTA continues to go directly to `/auth?mode=signin`.

## 2. Reward Card Popups — Deterministic
- Source of truth becomes the backend `reward_unlock_events` table (already exists) + `useAssessmentRewards` hook with `pendingUnlocks`.
- Remove the parallel `localStorage` "shown" gating in `OnboardingRewardBanner` that causes inconsistent firing. Replace with a single rule: *if there is a pending (unacknowledged) unlock event for the current user, show the celebration; on Continue → ack it.*
- During onboarding, after each step that crosses 30/60/90 %, explicitly call the existing `unlock_reward` RPC (idempotent) so the event row is created server-side. Mount `<RewardCelebrationManager />` globally in `App.tsx` so it pops on every page including onboarding.
- During Curiosity Compass, the existing `update_assessment_progress` RPC already calls `unlock_reward` at milestones — verify each assessment submission calls it with the correct `_completed/_total`. Add the call to the Discovery, Psychometric, and Interests submit handlers where missing.

## 3. Stale App After Email Confirmation
- Cause: confirmation link opens `https://myraaha.lovable.app/...` which is the *published* build (older), while the user normally tests in the preview build. Different origins → different bundles + different cached service worker.
- Fix two ways:
  a. `public/sw.js`: ensure `self.skipWaiting()` + `clients.claim()` and a network-first strategy for `index.html` so a refresh always pulls the new HTML.
  b. Add an `/auth/callback` route that detects email confirmation (`?verified=1` or recovery token in hash), force-unregisters any stale SW, then redirects to `/auth?mode=signin&verified=1` with the email prefilled (from `auth.getUser()` post-verification).
- Document that for preview-vs-published mismatch, the user should publish before testing the verification link.

## 4. Compass Intro Slides Not Showing After Onboarding
- The "Enter Curiosity Compass" button at end of onboarding currently routes straight to `/dashboard/curiosity-compass` and the page skips its intro because `journey_responses` already has prior keys. Re-enable the intro by adding a session-scoped flag (`sessionStorage["compass_intro_shown"]`) that the consent step clears, and the CuriosityCompass page checks before rendering tabs. If flag absent → show `<CompassIntroSlides />` (existing component, restore the render path).

## 5. Sign Out — Reliable & Fast
- Rewrite `signOut` in `AuthContext.tsx`:
  - Clear local React state first (`setUser/setSession/setProfile(null)`).
  - Wipe `localStorage` keys: `myraaha_is_guest`, `myraaha_uid_reveal_pending`, `myraaha_shown_reward_celebrations`, all `sb-*-auth-token` keys.
  - `await supabase.auth.signOut({ scope: 'local' })` (local scope is instant, no network round-trip for global session revoke).
  - `window.location.replace('/auth?mode=signin')` to guarantee a clean reload.
- Wrap the navbar Sign Out button with a loading state + 3 s timeout fallback that still forces the redirect.

## 6. Large Archetype Library + Real Calibration
- New file `src/lib/archetypeLibrary.ts` with ~40 archetypes seeded from established frameworks (Holland RIASEC × Jung × Enneagram-inspired blends): Builder, Strategist, Explorer, Connector, Craftsperson, Changemaker, Visionary, Analyst, Diplomat, Mentor, Pioneer, Catalyst, Guardian, Curator, Storyteller, Researcher, Healer, Negotiator, Inventor, Organizer, Performer, Investigator, Educator, Advocate, Synthesizer, Operator, Designer, Entrepreneur, Scholar, Mediator, Producer, Trailblazer, Steward, Architect, Coach, Translator, Composer, Optimizer, Networker, Reformer. Each entry: `{key, title, tagline, description, strengths[], shadow[], careerThemes[], keywordWeights, riasecVector}`.
- Replace the regex map in `archetypeCalibration.ts` with a vector-scoring function:
  1. Convert each answer label into a RIASEC vector + keyword-token set (using a tokenized weight table per archetype).
  2. Sum weighted contributions across all answers.
  3. Cosine-similarity each archetype's combined vector against the user vector.
  4. Return top archetype, runner-up, full ranked scores, and a generated rationale that cites the user's actual picks (no mock text).
- Persist to `assessment_conclusions` (`archetype_key`, `archetype_scores jsonb`, `rationale text[]`). Migration: add nullable columns if missing.
- Edge function `curiosity-compass-ai` (already exists) consumes the same library to refine + write a `behavior_insights` enrichment; client renders immediate calibrated result first, then live-updates when the edge call returns.

## Technical Notes
- No schema-breaking changes; one additive migration for `assessment_conclusions.archetype_key text` + `archetype_scores jsonb`.
- All existing reward/celebration data stays valid; we only stop double-gating via localStorage.
- Service worker change requires a one-time hard refresh; users on the broken stale tab will get the new SW on next navigation.

## Files Touched
- `src/components/MyRaahaNavbar.tsx`, `src/pages/MyRaahaLanding.tsx` (signup CTA)
- `src/pages/IntroSlides.tsx` (next= routing)
- `src/components/onboarding/OnboardingRewardBanner.tsx`, `src/components/curiositycompass/RewardCelebrationManager.tsx`, `src/App.tsx` (mount manager globally)
- `src/pages/onboarding/ConsentStep.tsx`, `src/pages/career/CuriosityCompass.tsx` (compass intro flag, milestone RPC calls)
- `public/sw.js`, new `src/pages/AuthCallback.tsx`, `src/App.tsx` route
- `src/contexts/AuthContext.tsx`, `src/components/MyRaahaNavbar.tsx` (signOut)
- New `src/lib/archetypeLibrary.ts`, rewritten `src/lib/archetypeCalibration.ts`, edited `supabase/functions/curiosity-compass-ai/index.ts`
- New migration adding archetype columns to `assessment_conclusions`
- `docs/CHANGE_JOURNAL.md` entry

Implementing in this order: 5 (sign out — quickest win) → 1 (intro routing) → 4 (compass intro) → 2 (rewards) → 3 (SW/callback) → 6 (archetype library).
