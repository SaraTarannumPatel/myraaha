import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const RolloutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 md:py-32 gradient-dark relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] gradient-glow opacity-40 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="max-w-2xl mx-auto text-center"
        >
          <p className="font-body text-xs uppercase tracking-[0.2em] text-secondary font-semibold mb-4">
            The Better Way
          </p>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl text-primary-foreground leading-tight mb-8">
            It's about becoming <em className="text-gradient-warm">right</em> — not reaching fast.
          </h2>

          <div className="space-y-4 font-body text-sm text-primary-foreground/70 leading-relaxed text-left max-w-lg mx-auto">
            <p>Every path is different. Growth is non-linear.</p>
            <p>Reflection should come before direction. Pace matters.</p>
            <p>You don't need someone shouting instructions.</p>
            <p className="text-primary-foreground font-medium">
              You need a system sitting beside you. Tracking. Guiding. Adjusting. Staying with you.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.4 }}
            className="mt-10 bg-card/10 backdrop-blur-sm rounded-3xl p-6 border border-primary-foreground/10"
          >
            <p className="font-display text-xl text-primary-foreground italic">
              "To make decisions you don't regret later."
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default RolloutSection;
