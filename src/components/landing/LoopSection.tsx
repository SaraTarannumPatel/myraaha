import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Search, Wrench, Globe, RefreshCw } from "lucide-react";
import loopIllustration from "@/assets/loop-illustration.png";

const steps = [
  { icon: Search, label: "Discover", description: "Explore who you are, what excites you, and where you fit." },
  { icon: Wrench, label: "Build", description: "Learn real skills, create projects, and develop your MVP." },
  { icon: Globe, label: "Connect", description: "Find mentors, peers, communities, and real opportunities." },
  { icon: RefreshCw, label: "Evolve", description: "Adapt, pivot, and grow — the journey never stops." },
];

const LoopSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 md:py-32 gradient-dark relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] gradient-glow opacity-40 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="font-body text-xs uppercase tracking-[0.2em] text-secondary font-semibold mb-4"
          >
            The ShuttlEx Loop
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl text-primary-foreground"
          >
            A cycle that <em className="text-gradient-warm">never ends</em>
          </motion.h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          {/* Loop illustration */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
            animate={isInView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="flex justify-center"
          >
            <motion.img
              src={loopIllustration}
              alt="The ShuttlEx loop — Discover, Build, Connect, Evolve"
              className="w-full max-w-sm"
              animate={{ rotate: [0, 2, -2, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

          {/* Steps */}
          <div className="space-y-6">
            {steps.map((step, i) => (
              <motion.div
                key={step.label}
                initial={{ opacity: 0, x: 30 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.12 }}
                className="flex items-start gap-4"
              >
                <div className="w-12 h-12 rounded-2xl gradient-warm flex items-center justify-center shrink-0">
                  <step.icon size={22} className="text-secondary-foreground" />
                </div>
                <div>
                  <h3 className="font-display text-xl text-primary-foreground">{step.label}</h3>
                  <p className="font-body text-sm text-primary-foreground/60 leading-relaxed">{step.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoopSection;
