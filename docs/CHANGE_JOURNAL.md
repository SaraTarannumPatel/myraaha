# MyRaaha — Change Journal

A running log of **major** product and design changes, the reasoning behind them, what was wrong before, and the benefit delivered. Minor tweaks (typo fixes, single-color hex nudges, one-line copy edits) are intentionally excluded.

Entry format:
```
### YYYY-MM-DD — Title
- What changed:
- Why:
- Before:
- Benefit:
- Files:
```

---

## Retrospective entries (reconstructed from prior chat history)

> The entries below are reconstructed from available conversation history. Exact dates of original changes are not preserved — they are grouped by theme in the order they occurred during the recent landing-page overhaul.

### Landing Home — Structural Cleanup
- **What changed:** Deleted the "Strategic Transformation" section. Merged the "Ready to Make an Impact?" CTA into the top of the footer. Removed the "Explore MyRaaha to get your answers" button from the hero.
- **Why:** Reduce redundancy and tighten the home page narrative; consolidate the conversion CTA into a single high-visibility footer slot.
- **Before:** Home page had multiple competing CTAs and an extra strategic-narrative section that diluted focus.
- **Benefit:** Cleaner scroll, fewer decision points, stronger single CTA at the page foot.
- **Files:** `src/pages/Index.tsx`, `src/components/landing/shared/LandingFooter.tsx`

### Brand Palette — Yellow → Lightest Purple
- **What changed:** Removed yellow accent across the landing site and web app; replaced with the lightest shade of purple. Updated semantic tokens (`--accent`, `--yellow-highlight`, `--yellow-icon`, related gradients/shadows) so legacy `yellow-*` Tailwind utilities now resolve to purple variants.
- **Why:** Unify the brand around a single purple-led palette and remove a color that read as informal/childish for the institutional audience (governments, institutions, parents).
- **Before:** Yellow highlights felt off-brand against the navy/purple primary, and yellow-on-white had poor contrast.
- **Benefit:** Consistent purple identity, better contrast, future color edits flow through tokens.
- **Files:** `src/index.css`, `tailwind.config.ts`

### Typography — Single Font Family (Poppins)
- **What changed:** Removed Instrument Serif from the entire app. Poppins is the only font family; variation now comes only from size, weight, and italic.
- **Why:** Visual consistency, faster font loading, and a simpler typographic system that scales across modules.
- **Before:** Mixing Poppins with Instrument Serif italics created inconsistent rhythm between sections and added font-load weight.
- **Benefit:** Cohesive typography system, lighter page weight, predictable styling across every screen.
- **Files:** `src/index.css`, `tailwind.config.ts`

### Value Realization Section — Restructured Stakeholder Cards
- **What changed:** Rebuilt the per-stakeholder tabs:
  - **Parents:** Decision Intelligence, Positive Parenting, Continuous Tracking
  - **Institutions:** Institutional Reputation, NEP 2020 Alignment, Teacher Empowerment (later extended with Ecosystem Network copy)
  - **Governments:** Talent Discovery, Workforce Readiness, Public-Private Partnerships, Policy Alignment, Ecosystem Integration
  - Centered all card contents (`items-center text-center`, `mx-auto` icon container)
  - Deleted the five trailing outcome sections (Student Outcome, Institutional Reputation, Parent Satisfaction, Policy Alignment, Ecosystem Partnerships) that duplicated this content below.
- **Why:** The page repeated the same value props twice — once inside Value Realization and again below it. Consolidating into the tabbed section removed duplication and let each stakeholder see their relevant value at a glance.
- **Before:** Long, repetitive scroll; stakeholders had to read past unrelated cards to find their own value props.
- **Benefit:** Single source of truth per stakeholder, ~5 fewer scroll sections, clearer hierarchy.
- **Files:** `src/pages/Index.tsx`

### Success Stories — Removed Administrators Tab
- **What changed:** Deleted the "Administrators" tab from the Success Stories section.
- **Why:** Audience scoped to students/parents/institutions/governments; administrators are covered under Institutions.
- **Before:** Redundant tab with overlapping content.
- **Benefit:** Tighter tab set, clearer audience targeting.
- **Files:** `src/pages/Index.tsx`

### Design System — Type Hierarchy Normalization
- **What changed:**
  - All highlighted (purple) title spans set to italic for visual emphasis.
  - All section/card titles unified to the same weight (`font-semibold`) site-wide — including the footer CTA "Ready to Make an Impact?" which had been left at `font-bold`.
  - Bumped description body text up (`text-base sm:text-lg`) and bullet titles to `text-lg font-semibold` for readability.
  - Main backgrounds standardized to light grey; capsule chips standardized to purple / light purple based on use case.
  - Identical elements across the home page now share identical font sizes.
- **Why:** Earlier passes left inconsistent weights and sizes between mobile and desktop, and previously requested "less bold" titles weren't applied uniformly (desktop still showed bolder headings, and the footer title diverged from the rest).
- **Before:** Mixed `font-bold` and `font-semibold` titles, small/cramped body copy, mismatched background tones, inconsistent capsule colors.
- **Benefit:** Coherent visual rhythm, improved readability for the Tier 3/4 audience, single typography contract across the page.
- **Files:** `src/pages/Index.tsx`, `src/components/landing/shared/LandingFooter.tsx`, `src/index.css`

---

## New entries

### 2026-05-16 — Introduced Change Journal
- **What changed:** Added `docs/CHANGE_JOURNAL.md` and a memory rule requiring major-change documentation going forward.
- **Why:** User asked for a traceable history of *why* changes happen, not just *what* changed.
- **Before:** Rationale lived only in chat history and was easily lost between sessions.
- **Benefit:** Persistent product memory; future agents and humans can understand the trajectory of decisions.
- **Files:** `docs/CHANGE_JOURNAL.md`, `mem://preferences/change-journal`, `mem://index.md`
