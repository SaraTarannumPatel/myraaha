
# MyRaaha Security Hardening — Implementation Plan

I read all three documents end-to-end. Doc 1 (`security_prompts_lovable_ai.md`) and the two DOCX files (`Security Hardening Implementation for Lovable AI.docx`, `Security Implementation Brief for Lovable AI.docx`) are versions of the same brief — one is the prompt, the other two are the formal hardening + launch-ready briefs. They share the same 12 control families and the same mandatory constraint: **do not change features, UI, UX, business logic, workflows, navigation, modules, pages, or the database schema unless absolutely unavoidable** — and if it is, stop and ask first.

Every item below is **additive**. No existing component, route, edge function, table, RLS policy, copy, or visual is removed or rewritten. If a control would require touching feature behavior or the schema, it is flagged **APPROVAL REQUIRED** and not executed until you say yes.

---

## 0. Audit findings (current state, before any change)

- Transport: served via Lovable hosting (HTTPS) but no app-level CSP, HSTS, Referrer-Policy, Permissions-Policy, X-Content-Type-Options, X-Frame-Options, COOP/COEP/CORP headers are set.
- Auth: Supabase email/password + OAuth + phone OTP. No client-side rate limit UX, no progressive delay, no lockout messaging, no MFA for admins. Sessions stored by supabase-js in localStorage (default).
- Authorization: RLS exists on every public table (per supabase context). `has_role` security-definer pattern present (good). Several edge functions exist; some likely run with `verify_jwt = false` and need explicit in-code JWT validation + zod input validation audit.
- Browser storage: app writes `myraaha_pending_email`, `myraaha_last_route`, `myraaha_compass_finale_shown`, plus the Supabase auth token to localStorage. No sensitive PII beyond email, but needs review + logout-time purge.
- PWA: `public/sw.js` and `public/manifest.webmanifest` exist. Need to verify scope, cache strategy, cache versioning, no auth-bearing responses cached, skipWaiting/clients.claim behavior.
- Input validation: Most forms are React state → Supabase. Need zod schemas at every write boundary (client + edge function).
- Logging: `console.log` calls scattered through src/ and supabase/functions/. Need a scrub pass so no tokens/emails/PII land in logs.
- Dependencies: no automated scan wired in. `bun.lockb`/`package.json` present.
- Secrets: all in Lovable Cloud secret store (good). `.env` only carries publishable keys (good).
- Headers / `_redirects`: `public/_redirects` exists; no `public/_headers` for security headers.
- Edge function CORS: most use wildcard CORS; should be restricted to known origins.

---

## 1. What gets implemented automatically (no feature/UX/schema change)

Grouped by the doc sections. Each item lists the exact file(s) touched and is purely additive.

### A. Transport Security & Browser Hardening (Doc §1, §9, §0-Transport)
- Add `public/_headers` with:
  - `Strict-Transport-Security: max-age=63072000; includeSubDomains; preload`
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY` (and frame-ancestors in CSP)
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Permissions-Policy` disabling camera/mic/geolocation/usb/payment by default
  - `Cross-Origin-Opener-Policy: same-origin`, `Cross-Origin-Resource-Policy: same-origin`
  - `Content-Security-Policy-Report-Only` first (per doc: start in Report-Only), allowing only: `'self'`, Supabase project origin, Lovable AI gateway, Google Fonts, image CDNs already in use, `'wasm-unsafe-eval'` only if needed. After 1 deploy of observation, flip to enforcing CSP.
- Add SRI hashes for any `<script>`/`<link>` to third-party CDNs in `index.html` (currently minimal — verified per file).
- `index.html` `<meta http-equiv>` fallbacks for `Content-Security-Policy` and `Referrer-Policy` so protections also apply on platforms that strip headers.

### B. PWA / Service Worker (Doc §9)
- Edit `public/sw.js` additively: explicit cache version constant, install/activate that deletes old caches, **network-first for `/api/`, `*.functions.supabase.co`, and any `Authorization`-bearing request — never cache them**, cache-first only for static assets in `/assets/`. Add a `message` handler for `LOGOUT_PURGE` that wipes all caches.
- Tighten `manifest.webmanifest` scope to `/` and `start_url` to current value (verify, no behavior change).

### C. Authentication & Session (Doc §2)
- Add a thin `src/lib/security/authGuard.ts`:
  - Tracks failed login attempts in memory + sessionStorage (not localStorage), enforces progressive delay (1s, 2s, 4s, 8s, max 30s) before next attempt — purely client-side UX hardening; server-side rate-limit lives in Supabase auth.
  - Idle timeout (configurable, default 30 min) and absolute timeout (12 h): on trigger, calls `supabase.auth.signOut()` then posts `LOGOUT_PURGE` to SW.
- On `signOut`: clear all `myraaha_*` keys, clear `sessionStorage`, send SW purge message.
- Wire `supabase.auth.onAuthStateChange` to regenerate any in-memory caches on `SIGNED_IN`/`TOKEN_REFRESHED`.
- Call `supabase--configure_auth` to enable HIBP leaked-password check (no UI change, just stronger validation at signup/reset).
- **APPROVAL REQUIRED:** switching Supabase session storage from localStorage to an httpOnly cookie flow — requires SSR/edge proxy and would change the supabase-js init. Not done automatically.
- **APPROVAL REQUIRED:** MFA enrollment UI for admins — adds a new flow.

### D. Authorization (Doc §3)
- Audit-only pass on every `public.*` table for RLS + `GRANT`s (run `supabase--linter` + `security--run_security_scan`). For each finding I will list it; I will only fix when the fix is purely a missing policy/grant addition (additive). Anything that would tighten an existing permissive policy and could affect current reads/writes is **APPROVAL REQUIRED**.
- Edge-function in-code JWT verification helper `supabase/functions/_shared/requireUser.ts` (additive; existing functions wrap their handler with it without behavior change for legitimate users).

### E. Input Validation & Output Encoding (Doc §4)
- Add `src/lib/security/schemas.ts` with zod schemas for every existing form (auth, onboarding, journal, mentor requests, etc.). Schemas mirror current accepted input — they reject only what the app already cannot handle (length caps, type checks, email/phone regex, URL allow-list). No new UX.
- Add equivalent `z` schemas at the top of every edge function handler before any DB call.
- Grep + remove any `dangerouslySetInnerHTML` with non-sanitized input; if any are found, wrap with DOMPurify (added dep). If none, no change.
- Open-redirect guard helper for any `navigate()` that consumes a query param (e.g. Auth `next=`/last-route restore).

### F. File Upload (Doc §5)
- Only the `resumes` bucket and `insight-covers` bucket exist. Add server-side validation in the upload edge path (or a thin wrapper): MIME + magic-byte sniff (pdf/png/jpg/webp only), size cap, randomized filename. Storage bucket policies audited — no policy widening.

### G. Data Protection & Browser Storage (Doc §6)
- Inventory localStorage usage; move anything sensitive to sessionStorage or memory. Currently only `pending_email`, `last_route`, `compass_finale_shown` — all low-sensitivity, but added to the logout purge list.
- Add a `src/lib/security/safeStorage.ts` wrapper used going forward (existing callers keep working; wrapper is opt-in).

### H. Logging & Monitoring (Doc §7)
- Add `src/lib/security/logger.ts` that strips emails, tokens (`eyJ...`), UUIDs, phone numbers from any logged payload. Replace top-level `console.error` in error boundaries with this scrubber. **Do not** rip out existing `console.log`s feature-by-feature; instead override `console.log/error/warn` in production builds via a small init in `src/main.tsx` that routes through the scrubber.
- Edge functions: same scrubber as `_shared/logger.ts`. Add structured `auth_event` / `authz_failure` log lines (no PII) on the existing auth + RLS-denied paths.

### I. Supply Chain (Doc §8)
- Run `code--dependency_scan`; list vulnerable packages with safe upgrade paths. Apply only **patch-level** upgrades automatically; minor/major upgrades = **APPROVAL REQUIRED**.
- Add `.npmrc` `engine-strict=true` and `save-exact=true` so future installs pin versions.

### J. Environment Isolation (Doc §10)
- No code change — verify `.env` only contains publishable keys (already true) and document in `docs/SECURITY.md` the separation. Add a build-time assert in `vite.config.ts` that throws if a `SERVICE_ROLE` style key appears in `import.meta.env`.

### K. Backup & Incident Response (Doc §11)
- Add `docs/SECURITY.md` and `docs/INCIDENT_RESPONSE.md` (new docs only, no app change) covering: backup cadence (Lovable Cloud managed), restore drill checklist, credential-leak playbook, SW-compromise playbook, account-takeover playbook.

### L. Security Testing (Doc §12)
- Add `scripts/security/` with: `npm audit`/`bun audit` wrapper, secret-scan (gitleaks config), CSP report endpoint stub (edge function) that just logs violations, and a README listing the manual SAST/DAST/pen-test steps you (or a vendor) run pre-release.

### M. Edge-function CORS tightening
- Replace wildcard `Access-Control-Allow-Origin: *` with an allow-list (`myraaha.lovable.app`, preview domain, `localhost:8080`). Behaviorally identical for the real app, blocks cross-origin abuse.

---

## 2. Items flagged APPROVAL REQUIRED (not executed automatically)

Per the documents' mandatory constraint, these would touch behavior, UX, or schema:

1. Move Supabase session from `localStorage` → httpOnly cookie via an edge proxy (Doc §6 strongly implies this).
2. Add MFA enrollment + challenge UI for admin role (Doc §2).
3. Enforce CSP (after Report-Only observation window). Could break a feature if an unexpected origin is in use.
4. Switch any permissive RLS policy (e.g. tables granting `anon SELECT`) to authenticated-only if business logic allows.
5. Add CAPTCHA / Turnstile to auth endpoints (Doc §2 "bot detection").
6. Add a server-side rate-limiter table (would add 1 schema object) for per-IP edge function abuse protection.
7. Force re-login on password change everywhere (currently only invalidates current session).
8. Remove `console.log` calls in production via build flag (alternative to runtime scrubber) — minor behavior diff in dev tooling.
9. Subresource Integrity on Google Fonts (requires switching to self-hosted fonts; visual identical but build change).
10. Any dependency major-version upgrade flagged by the scan.

---

## 3. Execution order (when you say "go")

1. Snapshot audit (`security--run_security_scan`, `supabase--linter`, `code--dependency_scan`) → post findings list.
2. Add `public/_headers`, `index.html` meta fallbacks, CSP **Report-Only**.
3. Harden `public/sw.js` (versioned cache, no-cache for auth/api, LOGOUT_PURGE).
4. Add `src/lib/security/{logger,safeStorage,authGuard,schemas,sanitize,redirectGuard}.ts` + wire into `main.tsx`, `AuthContext`, `Auth.tsx`, `DashboardLayout.tsx` (additive imports only).
5. Add `supabase/functions/_shared/{requireUser,logger,validate,cors}.ts` and wrap every existing function (one-line wrapper, no logic change).
6. Tighten edge-function CORS allow-list.
7. Enable HIBP via `supabase--configure_auth`.
8. Add `docs/SECURITY.md`, `docs/INCIDENT_RESPONSE.md`, `scripts/security/*`, CSP-report edge function.
9. Append a detailed entry to `docs/CHANGE_JOURNAL.md` per project rule.
10. Re-run scanners → post the delta + the approval-required list above for your decision.

---

## 4. Guarantees

- Zero changes to: routes, page components, copy, colors, fonts, navigation, onboarding flow, Curiosity Compass flow, Career Navigator, AI Roadmaps, dashboard, edge-function business logic, RLS policies (additions only if missing), database schema.
- Every new file is in `src/lib/security/`, `supabase/functions/_shared/`, `public/_headers`, `docs/`, or `scripts/security/`.
- Every wrap of an existing edge function is a 1-line `requireUser(req, async (user) => { ...existing handler... })` — original code body untouched.

Reply **"go"** to start at step 1, or tell me which APPROVAL-REQUIRED items in §2 to fold into the automatic pass.
