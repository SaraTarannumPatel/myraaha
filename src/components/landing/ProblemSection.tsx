import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import problemIllustration from "@/assets/problem-illustration.png";

const painPoints = [
  "Watch YouTube videos",
  "Take random tests",
  "Ask seniors",
  "Scroll job portals",
  "Download 4–5 apps",
  "Still unsure",
];

const ProblemSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="problem" ref={ref} className="py-28 md:py-36 bg-background relative">
      {/* Section number */}
      <div className="absolute top-12 left-6 md:left-12">
        <span className="font-display text-[120px] md:text-[180px] text-muted/40 leading-none select-none">01</span>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-5 gap-12 lg:gap-8 items-center">
          {/* Illustration — 2 cols */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.7 }}
            className="lg:col-span-2 relative flex justify-center"
          >
            <div className="absolute -inset-8 bg-gradient-to-br from-accent/10 to-transparent rounded-full blur-3xl" />
            <img
              src={problemIllustration}
              alt="A confused person surrounded by too many options"
              className="w-full max-w-xs relative"
            />
          </motion.div>

          {/* Content — 3 cols */}
          <div className="lg:col-span-3">
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              className="font-body text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3"
            >
              It Usually Starts Like This
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.05] mb-6"
            >
              You don't lack{" "}
              <em className="text-gradient-warm">ambition.</em>
              <br />
              You lack clarity.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
              className="font-body text-base text-muted-foreground leading-relaxed mb-8 max-w-lg"
            >
              Engineering. MBA. Design. Government exams. Startup. Freelancing. Switch careers. Move cities. You have options. <strong className="text-foreground">Too many.</strong>
            </motion.p>

            {/* Pain point pills */}
            <div className="flex flex-wrap gap-2 mb-8">
              {painPoints.map((point, i) => (
                <motion.span
                  key={point}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className={`font-body text-xs px-4 py-2 rounded-full border ${
                    i === painPoints.length - 1
                      ? "bg-destructive/10 border-destructive/20 text-destructive font-semibold"
                      : "bg-muted/50 border-border text-muted-foreground"
                  }`}
                >
                  {point}
                </motion.span>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5 }}
              className="bg-card rounded-2xl p-6 border border-border shadow-soft max-w-lg"
            >
              <p className="font-display text-xl md:text-2xl text-foreground italic leading-snug">
                "Why is making a life decision still this <span className="text-gradient-warm">unstructured?</span>"
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
