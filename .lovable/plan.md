# Plan: New "Career Navigator" Module

## Goal
Spin off Career Cards, Story Mode, Challenge Mode, and Visual Mode from the Curiosity Compass into a dedicated **Career Navigator** module. Drive every card from the user's Onboarding + Curiosity Compass signals, then top it off with curated trending picks pulled from the 18 sector intel tables.

## Scope
**In:** new route/page, moved components, personalization layer, sector-trending fetch, navbar/dashboard links, Compass cleanup.
**Out:** changing the underlying card visuals, editing onboarding flow, schema changes (sector tables already exist).

## 1. New module skeleton
- New page: `src/pages/career/CareerNavigator.tsx` with four tabs (Visual Mode, Career Cards, Story Mode, Challenge Mode) using the same Tabs UI pattern that Compass uses today.
- Add route `/career/navigator` in `src/App.tsx` (protected, lazy-loaded).
- Add navbar/dashboard entry under the Career track.

## 2. Move components out of Curiosity Compass
- Keep components (`CareerCardDeck`, `StoryModeCards`, `ChallengeModeCards`, `BlueprintCard`) where they live; just stop importing them in `CuriosityCompass.tsx`.
- Remove the `visual`, `career-cards`, `story`, `challenge` tab triggers + their `TabsContent` blocks in Compass.
- Leave behind a single "Open Career Navigator" CTA card on the Compass results screen so users discover the new module after assessments.
- Preserve existing visual-mode signal logging by relocating that logic into the new module (so the SelfGraph/keywords keep flowing).

## 3. Personalization layer
- New hook `src/hooks/useNavigatorContext.ts` that aggregates, in parallel:
  - `profiles` row (demographics, journey_responses, intent flags, full_name, location, age_band).
  - `user_onboarding_sectors`, `user_education_status`, `user_subjects`, `user_skills_profile`.
  - `assessment_conclusions` (latest), `assessment_conclusion_keywords`, `user_interest_profile`, archetype output, `user_signals`.
- New util `src/lib/navigatorPersonalization.ts` that converts the aggregated context into a normalized `NavigatorSignal` (keywords[], riasecVector, sectors[], skills[], archetype, lifeStage, intent).
- Each of the four modes consumes `NavigatorSignal` to score/order/filter their existing card data. For cards without inherent scoring fields, do keyword-overlap ranking against the card's text.

## 4. Trending picks from 18 sector tables
- New edge function `supabase/functions/sector-trending/index.ts` that, for each of the 18 `career_intel_*` tables, returns 4–5 rows ordered by an existing popularity/recency column (fallback: `created_at desc`), tagged with the sector name. Returns `{ sector, items: [...] }[]`.
- New component `src/components/career/TrendingSectorRail.tsx` rendered at the bottom of each mode (or as a final "Trending across India" section once personalized cards end).
- Cache results client-side via `useAICache`-style keyed query so we don't hit the function on every tab switch.

## 5. Compass cleanup
- Update the Compass tab list, mode descriptions array, and any onboarding tooltip copy that names the removed modes.
- Update `RewardProgressTracker` / reward copy only if it references the removed tabs (verify, don't blanket-edit).

## 6. Docs / memory
- Append a Change Journal entry describing the split, personalization sources, and trending source tables.
- No memory updates required (architecture rules unchanged).

## Technical notes
- Route: `/career/navigator`, protected by `ProtectedRoute`, gated behind `has_completed_curiosity_compass` — if false, show an empty state pushing the user back to Compass.
- Edge function returns at most `5 * 18 = 90` rows; small payload, no pagination needed.
- All personalization runs client-side from already-fetched signals; no new RPC required.

## File touch list
**New:** `src/pages/career/CareerNavigator.tsx`, `src/hooks/useNavigatorContext.ts`, `src/lib/navigatorPersonalization.ts`, `src/components/career/TrendingSectorRail.tsx`, `supabase/functions/sector-trending/index.ts`.
**Edited:** `src/App.tsx`, `src/pages/career/CuriosityCompass.tsx`, `src/components/MyRaahaNavbar.tsx`, `src/pages/CareerDashboard.tsx` (add tile), `src/components/career/CareerCardDeck.tsx` / `StoryModeCards.tsx` / `ChallengeModeCards.tsx` / `BlueprintCard.tsx` (accept optional `signal` prop for personalization), `docs/CHANGE_JOURNAL.md`.
