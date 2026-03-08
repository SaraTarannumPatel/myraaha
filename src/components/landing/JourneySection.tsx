import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Briefcase, Rocket, ArrowRight, Check } from "lucide-react";

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
    <section ref={ref} className="py-28 md:py-36 bg-background relative">
      <div className="absolute top-12 left-6 md:left-12">
        <span className="font-display text-[120px] md:text-[180px] text-muted/30 leading-none select-none">07</span>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="font-body text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3"
          >
            Execution Without Restarting
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight mb-4"
          >
            You don't keep{" "}
            <em className="text-gradient-warm">resetting</em>
            <br />your journey.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="font-body text-base text-muted-foreground max-w-lg"
          >
            Most platforms stop at "advice." MyRaaha continues. The system remembers your history.
          </motion.p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Career card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.25 }}
            className="group bg-card rounded-3xl border border-border shadow-soft hover:shadow-card transition-all duration-500 overflow-hidden"
          >
            <div className="gradient-warm p-6">
              <Briefcase size={28} className="text-primary-foreground mb-3" />
              <h3 className="font-display text-2xl text-primary-foreground">For Careers</h3>
            </div>
            <div className="p-6">
              <ul className="space-y-3 mb-5">
                {careerFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <Check size={16} className="text-primary mt-0.5 shrink-0" />
                    <span className="font-body text-sm text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="font-display text-sm text-foreground italic">
                  Clear next actions every week. No random course hopping.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Startup card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.35 }}
            className="group bg-card rounded-3xl border border-border shadow-soft hover:shadow-card transition-all duration-500 overflow-hidden"
          >
            <div className="gradient-warm p-6">
              <Rocket size={28} className="text-primary-foreground mb-3" />
              <h3 className="font-display text-2xl text-primary-foreground">For Entrepreneurship</h3>
            </div>
            <div className="p-6">
              <ul className="space-y-3 mb-5">
                {startupFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-3">
                    <Check size={16} className="text-primary mt-0.5 shrink-0" />
                    <span className="font-body text-sm text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-muted/50 rounded-xl p-4">
                <p className="font-display text-sm text-foreground italic">
                  You don't quit your job based on motivation. You move based on readiness.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default JourneySection;
