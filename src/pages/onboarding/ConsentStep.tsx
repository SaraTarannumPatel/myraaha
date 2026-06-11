import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Users, Eye, Lock, Check } from "lucide-react";
import OnboardingProgressBar from "@/components/onboarding/OnboardingProgressBar";
import OnboardingRewardBanner from "@/components/onboarding/OnboardingRewardBanner";
import { ONBOARDING_REWARDS } from "@/components/onboarding/OnboardingRewardBanner";
import OnboardingRewardCelebration from "@/components/onboarding/OnboardingRewardCelebration";
import UIDRevealCard from "@/components/onboarding/UIDRevealCard";

const ConsentStep = () => {
  const { user, profile, updateProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [consentData, setConsentData] = useState(false);
  const [consentMentor, setConsentMentor] = useState(false);
  const [showUID, setShowUID] = useState(false);
  const [generatedUid, setGeneratedUid] = useState(profile?.public_uid || "");
  const [submitting, setSubmitting] = useState(false);

  const createWelcomeNotifications = async () => {
    if (!user) return;
    const notifications = [
      {
        user_id: user.id,
        title: "Welcome to MyRaaha! 🎉",
        message: "Your journey starts now. Begin with the Curiosity Compass to discover your path.",
        notification_type: "welcome",
        action_url: "/dashboard/curiosity-compass",
      },
      {
        user_id: user.id,
        title: "Discover your interests 🧭",
        message: "Use the Curiosity Compass to explore what drives you and find your direction.",
        notification_type: "nudge",
        action_url: "/dashboard/curiosity-compass",
      },
    ];
    await supabase.from("notifications").insert(notifications);
  };

  const handleContinue = async () => {
    if (submitting) return;
    setSubmitting(true);
    localStorage.setItem("myraaha_uid_reveal_pending", "true");

    let uid = profile?.public_uid || "";
    if (user && !uid) {
      const { data, error } = await (supabase as any).rpc("ensure_profile_public_uid");
      if (!error && data) uid = data;
    }
    setGeneratedUid(uid || "MR-XXXXXX");

    await updateProfile({
      onboarding_status: "complete",
      ...({
        consent_data_usage: consentData,
        consent_mentor_sharing: consentMentor,
      } as any),
    });

    if (user) {
      const rewards = ONBOARDING_REWARDS.map((r) => ({
        user_id: user.id,
        milestone_percent: r.percent,
        reward_key: r.rewardKey,
        reward_title: r.title,
        reward_description: r.description,
      }));
      await supabase.from("onboarding_rewards").upsert(rewards, { onConflict: "user_id,reward_key" });
    }

    await createWelcomeNotifications();
    localStorage.removeItem("myraaha_initial_path");
    await refreshProfile();
    setShowUID(true);
    setSubmitting(false);
  };

  const handleEnterApp = () => {
    setShowUID(false);
    localStorage.removeItem("myraaha_uid_reveal_pending");
    navigate("/dashboard/curiosity-compass", { replace: true });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <OnboardingProgressBar progress={90} />
      <OnboardingRewardBanner currentProgress={90} showCelebration={!showUID} />
      {showUID && profile && (
        <UIDRevealCard
          fullName={profile.full_name || "Explorer"}
          uid={generatedUid || profile.public_uid || "MR-XXXXXX"}
          rewards={ONBOARDING_REWARDS.map((reward) => reward.title)}
          onContinue={handleEnterApp}
        />
      )}
      <div className="flex-1 flex flex-col items-center justify-center p-6 py-4 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-xl w-full space-y-4"
        >
          <div className="text-center space-y-2">
            <p className="progress-step-label text-primary uppercase tracking-wider">Almost There!</p>
            <h1 className="onboarding-step-heading text-primary">Your Privacy Matters</h1>
            <p className="onboarding-step-desc text-muted-foreground mt-2">
              Your journey is personal. You control what you share and who sees your progress.
            </p>
          </div>

          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10"><Eye size={20} className="text-primary" /></div>
                <div className="flex-1">
                  <h3 className="choice-card-title text-foreground font-semibold">Personalized Experience</h3>
                  <p className="choice-card-desc text-muted-foreground mt-1 text-sm">
                    Allow MyRaaha to use your interests, skills, and goals to provide personalized recommendations, AI insights, and tailored content.
                  </p>
                  <button onClick={() => setConsentData(!consentData)}
                    className={`mt-3.5 flex items-center gap-2.5 px-5 py-2.5 rounded-full font-body text-sm font-semibold transition-all border shadow-sm ${
                      consentData 
                        ? "bg-primary border-primary text-white" 
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}>
                    <div className="relative w-4 h-4 flex items-center justify-center">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        consentData ? "border-white bg-white/20 scale-110" : "border-gray-400 bg-transparent"
                      }`}>
                        {consentData && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 350, damping: 20 }}
                          >
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          </motion.div>
                        )}
                      </div>
                    </div>
                    {consentData ? "Enabled" : "Enable personalization"}
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
              className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10"><Users size={20} className="text-primary" /></div>
                <div className="flex-1">
                  <h3 className="choice-card-title text-foreground font-semibold">Mentor & Community Sharing</h3>
                  <p className="choice-card-desc text-muted-foreground mt-1 text-sm">
                    Allow your profile highlights and progress to be visible to matched mentors and community groups.
                  </p>
                  <button onClick={() => setConsentMentor(!consentMentor)}
                    className={`mt-3.5 flex items-center gap-2.5 px-5 py-2.5 rounded-full font-body text-sm font-semibold transition-all border shadow-sm ${
                      consentMentor 
                        ? "bg-primary border-primary text-white" 
                        : "bg-white border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}>
                    <div className="relative w-4 h-4 flex items-center justify-center">
                      <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${
                        consentMentor ? "border-white bg-white/20 scale-110" : "border-gray-400 bg-transparent"
                      }`}>
                        {consentMentor && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 350, damping: 20 }}
                          >
                            <Check className="w-3 h-3 text-white" strokeWidth={3} />
                          </motion.div>
                        )}
                      </div>
                    </div>
                    {consentMentor ? "Enabled" : "Enable sharing"}
                  </button>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="bg-white rounded-xl border border-border p-5">
              <div className="flex items-start gap-4">
                <div className="p-2 rounded-lg bg-primary/10"><Lock size={20} className="text-primary" /></div>
                <div>
                  <h3 className="choice-card-title text-foreground font-semibold">Your Data, Your Control</h3>
                  <p className="choice-card-desc text-muted-foreground mt-1 text-sm">
                    You can change these preferences anytime in Settings. We never sell your data.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="flex justify-between items-center">
            <Button variant="ghost" onClick={() => navigate("/onboarding/educational-status")} className="font-body h-[48px] min-h-[48px] px-4 rounded-full">
              <ArrowLeft size={18} className="mr-1.5" /> Back
            </Button>
            <Button onClick={handleContinue} disabled={submitting}
              className="bg-primary text-white rounded-full h-[52px] min-h-[52px] px-8 font-body font-semibold hover:bg-primary/90 disabled:opacity-50">
              {submitting ? "Finalizing..." : "Generate My UID"} <ArrowRight size={18} className="ml-1.5" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default ConsentStep;
