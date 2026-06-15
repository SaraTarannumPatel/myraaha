import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import OnboardingProgressBar from "@/components/onboarding/OnboardingProgressBar";
import OnboardingRewardBanner from "@/components/onboarding/OnboardingRewardBanner";
import loginIllustration from "@/assets/auth-login-illustration.png";
import signupIllustration from "@/assets/auth-signup-illustration.png";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const { signIn, user, profile } = useAuth();
  const navigate = useNavigate();

  // Detect email verification from URL hash
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && (hash.includes("type=signup") || hash.includes("type=email"))) {
      setEmailVerified(true);
      setIsLogin(true);
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);

  useEffect(() => {
    if (user && profile) {
      if (profile.onboarding_status === "complete") {
        // Returning users land on their dashboard (resumes their saved history),
        // NOT on the Curiosity Compass as if it were their first session.
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/onboarding", { replace: true });
      }
    }
  }, [user, profile, navigate]);

  const formatPhone = (value: string) => {
    // Only allow digits after +91
    const digits = value.replace(/\D/g, "");
    if (digits.length <= 2) return "+91 ";
    const remaining = digits.slice(2, 12);
    if (remaining.length <= 5) return `+91 ${remaining}`;
    return `+91 ${remaining.slice(0, 5)} ${remaining.slice(5)}`;
  };

  const handlePhoneChange = (value: string) => {
    if (!value.startsWith("+91")) {
      setPhone("+91 ");
      return;
    }
    setPhone(formatPhone(value));
  };

  const getCleanPhone = () => {
    return "+" + phone.replace(/\D/g, "");
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSubmitting(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) toast.error(error.message);
    } else {
      // Validate phone
      const cleanPhone = getCleanPhone();
      if (cleanPhone.length < 13) {
        toast.error("Please enter a valid 10-digit Indian mobile number");
        setSubmitting(false);
        return;
      }

      // [ARCHIVED] Email OTP + phone OTP flow paused. Using default email verification link.
      // Phone number is collected as profile metadata only (must be the one registered with
      // the user's school / college / university — i.e. their official institutional number).
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          data: { full_name: email.split("@")[0], phone: cleanPhone },
        },
      });
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Verification email sent! Check your inbox to confirm your account, then log in.");
        setIsLogin(true);
      }

    }
    setSubmitting(false);
  };

  const handleGoogleSignIn = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) toast.error("Google sign-in failed. Please try again.");
  };

  const handleAppleSignIn = async () => {
    const { error } = await lovable.auth.signInWithOAuth("apple", {
      redirect_uri: window.location.origin,
    });
    if (error) toast.error("Apple sign-in failed. Please try again.");
  };

  const handleFacebookUnavailable = () => {
    toast.info("Facebook sign-in isn't supported yet. Please use Google, Apple, or email.");
  };


  if (user) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {!isLogin && <OnboardingProgressBar progress={5} />}
      {!isLogin && <OnboardingRewardBanner currentProgress={5} />}

      <div className="flex-1 flex flex-col items-center justify-center px-4 py-2 pb-4">
        <div className="flex flex-col w-full max-w-md">

          {/* Email verification banner */}
          <AnimatePresence>
            {emailVerified && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-4 p-4 rounded-xl bg-primary/10 border border-primary/20"
              >
                <div className="flex items-start gap-3">
                  <span className="text-xl">✅</span>
                  <div>
                    <p className="font-display text-sm font-bold text-primary">Email verified successfully!</p>
                    <p className="font-body text-xs text-primary/70 mt-0.5">
                      Please login with the same email and password you used during sign up.
                    </p>
                  </div>
                  <button onClick={() => setEmailVerified(false)} className="text-primary/70 ml-auto shrink-0">✕</button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          
          <div className="relative mb-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? "login" : "signup"}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <div className="flex items-center">
                  <h1 className="onboarding-welcome-headline text-primary flex-1 z-10 !text-left">
                    {isLogin ? (
                      <>Hey, Login Now</>
                    ) : (
                      <>Continue your journey!</>
                    )}
                  </h1>
                  <div className="w-[28%] sm:w-[25%] ml-2">
                    <img
                      src={isLogin ? loginIllustration : signupIllustration}
                      alt=""
                      className="w-full h-auto object-contain"
                      width={768}
                      height={896}
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2 mb-2 font-body text-xs">
            <button
              onClick={() => setIsLogin(true)}
              className={`transition-colors py-2 px-3 min-h-[44px] flex items-center ${isLogin ? "text-foreground font-semibold" : "text-muted-foreground"}`}
            >
              I am an old user
            </button>
            <span className="text-muted-foreground">/</span>
            <button
              onClick={() => setIsLogin(false)}
              className={`transition-colors py-2 px-3 min-h-[44px] flex items-center ${!isLogin ? "text-foreground font-semibold" : "text-muted-foreground"}`}
            >
              New User
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isLogin ? "Email" : "Email"}
              required
              className="w-full h-12 md:h-12 md:min-h-[48px] min-h-[52px] rounded-md bg-muted px-4 font-body text-base placeholder:text-muted-foreground outline-none border-none focus:ring-2 focus:ring-primary transition-all"
            />

            {!isLogin && (
              <>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  required
                  className="w-full h-12 md:h-12 md:min-h-[48px] min-h-[52px] rounded-md bg-muted px-4 font-body text-base placeholder:text-muted-foreground outline-none border-none focus:ring-2 focus:ring-primary transition-all"
                  onFocus={() => !phone && setPhone("+91 ")}
                />
                <p className="font-body text-[11px] text-muted-foreground px-1 -mt-1">
                  📌 Please enter the official phone number registered with your school, college, or university.
                </p>
              </>
            )}

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={6}
              className="w-full h-12 md:h-12 md:min-h-[48px] min-h-[52px] rounded-md bg-muted px-4 font-body text-base placeholder:text-muted-foreground outline-none border-none focus:ring-2 focus:ring-primary transition-all"
            />

            {isLogin && (
              <div className="flex items-center gap-2 font-body text-xs pt-0.5">
                <span className="text-muted-foreground">Forgot password?</span>
                <button
                  type="button"
                  onClick={async () => {
                    const target = email.trim();
                    if (!target) { toast.error("Enter your registered email above first"); return; }
                    const { error } = await supabase.auth.resetPasswordForEmail(target, {
                      redirectTo: `${window.location.origin}/reset-password`,
                    });
                    if (error) toast.error(error.message);
                    else toast.success(`Reset link sent to ${target}. Check your inbox.`);
                  }}
                  className="text-foreground font-semibold underline underline-offset-2 py-2 min-h-[44px] flex items-center"
                >
                  Send reset link
                </button>
              </div>
            )}
          </form>

          <div className="mt-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1 h-px bg-border" />
              <span className="font-body text-xs text-muted-foreground">
                Or {isLogin ? "Login" : "Signup"} with
              </span>
              <div className="flex-1 h-px bg-border" />
            </div>
            <div className="flex items-center justify-center gap-8">
              <button onClick={handleGoogleSignIn} className="social-btn w-12 h-12 md:w-11 md:h-11 flex items-center justify-center rounded-full hover:bg-muted transition-colors" aria-label="Google">
                <svg viewBox="0 0 24 24" className="w-6 h-6">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </button>
              <button onClick={handleFacebookUnavailable} className="social-btn w-12 h-12 md:w-11 md:h-11 flex items-center justify-center rounded-full hover:bg-muted transition-colors" aria-label="Facebook">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              <button onClick={handleAppleSignIn} className="social-btn w-12 h-12 md:w-11 md:h-11 flex items-center justify-center rounded-full hover:bg-muted transition-colors" aria-label="Apple">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3">
            {isLogin ? (
              <div className="flex items-center gap-1 font-body text-sm h-[48px] px-4 flex items-center">
                <span className="text-muted-foreground">New here?</span>
                <button onClick={() => setIsLogin(false)} className="text-foreground font-medium py-2">
                  Sign Up
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1 font-body text-sm h-[48px] px-4 flex items-center">
                <span className="text-muted-foreground">Already User?</span>
                <button onClick={() => setIsLogin(true)} className="text-foreground font-medium py-2">
                  Login
                </button>
              </div>
            )}
            <button
              onClick={() => handleSubmit()}
              disabled={submitting}
              className="flex items-center justify-center gap-2 h-[52px] min-h-[52px] px-8 rounded-full bg-primary font-body text-base font-semibold text-white hover:bg-primary/95 transition-colors disabled:opacity-50"
            >
              {submitting ? "Please wait..." : isLogin ? "Login" : "Sign Up"}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
