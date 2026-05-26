import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ArrowRight, Sparkles } from "lucide-react";

const CTASection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-20 sm:py-28 md:py-36 bg-background relative overflow-hidden">
      <div className="absolute inset-0 gradient-glow pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] sm:w-[400px] h-[300px] sm:h-[400px] rounded-full border border-blue/10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[450px] sm:w-[600px] h-[450px] sm:h-[600px] rounded-full border border-terracotta/8" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[800px] h-[600px] sm:h-[800px] rounded-full border border-accent/10" />

      <div className="container mx-auto px-5 sm:px-6 relative z-10">
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
            className="w-14 sm:w-16 h-14 sm:h-16 gradient-milestone rounded-2xl mx-auto flex items-center justify-center shadow-accent mb-6 sm:mb-8"
          >
            <Sparkles size={24} className="text-white sm:w-7 sm:h-7" />
          </motion.div>

          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground mb-3 sm:mb-4 leading-tight">
            Start your journey
            <br />
            with <em className="text-gradient-milestone">MyRaaha.</em> let's go 🚀
          </h2>

          <p className="font-body text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8">
            <span className="text-blue">Clarity</span> → <span className="text-primary">Direction</span> → <span className="text-terracotta">Action</span> → <span className="text-maroon">Outcome.</span> no cap.
          </p>

          <a href="/intro" className="gradient-milestone text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-body font-semibold text-base sm:text-lg shadow-accent hover:opacity-90 transition-opacity inline-flex items-center gap-2 group">
            Get Started
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform sm:w-5 sm:h-5" />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;
