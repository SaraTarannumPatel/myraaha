import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Fingerprint, Brain, Gamepad2, Globe, FileText, Sparkles,
  Heart, BarChart3, Users,
} from "lucide-react";

const usps = [
  {
    icon: Sparkles,
    title: "End-to-End Journey",
    description: "Class 8 to first job — no reset, no confusion, just guided growth.",
  },
  {
    icon: Fingerprint,
    title: "Identity over Aptitude",
    description: "Storytelling, creativity & behavior tracking — not boring tests.",
  },
  {
    icon: Gamepad2,
    title: "Built for Gen Z & Alpha",
    description: "Gamified, visual, swipe-first UX — not dashboards from 2005.",
  },
  {
    icon: Globe,
    title: "Inclusive by Design",
    description: "Tier 3, 4 & rural India — where students are left behind the most.",
  },
  {
    icon: FileText,
    title: "Living Resume",
    description: "Every choice & project auto-logged — recruiter-ready from day one.",
  },
  {
    icon: Brain,
    title: "AI That Knows You",
    description: "Learns your patterns & gently nudges you toward paths you'd love.",
  },
  {
    icon: BarChart3,
    title: "SelfGraph™ Intelligence",
    description: "A continuously evolving identity mirror — not a one-time quiz result.",
  },
  {
    icon: Heart,
    title: "AI Career Therapist",
    description: "Empathetic guidance through confusion — the therapist you always needed.",
  },
  {
    icon: Users,
    title: "Domain Demand & Supply",
    description: "Niche talent pools matched to real-time industry needs — not generic boards.",
  },
];

const USPsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="usps" ref={ref} className="py-24 md:py-32 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="font-body text-xs uppercase tracking-[0.2em] text-secondary font-semibold mb-4"
          >
            What Makes Us Different
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl text-foreground"
          >
            Not just another <em className="text-gradient-warm">career platform</em>
          </motion.h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {usps.map((usp, i) => (
            <motion.div
              key={usp.title}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.15 + i * 0.05 }}
              className="bg-card rounded-3xl p-6 border border-border shadow-soft hover:shadow-card transition-shadow duration-500 group"
            >
              <div className="w-11 h-11 rounded-xl gradient-warm flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <usp.icon size={20} className="text-secondary-foreground" />
              </div>
              <h3 className="font-display text-lg text-foreground mb-1">{usp.title}</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">{usp.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default USPsSection;
