import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import {
  Compass, Route, Layers, Users, Fingerprint, Brain,
} from "lucide-react";
import featuresIllustration from "@/assets/features-illustration.png";

const features = [
  {
    icon: Compass,
    title: "Curiosity Compass",
    description: "Gamified exploration of your interests and strengths.",
  },
  {
    icon: Route,
    title: "AI Roadmaps",
    description: "Personalized, evolving paths based on your journey.",
  },
  {
    icon: Layers,
    title: "SkillStacker",
    description: "Real-world skills aligned with industry trends.",
  },
  {
    icon: Users,
    title: "Mentor Match",
    description: "AI-paired mentors who guide, not gatekeep.",
  },
  {
    icon: Fingerprint,
    title: "Living Resume",
    description: "Auto-updated portfolio from day one.",
  },
  {
    icon: Brain,
    title: "SelfGraph™",
    description: "AI identity mirror that evolves with you.",
  },
];

const FeaturesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section id="features" ref={ref} className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="font-body text-xs uppercase tracking-[0.2em] text-secondary font-semibold mb-4"
          >
            Features
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl text-foreground"
          >
            Everything to <em className="text-gradient-warm">design your path</em>
          </motion.h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          {/* Feature illustration with animated swap */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6 }}
            className="relative flex justify-center"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-secondary/10 to-transparent rounded-3xl blur-2xl" />
            <img
              src={featuresIllustration}
              alt="ShuttlEx features - compass, skills, resume, mentor connection"
              className="relative w-full max-w-md"
            />
          </motion.div>

          {/* Feature cards — interactive list */}
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
