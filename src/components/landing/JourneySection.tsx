import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Briefcase, Rocket, Check } from "lucide-react";

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
    <section ref={ref} className="py-20 sm:py-28 md:py-36 bg-background relative">
      <div className="absolute top-8 sm:top-12 left-4 sm:left-6 md:left-12">
        <span className="font-display text-[80px] sm:text-[120px] md:text-[180px] text-grey-divider/30 leading-none select-none">07</span>
      </div>

      <div className="container mx-auto px-5 sm:px-6 relative z-10">
        <div className="max-w-3xl mb-12 sm:mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="font-body text-[10px] sm:text-xs uppercase tracking-[0.25em] text-warmth font-semibold mb-3"
          >
            Execution Without Restarting
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight mb-3 sm:mb-4"
          >
            You don't keep{" "}
            <em className="text-gradient-warm">resetting</em>
            <br />your journey.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="font-body text-sm sm:text-base text-muted-foreground max-w-lg"
          >
            Most platforms stop at "advice." MyRaaha continues. The system remembers your history.
          </motion.p>
        </div>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 max-w-4xl mx-auto">
          {/* Career card */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.25 }}
            className="group bg-card rounded-2xl sm:rounded-3xl border border-border shadow-soft hover:shadow-card transition-all duration-500 overflow-hidden"
          >
            <div className="gradient-warm p-5 sm:p-6">
              <Briefcase size={24} className="text-primary-foreground mb-2 sm:mb-3 sm:w-7 sm:h-7" />
              <h3 className="font-display text-xl sm:text-2xl text-primary-foreground">For Careers</h3>
            </div>
            <div className="p-5 sm:p-6">
              <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-5">
                {careerFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 sm:gap-3">
                    <Check size={14} className="text-primary mt-0.5 shrink-0 sm:w-4 sm:h-4" />
                    <span className="font-body text-xs sm:text-sm text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-background-alt rounded-xl p-3 sm:p-4">
                <p className="font-display text-xs sm:text-sm text-foreground italic">
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
            className="group bg-card rounded-2xl sm:rounded-3xl border border-border shadow-soft hover:shadow-card transition-all duration-500 overflow-hidden"
          >
            <div className="gradient-milestone p-5 sm:p-6">
              <Rocket size={24} className="text-primary-foreground mb-2 sm:mb-3 sm:w-7 sm:h-7" />
              <h3 className="font-display text-xl sm:text-2xl text-primary-foreground">For Entrepreneurship</h3>
            </div>
            <div className="p-5 sm:p-6">
              <ul className="space-y-2 sm:space-y-3 mb-4 sm:mb-5">
                {startupFeatures.map((f) => (
                  <li key={f} className="flex items-start gap-2 sm:gap-3">
                    <Check size={14} className="text-warmth mt-0.5 shrink-0 sm:w-4 sm:h-4" />
                    <span className="font-body text-xs sm:text-sm text-muted-foreground">{f}</span>
                  </li>
                ))}
              </ul>
              <div className="bg-background-alt rounded-xl p-3 sm:p-4">
                <p className="font-display text-xs sm:text-sm text-foreground italic">
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