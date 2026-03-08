import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import rolloutIllustration from "@/assets/rollout-illustration.png";

const milestones = [
  { pct: "10%", title: "Onboarding", description: "Dashboard & Curiosity Compass — explore interests through gamified cards.", phase: "Discovery" },
  { pct: "20%", title: "Direction Setting", description: "AI Roadmaps generated from exploration data. Career directions & learning paths.", phase: "Direction" },
  { pct: "35%", title: "Learning Kickoff", description: "Adaptive micro-learning, curated content, and early certification paths.", phase: "Learning" },
  { pct: "50%", title: "Skill Application", description: "SkillStacker, Project Playground, hackathons & real-world challenges.", phase: "Development" },
  { pct: "65%", title: "Identity Formation", description: "Living Resume & SelfGraph™ — your evolving professional identity visualized.", phase: "Identity" },
  { pct: "75%", title: "Guidance Activation", description: "Mentor Matchmaking, Virtual Career Coach & AI Career Therapist unlocked.", phase: "Support" },
  { pct: "85%", title: "Real-World Readiness", description: "Job & Internship Match, company challenges, domain-specific opportunities.", phase: "Opportunities" },
  { pct: "100%", title: "Continuous Evolution", description: "SelfGraph Deep Insights — progress, clarity, and direction evolve live.", phase: "Evolution" },
];

const RolloutSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <section ref={ref} className="py-24 md:py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="font-body text-xs uppercase tracking-[0.2em] text-secondary font-semibold mb-4"
          >
            Progressive Unlocking
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl text-foreground"
          >
            Features unlock as <em className="text-gradient-warm">you grow</em>
          </motion.h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-start max-w-5xl mx-auto">
          {/* Illustration + active detail */}
          <div className="sticky top-24">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={isInView ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 0.6 }}
              className="flex justify-center mb-8"
            >
              <img
                src={rolloutIllustration}
                alt="Progress tree with milestone badges"
                className="w-full max-w-xs"
              />
            </motion.div>

            {/* Active milestone detail */}
            <motion.div
              key={activeIdx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-3xl p-6 border border-border shadow-card"
            >
              <div className="flex items-center gap-3 mb-3">
                <span className="gradient-warm text-secondary-foreground px-3 py-1 rounded-full font-body text-sm font-semibold">
                  {milestones[activeIdx].pct}
                </span>
                <span className="font-body text-xs uppercase tracking-wider text-muted-foreground">
                  {milestones[activeIdx].phase}
                </span>
              </div>
              <h3 className="font-display text-xl text-foreground mb-2">{milestones[activeIdx].title}</h3>
              <p className="font-body text-sm text-muted-foreground leading-relaxed">{milestones[activeIdx].description}</p>
            </motion.div>
          </div>

          {/* Milestone list */}
          <div className="space-y-2">
            {milestones.map((m, i) => (
              <motion.div
                key={m.pct}
                initial={{ opacity: 0, x: 20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.15 + i * 0.05 }}
                className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 border ${
                  activeIdx === i
                    ? "bg-card border-secondary/30 shadow-card"
                    : "border-transparent hover:bg-muted/50"
                }`}
                onClick={() => setActiveIdx(i)}
              >
                {/* Progress dot */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 font-body text-xs font-bold transition-all duration-300 ${
                  activeIdx === i ? "gradient-warm text-secondary-foreground" : "bg-muted text-muted-foreground"
                }`}>
                  {m.pct}
                </div>
                <div>
                  <h4 className="font-display text-base text-foreground">{m.title}</h4>
                  <p className="font-body text-xs text-muted-foreground">{m.phase} Phase</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default RolloutSection;
