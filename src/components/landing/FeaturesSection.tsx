import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Compass,
  Route,
  Layers,
  Users,
  BookOpen,
  Briefcase,
  Fingerprint,
  MessageCircle,
  Rocket,
  Brain,
} from "lucide-react";

const features = [
  {
    icon: Compass,
    title: "Curiosity Compass",
    description: "Gamified, pressure-free exploration of interests, strengths & learning styles.",
    tag: "Discovery",
  },
  {
    icon: Route,
    title: "AI-Powered Roadmaps",
    description: "Personalized, evolving paths based on your goals, behavior & exploration history.",
    tag: "Direction",
  },
  {
    icon: Layers,
    title: "SkillStacker",
    description: "Real-world skills aligned with industry trends and your personal gaps.",
    tag: "Development",
  },
  {
    icon: Users,
    title: "Mentor Matchmaking",
    description: "AI-paired mentors and role models who check in, not just check boxes.",
    tag: "Support",
  },
  {
    icon: BookOpen,
    title: "Adaptive Capsules",
    description: "Curated micro-learning from the best sources, personalized to your pace.",
    tag: "Learning",
  },
  {
    icon: Briefcase,
    title: "Project Playground",
    description: "Hands-on challenges, industry-linked projects and real hackathons.",
    tag: "Real-World",
  },
  {
    icon: Fingerprint,
    title: "Living Resume",
    description: "Auto-updated portfolio tracking your entire journey from day one.",
    tag: "Identity",
  },
  {
    icon: MessageCircle,
    title: "Virtual Career Coach",
    description: "Chat-based assistant suggesting next steps and solving your doubts 24/7.",
    tag: "Navigation",
  },
  {
    icon: Rocket,
    title: "Startup Creation Lab",
    description: "From idea validation to MVP — build your venture with guided tools and mentors.",
    tag: "Entrepreneurship",
  },
  {
    icon: Brain,
    title: "SelfGraph™",
    description: "A real-time AI identity mirror that evolves with every choice you make.",
    tag: "Intelligence",
  },
];

const FeaturesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="features" ref={ref} className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
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
            Everything you need to{" "}
            <em className="text-gradient-warm">design your path</em>
          </motion.h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 + i * 0.05, duration: 0.5 }}
              className="group bg-card rounded-2xl p-6 border border-border hover:shadow-card transition-all duration-300 hover:border-secondary/30"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center group-hover:gradient-warm group-hover:text-secondary-foreground transition-all duration-300">
                  <feature.icon size={20} />
                </div>
                <span className="font-body text-[10px] uppercase tracking-wider text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
                  {feature.tag}
                </span>
              </div>
              <h3 className="font-display text-xl text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
