import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import OnboardingProgressBar from "@/components/onboarding/OnboardingProgressBar";
import OnboardingRewardBanner from "@/components/onboarding/OnboardingRewardBanner";
import otpIllustration from "@/assets/auth-signup-illustration.png";

const CODE_LEN = 6;

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email } = (location.state as { email?: string }) || {};

  const [code, setCode] = useState<string[]>(Array(CODE_LEN).fill(""));
  const [resendTimer, setResendTimer] = useState(30);
  const [resending, setResending] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (!email) navigate("/auth", { replace: true });
    else inputsRef.current[0]?.focus();
  }, [email, navigate]);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  const handleChange = (idx: number, val: string) => {
    const digit = val.replace(/\D/g, "").slice(-1);
    const next = [...code];
    next[idx] = digit;
    setCode(next);
    if (digit && idx < CODE_LEN - 1) inputsRef.current[idx + 1]?.focus();
    if (next.every((d) => d) && next.join("").length === CODE_LEN) {
      void verify(next.join(""));
    }
  };

  const handleKeyDown = (idx: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[idx] && idx > 0) inputsRef.current[idx - 1]?.focus();
    if (e.key === "ArrowLeft" && idx > 0) inputsRef.current[idx - 1]?.focus();
    if (e.key === "ArrowRight" && idx < CODE_LEN - 1) inputsRef.current[idx + 1]?.focus();
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, CODE_LEN);
    if (!pasted) return;
    e.preventDefault();
    const next = pasted.split("").concat(Array(CODE_LEN).fill("")).slice(0, CODE_LEN);
    setCode(next);
    inputsRef.current[Math.min(pasted.length, CODE_LEN - 1)]?.focus();
    if (pasted.length === CODE_LEN) void verify(pasted);
  };

  const verify = async (token: string) => {
    if (!email || verifying) return;
    setVerifying(true);
    try {
      const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
      if (error) {
        toast.error(error.message || "Invalid code. Try again.");
        setCode(Array(CODE_LEN).fill(""));
        inputsRef.current[0]?.focus();
        return;
      }

      // Persist the password the user chose on signup so they can log in normally later.
      const pendingPwd = sessionStorage.getItem("myraaha_pending_password");
      const pendingPhone = sessionStorage.getItem("myraaha_pending_phone");
      if (pendingPwd) {
        await supabase.auth.updateUser({
          password: pendingPwd,
          data: pendingPhone ? { phone: pendingPhone, pending_password_set: false } : { pending_password_set: false },
        });
        sessionStorage.removeItem("myraaha_pending_password");
        sessionStorage.removeItem("myraaha_pending_phone");
      }

      toast.success("Email verified! 🎉");
      // AuthContext will pick up the session; ProtectedRoute routes to /onboarding (new users)
      // or /dashboard (returning users with completed onboarding).
      navigate("/onboarding", { replace: true });
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || !email) return;
    setResending(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { shouldCreateUser: false },
      });
      if (error) throw error;
      toast.success("New 6-digit code sent!");
      setResendTimer(30);
      setCode(Array(CODE_LEN).fill(""));
      inputsRef.current[0]?.focus();
    } catch (err: any) {
      toast.error(err.message || "Failed to resend");
    } finally {
      setResending(false);
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
          className="w-[40%] max-w-[160px] mb-4"
        >
          <img src={otpIllustration} alt="" className="w-full h-auto object-contain" />
        </motion.div>

        <div className="flex items-center gap-2 mb-2">
          <Mail size={20} className="text-primary" />
          <h1 className="font-display text-2xl text-primary">Enter your code</h1>
        </div>

        <p className="font-body text-sm text-muted-foreground mb-1 text-center">
          We sent a 6-digit code to
        </p>
        <p className="font-body text-sm font-semibold text-primary mb-6 text-center break-all">
          {email}
        </p>

        <div className="flex items-center justify-center gap-2 mb-6" onPaste={handlePaste}>
          {code.map((d, i) => (
            <input
              key={i}
              ref={(el) => (inputsRef.current[i] = el)}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={1}
              value={d}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={verifying}
              className="w-11 h-14 sm:w-12 sm:h-14 text-center font-display text-2xl rounded-xl bg-muted border-2 border-transparent focus:border-primary focus:outline-none transition-all disabled:opacity-50"
            />
          ))}
        </div>

        <button
          onClick={() => verify(code.join(""))}
          disabled={verifying || code.some((d) => !d)}
          className="w-full py-4 rounded-full bg-primary font-body text-base font-semibold text-white hover:bg-primary/95 transition-colors disabled:opacity-50 mb-3"
        >
          {verifying ? "Verifying..." : "Verify"}
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
            {resendTimer > 0 ? `Resend in ${resendTimer}s` : "Resend code"}
          </button>
        </div>

        <p className="font-body text-[11px] text-muted-foreground mt-4 text-center">
          💡 Don't see it? Check spam/promotions folder.
        </p>
      </div>
    </div>
  );
};

export default OTPVerification;
