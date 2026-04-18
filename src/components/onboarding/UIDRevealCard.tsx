import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Copy, ShieldCheck, Sparkles, Check } from "lucide-react";
import { toast } from "sonner";

interface UIDRevealCardProps {
  fullName: string;
  uid: string;
  onContinue: () => void;
}

const UIDRevealCard = ({ fullName, uid, onContinue }: UIDRevealCardProps) => {
  const [copied, setCopied] = useState(false);
  const [confetti, setConfetti] = useState<{ id: number; x: number; delay: number; color: string }[]>([]);

  useEffect(() => {
    const items = Array.from({ length: 24 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      delay: Math.random() * 0.5,
      color: ["hsl(45,80%,65%)", "hsl(230,40%,25%)", "hsl(158,17%,37%)", "hsl(10,60%,50%)"][Math.floor(Math.random() * 4)],
    }));
    setConfetti(items);
  }, []);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(uid);
    setCopied(true);
    toast.success("UID copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      >
        {confetti.map((c) => (
          <motion.div
            key={c.id}
            initial={{ y: -20, x: `${c.x}vw`, opacity: 1 }}
            animate={{ y: "110vh", opacity: 0, rotate: 360 }}
            transition={{ duration: 2.5 + Math.random() * 1.5, delay: c.delay, ease: "easeIn" }}
            className="fixed top-0 w-2.5 h-2.5 rounded-sm pointer-events-none"
            style={{ backgroundColor: c.color, left: `${c.x}%` }}
          />
        ))}

        <motion.div
          initial={{ scale: 0.6, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 16, stiffness: 200, delay: 0.15 }}
          className="bg-card rounded-3xl border border-border shadow-2xl max-w-md w-full overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-br from-[hsl(230,40%,25%)] to-[hsl(230,40%,18%)] px-6 py-5 text-center relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full bg-[hsl(45,80%,65%)]" />
              <div className="absolute -bottom-6 -left-6 w-20 h-20 rounded-full bg-[hsl(45,80%,65%)]" />
            </div>
            <div className="relative">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[hsl(45,80%,65%)]/20 mb-2">
                <Sparkles size={12} className="text-[hsl(45,80%,65%)]" />
                <span className="font-body text-[10px] uppercase tracking-wider font-bold text-[hsl(45,80%,65%)]">
                  Identity Created
                </span>
              </div>
              <h2 className="font-display text-2xl text-white">Welcome, {fullName.split(" ")[0]}!</h2>
              <p className="font-body text-xs text-white/70 mt-1">
                Your unique MyRaaha identity is ready
              </p>
            </div>
          </div>

          {/* UID Card */}
          <div className="p-6 space-y-5">
            <div className="bg-gradient-to-br from-[hsl(45,80%,92%)] to-[hsl(45,80%,85%)] rounded-2xl p-5 border-2 border-[hsl(45,70%,70%)] relative">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-body text-[10px] uppercase tracking-wider text-[hsl(230,40%,35%)] font-bold">
                    Your MyRaaha UID
                  </p>
                  <p className="font-body text-[10px] text-[hsl(230,30%,45%)] mt-0.5">
                    Use this everywhere — keep it safe
                  </p>
                </div>
                <ShieldCheck size={20} className="text-[hsl(158,17%,37%)]" />
              </div>
              <div className="flex items-center gap-2">
                <code className="flex-1 font-mono text-2xl font-bold text-[hsl(230,40%,25%)] tracking-wider">
                  {uid}
                </code>
                <button
                  onClick={handleCopy}
                  className="p-2 rounded-lg bg-[hsl(230,40%,25%)] text-[hsl(45,80%,65%)] hover:bg-[hsl(230,40%,20%)] transition-colors"
                  aria-label="Copy UID"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                </button>
              </div>
              <div className="mt-3 pt-3 border-t border-[hsl(45,60%,70%)]">
                <p className="font-body text-[11px] text-[hsl(230,30%,35%)]">
                  <strong>Display Name:</strong> {fullName}
                </p>
              </div>
            </div>

            <div className="bg-muted/40 rounded-xl p-3 space-y-1.5">
              <p className="font-body text-[11px] text-foreground font-semibold">
                🔒 Why this UID matters
              </p>
              <p className="font-body text-[11px] text-muted-foreground leading-relaxed">
                Inside MyRaaha, only your <strong>name</strong> and <strong>UID</strong> are visible. Your email,
                phone, date of birth, and location stay private — securely encrypted in our backend.
              </p>
            </div>

            <Button
              onClick={onContinue}
              className="w-full bg-[hsl(230,40%,25%)] text-[hsl(45,80%,65%)] rounded-full py-6 font-body font-semibold hover:bg-[hsl(230,40%,20%)]"
            >
              Enter Curiosity Compass <ArrowRight size={16} />
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default UIDRevealCard;
