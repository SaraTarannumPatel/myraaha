import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import problemIllustration from "@/assets/problem-illustration.png";

const painPoints = [
  { text: "Doom-scroll YouTube videos", color: "bg-blue/5 border-blue/15 text-blue" },
  { text: "Take random tests", color: "bg-indigo/5 border-indigo/15 text-indigo" },
  { text: "Ask seniors who are also lost", color: "bg-terracotta/5 border-terracotta/15 text-terracotta" },
  { text: "Scroll job portals at 2am", color: "bg-maroon/5 border-maroon/15 text-maroon" },
  { text: "Download 4–5 apps", color: "bg-primary/5 border-primary/15 text-primary" },
  { text: "Still have zero clue", color: "bg-destructive/10 border-destructive/20 text-destructive font-semibold" },
];

const ProblemSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="problem" ref={ref} className="py-20 sm:py-28 md:py-36 bg-background relative">
      <div className="absolute top-8 sm:top-12 left-4 sm:left-6 md:left-12">
        <span className="font-display text-[80px] sm:text-[120px] md:text-[180px] text-grey-divider/40 leading-none select-none">01</span>
      </div>

      <div className="container mx-auto px-5 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.7 }}
            className="lg:col-span-2 relative flex justify-center order-2 lg:order-1"
          >
            <div className="absolute -inset-8 bg-gradient-to-br from-terracotta/10 via-accent/8 to-transparent rounded-full blur-3xl" />
            <img
              src={problemIllustration}
              alt="A confused person surrounded by too many options"
              className="w-full max-w-[240px] sm:max-w-xs md:max-w-md relative"
            />
          </motion.div>

          <div className="lg:col-span-3 order-1 lg:order-2">
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              className="font-body text-[10px] sm:text-xs uppercase tracking-[0.25em] text-terracotta font-semibold mb-3"
            >
              It Usually Starts Like This
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground leading-[1.05] mb-4 sm:mb-6"
            >
              You don't lack{" "}
              <em className="text-gradient-milestone">ambition.</em>
              <br />
              You lack clarity. fr.
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
              className="font-body text-sm sm:text-base text-muted-foreground leading-relaxed mb-6 sm:mb-8 max-w-lg"
            >
              Engineering. MBA. Design. Govt exams. Startup. Freelancing. Switch careers. Move cities. You've got options. <strong className="text-foreground">Way too many.</strong>
            </motion.p>

            <div className="flex flex-wrap gap-2 mb-6 sm:mb-8">
              {painPoints.map((point, i) => (
                <motion.span
                  key={point.text}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={isInView ? { opacity: 1, scale: 1 } : {}}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className={`font-body text-[10px] sm:text-xs px-3 sm:px-4 py-1.5 sm:py-2 rounded-full border ${point.color}`}
                >
                  {point.text}
                </motion.span>
              ))}
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5 }}
              className="bg-card rounded-2xl p-5 sm:p-6 border border-terracotta/20 shadow-soft max-w-lg"
            >
              <p className="font-display text-lg sm:text-xl md:text-2xl text-foreground italic leading-snug">
                "Why is making a life decision still this <span className="text-gradient-milestone">chaotic?</span> like bestie help 💀"
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSection;
