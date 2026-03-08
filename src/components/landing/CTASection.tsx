import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-28 md:py-36 bg-background relative overflow-hidden">
      <div className="absolute inset-0 gradient-glow pointer-events-none" />
      {/* Decorative rings */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-border/30" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-border/20" />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7 }}
          className="max-w-xl mx-auto text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={isInView ? { scale: 1 } : {}}
            transition={{ delay: 0.2, type: "spring" }}
            className="w-16 h-16 gradient-warm rounded-2xl mx-auto flex items-center justify-center shadow-accent mb-8"
          >
            <Sparkles size={28} className="text-primary-foreground" />
          </motion.div>

          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground mb-4 leading-tight">
            Start your journey
            <br />
            with <em className="text-gradient-warm">MyRaaha.</em>
          </h2>

          <p className="font-body text-base text-muted-foreground mb-8">
            Clarity → Direction → Action → Outcome.
          </p>

          <a href="/get-started" className="gradient-warm text-primary-foreground px-10 py-4 rounded-full font-body font-semibold text-lg shadow-accent hover:opacity-90 transition-opacity inline-flex items-center gap-2 group">
            Get Started
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
