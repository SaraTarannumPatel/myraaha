import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Brain, BookmarkPlus, ShieldAlert, Sparkles } from "lucide-react";

const traits = [
  { icon: Brain, text: "Overthink before choosing", emoji: "🧠" },
  { icon: BookmarkPlus, text: "Save posts about \"finding purpose\"", emoji: "📌" },
  { icon: ShieldAlert, text: "Fear choosing wrong", emoji: "😰" },
  { icon: Sparkles, text: "Want clarity — not pressure", emoji: "✨" },
];

const StagesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-28 md:py-36 bg-background relative">
      <div className="absolute top-12 left-6 md:left-12">
        <span className="font-display text-[120px] md:text-[180px] text-muted/30 leading-none select-none">09</span>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              className="font-body text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3"
            >
              What Happens Next
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight"
            >
              Built for{" "}
              <em className="text-gradient-warm">thoughtful</em>
              <br />decision-makers.
            </motion.h2>
          </div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="font-body text-base text-muted-foreground text-center mb-10"
          >
            For people who:
          </motion.p>

          <div className="grid sm:grid-cols-2 gap-4">
            {traits.map((trait, i) => (
              <motion.div
                key={trait.text}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={isInView ? { opacity: 1, y: 0, scale: 1 } : {}}
                transition={{ delay: 0.3 + i * 0.08, type: "spring", stiffness: 200 }}
                className="bg-card rounded-3xl p-6 border border-border shadow-soft hover:shadow-card transition-all duration-400 group"
              >
                <div className="flex items-start gap-4">
                  <span className="text-2xl">{trait.emoji}</span>
                  <div>
                    <p className="font-display text-lg text-foreground leading-snug group-hover:text-gradient-warm transition-colors">
                      {trait.text}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default StagesSection;
