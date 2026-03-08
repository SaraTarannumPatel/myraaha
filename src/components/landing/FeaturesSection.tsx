import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import {
  Brain, Route, Briefcase, Rocket, ArrowRight, Check,
} from "lucide-react";
import featuresIllustration from "@/assets/features-illustration.png";

const features = [
  {
    icon: Brain,
    num: "01",
    title: "Personal Intelligence Setup",
    highlights: ["Strength profile", "Work-style analysis", "Risk tolerance score", "Decision-making pattern", "Energy gain vs drain map"],
    description: "Structured assessments + continuous behavioural learning. A dynamic identity model, not a one-time test.",
  },
  {
    icon: Route,
    num: "02",
    title: "Pathway Narrowing Engine",
    highlights: ["Top aligned paths ranked", "Transition feasibility", "Skills gap breakdown", "Time-to-readiness", "Effort vs reward"],
    description: "Filters based on your intelligence model, real-time job demand, skill saturation, and income stability.",
  },
  {
    icon: Briefcase,
    num: "03",
    title: "Career Execution System",
    highlights: ["Structured skill roadmap", "Learning sequence", "Portfolio requirements", "Market-fit checkpoints", "Interview readiness"],
    description: "Adjusts if you fall behind, shift interest, or market demand changes. Clear next actions every week.",
  },
  {
    icon: Rocket,
    num: "04",
    title: "Startup Validation & Build",
    highlights: ["Validation checklist", "Market signal analysis", "Founder mindset score", "Execution tracker", "Funding readiness"],
    description: "Idea → Problem validation → Market testing → Build → Launch → Funding readiness. No skipping validation.",
  },
];

const FeaturesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="how-it-works" ref={ref} className="py-28 md:py-36 bg-background relative">
      <div className="absolute top-12 left-6 md:left-12">
        <span className="font-display text-[120px] md:text-[180px] text-muted/30 leading-none select-none">03</span>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="max-w-3xl mb-20">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="font-body text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3"
          >
            How MyRaaha Works
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight mb-4"
          >
            A system that doesn't make you{" "}
            <em className="text-gradient-warm">search.</em>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.2 }}
            className="font-body text-base text-muted-foreground max-w-xl leading-relaxed"
          >
            Clarity → Direction → Action → Outcome. The system learns how you think, tracks what you're good at, and connects that to real market data.
          </motion.p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start max-w-6xl mx-auto">
          {/* Feature tabs — left 5 cols */}
          <div className="lg:col-span-5 space-y-2">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.15 + i * 0.06 }}
                className={`p-5 rounded-2xl cursor-pointer transition-all duration-400 border ${
                  activeIndex === i
                    ? "bg-card border-primary/20 shadow-card"
                    : "border-transparent hover:bg-muted/50"
                }`}
                onClick={() => setActiveIndex(i)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className={`font-display text-xs transition-colors ${
                    activeIndex === i ? "text-primary" : "text-muted-foreground"
                  }`}>{feature.num}</span>
                  <h3 className="font-display text-lg text-foreground">{feature.title}</h3>
                </div>
                {activeIndex === i && (
                  <motion.p
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="font-body text-sm text-muted-foreground leading-relaxed pl-8"
                  >
                    {feature.description}
                  </motion.p>
                )}
              </motion.div>
            ))}
          </div>

          {/* Active feature detail — right 7 cols */}
          <div className="lg:col-span-7">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-card rounded-3xl p-8 border border-border shadow-card"
            >
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl gradient-warm flex items-center justify-center">
                  {(() => {
                    const Icon = features[activeIndex].icon;
                    return <Icon size={24} className="text-primary-foreground" />;
                  })()}
                </div>
                <div>
                  <p className="font-body text-xs text-primary font-semibold uppercase tracking-wider">Step {features[activeIndex].num}</p>
                  <h3 className="font-display text-2xl text-foreground">{features[activeIndex].title}</h3>
                </div>
              </div>

              <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6">
                {features[activeIndex].description}
              </p>

              <p className="font-body text-xs uppercase tracking-wider text-primary font-semibold mb-3">What you get:</p>
              <div className="grid grid-cols-2 gap-2">
                {features[activeIndex].highlights.map((h) => (
                  <div key={h} className="flex items-center gap-2">
                    <Check size={14} className="text-primary shrink-0" />
                    <span className="font-body text-sm text-foreground">{h}</span>
                  </div>
                ))}
              </div>

              {/* Illustration accent */}
              <div className="mt-8 flex justify-center">
                <img
                  src={featuresIllustration}
                  alt="MyRaaha feature illustration"
                  className="w-full max-w-[200px] opacity-60"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
