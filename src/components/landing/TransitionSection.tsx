import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Cpu, Globe, BarChart3, DollarSign, Heart } from "lucide-react";
import transitionIllustration from "@/assets/transition-illustration.png";

const features = [
  { icon: Cpu, title: "Built Specifically For", description: "Career navigation, entrepreneurship systems, and decision modeling — not generic AI." },
  { icon: Globe, title: "Proactive, Not Reactive", description: "Anticipates confusion based on behaviour patterns before you even ask." },
  { icon: BarChart3, title: "Connected Intelligence", description: "Industry data, skill demand signals, startup ecosystem insights, and funding readiness metrics." },
  { icon: DollarSign, title: "Affordable at Scale", description: "Automated and revenue-sustained. Works in Tier 3, 4 and rural regions — not just metros." },
  { icon: Heart, title: "Impact-Measured", description: "Every interaction tracked for real outcomes. Not vanity metrics — measurable career and business progress." },
];

const TransitionSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 md:py-32 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="font-body text-xs uppercase tracking-[0.2em] text-secondary font-semibold mb-4"
          >
            Precision, But Still Human
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl text-foreground"
          >
            This is not <em className="text-gradient-warm">generic AI.</em>
          </motion.h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          <div>
            <div className="space-y-4">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className="flex items-start gap-3"
                >
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <f.icon size={18} className="text-primary" />
                  </div>
                  <div>
                    <h3 className="font-display text-base text-foreground">{f.title}</h3>
                    <p className="font-body text-xs text-muted-foreground leading-relaxed">{f.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="flex justify-center"
          >
            <img
              src={transitionIllustration}
              alt="AI precision with human empathy"
              className="w-full max-w-sm"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default TransitionSection;
