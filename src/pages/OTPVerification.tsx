import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, CheckCircle2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import OnboardingProgressBar from "@/components/onboarding/OnboardingProgressBar";
import OnboardingRewardBanner from "@/components/onboarding/OnboardingRewardBanner";
import otpIllustration from "@/assets/auth-signup-illustration.png";

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = (location.state as { email?: string }) || {};

  const [resendTimer, setResendTimer] = useState(30);
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    if (!email) {
      navigate("/auth", { replace: true });
    }
  }, [email, navigate]);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  // Detect verification across windows. The email may be verified in another browser tab,
  // a different browser, or even on the user's phone — in all cases, this page should detect it.
  useEffect(() => {
    let cancelled = false;

    const checkVerified = async (): Promise<boolean> => {
      try {
        // refreshSession forces Supabase to re-fetch the latest auth state from the server,
        // which is essential when the verification happened in a different window/device.
        const [{ data: refreshed }, { data: rpcVerified }] = await Promise.all([
          supabase.auth.refreshSession(),
          email ? (supabase as any).rpc("is_email_verified", { _email: email }) : Promise.resolve({ data: false }),
        ]);
        const confirmedAt =
          refreshed?.user?.email_confirmed_at ??
          (await supabase.auth.getUser()).data?.user?.email_confirmed_at;
        if ((confirmedAt || rpcVerified === true) && !cancelled) {
          toast.success("Email verified! 🎉");
          setTimeout(() => navigate("/auth", { replace: true }), 1200);
          return true;
        }
      } catch {
        /* ignore network errors during polling */
      }
      return false;
    };

    // 1. React to in-window auth state changes (same-tab verification)
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email_confirmed_at && !cancelled) {
        toast.success("Email verified! 🎉");
        setTimeout(() => navigate("/auth", { replace: true }), 1200);
      }
    });

    // 2. Poll the server every 4s — catches verification done on another device/window
    const pollInterval = setInterval(checkVerified, 4000);

    // 3. Re-check immediately when the user returns focus / tab becomes visible
    const onFocus = () => { void checkVerified(); };
    const onVisibility = () => { if (document.visibilityState === "visible") void checkVerified(); };
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);

    // 4. Initial check on mount
    void checkVerified();

    return () => {
      cancelled = true;
      sub.subscription.unsubscribe();
      clearInterval(pollInterval);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [email, navigate]);

  const handleResend = async () => {
    if (resendTimer > 0 || !email) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.resend({ type: "signup", email });
      if (error) throw error;
      toast.success("Verification email sent again!");
      setResendTimer(30);
    } catch (err: any) {
      toast.error(err.message || "Failed to resend");
    } finally {
      setResending(false);
    }
  };

  const handleICheckedIt = async () => {
    setChecking(true);
    try {
      // Force a session refresh first so we pick up verification done in another window/device
      const [{ data }, { data: rpcVerified }] = await Promise.all([
        supabase.auth.getUser(),
        email ? (supabase as any).rpc("is_email_verified", { _email: email }) : Promise.resolve({ data: false }),
      ]);
      await supabase.auth.refreshSession();
      if (data?.user?.email_confirmed_at || rpcVerified === true) {
        toast.success("Email verified! 🎉");
        navigate("/auth", { replace: true });
      } else {
        toast.info("Not verified yet. Please click the link in your inbox.");
      }
    } finally {
      setChecking(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <OnboardingProgressBar progress={8} />
      <OnboardingRewardBanner currentProgress={8} />

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 pb-20 max-w-md mx-auto w-full">
        <div className="w-full mb-4 flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-primary" />
          </button>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-[45%] max-w-[180px] mb-4"
        >
          <img src={otpIllustration} alt="" className="w-full h-auto object-contain" />
        </motion.div>

        <div className="flex items-center gap-2 mb-2">
          <Mail size={20} className="text-primary" />
          <h1 className="font-display text-2xl text-primary">Verify your email</h1>
        </div>

        <p className="font-body text-sm text-muted-foreground mb-1 text-center">
          We sent a verification link to
        </p>
        <p className="font-body text-sm font-semibold text-primary mb-6 text-center break-all">
          {email}
        </p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="w-full p-5 rounded-2xl bg-accent/20 border border-accent/60 mb-6"
        >
          <div className="flex items-start gap-3">
            <CheckCircle2 size={20} className="text-primary shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-display text-sm font-bold text-primary">
                Check your inbox
              </p>
              <p className="font-body text-xs text-muted-foreground leading-relaxed">
                Open the email from us and tap the <span className="font-semibold">"Verify your email"</span> button. Then come back here — we'll detect it automatically.
              </p>
              <p className="font-body text-xs text-muted-foreground leading-relaxed pt-1">
                💡 Don't see it? Check spam/promotions folder.
              </p>
            </div>
          </div>
        </motion.div>

        <button
          onClick={handleICheckedIt}
          disabled={checking}
          className="w-full py-4 rounded-full bg-primary font-body text-base font-semibold text-white hover:bg-primary/95 transition-colors disabled:opacity-50 mb-3"
        >
          {checking ? "Checking..." : "I've verified my email"}
        </button>

        <div className="flex items-center gap-2 font-body text-sm">
          <span className="text-muted-foreground">Didn't receive it?</span>
          <button
            onClick={handleResend}
            disabled={resendTimer > 0 || resending}
            className={`font-semibold flex items-center gap-1 ${
              resendTimer > 0 || resending
                ? "text-muted-foreground"
                : "text-primary underline underline-offset-2"
            }`}
          >
            <RefreshCw size={12} className={resending ? "animate-spin" : ""} />
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend email"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;
