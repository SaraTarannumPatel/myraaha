import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const ProblemSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const problems = [
    "Career choices made by chance, not choice",
    "Generic aptitude tests that decide your future like roulette",
    "Zero real-world exposure in Tier 3, 4 & rural India",
    "Career transitions feel risky, lonely, and unsupported",
    "Entrepreneurship seen as elite, not accessible",
    "No one asks students about their dreams",
  ];

  return (
    <section ref={ref} className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="font-body text-xs uppercase tracking-[0.2em] text-secondary font-semibold mb-4"
          >
            The Problem
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight mb-12"
          >
            Most people don't <em className="text-gradient-warm">choose</em> their
            careers — they stumble into them.
          </motion.h2>

          <div className="space-y-4">
            {problems.map((problem, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.2 + i * 0.08 }}
                className="flex items-start gap-4 py-3 border-b border-border last:border-0"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 shrink-0" />
                <p className="font-body text-base md:text-lg text-muted-foreground">
                  {problem}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
