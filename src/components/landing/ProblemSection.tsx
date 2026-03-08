import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import problemIllustration from "@/assets/problem-illustration.png";

const ProblemSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="problem" ref={ref} className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="relative flex justify-center"
          >
            <img
              src={problemIllustration}
              alt="A confused person surrounded by too many options"
              className="w-full max-w-sm"
            />
          </motion.div>

          <div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              className="font-body text-xs uppercase tracking-[0.2em] text-secondary font-semibold mb-4"
            >
              It Usually Starts Like This
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-5xl text-foreground leading-tight mb-6"
            >
              You don't lack <em className="text-gradient-warm">ambition.</em>{" "}
              You lack clarity.
            </motion.h2>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
              className="space-y-4 font-body text-sm text-muted-foreground leading-relaxed"
            >
              <p>
                You're in school or college. Or maybe already working. You have options. <strong className="text-foreground">Too many.</strong>
              </p>
              <p>
                Engineering. MBA. Design. Government exams. Startup. Freelancing. Switch careers. Move cities.
              </p>
              <p>
                You watch YouTube videos. Take random tests. Ask seniors. Scroll job portals. Download 4–5 apps. <strong className="text-foreground">Still unsure.</strong>
              </p>
              <p className="font-display text-lg text-foreground italic mt-6">
                Why is making a life decision still this unstructured?
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
