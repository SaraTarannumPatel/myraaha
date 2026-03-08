import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import {
  Brain, Route, Briefcase, Rocket,
} from "lucide-react";
import featuresIllustration from "@/assets/features-illustration.png";

const features = [
  {
    icon: Brain,
    title: "1. Personal Intelligence Setup",
    description: "Structured assessments + continuous behavioural learning. Strength profile, work-style analysis, risk tolerance, decision patterns, energy map — a dynamic identity model, not a one-time test.",
  },
  {
    icon: Route,
    title: "2. Pathway Narrowing Engine",
    description: "Filters based on your intelligence model, real-time job demand, skill saturation, and income stability. Top aligned paths ranked with transition feasibility, skill gaps, and effort vs reward.",
  },
  {
    icon: Briefcase,
    title: "3. Career Execution System",
    description: "Structured skill roadmap, learning sequences, portfolio requirements, market-fit checkpoints, interview readiness. Adjusts if you fall behind, shift interest, or market demand changes.",
  },
  {
    icon: Rocket,
    title: "4. Startup Validation & Build",
    description: "Idea → Problem validation → Market testing → Build → Launch → Funding readiness. Validation checklist, market signals, founder mindset score, and capital readiness indicator.",
  },
];

const FeaturesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="how-it-works" ref={ref} className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="font-body text-xs uppercase tracking-[0.2em] text-secondary font-semibold mb-4"
          >
            How MyRaaha Works
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl text-foreground max-w-2xl mx-auto"
          >
            A system that doesn't make you{" "}
            <em className="text-gradient-warm">search</em>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="font-body text-sm text-muted-foreground mt-4 max-w-xl mx-auto leading-relaxed"
          >
            Clarity → Direction → Action → Outcome. You don't jump between platforms. The system learns how you think, tracks what you're good at, notices what drains you, and connects that to real market data.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="relative flex justify-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent rounded-3xl blur-2xl" />
            <img
              src={featuresIllustration}
              alt="MyRaaha feature walkthrough — intelligence, pathways, execution"
              className="relative w-full max-w-md"
            />
          </motion.div>

          <div className="space-y-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.15 + i * 0.06 }}
                className={`flex items-start gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${
                  activeIndex === i
                    ? "bg-card border-secondary/30 shadow-card"
                    : "border-transparent hover:bg-muted/50"
                }`}
                onClick={() => setActiveIndex(i)}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${
                  activeIndex === i ? "gradient-warm text-secondary-foreground" : "bg-muted"
                }`}>
                  <feature.icon size={20} />
                </div>
                <div>
                  <h3 className="font-display text-lg text-foreground">{feature.title}</h3>
                  <p className="font-body text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
