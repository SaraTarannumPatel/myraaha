import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import problemIllustration from "@/assets/problem-illustration.png";

const ProblemSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  const stats = [
    { value: "85%", label: "students feel lost about career choices" },
    { value: "3x", label: "more likely to switch careers within 5 years" },
    { value: "0", label: "real-world exposure in most schools" },
  ];

  return (
    <section ref={ref} className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Illustration */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="relative flex justify-center"
          >
            <img
              src={problemIllustration}
              alt="A confused student at a crossroads"
              className="w-full max-w-sm"
            />
          </motion.div>

          {/* Content — minimal */}
          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              className="font-body text-xs uppercase tracking-[0.2em] text-secondary font-semibold mb-4"
            >
              The Problem
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-5xl text-foreground leading-tight mb-8"
            >
              Most people don't <em className="text-gradient-warm">choose</em> their careers.
            </motion.h2>

            <div className="grid grid-cols-3 gap-6">
              {stats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="text-center"
                >
                  <div className="font-display text-3xl md:text-4xl text-foreground">{stat.value}</div>
                  <p className="font-body text-xs text-muted-foreground mt-2 leading-snug">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
