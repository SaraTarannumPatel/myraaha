# Plan: Education-aware Roadmaps + new onboarding module + sidebar fix

Five tightly-scoped workstreams. I'll ship them in this order so each builds on the previous.

## 1. Backend — new tables for Current Educational Status

One migration creating user-scoped tables (RLS + GRANTs included):

- `user_education_status` — one row per user. Stores: educational_status, institution_name, board_or_university_type, stream (11/12), course_program (UG), year_of_study, looking_for_help[], career_domains[], curious_careers (text), prepping_for[].
- `user_subjects` — many per user: subject_name, relation ('current' | 'favorite' | 'difficult').
- `user_skills_profile` — many per user: skill_name, confidence ('beginner'|'intermediate'|'advanced').
- `user_certifications` — name, platform, year, certificate_url (nullable).
- `user_projects_profile` — name, description, skills_used[], link.
- `user_activities` — activity_type, title, role, year, achievement.
- `user_leadership` — position_title, organization, duration, description.

All tables: `user_id uuid not null` referencing auth user, `created_at`, `updated_at`, RLS `auth.uid() = user_id`, GRANT to authenticated + service_role.

## 2. Frontend — new onboarding step `EducationalStatus`

- New page `src/pages/onboarding/EducationalStatus.tsx` covering the 23 questions in 10 sectioned screens (single conditional flow — stream questions only show for 11/12, course/year only for UG).
- Inserted into onboarding sequence between `JourneyDiscovery` (demographics) and `ConsentStep`.
- Update `onboarding_status` enum value usage: add `'educational_status'` to `ProtectedRoute.onboardingRoutes` map and to `JourneyDiscovery`'s `handleFinish` (set next status to `educational_status` instead of `consent`).
- Persists answers to the new tables on Finish, then advances to `/onboarding/consent`.
- Uses existing `OnboardingProgressBar` + `OnboardingRewardBanner`.

## 3. Rewards recalibration

- Total onboarding weight redistributed across: Welcome → User Type → Journey/Demographics → **Educational Status (new)** → Consent.
- Update progress % math in `JourneyDiscovery` (currently `25 + step/total*40`) and add matching math in `EducationalStatus` so the bar hits 30/60/90 milestones at meaningful points.
- No DB change for `reward_milestones` keys (they still trigger by % via `update_assessment_progress`/onboarding banner rules).

## 4. AI Roadmaps restructure (education-aware)

Edit `src/lib/aiRoadmaps.ts`:

- Remove stage **Self-Discovery & Fit** (already in Curiosity Compass).
- Prepend education-prerequisite stages, dynamically based on user's `educational_status`:
  - For School/Class 11/12 → "Stream & Subject Choice", "Entrance Exam Plan", "College & Course Shortlist".
  - For Diploma/UG-in-progress → "Specialization & Electives", "Higher Studies Options (PG/Exams)".
  - For graduated/working → skip prereq stages entirely.
- Stage **Advanced & Specialization** now gated: only included when `educational_status ∈ {undergraduate, completed_ug, graduate}`.
- `buildRoadmapForEntity(entity, { educationStatus })` reads from the new `user_education_status` table (or accepts as arg) and assembles the final ordered stage list.
- Add matching `STEP_INTENT` entries in `src/lib/aiRoadmapsMock.ts` for each new prereq stage so "Curate with AI" returns context-appropriate resources (colleges, exams, subject guides, etc.).
- `Roadmap.tsx` fetches `user_education_status` on mount and passes it to the builder; shows a small "Tailored to your current education: …" chip.

## 5. Sidebar fix (desktop)

- Audit `DashboardLayout.tsx` + the sidebar component it renders. Symptom: not all modules displayed on desktop. Likely causes: `collapsible="offcanvas"` hiding items, missing `w-full` on provider wrapper, or items array filtered by an intent that drops entries.
- Fix by ensuring every route in `App.tsx`'s dashboard children has a corresponding sidebar item, using `collapsible="icon"` with a persistent `SidebarTrigger` in the header, and `w-full` on the provider wrapper per the shadcn guideline.

---

## Out of scope (won't touch)

- No changes to Curiosity Compass logic.
- No changes to existing demographics questions.
- No edits to `reward_milestones` rows — only the % math that feeds them.

## Technical notes

- Migration is one file, ~7 CREATE TABLE blocks each followed by GRANT + RLS + policy.
- Onboarding status string `educational_status` is stored as text in `profiles.onboarding_status` (already text per current usage), so no enum migration needed.
- Roadmap builder change is additive — existing entities still work; education context is optional.
