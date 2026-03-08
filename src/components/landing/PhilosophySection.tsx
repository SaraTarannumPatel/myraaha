import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const PhilosophySection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 md:py-32 bg-muted/50">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center"
        >
          <p className="font-body text-xs uppercase tracking-[0.2em] text-secondary font-semibold mb-6">
            Our Philosophy
          </p>
          <blockquote className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground leading-tight italic mb-8">
            "Don't wait for students to reach the battlefield. Train them from
            childhood to master their weapons, understand their purpose, and{" "}
            <span className="text-gradient-warm">love the fight.</span>"
          </blockquote>
          <p className="font-body text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            We start before the confusion begins — and walk with you till clarity
            becomes action. From classrooms to boardrooms, from curiosity to
            creation.
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default PhilosophySection;
