import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import {
  Filter, BarChart3, TrendingUp, Brain, RefreshCw, Link2,
} from "lucide-react";

const usps = [
  {
    icon: Filter,
    title: "Filtering Noise",
    description: "Instead of 200 careers or ideas, MyRaaha narrows options responsibly based on your real data.",
  },
  {
    icon: BarChart3,
    title: "Ranking Options Responsibly",
    description: "Every path shows required skills, market demand, income realities, effort needed, and risk level.",
  },
  {
    icon: TrendingUp,
    title: "Showing Trade-offs Clearly",
    description: "Time-to-readiness estimates, effort vs reward comparisons, and income-risk analysis — not YouTube-guru optimism.",
  },
  {
    icon: Brain,
    title: "Tracking Growth Automatically",
    description: "Your dynamic identity model evolves continuously — aptitude, attitude, and articulation tracked over time.",
  },
  {
    icon: RefreshCw,
    title: "Preventing Unnecessary Resets",
    description: "The system remembers your history. Adjusts if you fall behind, shift interest, or market demand changes.",
  },
  {
    icon: Link2,
    title: "Skill-Building → Outcome",
    description: "Connects learning directly to jobs, startup validation, and real opportunities — no random course hopping.",
  },
];

const USPsSection = () => {
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
            What Makes MyRaaha Different
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl text-foreground max-w-2xl mx-auto"
          >
            Not information. Not courses. A{" "}
            <em className="text-gradient-warm">decision operating system.</em>
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
