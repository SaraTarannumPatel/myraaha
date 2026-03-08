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
    <section ref={ref} className="py-28 md:py-36 bg-background-alt overflow-hidden relative">
      <div className="absolute top-12 right-6 md:right-12">
        <span className="font-display text-[120px] md:text-[180px] text-muted/30 leading-none select-none">02</span>
      </div>

      <div className="container mx-auto px-6 relative z-10 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-12">
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

        {/* Illustration centered */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex justify-center mb-14"
        >
          <img
            src={visionIllustration}
            alt="Fragmented tools failing users"
            className="w-full max-w-sm"
          />
        </motion.div>

        {/* Fragment cards — 3-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-14">
          {fragments.map((item, i) => (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.25 + i * 0.06 }}
              className="bg-card rounded-2xl p-5 border border-border shadow-soft flex items-start gap-3"
            >
              <span className="text-xl shrink-0">{item.emoji}</span>
              <p className="font-body text-sm text-muted-foreground leading-snug">{item.text}</p>
            </motion.div>
          ))}
        </div>

        {/* Bottom statement */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="text-center space-y-5"
        >
          <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto">
            You are expected to connect all this yourself. And when something doesn't work, you start over.
          </p>
          <div className="flex items-center justify-center gap-6">
            {["Late", "Behind", "Misaligned"].map((word, i) => (
              <span key={word} className="font-display text-lg text-foreground">
                {word}{i < 2 && <span className="text-muted-foreground ml-6">·</span>}
              </span>
            ))}
          </div>
          <p className="font-display text-xl md:text-2xl text-foreground italic pt-2">
            "So what would a real system look like?"
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default VisionSection;
