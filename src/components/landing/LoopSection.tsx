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
            Explore Before You Commit
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl text-primary-foreground"
          >
            You <em className="text-gradient-warm">simulate</em> paths.
          </motion.h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: -5 }}
            animate={isInView ? { opacity: 1, scale: 1, rotate: 0 } : {}}
            transition={{ duration: 0.8 }}
            className="flex justify-center"
          >
            <motion.img
              src={loopIllustration}
              alt="Path simulation — explore before you commit"
              className="w-full max-w-sm"
              animate={{ rotate: [0, 2, -2, 0] }}
              transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>

          <div>
            <div className="space-y-4 font-body text-sm text-primary-foreground/70 mb-8">
              <p>If you're a <strong className="text-primary-foreground">student</strong>: See what a career actually demands before locking in.</p>
              <p>If you're <strong className="text-primary-foreground">working</strong>: See what a transition really costs — skills, time, money.</p>
              <p>If you want to <strong className="text-primary-foreground">build</strong>: Validate the problem before quitting your job.</p>
            </div>

            <p className="font-body text-xs uppercase tracking-wider text-secondary font-semibold mb-4">Every path shows:</p>
            <div className="space-y-4">
              {pathInfo.map((item, i) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, x: 30 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-2xl gradient-warm flex items-center justify-center shrink-0">
                    <item.icon size={18} className="text-secondary-foreground" />
                  </div>
                  <div>
                    <h3 className="font-display text-lg text-primary-foreground">{item.label}</h3>
                    <p className="font-body text-sm text-primary-foreground/60 leading-relaxed">{item.description}</p>
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
