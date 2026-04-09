import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { toast } from "sonner";
import { ArrowRight } from "lucide-react";
import loginIllustration from "@/assets/auth-login-illustration.png";
import signupIllustration from "@/assets/auth-signup-illustration.png";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp, user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && profile) {
      if (profile.onboarding_status === "complete") {
        navigate("/dashboard", { replace: true });
      } else {
        navigate("/onboarding", { replace: true });
      }
    }
  }, [user, profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) toast.error(error.message);
    } else {
      if (!fullName.trim()) {
        toast.error("Please enter your name");
        setSubmitting(false);
        return;
      }
      const { error } = await signUp(email, password, fullName);
      if (error) toast.error(error.message);
      else toast.success("Check your email to confirm your account!");
    }
    setSubmitting(false);
  };

  const handleGoogleSignIn = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) toast.error("Google sign-in failed. Please try again.");
  };

  const handleSocialUnavailable = (provider: string) => {
    toast.info(`${provider} sign-in coming soon!`);
  };

  if (user) return null;

  return (
    <div className="min-h-screen bg-[hsl(60,14%,98%)] flex flex-col">
      {/* Top bar: Logo + progress */}
      <div className="px-6 pt-6 pb-2">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 flex items-center justify-center">
            <span className="font-display text-xl font-bold text-[hsl(230,40%,25%)]">M</span>
          </div>
          <span className="text-xs text-muted-foreground font-body">5%</span>
          <div className="flex-1 h-1.5 rounded-full bg-[hsl(0,0%,88%)]">
            <div className="h-full w-[5%] rounded-full bg-[hsl(158,17%,37%)]" />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:flex-row lg:items-center lg:justify-center">
        {/* Mobile/Tablet: stacked | Desktop: side by side */}
        <div className="flex-1 flex flex-col px-6 pb-8 lg:px-16 lg:justify-center max-w-lg mx-auto w-full">
          
          {/* Heading + Illustration */}
          <div className="relative mt-4 mb-4 lg:mb-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? "login" : "signup"}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
                className="relative"
              >
                <div className="flex items-start">
                  <h1 className="font-display text-[2.8rem] sm:text-[3.5rem] lg:text-[4.5rem] leading-[0.92] font-bold text-[hsl(230,40%,25%)] flex-1 z-10">
                    {isLogin ? (
                      <>Hey,<br />Login<br />Now</>
                    ) : (
                      <>Continue<br />your<br />journey!</>
                    )}
                  </h1>
                  <div className="w-[45%] sm:w-[40%] lg:w-[35%] -mt-4 -mr-2">
                    <img
                      src={isLogin ? loginIllustration : signupIllustration}
                      alt=""
                      className="w-full h-auto object-contain"
                      width={512}
                      height={640}
                    />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Toggle: Old user / New user */}
          <div className="flex items-center gap-2 mb-5 font-body text-sm">
            <button
              onClick={() => setIsLogin(true)}
              className={`transition-colors ${isLogin ? "text-foreground font-semibold" : "text-muted-foreground"}`}
            >
              I am an old user
            </button>
            <span className="text-muted-foreground">/</span>
            <button
              onClick={() => setIsLogin(false)}
              className={`transition-colors ${!isLogin ? "text-foreground font-semibold" : "text-muted-foreground"}`}
            >
              New User
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {!isLogin && (
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your Full Name"
                required
                className="w-full h-14 rounded-2xl bg-[hsl(0,0%,85%,0.5)] px-5 font-body text-sm text-foreground placeholder:text-muted-foreground outline-none border-none focus:ring-2 focus:ring-[hsl(158,17%,37%)] transition-all"
              />
            )}
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={isLogin ? "Name/Mobile Number/Email" : "Email/Mobile Number"}
              required
              className="w-full h-14 rounded-2xl bg-[hsl(0,0%,85%,0.5)] px-5 font-body text-sm text-foreground placeholder:text-muted-foreground outline-none border-none focus:ring-2 focus:ring-[hsl(158,17%,37%)] transition-all"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              minLength={6}
              className="w-full h-14 rounded-2xl bg-[hsl(0,0%,85%,0.5)] px-5 font-body text-sm text-foreground placeholder:text-muted-foreground outline-none border-none focus:ring-2 focus:ring-[hsl(158,17%,37%)] transition-all"
            />

            {/* Forgot password (login only) */}
            {isLogin && (
              <div className="flex items-center gap-2 font-body text-sm pt-1">
                <span className="text-muted-foreground">Forgot Password</span>
                <span className="text-muted-foreground">/</span>
                <button
                  type="button"
                  onClick={async () => {
                    if (!email) { toast.error("Enter your email first"); return; }
                    const { error } = await supabase.auth.resetPasswordForEmail(email, {
                      redirectTo: `${window.location.origin}/reset-password`,
                    });
                    if (error) toast.error(error.message);
                    else toast.success("Check your email for a password reset link!");
                  }}
                  className="text-foreground font-semibold underline underline-offset-2"
                >
                  Reset
                </button>
              </div>
            )}
          </form>

          {/* Divider + Social */}
          <div className="mt-5">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-[hsl(0,0%,82%)]" />
              <span className="font-body text-xs text-muted-foreground">
                Or {isLogin ? "Login" : "Signup"} with
              </span>
              <div className="flex-1 h-px bg-[hsl(0,0%,82%)]" />
            </div>
            <div className="flex items-center justify-center gap-8">
              <button onClick={handleGoogleSignIn} className="w-8 h-8 flex items-center justify-center" aria-label="Google">
                <svg viewBox="0 0 24 24" className="w-6 h-6">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              </button>
              <button onClick={() => handleSocialUnavailable("Facebook")} className="w-8 h-8 flex items-center justify-center" aria-label="Facebook">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="#1877F2">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </button>
              <button onClick={() => handleSocialUnavailable("Apple")} className="w-8 h-8 flex items-center justify-center" aria-label="Apple">
                <svg viewBox="0 0 24 24" className="w-6 h-6" fill="currentColor">
                  <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Bottom: Enter as Guest / Login button */}
          <div className="flex items-center justify-between mt-8">
            {isLogin ? (
              <button
                onClick={() => navigate("/guest")}
                className="font-body text-sm text-foreground font-medium"
              >
                Enter as Guest
              </button>
            ) : (
              <div className="flex items-center gap-1 font-body text-sm">
                <span className="text-muted-foreground">Already User?</span>
                <button onClick={() => setIsLogin(true)} className="text-foreground font-medium">
                  Login
                </button>
              </div>
            )}
            <button
              onClick={handleSubmit as any}
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-3 rounded-full bg-[hsl(230,40%,25%)] font-body text-sm font-semibold text-[hsl(45,80%,65%)] hover:bg-[hsl(230,40%,20%)] transition-colors disabled:opacity-50"
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
