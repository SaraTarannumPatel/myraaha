import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import visionIllustration from "@/assets/vision-illustration.png";

const fragments = [
  { text: "Aptitude tests on one platform", emoji: "📝" },
  { text: "Courses somewhere else", emoji: "📚" },
  { text: "Mentors on Instagram", emoji: "📱" },
  { text: "Job portals disconnected from skill-building", emoji: "💼" },
  { text: "Startup advice scattered across blogs", emoji: "🚀" },
  { text: "Funding information hidden behind networks", emoji: "🔒" },
];

const VisionSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-28 md:py-36 bg-muted/20 overflow-hidden relative">
      <div className="absolute top-12 right-6 md:right-12">
        <span className="font-display text-[120px] md:text-[180px] text-muted/30 leading-none select-none">02</span>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          {/* Header — full width, centered */}
          <div className="text-center mb-16">
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              className="font-body text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3"
            >
              Because The System Is Fragmented
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight"
            >
              This is not a talent problem.
              <br />
              <em className="text-gradient-warm">It's an infrastructure problem.</em>
            </motion.h2>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Fragment cards — staggered grid */}
            <div className="grid grid-cols-2 gap-3">
              {fragments.map((item, i) => (
                <motion.div
                  key={item.text}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.2 + i * 0.06 }}
                  className={`bg-card rounded-2xl p-4 border border-border shadow-soft ${
                    i % 3 === 0 ? "col-span-2" : ""
                  }`}
                >
                  <span className="text-lg mb-1 block">{item.emoji}</span>
                  <p className="font-body text-sm text-muted-foreground leading-snug">{item.text}</p>
                </motion.div>
              ))}
            </div>

            {/* Illustration + impact text */}
            <div className="flex flex-col items-center gap-8">
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.7 }}
              >
                <img
                  src={visionIllustration}
                  alt="Fragmented tools failing users"
                  className="w-full max-w-xs mx-auto"
                />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.5 }}
                className="text-center"
              >
                <p className="font-body text-sm text-muted-foreground leading-relaxed mb-4">
                  You are expected to connect all this yourself. And when something doesn't work, you start over.
                </p>
                <div className="flex items-center justify-center gap-4">
                  {["Late", "Behind", "Misaligned"].map((word, i) => (
                    <motion.span
                      key={word}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: 0.6 + i * 0.1 }}
                      className="font-display text-lg text-foreground"
                    >
                      {word}{i < 2 && <span className="text-muted-foreground ml-4">·</span>}
                    </motion.span>
                  ))}
                </div>
                <p className="font-display text-xl text-foreground italic mt-6">
                  So what would a real system look like?
                </p>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default VisionSection;
