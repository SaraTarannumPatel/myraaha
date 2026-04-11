import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import OnboardingProgressBar from "@/components/onboarding/OnboardingProgressBar";
import OnboardingRewardBanner from "@/components/onboarding/OnboardingRewardBanner";
import otpIllustration from "@/assets/auth-signup-illustration.png";

const OTPVerification = () => {
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const navigate = useNavigate();
  const location = useLocation();
  const { email, phone, type } = (location.state as { email?: string; phone?: string; type?: string }) || {};

  useEffect(() => {
    if (!email && !phone) {
      navigate("/auth", { replace: true });
    }
  }, [email, phone, navigate]);

  useEffect(() => {
    if (resendTimer > 0) {
      const t = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [resendTimer]);

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 3) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 4);
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    const nextIndex = Math.min(pasted.length, 3);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 4) {
      toast.error("Please enter the full OTP");
      return;
    }
    setSubmitting(true);
    try {
      if (type === "phone" && phone) {
        const { error } = await supabase.auth.verifyOtp({
          phone,
          token: code,
          type: "sms",
        });
        if (error) throw error;
      } else if (email) {
        const { error } = await supabase.auth.verifyOtp({
          email,
          token: code,
          type: "email",
        });
        if (error) throw error;
      }
      toast.success("Verified successfully!");
      navigate("/onboarding", { replace: true });
    } catch (err: any) {
      toast.error(err.message || "Verification failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      if (type === "phone" && phone) {
        const { error } = await supabase.auth.signInWithOtp({ phone });
        if (error) throw error;
      } else if (email) {
        const { error } = await supabase.auth.resend({ type: "signup", email });
        if (error) throw error;
      }
      toast.success("OTP sent again!");
      setResendTimer(30);
    } catch (err: any) {
      toast.error(err.message || "Failed to resend");
    }
  };

  const identifier = type === "phone" ? phone : email;

  return (
    <div className="h-[100dvh] bg-[hsl(60,14%,98%)] flex flex-col overflow-hidden">
      <OnboardingProgressBar progress={8} />
      <OnboardingRewardBanner currentProgress={8} />

      <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-md mx-auto w-full">
        {/* Back button */}
        <div className="w-full mb-4">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 rounded-full bg-[hsl(0,0%,85%,0.4)] flex items-center justify-center"
          >
            <ArrowLeft size={18} className="text-[hsl(230,40%,25%)]" />
          </button>
        </div>

        {/* Illustration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="w-[60%] max-w-[240px] mb-6"
        >
          <img
            src={otpIllustration}
            alt=""
            className="w-full h-auto object-contain"
          />
        </motion.div>

        {/* OTP Inputs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="flex gap-4 mb-6"
          onPaste={handlePaste}
        >
          {otp.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              className="w-14 h-16 sm:w-16 sm:h-20 rounded-2xl bg-[hsl(230,40%,25%)] text-center font-display text-2xl sm:text-3xl text-[hsl(45,80%,65%)] outline-none focus:ring-2 focus:ring-[hsl(158,17%,37%)] transition-all"
            />
          ))}
        </motion.div>

        {/* Resend */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex items-center gap-2 font-body text-sm mb-8"
        >
          <span className="text-muted-foreground">Did not receive the OTP?</span>
          <span className="text-muted-foreground">/</span>
          <button
            onClick={handleResend}
            disabled={resendTimer > 0}
            className={`font-semibold ${resendTimer > 0 ? "text-muted-foreground" : "text-[hsl(230,40%,25%)] underline underline-offset-2"}`}
          >
            {resendTimer > 0 ? `Send Again (${resendTimer}s)` : "Send Again"}
          </button>
        </motion.div>

        {/* Verify button */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          onClick={handleVerify}
          disabled={submitting || otp.join("").length < 4}
          className="w-full py-4 rounded-full bg-[hsl(230,40%,25%)] font-body text-base font-semibold text-[hsl(45,80%,65%)] hover:bg-[hsl(230,40%,20%)] transition-colors disabled:opacity-50"
        >
          {submitting ? "Verifying..." : "Verify"}
        </motion.button>

        {identifier && (
          <p className="mt-4 font-body text-xs text-muted-foreground text-center">
            OTP sent to {identifier}
          </p>
        )}
      </div>
    </div>
  );
};

export default OTPVerification;
