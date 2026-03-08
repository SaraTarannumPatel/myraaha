import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const PhilosophySection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-20 md:py-28 bg-muted/50 overflow-hidden">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="max-w-2xl mx-auto text-center"
        >
          <blockquote className="font-display text-3xl md:text-4xl lg:text-5xl text-foreground leading-tight italic">
            "You don't need more{" "}
            <span className="text-gradient-warm">motivation.</span>
            {" "}You need better navigation."
          </blockquote>
        </motion.div>
      </div>
    </section>
  );
};

export default PhilosophySection;
