import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight } from "lucide-react";

const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 md:py-32 bg-background relative overflow-hidden">
      <div className="absolute inset-0 gradient-glow pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="max-w-2xl mx-auto text-center"
        >
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-6">
            Your journey starts{" "}
            <em className="text-gradient-warm">today.</em>
          </h2>
          <p className="font-body text-lg text-muted-foreground mb-10 leading-relaxed">
            Join thousands of students and creators who are designing their futures
            — not stumbling into them.
          </p>
          <button className="gradient-warm text-secondary-foreground px-10 py-4 rounded-full font-body font-semibold text-lg shadow-accent hover:opacity-90 transition-opacity inline-flex items-center gap-2 group">
            Get Early Access
            <ArrowRight
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
