import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Mail, Phone, CheckCircle2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import OnboardingProgressBar from "@/components/onboarding/OnboardingProgressBar";
import OnboardingRewardBanner from "@/components/onboarding/OnboardingRewardBanner";
import otpIllustration from "@/assets/auth-signup-illustration.png";

type VerifyStep = "email" | "phone" | "done";

const OTPVerification = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { email, phone, type } = (location.state as { email?: string; phone?: string; type?: string }) || {};

  // Determine initial step
  const isDual = type === "dual";
  const [step, setStep] = useState<VerifyStep>(isDual || type === "email" || !type ? "email" : "phone");
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneVerified, setPhoneVerified] = useState(false);

  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [submitting, setSubmitting] = useState(false);
  const [resendTimer, setResendTimer] = useState(30);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

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
    setOtp(["", "", "", "", "", ""]);
    setResendTimer(30);
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, [step]);

  const handleChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1];
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) newOtp[i] = pasted[i];
    setOtp(newOtp);
    const nextIndex = Math.min(pasted.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      toast.error("Please enter the full 6-digit OTP");
      return;
    }
    setSubmitting(true);
    try {
      if (step === "email" && email) {
        const { error } = await supabase.auth.verifyOtp({ email, token: code, type: "email" });
        if (error) throw error;
        setEmailVerified(true);
        toast.success("Email verified! ✅");
        if (isDual && phone) {
          // Send phone OTP and move to phone step
          await supabase.auth.signInWithOtp({ phone });
          setStep("phone");
        } else {
          setStep("done");
        }
      } else if (step === "phone" && phone) {
        const { error } = await supabase.auth.verifyOtp({ phone, token: code, type: "sms" });
        if (error) throw error;
        setPhoneVerified(true);
        toast.success("Phone verified! ✅");
        setStep("done");
      }
    } catch (err: any) {
      toast.error(err.message || "Verification failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    try {
      if (step === "email" && email) {
        const { error } = await supabase.auth.resend({ type: "signup", email });
        if (error) throw error;
      } else if (step === "phone" && phone) {
        const { error } = await supabase.auth.signInWithOtp({ phone });
        if (error) throw error;
      }
      toast.success("OTP sent again!");
      setResendTimer(30);
    } catch (err: any) {
      toast.error(err.message || "Failed to resend");
    }
  };

  // Done step - show success and redirect
  useEffect(() => {
    if (step === "done") {
      const timer = setTimeout(() => {
        navigate("/auth", { replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step, navigate]);

  if (step === "done") {
    return (
      <div className="h-[100dvh] bg-[hsl(60,14%,98%)] flex flex-col overflow-hidden">
        <OnboardingProgressBar progress={10} />
        <div className="flex-1 flex items-center justify-center px-6">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-6 max-w-md">
            <div className="w-24 h-24 rounded-3xl bg-[hsl(158,40%,90%)] flex items-center justify-center mx-auto">
              <CheckCircle2 size={48} className="text-[hsl(158,30%,35%)]" />
            </div>
            <h1 className="font-display text-3xl text-[hsl(230,40%,25%)]">All Verified! 🎉</h1>
            <p className="font-body text-muted-foreground">
              Your email{isDual ? " and phone number have" : " has"} been verified successfully. Please login with your credentials to continue.
            </p>
            <p className="font-body text-xs text-muted-foreground">Redirecting to login...</p>
          </motion.div>
        </div>
      </div>
    );
  }

  const currentIdentifier = step === "email" ? email : phone;
  const stepIcon = step === "email" ? Mail : Phone;
  const stepLabel = step === "email" ? "Email" : "Phone Number";

  return (
    <div className="h-[100dvh] bg-[hsl(60,14%,98%)] flex flex-col overflow-hidden">
      <OnboardingProgressBar progress={8} />
      <OnboardingRewardBanner currentProgress={8} />

      <div className="flex-1 flex flex-col items-center justify-center px-6 max-w-md mx-auto w-full">
        <div className="w-full mb-4 flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-[hsl(0,0%,85%,0.4)] flex items-center justify-center">
            <ArrowLeft size={18} className="text-[hsl(230,40%,25%)]" />
          </button>
          {isDual && (
            <div className="flex items-center gap-2 ml-auto">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${emailVerified ? "bg-[hsl(158,40%,90%)] text-[hsl(158,30%,35%)]" : step === "email" ? "bg-[hsl(230,40%,25%)] text-[hsl(45,80%,65%)]" : "bg-muted text-muted-foreground"}`}>
                {emailVerified ? "✓" : "1"}
              </div>
              <div className="w-6 h-0.5 bg-muted" />
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${phoneVerified ? "bg-[hsl(158,40%,90%)] text-[hsl(158,30%,35%)]" : step === "phone" ? "bg-[hsl(230,40%,25%)] text-[hsl(45,80%,65%)]" : "bg-muted text-muted-foreground"}`}>
                {phoneVerified ? "✓" : "2"}
              </div>
            </div>
          )}
        </div>

        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }} className="w-[50%] max-w-[200px] mb-4">
          <img src={otpIllustration} alt="" className="w-full h-auto object-contain" />
        </motion.div>

        {/* Step label */}
        <div className="flex items-center gap-2 mb-2">
          {step === "email" ? <Mail size={18} className="text-[hsl(230,40%,25%)]" /> : <Phone size={18} className="text-[hsl(230,40%,25%)]" />}
          <span className="font-display text-lg text-[hsl(230,40%,25%)]">Verify {stepLabel}</span>
        </div>
        <p className="font-body text-xs text-muted-foreground mb-6 text-center">
          Enter the 6-digit OTP sent to <span className="font-semibold">{currentIdentifier}</span>
        </p>

        {/* OTP Inputs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex gap-3 mb-6" onPaste={handlePaste}>
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
              className="w-12 h-14 sm:w-14 sm:h-16 rounded-2xl bg-[hsl(230,40%,25%)] text-center font-display text-xl sm:text-2xl text-[hsl(45,80%,65%)] outline-none focus:ring-2 focus:ring-[hsl(158,17%,37%)] transition-all"
            />
          ))}
        </motion.div>

        {/* Resend */}
        <div className="flex items-center gap-2 font-body text-sm mb-6">
          <span className="text-muted-foreground">Didn't receive OTP?</span>
          <button onClick={handleResend} disabled={resendTimer > 0} className={`font-semibold ${resendTimer > 0 ? "text-muted-foreground" : "text-[hsl(230,40%,25%)] underline underline-offset-2"}`}>
            {resendTimer > 0 ? `Send Again (${resendTimer}s)` : "Send Again"}
          </button>
        </div>

        {/* Verify button */}
        <motion.button
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
          onClick={handleVerify}
          disabled={submitting || otp.join("").length < 6}
          className="w-full py-4 rounded-full bg-[hsl(230,40%,25%)] font-body text-base font-semibold text-[hsl(45,80%,65%)] hover:bg-[hsl(230,40%,20%)] transition-colors disabled:opacity-50"
        >
          {submitting ? "Verifying..." : `Verify ${stepLabel}`}
        </motion.button>
      </div>
    </div>
  );
};

export default OTPVerification;
