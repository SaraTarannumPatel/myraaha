import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const PhilosophySection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 md:py-32 bg-muted/50 overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="max-w-2xl mx-auto text-center"
        >
          <blockquote className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground leading-tight italic">
            "Train them to master their weapons and{" "}
            <span className="text-gradient-warm">love the fight.</span>"
          </blockquote>
          <p className="font-body text-sm text-muted-foreground mt-6">
            We start before the confusion begins.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PhilosophySection;
