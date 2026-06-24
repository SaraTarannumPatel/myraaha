import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ArrowRight, Eye, EyeOff, Lock } from "lucide-react";
import Logo from "@/components/Logo";

const ResetPassword = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isRecovery, setIsRecovery] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check for recovery token in URL hash
    const hash = window.location.hash;
    if (hash.includes("type=recovery")) {
      setIsRecovery(true);
    } else {
      // No recovery token, redirect
      toast.error("Invalid or expired reset link.");
      navigate("/auth");
    }
  }, [navigate]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      toast.error(error.message);
    } else {
      // Security: force re-login on password change — invalidate ALL other sessions
      // (current session is replaced by the recovery flow). Additive, does not change UX
      // beyond requiring the user to sign in once with the new password.
      try { await supabase.auth.signOut({ scope: "global" }); } catch { /* best effort */ }
      toast.success("Password updated! Please sign in with your new password.");
      setTimeout(() => navigate("/auth"), 1500);
    }
    setSubmitting(false);
  };

  if (!isRecovery) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="px-4 sm:px-6 pt-4 sm:pt-6">
        <Logo to="/" size="sm" />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 py-8 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full space-y-6 sm:space-y-8"
        >
          <div className="text-center space-y-2">
            <div className="w-14 h-14 sm:w-16 sm:h-16 gradient-warm rounded-2xl mx-auto flex items-center justify-center shadow-accent">
              <Lock className="text-primary-foreground" size={26} />
            </div>
            <h1 className="onboarding-step-heading text-primary mt-4">Set New Password</h1>
            <p className="onboarding-step-desc text-muted-foreground">Choose a strong password for your account.</p>
          </div>

        <form onSubmit={handleReset} className="space-y-5">
          <div className="space-y-2">
            <Label className="input-label">New Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
                className="h-12 md:h-12 md:min-h-[48px] min-h-[52px] rounded-md bg-muted px-4 font-body text-base placeholder:text-muted-foreground outline-none border-none focus:ring-2 focus:ring-primary transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-2 min-h-[44px] flex items-center"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="input-label">Confirm Password</Label>
            <Input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="h-12 md:h-12 md:min-h-[48px] min-h-[52px] rounded-md bg-muted px-4 font-body text-base placeholder:text-muted-foreground outline-none border-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-white rounded-full h-[52px] min-h-[52px] font-body font-semibold text-base hover:bg-primary/95"
          >
            {submitting ? "Updating..." : "Update Password"} <ArrowRight size={18} className="ml-1.5" />
          </Button>
        </form>
      </motion.div>
      </div>
    </div>
  );
};

export default ResetPassword;
