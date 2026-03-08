import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Briefcase, Rocket, ArrowRight } from "lucide-react";

const careerFeatures = [
  "Skills mapped to real-time job demand",
  "Structured progression",
  "AI-guided transitions",
  "Reduced risk when switching",
];

const startupFeatures = [
  "Idea → validation → build → launch → funding",
  "Founder mindset tracking",
  "AI co-founder support",
  "Readiness-based funding paths",
];

const JourneySection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="font-body text-xs uppercase tracking-[0.2em] text-secondary font-semibold mb-4"
          >
            Execution Without Restarting
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl text-foreground max-w-2xl mx-auto"
          >
            You don't keep <em className="text-gradient-warm">resetting</em> your journey.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="font-body text-sm text-muted-foreground mt-4 max-w-lg mx-auto"
          >
            Most platforms stop at "advice." MyRaaha continues. The system remembers your history.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.25 }}
            className="bg-card rounded-3xl p-8 border border-border shadow-card"
          >
            <div className="w-14 h-14 rounded-2xl gradient-warm flex items-center justify-center mb-5">
              <Briefcase size={24} className="text-secondary-foreground" />
            </div>
            <h3 className="font-display text-2xl text-foreground mb-4">For Careers</h3>
            <ul className="space-y-3">
              {careerFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <ArrowRight size={14} className="text-primary shrink-0" />
                  <span className="font-body text-sm text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
            <p className="font-body text-xs text-muted-foreground mt-5 italic">
              Clear next actions every week. No random course hopping.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.35 }}
            className="bg-card rounded-3xl p-8 border border-border shadow-card"
          >
            <div className="w-14 h-14 rounded-2xl gradient-warm flex items-center justify-center mb-5">
              <Rocket size={24} className="text-secondary-foreground" />
            </div>
            <h3 className="font-display text-2xl text-foreground mb-4">For Entrepreneurship</h3>
            <ul className="space-y-3">
              {startupFeatures.map((f) => (
                <li key={f} className="flex items-center gap-3">
                  <ArrowRight size={14} className="text-primary shrink-0" />
                  <span className="font-body text-sm text-muted-foreground">{f}</span>
                </li>
              ))}
            </ul>
            <p className="font-body text-xs text-muted-foreground mt-5 italic">
              You don't quit your job based on motivation. You move based on readiness.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default JourneySection;
