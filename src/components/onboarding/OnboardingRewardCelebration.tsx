import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, PartyPopper } from "lucide-react";

interface OnboardingRewardCelebrationProps {
  emoji: string;
  title: string;
  description: string;
  onContinue: () => void;
}

const OnboardingRewardCelebration = ({ emoji, title, description, onContinue }: OnboardingRewardCelebrationProps) => {
  const [confetti, setConfetti] = useState<{ id: number; x: number; delay: number; color: string }[]>([]);

  useEffect(() => {
    const items = Array.from({ length: 30 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      color: ["hsl(48 92% 72%)", "hsl(270 96% 30%)", "hsl(270 96% 48%)", "hsl(48 92% 72%)", "hsl(270 96% 48%)"][Math.floor(Math.random() * 5)],
    }));
    setConfetti(items);
  }, []);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      >
        {/* Confetti */}
        {confetti.map((c) => (
          <motion.div
            key={c.id}
            initial={{ y: -20, x: `${c.x}vw`, opacity: 1, scale: 1 }}
            animate={{ y: "110vh", opacity: 0, rotate: 360 * (Math.random() > 0.5 ? 1 : -1) }}
            transition={{ duration: 2 + Math.random() * 2, delay: c.delay, ease: "easeIn" }}
            className="fixed top-0 w-3 h-3 rounded-sm pointer-events-none"
            style={{ backgroundColor: c.color, left: `${c.x}%` }}
          />
        ))}

        {/* Card */}
        <motion.div
          initial={{ scale: 0.5, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.2 }}
          className="bg-card rounded-3xl border border-border shadow-2xl p-8 max-w-sm mx-6 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-[hsl(48 92% 88%)] to-transparent opacity-50 pointer-events-none" />
          <div className="relative z-10 space-y-4">
            <motion.div
              animate={{ scale: [1, 1.2, 1], rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="text-6xl"
            >
              {emoji}
            </motion.div>
            <div className="flex items-center justify-center gap-2 text-accent">
              <PartyPopper size={16} />
              <span className="font-body text-xs uppercase tracking-wider font-bold">Reward Unlocked!</span>
              <PartyPopper size={16} />
            </div>
            <h2 className="reward-celebration-title text-foreground">{title}</h2>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">{description}</p>
            <Button
              onClick={onContinue}
              className="bg-primary text-accent rounded-full px-8 font-body font-semibold mt-2"
            >
              Continue <ArrowRight size={16} />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default OnboardingRewardCelebration;
