import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Shield, Users, Eye, Lock } from "lucide-react";
import OnboardingProgressBar from "@/components/onboarding/OnboardingProgressBar";
import OnboardingRewardBanner from "@/components/onboarding/OnboardingRewardBanner";
import { ONBOARDING_REWARDS } from "@/components/onboarding/OnboardingRewardBanner";
import OnboardingRewardCelebration from "@/components/onboarding/OnboardingRewardCelebration";

const ConsentStep = () => {
  const { user, profile, updateProfile } = useAuth();
  const navigate = useNavigate();
  const [consentData, setConsentData] = useState(false);
  const [consentMentor, setConsentMentor] = useState(false);
  const [showReward, setShowReward] = useState<typeof ONBOARDING_REWARDS[0] | null>(null);

  // Show 90% reward on mount
  useEffect(() => {
    const reward = ONBOARDING_REWARDS.find((r) => r.percent === 90);
    if (reward) {
      const timer = setTimeout(() => setShowReward(reward), 500);
      return () => clearTimeout(timer);
    }
  }, []);

  const createWelcomeNotifications = async () => {
    if (!user) return;
    const intent = profile?.active_intent || "career";
    const notifications = [
      {
        user_id: user.id,
        title: "Welcome to MyRaaha! 🎉",
        message: "Your journey starts now. Explore your dashboard and discover tools tailored for you.",
        notification_type: "welcome",
        action_url: "/dashboard",
      },
    ];

    if (intent === "entrepreneurship" || intent === "both") {
      notifications.push(
        {
          user_id: user.id,
          title: "Spark your first idea 💡",
          message: "Head to Startup Sparks to capture and validate your startup ideas with AI.",
          notification_type: "nudge",
          action_url: "/dashboard/startup-sparks",
        },
        {
          user_id: user.id,
          title: "Build your founder mindset ⚡",
          message: "Start a mindset challenge to develop resilience and entrepreneurial thinking.",
          notification_type: "nudge",
          action_url: "/dashboard/mindset-builder",
        },
        {
          user_id: user.id,
          title: "Meet your AI Coach 🤖",
          message: "Get personalized guidance on your startup journey from our AI entrepreneurship coach.",
          notification_type: "nudge",
          action_url: "/dashboard/ai-coach",
        }
      );
    }

    if (intent === "career" || intent === "both") {
      notifications.push(
        {
          user_id: user.id,
          title: "Discover your interests 🧭",
          message: "Use the Curiosity Compass to explore what drives you and find your direction.",
          notification_type: "nudge",
          action_url: "/dashboard/curiosity-compass",
        },
        {
          user_id: user.id,
          title: "Build your SelfGraph™ 🧠",
          message: "Map your skills, interests, and growth areas with our identity mirror.",
          notification_type: "nudge",
          action_url: "/dashboard/selfgraph",
        }
      );
    }

    await supabase.from("notifications").insert(notifications);
  };

  const handleContinue = async () => {
    await updateProfile({
      onboarding_status: "complete",
      ...({
        consent_data_usage: consentData,
        consent_mentor_sharing: consentMentor,
      } as any),
    });

    // Insert onboarding rewards for the user
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
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen bg-[hsl(60,14%,98%)] flex flex-col">
      <OnboardingProgressBar progress={90} />
      <OnboardingRewardBanner currentProgress={90} />
      {showReward && (
        <OnboardingRewardCelebration
          emoji={showReward.emoji}
          title={showReward.title}
          description={showReward.description}
          onContinue={() => setShowReward(null)}
        />
      )}
      <div className="flex-1 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full space-y-8"
      >
        <div className="text-center space-y-2">
          <p className="font-body text-sm text-primary font-semibold uppercase tracking-wider">Step 4 of 4</p>
          <h1 className="font-display text-4xl text-[hsl(230,40%,25%)]">Your Privacy Matters</h1>
          <p className="font-body text-muted-foreground">
            Your journey is personal. You control what you share and who sees your progress.
          </p>
        </div>

        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
            className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10"><Eye size={20} className="text-primary" /></div>
              <div className="flex-1">
                <h3 className="font-display text-lg text-foreground">Personalized Experience</h3>
                <p className="font-body text-sm text-muted-foreground mt-1">
                  Allow MyRaaha to use your interests, skills, and goals to provide personalized recommendations, AI insights, and tailored content.
                </p>
                <button onClick={() => setConsentData(!consentData)}
                  className={`mt-3 flex items-center gap-2 px-4 py-2 rounded-full font-body text-sm transition-all ${
                    consentData ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}>
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${consentData ? "border-primary-foreground bg-primary-foreground/20" : "border-muted-foreground"}`}>
                    {consentData && <div className="w-2 h-2 rounded-sm bg-primary-foreground" />}
                  </div>
                  {consentData ? "Enabled" : "Enable personalization"}
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10"><Users size={20} className="text-primary" /></div>
              <div className="flex-1">
                <h3 className="font-display text-lg text-foreground">Mentor & Community Sharing</h3>
                <p className="font-body text-sm text-muted-foreground mt-1">
                  Allow your profile highlights and progress to be visible to matched mentors and community groups for collaboration and guidance.
                </p>
                <button onClick={() => setConsentMentor(!consentMentor)}
                  className={`mt-3 flex items-center gap-2 px-4 py-2 rounded-full font-body text-sm transition-all ${
                    consentMentor ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}>
                  <div className={`w-4 h-4 rounded border-2 flex items-center justify-center ${consentMentor ? "border-primary-foreground bg-primary-foreground/20" : "border-muted-foreground"}`}>
                    {consentMentor && <div className="w-2 h-2 rounded-sm bg-primary-foreground" />}
                  </div>
                  {consentMentor ? "Enabled" : "Enable sharing"}
                </button>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="bg-card rounded-xl border border-border p-5">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-lg bg-primary/10"><Lock size={20} className="text-primary" /></div>
              <div>
                <h3 className="font-display text-lg text-foreground">Your Data, Your Control</h3>
                <p className="font-body text-sm text-muted-foreground mt-1">
                  You can change these preferences anytime in Settings. We never sell your data. Your progress and reflections remain private unless you choose to share.
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="flex justify-between">
          <Button variant="ghost" onClick={() => navigate("/onboarding/guided")} className="font-body">
            <ArrowLeft size={18} /> Back
          </Button>
          <Button onClick={handleContinue}
            className="bg-primary text-primary-foreground rounded-full px-8 font-body font-semibold">
            Enter Dashboard <ArrowRight size={18} />
          </Button>
        </div>
      </motion.div>
      </div>
    </div>
  );
};

export default ConsentStep;
