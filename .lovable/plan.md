# Fix Plan — Curiosity Compass + Auth + Onboarding Reminder

Grouping the 9 issues into 4 work batches. I'll ship them in order, verifying each before moving on.

## Batch 1 — Curiosity Compass: Archetype + Flow (issues 1, 2, 3, 4)

**1. Real archetype calibration (replace "curiosity unlocked 🔓" mock)**
- Read the discovery + psychometric question banks end-to-end.
- Define an archetype taxonomy grounded in standard career-archetype frameworks (Holland RIASEC + Jungian "explorer / creator / sage / builder / connector / catalyst / strategist / guardian" overlay). Final set (8): **Explorer, Creator, Builder, Strategist, Sage, Connector, Catalyst, Guardian**.
- Build `src/lib/archetypeCalibration.ts`: pure function `calibrateArchetype(responses)` → `{ primary, secondary, scores, confidence, rationale }`. Each question option maps to weighted contributions across the 8 archetypes (extended from `assessmentSignalMap.ts`).
- Persist to new column `profiles.archetype_result jsonb` (migration). Also write to `assessment_conclusions` so SelfGraph/Roadmap consume it.
- Replace the mock "Calibrating…" screen with real-time call to `calibrateArchetype` (instant, no fake loader) and render `primary` + secondary + top-3 trait bars + rationale.

**2. Response preview + edit before final submit (all 3 assessments)**
- After last question, instead of auto-submitting, show a **Preview & Edit** screen listing every Q/A with an "Edit" button per row that jumps back to that question. Final **Submit** button on preview triggers persistence + calibration.
- Apply to Discovery, Psychometric, Interests.

**3. Inter-assessment navigation**
- After Submit on each assessment, show completion card with explicit **"Next: Psychometric →"** (or **"Next: Interests →"**, or **"See your Compass results →"** on the third). Buttons route within the Curiosity Compass tabs and scroll to top.
- Add a sticky stepper at the top of CuriosityCompass page: ● Discovery → ○ Psychometric → ○ Interests, with current/done states.

## Batch 2 — Auth Session + Hard Gate (issues 5, 7, 8)

**5. Session not surviving refresh**
- Audit `AuthContext`: ensure `supabase.auth.getSession()` runs before `setIsReady(true)` and that `onAuthStateChange` doesn't clobber the restored profile. Add `persistSession: true, autoRefreshToken: true` check (client is auto-gen; verify config). Fix any race that nukes the profile on `INITIAL_SESSION`.
- Add localStorage marker `myraaha_last_route` updated on route change; restore after refresh.

**Hard gate until Curiosity Compass complete**
- New helper `useCompassGate()` reading `profile.journey_responses.{assessment_completed,psychometric_completed,interests_completed}`.
- Update `ProtectedRoute`: if onboarding complete AND compass NOT complete AND target route is not `/career/curiosity-compass` (and not allowlisted: settings, logout) → redirect to `/career/curiosity-compass`.
- Remove any auto-unlock side effects that bypass this.

**7. Landing Sign Up vs Sign In buttons**
- Landing currently routes both to `/auth`. Pass `?mode=signup` / `?mode=signin` and have `Auth.tsx` read the param to set initial tab.

**8. Email verification redirect leak ("project access" prompt)**
- The "project access" screen = Lovable preview's auth gate, triggered because `emailRedirectTo` is set to `window.location.origin` which on preview = the lovable.app preview domain that requires project auth.
- Fix: set `emailRedirectTo` to the **published site URL** (or current `window.location.origin` only when on the published domain). Use `import.meta.env.VITE_PUBLIC_SITE_URL` with fallback to `window.location.origin`. Add `/auth/callback` route that:
  1. Reads `?code=` or hash tokens, exchanges via `supabase.auth.exchangeCodeForSession`.
  2. Pre-fills email in sign-in form and shows "Email verified — sign in to continue".
- Document that the published domain must be used in confirmation emails.

## Batch 3 — Onboarding Reminder Popup (issue 6)

- Current `OnboardingReminderPopup` already checks `onboarding_status === "complete"` then re-evaluates each step. Bug: `user_type` step still flags because `checkFn` doesn't respect that onboarding may have been completed via a path that doesn't set `user_type` (guest/legacy).
- Fix:
  - Treat `onboarding_status === "complete"` as authoritative — only show popup for steps the user **explicitly skipped** (tracked via new `profiles.skipped_onboarding_steps text[]`).
  - Update each onboarding step page to push its key into `skipped_onboarding_steps` only when the user hits a "Skip" button (no skip button → never flagged).
  - Popup filters by `skipped_onboarding_steps` ∩ still-missing fields. Empty → never renders.
  - "Complete Now" routes only to that specific skipped step, then removes the key on completion.

## Batch 4 — Real-time progress persistence (issue 9)

- Generic `useAutoSave` hook + `user_progress_snapshots` table storing `{user_id, module, route, payload jsonb, updated_at}` upserted on every meaningful action (debounced 1.5s).
- Wire into: Curiosity Compass (current question index per assessment), Roadmap (open step), SkillStacker (active stack), Moodboard. On mount each page reads snapshot and restores.
- `last_active_route` saved to `profiles` on every navigation; after login user lands there.

## Technical notes

- All migrations include `GRANT` + RLS per project rules.
- Archetype taxonomy + weights live in `src/lib/archetypes.ts` (source-of-truth), consumed by both client calibration and the edge function `roadmap-ai` for cross-module use.
- No third-party email service — keep default Supabase confirmation email; only fix the redirect URL.
- Will NOT touch already-working backend pieces (per prior instruction).

## Rollout

I'll implement Batch 1 first, verify in the preview (Playwright pass through the discovery assessment end-to-end and screenshot the new archetype screen), then move to Batch 2, 3, 4. Each batch ends with a Change Journal entry.

Approve and I'll start with Batch 1.