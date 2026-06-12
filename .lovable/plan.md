
This is purely additive — no existing question, screen, or flow is removed or rewritten. Everything below sits on top of the current 2-assessment system.

## 1. New "Holistic Interests Assessment" (12 Qs)

Extracted from doc §CURIOSITY/INTEREST QUESTIONS (Q26–Q37):
- Q26 Science curiosity (1–5)
- Q27 Mathematics curiosity (1–5)
- Q28 Technology curiosity (1–5)
- Q29 Business curiosity (1–5)
- Q30 Humanities curiosity (1–5)
- Q31 Arts curiosity (1–5)
- Q32 Which problems do you enjoy solving? (A Analytical / B Technical / C Business / D Social / E Creative)
- Q33 Which activity excites you most? (Building / Analyzing / Leading / Designing / Writing)
- Q34 What kind of impact would you like to create? (Tech / Business / Social / Creative)
- Q35 Experimentation curiosity (1–5)
- Q36 Exploration curiosity (1–5)
- Q37 Discovery curiosity (1–5)

Built as new component `src/components/curiositycompass/InterestsAssessment.tsx` mirroring `PsychometricTest.tsx` behavior:
- Per-question signal map entry in `src/lib/assessmentSignalMap.ts` (new `INTERESTS_SIGNAL_MAP`).
- Writes to `user_signals` + `assessment_question_signals` per answer.
- Calls `useModuleProgress.report("interests", completed, total)`.
- Stores conclusion in `assessment_conclusions` with `assessment_type="interests"`.

## 2. Gating: 3 assessments instead of 2

- `AssessmentGate.tsx` adds a third row "Map Your Curiosities" with `interests_completed` flag in `profile.journey_responses`.
- All explore/quests/domains/insights/behavior tabs stay locked until all three are done.
- Intro slides for Curiosity Compass mention the third assessment.

## 3. Rewards parity

- New `TestType` value `"interests"` added to `useAssessmentRewards`.
- Seed 4 rows in `reward_milestones` (25/50/75/100) for `test_type='interests'` with entitlement keys `interests_25` … `interests_100`.
- Onboarding rewards list ("what you unlock by completing onboarding") gains an "Interests Assessment unlocked (₹-value test, free on MyRaaha)" card.

## 4. Backend (new tables + functions)

Migration adds:
- `interests_assessment_responses(user_id, question_id, answer_value, answer_label, construct, created_at)` — RLS owner-only.
- `user_interest_profile(user_id, science, mathematics, technology, business, humanities, arts, experimentation, exploration, discovery, problem_style, activity_style, impact_style, last_updated)` — recomputed via trigger after each insert.
- `user_onboarding_sectors(user_id, sector_slug, rank, created_at)` — for the 18-sector multi-select.
- `assessment_conclusion_keywords(user_id, keyword, weight, source_assessment)` — flat keyword bag used for matching.
- `explore_entity_keywords(entity_type, entity_id, keyword, weight)` — keyword index over sectors / industries / domains / roles / universities / subjects / skills / colleges / paths.

Extends `update_assessment_progress` to accept `interests`. Adds RPC `match_explore_entities_for_user(user_id, entity_type, limit)` returning ranked entities by keyword overlap × sector filter.

GRANTs to `authenticated` + `service_role`; full RLS.

## 5. "Current State" onboarding — 18 sectors multi-select

`EducationalStatus.tsx` gains a new section "Which sectors spark your curiosity?" listing the 18 sectors already in `career_intel_*` tables. Stored in `user_onboarding_sectors`.

## 6. Curiosity Compass 4 sections filtered by sectors + assessments

`StoryModeCards`, `ChallengeModeCards`, `CareerCardDeck`, and audio/visual mode all read:
1. `user_onboarding_sectors` (hard filter)
2. `assessment_conclusion_keywords` (soft ranking)
3. Call new RPC `match_explore_entities_for_user` for the curated subset.

Edge function `curiosity-compass-curated` orchestrates: pulls sectors + keywords → queries Explore taxonomy → returns AI-summarized cards.

## 7. Explore keyword tagging

Background edge function `tag-explore-entities` (one-shot, admin-triggered) walks each Explore source table and populates `explore_entity_keywords` from existing fields (description, tags, skills_required). Re-runnable; idempotent.

## 8. Doc cross-check — missing questions

Diff vs. current code:
- **Demographics onboarding (already present):** name, gender, age, life stage, board, location, language, decision-support, device, digital comfort, subjects/performance → add only if any are missing in `EducationalStatus.tsx`.
- **Psychometric (current ~22 Qs vs doc's 45):** add the missing Knowledge (Q1–Q5), Skills (Q6–Q15), Cognitive (Q16–Q25), Values (Q38–Q41), Personality (Q42–Q45) — only the ones not already represented. New questions appended to existing `PSYCHOMETRIC_SIGNAL_MAP` with new construct tags, and to `PsychometricTest.tsx` items. Each new Q also seeds `assessment_question_signals` so its answer feeds the right modules.
- **Discovery:** doc has the same subject-exposure & experience/certifications blocks already in onboarding; nothing new to add unless a gap appears on re-read.

Total: ~30 new psychometric items appended (no replacement). Question IDs prefixed `doc_` to avoid colliding with existing IDs.

## 9. Data flow algorithm

`src/lib/personalizationPipeline.ts` (new) — single function `runUserPersonalization(userId)`:
1. Pull latest answers from all 3 assessments + sector picks.
2. Derive keyword bag (constructs + answer labels + sector slugs).
3. Upsert `assessment_conclusion_keywords`.
4. Invoke `match_explore_entities_for_user` per entity type, cache results in `ai_cache` keyed by `user_personalization_v1`.
5. Triggered: after each assessment completion, after sector save, and on dashboard load (debounced 6h).

Consumed by: Curiosity Compass 4 sections, Roadmap suggestions, Job Matching, Mentor Matchmaking, Content Library, Skill Stacker.

## Files (high level)

**New**
- `src/components/curiositycompass/InterestsAssessment.tsx`
- `src/lib/personalizationPipeline.ts`
- `supabase/migrations/<ts>_interests_assessment.sql`
- `supabase/functions/curiosity-compass-curated/index.ts`
- `supabase/functions/tag-explore-entities/index.ts`

**Edited (additive only)**
- `src/lib/assessmentSignalMap.ts` (append INTERESTS_SIGNAL_MAP + new psychometric IDs)
- `src/components/curiositycompass/PsychometricTest.tsx` (append new Qs)
- `src/components/curiositycompass/AssessmentGate.tsx` (3rd row)
- `src/components/curiositycompass/RewardProgressTracker.tsx` (3rd track)
- `src/hooks/useAssessmentRewards.ts` (add `interests` TestType)
- `src/pages/career/CuriosityCompass.tsx` (route the 3rd tab, gating)
- `src/pages/onboarding/EducationalStatus.tsx` (sector multi-select)
- `src/components/onboarding/OnboardingRewardBanner.tsx` (Interests reward card)
- `src/pages/career/Explore.tsx` filters fed by sectors
- The 4 Curiosity Compass section components (Story/Challenge/CareerDeck/AudioVisual) to call the curated edge function

## Order of execution

1. Migration (tables + RPC + milestone seed).
2. `InterestsAssessment.tsx` + signal map + rewards hook.
3. Gate / tracker / intro slides updates.
4. Sector multi-select in EducationalStatus + reward banner.
5. Doc cross-check: append missing psychometric Qs + signal mappings + DB rows.
6. Personalization pipeline + curated edge function.
7. Tag-explore-entities backfill function.
8. Wire 4 Curiosity Compass sections to curated output.

## Out of scope (confirm if you want these too)

- Replacing existing card/story content with AI-regenerated content (current cards stay; only the *filter* is new).
- Building admin UI for re-running `tag-explore-entities` (will be invocable from a hidden settings action).

Confirm and I'll execute in the order above.
