import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Cpu, Globe, BarChart3, DollarSign, Heart } from "lucide-react";
import transitionIllustration from "@/assets/transition-illustration.png";

const features = [
  { icon: Cpu, title: "Built Specifically For", description: "Career navigation, entrepreneurship systems, and decision modeling — not generic AI.", num: "01" },
  { icon: Globe, title: "Proactive, Not Reactive", description: "Anticipates confusion based on behaviour patterns before you even ask.", num: "02" },
  { icon: BarChart3, title: "Connected Intelligence", description: "Industry data, skill demand signals, startup ecosystem insights, and funding readiness metrics.", num: "03" },
  { icon: DollarSign, title: "Affordable at Scale", description: "Automated and revenue-sustained. Works in Tier 3, 4 and rural regions — not just metros.", num: "04" },
  { icon: Heart, title: "Impact-Measured", description: "Every interaction tracked for real outcomes. Measurable career and business progress.", num: "05" },
];

const TransitionSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-20 sm:py-28 md:py-36 bg-background-alt relative overflow-hidden">
      <div className="absolute top-8 sm:top-12 right-4 sm:right-6 md:right-12">
        <span className="font-display text-[80px] sm:text-[120px] md:text-[180px] text-grey-divider/30 leading-none select-none">08</span>
      </div>

      <div className="container mx-auto px-5 sm:px-6 relative z-10">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <motion.p
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              className="font-body text-[10px] sm:text-xs uppercase tracking-[0.25em] text-indigo font-semibold mb-3"
            >
              Precision, But Still Human
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground"
            >
              This is not{" "}
              <em className="text-gradient-warm">generic AI.</em>
            </motion.h2>
          </div>

          <div className="grid lg:grid-cols-5 gap-6 sm:gap-8 items-center">
            {/* Features — 3 cols */}
            <div className="lg:col-span-3 space-y-2 sm:space-y-3">
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, x: -20 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.2 + i * 0.06 }}
                  className="flex items-start gap-3 sm:gap-5 bg-card rounded-xl sm:rounded-2xl p-4 sm:p-5 border border-border shadow-soft hover:shadow-card transition-shadow duration-300 group"
                >
                  <div className="flex flex-col items-center gap-1 shrink-0">
                    <div className="w-9 sm:w-11 h-9 sm:h-11 rounded-lg sm:rounded-xl gradient-warm flex items-center justify-center group-hover:scale-110 transition-transform">
                      <f.icon size={16} className="text-primary-foreground sm:w-5 sm:h-5" />
                    </div>
                    <span className="font-display text-[9px] sm:text-[10px] text-grey-meta">{f.num}</span>
                  </div>
                  <div>
                    <h3 className="font-display text-base sm:text-lg text-foreground mb-0.5 sm:mb-1">{f.title}</h3>
                    <p className="font-body text-xs sm:text-sm text-muted-foreground leading-relaxed">{f.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Illustration — 2 cols */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.3 }}
              className="lg:col-span-2 flex justify-center"
            >
              <div className="relative">
                <div className="absolute -inset-8 bg-gradient-to-br from-indigo/10 to-accent/10 rounded-full blur-3xl" />
                <img
                  src={transitionIllustration}
                  alt="AI precision with human empathy"
                  className="relative w-full max-w-[240px] sm:max-w-xs md:max-w-md"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TransitionSection;