import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Brain, BookmarkPlus, ShieldAlert, Sparkles } from "lucide-react";

const traits = [
  { icon: Brain, text: "Overthink before choosing" },
  { icon: BookmarkPlus, text: "Save posts about \"finding purpose\"" },
  { icon: ShieldAlert, text: "Fear choosing wrong" },
  { icon: Sparkles, text: "Want clarity — not pressure" },
];

const StagesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-2xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="font-body text-xs uppercase tracking-[0.2em] text-secondary font-semibold mb-4"
          >
            What Happens Next
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl text-foreground mb-8"
          >
            Built for <em className="text-gradient-warm">thoughtful</em> decision-makers.
          </motion.h2>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="font-body text-sm text-muted-foreground mb-10"
          >
            For people who:
          </motion.p>

          <div className="grid grid-cols-2 gap-4">
            {traits.map((trait, i) => (
              <motion.div
                key={trait.text}
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.3 + i * 0.08 }}
                className="bg-card rounded-2xl p-5 border border-border shadow-soft flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl gradient-warm flex items-center justify-center shrink-0">
                  <trait.icon size={18} className="text-secondary-foreground" />
                </div>
                <p className="font-body text-sm text-foreground text-left">{trait.text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StagesSection;
