# MyRaaha — Incident Response Playbook

A short, opinionated playbook. When in doubt, **contain first, investigate
second, communicate third**.

## 0. Severity ladder

| Sev | Example | First action |
|-----|---------|--------------|
| SEV-1 | Credentials leaked, DB compromise, takeover of >1 account | Rotate keys; sign out all users |
| SEV-2 | Single account takeover, suspected SW compromise | Invalidate user's sessions; ship a kill-switch SW |
| SEV-3 | Vulnerable dependency, missing header, log leakage | File ticket; fix in next deploy |

## 1. Credential / API-key leak

1. `lovable_api_key--rotate_lovable_api_key` (rotates `LOVABLE_API_KEY`).
2. Lovable Cloud → rotate Supabase anon/publishable keys if exposed.
3. Rotate any connector key (Firecrawl, etc.) in Workspace → Connectors.
4. Force-deploy so the running edge functions pick up the new secrets.
5. Audit `auth.users.last_sign_in_at` for unusual activity in the leak window.

## 2. Suspected account takeover

1. Lovable Cloud → Users → revoke the user's sessions.
2. Force password reset via Supabase auth admin.
3. Check `user_signals` / activity tables for foreign IPs or unusual actions.
4. Notify the user out-of-band (the email on file is *also* the attack vector
   — prefer phone if you have it).

## 3. Service Worker compromise

Ship a kill-switch worker at `/sw.js`:

```js
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil((async () => {
  try { (await caches.keys()).forEach(k => caches.delete(k)); } finally {
    await self.registration.unregister();
    const wins = await self.clients.matchAll({ type: "window" });
    wins.forEach(w => w.navigate(w.url));
  }
})()));
```

Deploy, wait one release cycle, then restore the real SW with a bumped
`VERSION` constant.

## 4. Database corruption / unintended bulk write

1. Lovable Cloud → Database → Backups → point-in-time restore (managed).
2. Run `supabase--db_health` + `supabase--slow_queries` for anomalies.
3. Revoke whatever credential made the write; rotate.

## 5. Dependency compromise

1. `code--dependency_scan` → identify the package.
2. Pin the previous known-good version in `package.json`.
3. `bun install` and ship.
4. Audit any code path that imported the package for tainted output.

## 6. Post-incident

- Append a dated entry to `docs/CHANGE_JOURNAL.md` with: what, why, blast
  radius, mitigation, follow-ups.
- File a permanent fix ticket if the response was manual.
- Update this playbook if a step was missing.

## Always-on contacts

- Lovable support: via in-app chat.
- Supabase status: https://status.supabase.com
- Firecrawl status: https://status.firecrawl.dev
