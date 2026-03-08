import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowRight, Eye, EyeOff, Mail, Chrome } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate("/onboarding", { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    if (isLogin) {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message);
      } else {
        navigate("/onboarding");
      }
    } else {
      if (!fullName.trim()) {
        toast.error("Please enter your name");
        setSubmitting(false);
        return;
      }
      const { error } = await signUp(email, password, fullName);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Check your email to confirm your account!");
      }
    }
    setSubmitting(false);
  };

  const handleGoogleSignIn = async () => {
    const { error } = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin,
    });
    if (error) {
      toast.error("Google sign-in failed. Please try again.");
    }
  };

  if (user) return null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left - Branding */}
      <div className="hidden lg:flex lg:w-1/2 gradient-dark items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 gradient-glow opacity-30" />
        {/* Decorative color accents */}
        <div className="absolute top-20 left-20 w-32 h-32 rounded-full bg-blue/10 blur-3xl" />
        <div className="absolute bottom-32 right-16 w-40 h-40 rounded-full bg-terracotta/10 blur-3xl" />
        <div className="absolute top-1/2 right-1/3 w-24 h-24 rounded-full bg-accent/10 blur-2xl" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative z-10 text-center"
        >
          <h1 className="font-display text-6xl text-primary-foreground mb-4">MyRaaha</h1>
          <p className="font-body text-primary-foreground/70 text-lg max-w-md">
            Your personal launchpad for careers & entrepreneurship. Discover, build, connect, evolve.
          </p>
          {/* Color-coded feature pills */}
          <div className="flex flex-wrap gap-2 justify-center mt-8">
            <span className="px-3 py-1 rounded-full bg-blue/20 text-blue-light font-body text-xs">Career Clarity</span>
            <span className="px-3 py-1 rounded-full bg-terracotta/20 text-terracotta-light font-body text-xs">Startup Sparks</span>
            <span className="px-3 py-1 rounded-full bg-accent/20 text-accent font-body text-xs">AI Guidance</span>
            <span className="px-3 py-1 rounded-full bg-maroon/20 text-maroon-light font-body text-xs">Community</span>
          </div>
        </motion.div>
      </div>

      {/* Right - Auth Form */}
      <div className="flex-1 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md space-y-8"
        >
          <div className="text-center lg:text-left">
            <h2 className="font-display text-4xl text-foreground">
              {isLogin ? "Welcome back" : "Create your account"}
            </h2>
            <p className="font-body text-muted-foreground mt-2">
              {isLogin ? "Sign in to continue your journey" : "Start your ShuttlEx journey today"}
            </p>
          </div>

          {/* Social Login */}
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full h-12 font-body text-sm"
              onClick={handleGoogleSignIn}
            >
              <Chrome size={18} className="mr-2" />
              Continue with Google
            </Button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground font-body">or continue with email</span>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName" className="font-body">Full Name</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Your full name"
                  required={!isLogin}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email" className="font-body">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="font-body">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={submitting}
              className="w-full gradient-warm text-primary-foreground rounded-full h-12 font-body font-semibold text-base"
            >
              {submitting ? "Please wait..." : isLogin ? "Sign In" : "Create Account"}
              <ArrowRight size={18} />
            </Button>
          </form>

          {isLogin && (
            <p className="text-center">
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
                className="font-body text-sm text-blue hover:underline"
              >
                Forgot your password?
              </button>
            </p>
          )}

          <p className="text-center font-body text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-primary font-semibold hover:underline"
            >
              {isLogin ? "Sign up" : "Sign in"}
            </button>
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;
