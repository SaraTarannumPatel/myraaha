import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";
import OnboardingProgressBar from "@/components/onboarding/OnboardingProgressBar";
import OnboardingRewardBanner from "@/components/onboarding/OnboardingRewardBanner";
import guestIllustration from "@/assets/auth-guest-illustration.png";

const GuestEntry = () => {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleEnter = () => {
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    localStorage.setItem("myraaha_guest_name", name.trim());
    localStorage.setItem("myraaha_is_guest", "true");
    navigate("/onboarding");
  };

  return (
    <div className="min-h-screen bg-[hsl(60,14%,98%)] flex flex-col">
      <OnboardingProgressBar progress={5} />
      <OnboardingRewardBanner currentProgress={5} />

      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-4 max-w-md mx-auto w-full">
        <div className="relative mb-4 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-start"
          >
            <h1 className="font-display text-[3.5rem] sm:text-[4.5rem] lg:text-[5.5rem] leading-[0.90] font-bold text-[hsl(230,40%,25%)] flex-1 z-10">
              Find your<br />path, at<br />your<br />pace!
            </h1>
            <div className="w-[50%] sm:w-[45%] lg:w-[40%] -mt-2 -mr-2">
              <img
                src={guestIllustration}
                alt=""
                className="w-full h-auto object-contain"
                width={768}
                height={896}
              />
            </div>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="mb-8"
        >
          <span className="inline-block px-5 py-2 rounded-full bg-[hsl(45,80%,75%)] font-body text-sm italic text-[hsl(230,40%,25%)]">
            No sign-up needed to try this
          </span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your Name"
            className="w-full h-14 rounded-2xl bg-[hsl(0,0%,85%,0.5)] px-5 font-body text-sm text-foreground placeholder:text-muted-foreground outline-none border-none focus:ring-2 focus:ring-[hsl(158,17%,37%)] transition-all"
            onKeyDown={(e) => e.key === "Enter" && handleEnter()}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="flex items-center justify-between mt-6 w-full"
        >
          <button
            onClick={() => navigate("/auth")}
            className="font-body text-sm text-foreground font-medium"
          >
            Login/Sign Up
          </button>
          <button
            onClick={handleEnter}
            className="flex items-center gap-2 px-8 py-3 rounded-full bg-[hsl(230,40%,25%)] font-body text-sm font-semibold text-[hsl(45,80%,65%)] hover:bg-[hsl(230,40%,20%)] transition-colors"
          >
            Enter
            <ArrowRight size={16} />
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default GuestEntry;
