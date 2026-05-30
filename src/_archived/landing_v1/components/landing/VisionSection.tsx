import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import visionIllustration from "@/assets/vision-illustration.png";

const fragments = [
  { text: "Aptitude tests on one platform", emoji: "📝", border: "border-blue/20", bg: "bg-blue/5" },
  { text: "Courses somewhere else entirely", emoji: "📚", border: "border-indigo/20", bg: "bg-indigo/5" },
  { text: "Mentors on Instagram reels lol", emoji: "📱", border: "border-terracotta/20", bg: "bg-terracotta/5" },
  { text: "Job portals disconnected from skill-building", emoji: "💼", border: "border-maroon/20", bg: "bg-maroon/5" },
  { text: "Startup advice scattered across random blogs", emoji: "🚀", border: "border-primary/20", bg: "bg-primary/5" },
  { text: "Funding info gatekept behind networks", emoji: "🔒", border: "border-accent/30", bg: "bg-accent/10" },
];

const VisionSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-20 sm:py-28 md:py-36 bg-background-alt overflow-hidden relative">
      <div className="absolute top-8 sm:top-12 right-4 sm:right-6 md:right-12">
        <span className="font-display text-[80px] sm:text-[120px] md:text-[180px] text-grey-divider/30 leading-none select-none">02</span>
      </div>

      <div className="container mx-auto px-5 sm:px-6 relative z-10 max-w-5xl">
        <div className="text-center mb-10 sm:mb-12">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="font-body text-[10px] sm:text-xs uppercase tracking-[0.25em] text-indigo font-semibold mb-3"
          >
            Because The System Is Lowkey Broken
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight"
          >
            This ain't a talent problem.
            <br />
            <em className="text-gradient-warm">It's an infrastructure problem.</em>
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="flex justify-center mb-10 sm:mb-14"
        >
          <div className="relative">
            <div className="absolute -inset-8 bg-gradient-to-br from-indigo/10 via-blue/8 to-transparent rounded-full blur-3xl" />
            <img
              src={visionIllustration}
              alt="Fragmented tools failing users"
              className="w-full max-w-[200px] sm:max-w-xs md:max-w-sm relative"
            />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-10 sm:mb-14">
          {fragments.map((item, i) => (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.25 + i * 0.06 }}
              className={`${item.bg} rounded-2xl p-4 sm:p-5 border ${item.border} shadow-soft flex items-start gap-3`}
            >
              <span className="text-lg sm:text-xl shrink-0">{item.emoji}</span>
              <p className="font-body text-xs sm:text-sm text-muted-foreground leading-snug">{item.text}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="text-center space-y-4 sm:space-y-5"
        >
          <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto">
            You're literally expected to connect all this yourself. And when something flops, you start from scratch. it's giving 💀
          </p>
          <div className="flex items-center justify-center gap-4 sm:gap-6">
            {[
              { word: "Late", color: "text-maroon" },
              { word: "Behind", color: "text-terracotta" },
              { word: "Misaligned", color: "text-indigo" },
            ].map((item, i) => (
              <span key={item.word} className={`font-display text-base sm:text-lg ${item.color}`}>
                {item.word}{i < 2 && <span className="text-grey-disabled ml-4 sm:ml-6">·</span>}
              </span>
            ))}
          </div>
          <p className="font-display text-lg sm:text-xl md:text-2xl text-foreground italic pt-2">
            "So what would a real system actually look like tho?"
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default VisionSection;
