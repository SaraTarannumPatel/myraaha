import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const lines = [
  { text: "Every path is different.", delay: 0.15 },
  { text: "Growth is non-linear.", delay: 0.2 },
  { text: "Reflection should come before direction.", delay: 0.25 },
  { text: "Pace matters.", delay: 0.3 },
];

const RolloutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-28 md:py-36 gradient-dark relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] gradient-glow opacity-30 pointer-events-none" />
      {/* Decorative ring */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full border border-primary-foreground/5" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] rounded-full border border-primary-foreground/5" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="max-w-2xl mx-auto text-center"
        >
          <p className="font-body text-xs uppercase tracking-[0.25em] text-secondary font-semibold mb-3">
            The Better Way
          </p>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-primary-foreground leading-tight mb-10">
            It's about becoming{" "}
            <em className="text-gradient-warm">right</em>
            <br />— not reaching fast.
          </h2>

          <div className="space-y-2 mb-10">
            {lines.map((line) => (
              <motion.p
                key={line.text}
                initial={{ opacity: 0, y: 10 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: line.delay }}
                className="font-body text-base text-primary-foreground/60"
              >
                {line.text}
              </motion.p>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.45 }}
            className="bg-primary-foreground/5 backdrop-blur-sm rounded-3xl p-8 border border-primary-foreground/10 mb-8"
          >
            <p className="font-body text-base text-primary-foreground/80 leading-relaxed mb-4">
              You don't need someone shouting instructions.
            </p>
            <p className="font-display text-xl md:text-2xl text-primary-foreground leading-snug">
              You need a system sitting beside you.
              <br />
              <span className="text-gradient-warm">Tracking. Guiding. Adjusting. Staying with you.</span>
            </p>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.6 }}
            className="font-display text-lg text-primary-foreground/50 italic"
          >
            "To make decisions you don't regret later."
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
};

export default RolloutSection;
