import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { ShieldCheck, KeyRound } from "lucide-react";

/**
 * AdminMfaPanel — additive Multi-Factor Authentication enrollment surface.
 *
 * Renders ONLY for users with the `admin` role (per public.user_roles).
 * Does not touch any existing UI/UX for non-admins. Uses Supabase native
 * MFA TOTP factors — no DB schema change required.
 */
export function AdminMfaPanel() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [factors, setFactors] = useState<any[]>([]);
  const [enrolling, setEnrolling] = useState<null | { id: string; qr: string; secret: string }>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!user) return;
      const { data: roleRow } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .maybeSingle();
      if (!mounted) return;
      setIsAdmin(!!roleRow);
      if (roleRow) {
        const { data } = await supabase.auth.mfa.listFactors();
        setFactors(data?.totp ?? []);
      }
    })();
    return () => { mounted = false; };
  }, [user]);

  if (!user || !isAdmin) return null;

  const startEnrollment = async () => {
    setBusy(true);
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "Admin TOTP" });
    setBusy(false);
    if (error) return toast.error(error.message);
    setEnrolling({ id: data.id, qr: data.totp.qr_code, secret: data.totp.secret });
  };

  const verifyEnrollment = async () => {
    if (!enrolling || !code) return;
    setBusy(true);
    const { data: chal, error: cErr } = await supabase.auth.mfa.challenge({ factorId: enrolling.id });
    if (cErr) { setBusy(false); return toast.error(cErr.message); }
    const { error: vErr } = await supabase.auth.mfa.verify({ factorId: enrolling.id, challengeId: chal.id, code });
    setBusy(false);
    if (vErr) return toast.error(vErr.message);
    toast.success("MFA enabled for your admin account.");
    setEnrolling(null);
    setCode("");
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors(data?.totp ?? []);
  };

  const removeFactor = async (factorId: string) => {
    setBusy(true);
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    setBusy(false);
    if (error) return toast.error(error.message);
    toast.success("MFA factor removed.");
    const { data } = await supabase.auth.mfa.listFactors();
    setFactors(data?.totp ?? []);
  };

  return (
    <Card className="p-5 space-y-4 border-primary/20">
      <div className="flex items-center gap-2">
        <ShieldCheck className="text-primary" size={20} />
        <h3 className="font-semibold">Admin Two-Factor Authentication</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        Required for admin accounts. Scan the QR with any authenticator app (Google Authenticator, 1Password, Authy).
      </p>

      {factors.filter((f: any) => f.status === "verified").length > 0 && (
        <div className="space-y-2">
          {factors.filter((f: any) => f.status === "verified").map((f: any) => (
            <div key={f.id} className="flex items-center justify-between text-sm bg-muted/40 rounded-md px-3 py-2">
              <span className="flex items-center gap-2"><KeyRound size={14} /> {f.friendly_name || "TOTP"}</span>
              <Button size="sm" variant="ghost" onClick={() => removeFactor(f.id)} disabled={busy}>Remove</Button>
            </div>
          ))}
        </div>
      )}

      {!enrolling && factors.filter((f: any) => f.status === "verified").length === 0 && (
        <Button onClick={startEnrollment} disabled={busy}>Enable MFA</Button>
      )}

      {enrolling && (
        <div className="space-y-3">
          <img src={enrolling.qr} alt="MFA QR code" className="w-44 h-44 border rounded-md bg-white p-2" />
          <p className="text-xs text-muted-foreground break-all">Secret: {enrolling.secret}</p>
          <Label>Enter 6-digit code from your app</Label>
          <Input value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))} placeholder="123456" />
          <div className="flex gap-2">
            <Button onClick={verifyEnrollment} disabled={busy || code.length !== 6}>Verify & Activate</Button>
            <Button variant="ghost" onClick={() => { setEnrolling(null); setCode(""); }} disabled={busy}>Cancel</Button>
          </div>
        </div>
      )}
    </Card>
  );
}
