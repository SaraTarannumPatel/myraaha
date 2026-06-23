/**
 * authGuard — client-side hardening for login/signup flows.
 *
 * - Progressive delay on repeated failures (1s, 2s, 4s, 8s, cap 30s).
 * - Idle timeout (default 30 min) and absolute lifetime (12 h) call
 *   the supplied signOut() callback. Activity = mousemove/keydown/touch.
 *
 * Purely additive. The Auth.tsx form keeps its existing UX; it simply
 * awaits `throttleLoginAttempt()` before calling supabase.
 */

const FAIL_KEY = "myraaha_auth_fail_count";
const SESSION_START_KEY = "myraaha_session_started_at";
const IDLE_MS = 30 * 60 * 1000;
const ABSOLUTE_MS = 12 * 60 * 60 * 1000;

function readCount(): number {
  try { return Number(sessionStorage.getItem(FAIL_KEY) || "0") || 0; } catch { return 0; }
}
function writeCount(n: number) {
  try { sessionStorage.setItem(FAIL_KEY, String(n)); } catch { /* noop */ }
}

/** Call BEFORE attempting login. Awaits the progressive backoff if needed. */
export async function throttleLoginAttempt(): Promise<void> {
  const fails = readCount();
  if (fails <= 0) return;
  const delay = Math.min(30_000, 500 * 2 ** (fails - 1));
  await new Promise((r) => setTimeout(r, delay));
}

export function recordLoginFailure(): number {
  const next = readCount() + 1;
  writeCount(next);
  return next;
}

export function recordLoginSuccess(): void {
  writeCount(0);
  try { sessionStorage.setItem(SESSION_START_KEY, String(Date.now())); } catch { /* noop */ }
}

/**
 * Start idle + absolute timers. Returns a cleanup function.
 * Caller passes its own signOut to avoid coupling.
 */
export function startSessionTimers(signOut: () => void | Promise<void>): () => void {
  let lastActivity = Date.now();
  const start = Number(sessionStorage.getItem(SESSION_START_KEY) || Date.now());
  try { sessionStorage.setItem(SESSION_START_KEY, String(start)); } catch { /* noop */ }

  const bump = () => { lastActivity = Date.now(); };
  const events: Array<keyof WindowEventMap> = ["mousemove", "keydown", "touchstart", "click", "scroll"];
  events.forEach((e) => window.addEventListener(e, bump, { passive: true }));

  const tick = window.setInterval(() => {
    const now = Date.now();
    if (now - lastActivity > IDLE_MS || now - start > ABSOLUTE_MS) {
      window.clearInterval(tick);
      void signOut();
    }
  }, 60_000);

  return () => {
    window.clearInterval(tick);
    events.forEach((e) => window.removeEventListener(e, bump));
  };
}
