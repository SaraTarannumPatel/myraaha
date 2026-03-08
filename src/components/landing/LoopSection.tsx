import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Eye, DollarSign, Clock, AlertTriangle, Gauge } from "lucide-react";
import loopIllustration from "@/assets/loop-illustration.png";

const pathInfo = [
  { icon: Eye, label: "Required Skills", description: "What you actually need to learn for each path." },
  { icon: Gauge, label: "Market Demand", description: "Real-time signals — not motivational lies." },
  { icon: DollarSign, label: "Income Realities", description: "Honest salary and revenue projections." },
  { icon: Clock, label: "Effort Needed", description: "Time-to-readiness with clear estimates." },
  { icon: AlertTriangle, label: "Risk Level", description: "Financial, emotional, and career risk mapped." },
];

const personas = [
  { who: "Student", action: "See what a career actually demands before locking in." },
  { who: "Working Professional", action: "See what a transition really costs — skills, time, money." },
  { who: "Aspiring Founder", action: "Validate the problem before quitting your job." },
];

const LoopSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-20 sm:py-28 md:py-36 gradient-dark relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] sm:w-[800px] h-[400px] sm:h-[500px] gradient-glow opacity-30 pointer-events-none" />
      <div className="absolute top-8 sm:top-12 right-4 sm:right-6 md:right-12">
        <span className="font-display text-[80px] sm:text-[120px] md:text-[180px] text-primary-foreground/5 leading-none select-none">06</span>
      </div>

      <div className="container mx-auto px-5 sm:px-6 relative z-10">
        <div className="text-center mb-12 sm:mb-16 max-w-2xl mx-auto">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="font-body text-[10px] sm:text-xs uppercase tracking-[0.25em] text-accent font-semibold mb-3"
          >
            Explore Before You Commit
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-primary-foreground leading-tight"
          >
            You <em className="text-gradient-accent">simulate</em> paths.
          </motion.h2>
        </div>

        {/* Persona cards */}
        <div className="grid sm:grid-cols-3 gap-3 sm:gap-4 max-w-3xl mx-auto mb-12 sm:mb-16">
          {personas.map((p, i) => (
            <motion.div
              key={p.who}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.08 }}
              className="bg-primary-foreground/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-primary-foreground/10"
            >
              <p className="font-display text-xs sm:text-sm text-accent mb-1">{p.who}</p>
              <p className="font-body text-xs sm:text-sm text-primary-foreground/80 leading-relaxed">{p.action}</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.8 }}
            className="flex justify-center"
          >
            <motion.img
              src={loopIllustration}
              alt="Path simulation — explore before you commit"
              className="w-full max-w-[240px] sm:max-w-xs md:max-w-md"
              animate={{ rotate: [0, 1.5, -1.5, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

          <div>
            <p className="font-body text-[10px] sm:text-xs uppercase tracking-wider text-accent font-semibold mb-4 sm:mb-6">Every path shows:</p>
            <div className="space-y-2 sm:space-y-3">
              {pathInfo.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 30 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  className="flex items-center gap-3 sm:gap-4 bg-primary-foreground/5 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-primary-foreground/10"
                >
                  <div className="w-9 sm:w-10 h-9 sm:h-10 rounded-lg sm:rounded-xl gradient-accent flex items-center justify-center shrink-0">
                    <item.icon size={16} className="text-foreground sm:w-[18px] sm:h-[18px]" />
                  </div>
                  <div>
                    <h3 className="font-display text-sm sm:text-base text-primary-foreground">{item.label}</h3>
                    <p className="font-body text-[10px] sm:text-xs text-primary-foreground/50">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoopSection;