import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const PhilosophySection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-16 sm:py-20 md:py-28 bg-background overflow-hidden relative">
      {/* Colored decorative lines */}
      <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue/20 to-transparent" />
      <div className="absolute top-[calc(50%+4px)] left-0 right-0 h-px bg-gradient-to-r from-transparent via-terracotta/15 to-transparent" />

      <div className="container mx-auto px-5 sm:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.7 }}
          className="max-w-3xl mx-auto text-center bg-background px-4 sm:px-8"
        >
          <blockquote className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-foreground leading-[1.15] italic">
            "You don't need more{" "}
            <span className="text-gradient-milestone">motivation.</span>
          </blockquote>
          <blockquote className="font-display text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-foreground leading-[1.15] italic mt-2">
            You need better <span className="text-gradient-warm">navigation.</span> and that's on periodt."
          </blockquote>
        </motion.div>
      </div>
    </section>
  );
};

export default PhilosophySection;
