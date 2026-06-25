/**
 * Thin client wrapper around the `public.log_security_event` RPC.
 * Failures are swallowed — audit logging must never break user flows.
 */
import { supabase } from "@/integrations/supabase/client";

export type SecurityEventSeverity = "info" | "warning" | "critical";

export type SecurityEventType =
  | "auth.signin.success"
  | "auth.signin.failure"
  | "auth.signup"
  | "auth.signout"
  | "auth.password.reset_requested"
  | "auth.password.updated"
  | "auth.mfa.enrolled"
  | "auth.mfa.removed"
  | "auth.user.updated"
  | "session.expired_idle"
  | "session.expired_absolute"
  | "upload.rejected"
  | "fetch.blocked"
  | "rate_limit.exceeded"
  | "consent.updated"
  | string;

export async function logSecurityEvent(
  eventType: SecurityEventType,
  metadata: Record<string, unknown> = {},
  severity: SecurityEventSeverity = "info",
): Promise<void> {
  try {
    await (supabase as any).rpc("log_security_event", {
      _event_type: eventType,
      _severity: severity,
      _metadata: metadata,
    });
  } catch {
    // intentional: never surface logging errors
  }
}
