# MyRaaha — Security Posture

This document records the additive enterprise-grade security layer added to
MyRaaha. **No feature, page, route, UI, UX, workflow, edge-function business
logic, or database schema was changed.** Everything listed here is additive
hardening that runs transparently.

## Layers

| Layer | Control | File / Surface |
|------|---------|----------------|
| Transport | HSTS, CSP (Report-Only), Permissions-Policy, COOP/CORP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy | `public/_headers`, `index.html` meta fallback |
| PWA | Versioned cache, never cache auth/api/storage/functions, `LOGOUT_PURGE` message handler | `public/sw.js` |
| Client auth UX | Progressive backoff on failed logins, idle (30 min) + absolute (12 h) session timers, full storage purge on logout | `src/lib/security/authGuard.ts`, `safeStorage.ts`, wired in `AuthContext` |
| Input validation | Reusable zod schemas (email, password, name, phone, OTP, URL, journal, message) | `src/lib/security/schemas.ts` |
| Output safety | HTML sanitizer + escape helpers | `src/lib/security/sanitize.ts` |
| Redirect safety | `safeRedirect()` rejects absolute / protocol-relative / `javascript:` / CRLF | `src/lib/security/redirectGuard.ts` |
| Logging | Production console wrapper that strips JWTs, emails, UUIDs, phone numbers, secrets | `src/lib/security/logger.ts`, `supabase/functions/_shared/logger.ts` |
| Edge functions | Shared CORS allow-list, JWT verification helper, zod body parser | `supabase/functions/_shared/{cors,requireUser,validate,logger}.ts` |
| Env isolation | Build-time assert that no service-role-shaped key leaks into the client bundle | `vite.config.ts` |
| Supply chain | Pinned exact versions for future installs | `.npmrc` |

## Browser storage policy

Only these keys are ever written to `localStorage`, all low-sensitivity:

- `myraaha_pending_email` — last entered email (verification UX)
- `myraaha_last_route` — restore on re-login
- `myraaha_compass_finale_shown` — celebration-shown flag
- `myraaha_*` — feature flags / UI state
- `sb-*-auth-token` — Supabase session (managed by supabase-js)

All of the above are wiped on logout by `purgeOnLogout()`.

## Edge-function policy

- New functions: import `buildCorsHeaders`, `requireUser`, `parseBody`, `log`.
- Existing functions: keep working unchanged. They will be migrated to the
  shared helpers in subsequent passes — no behavior change is expected.
- Wildcard `*` CORS in any new function is forbidden; use the allow-list.

## Approval-required items (NOT yet implemented)

These would touch behavior, UX, or schema. See `.lovable/plan.md` §2 for the
full list.

1. Move Supabase session from `localStorage` → httpOnly cookie via edge proxy.
2. Admin MFA enrollment UI.
3. Promote CSP from Report-Only to enforcing.
4. Tighten any `anon SELECT` RLS policies that are no longer needed.
5. Add Turnstile / CAPTCHA on auth endpoints.
6. Server-side per-IP rate-limit table for edge functions.
7. Force global re-login on password change.
8. Strip `console.log` calls in production builds (alternative to runtime scrub).
9. Self-host fonts to enable SRI on font requests.
10. Dependency major-version upgrades flagged by `bun audit`.

## CSP rollout

Headers ship as **`Content-Security-Policy-Report-Only`**. Monitor browser
console (and any future report-uri endpoint) for ~1 release cycle. When the
report stream is clean, promote the header name to enforcing CSP in
`public/_headers`.

## Verification checklist

- [ ] `curl -I https://myraaha.lovable.app` shows the new headers.
- [ ] DevTools → Application → Service Workers shows the active SW responding
      to a `{ type: "LOGOUT_PURGE" }` postMessage.
- [ ] Sign out → DevTools → Application → Storage shows no `myraaha_*` or
      `sb-*-auth-token` keys.
- [ ] Failed login attempts visibly slow down (1s, 2s, 4s…).
- [ ] Idle for 30 min → automatically signed out.
- [ ] Production console logs contain no emails, JWTs, phone numbers, UUIDs.
