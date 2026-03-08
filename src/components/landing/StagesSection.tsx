import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { School, GraduationCap, BookOpen, Award, RefreshCw } from "lucide-react";

const stages = [
  {
    icon: School,
    label: "School Level",
    duration: "8 Years (Age 13–20)",
    strategy: "Slow-burn discovery — gradual self-awareness, exploration, light mentorship, and low-pressure experimentation.",
  },
  {
    icon: GraduationCap,
    label: "Secondary College",
    duration: "6 Years (Age 15–20)",
    strategy: "Compressed start, faster discovery — enough time for experimentation and guided direction.",
  },
  {
    icon: BookOpen,
    label: "Undergrad College",
    duration: "4 Years (Age 17–21)",
    strategy: "Fast-tracked orientation + project-based growth. Strong mentorship and job alignment.",
  },
  {
    icon: Award,
    label: "Postgrad College",
    duration: "2 Years (Age 21–23)",
    strategy: "Hyper-focused path clarity, portfolio development, and direct job-readiness.",
  },
  {
    icon: RefreshCw,
    label: "Career Transitioners",
    duration: "1 Year (Any Age)",
    strategy: "Intensive career re-alignment sprint. All AI systems, resume, mentors, and skills run in parallel.",
  },
];

const StagesSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <section ref={ref} className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="font-body text-xs uppercase tracking-[0.2em] text-secondary font-semibold mb-4"
          >
            Rollout by Stage
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl text-foreground"
          >
            One platform, <em className="text-gradient-warm">every stage</em>
          </motion.h2>
        </div>

        {/* Tab-style cards */}
        <div className="max-w-3xl mx-auto">
          <div className="flex flex-wrap justify-center gap-2 mb-8">
            {stages.map((s, i) => (
              <motion.button
                key={s.label}
                initial={{ opacity: 0, y: 12 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.15 + i * 0.06 }}
                onClick={() => setActiveIdx(i)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full font-body text-sm transition-all duration-300 border ${
                  activeIdx === i
                    ? "gradient-warm text-secondary-foreground border-transparent shadow-accent"
                    : "bg-card text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                <s.icon size={16} />
                {s.label}
              </motion.button>
            ))}
          </div>

          <motion.div
            key={activeIdx}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-card rounded-3xl p-8 border border-border shadow-card text-center"
          >
            <div className="w-14 h-14 rounded-2xl gradient-warm flex items-center justify-center mx-auto mb-4">
              {(() => {
                const Icon = stages[activeIdx].icon;
                return <Icon size={24} className="text-secondary-foreground" />;
              })()}
            </div>
            <h3 className="font-display text-2xl text-foreground mb-2">{stages[activeIdx].label}</h3>
            <p className="font-body text-sm text-secondary font-semibold mb-3">{stages[activeIdx].duration}</p>
            <p className="font-body text-sm text-muted-foreground leading-relaxed max-w-lg mx-auto">
              {stages[activeIdx].strategy}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default StagesSection;
