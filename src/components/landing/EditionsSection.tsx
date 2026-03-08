import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { GraduationCap, Briefcase, Rocket, Wrench, ArrowRight, Check } from "lucide-react";

const userTypes = [
  {
    icon: GraduationCap,
    emoji: "🎓",
    title: "Student",
    points: [
      "Clear direction before selecting degree",
      "Skill roadmap aligned with demand",
      "Career simulation before commitment",
      "Identity evolution tracking",
    ],
    result: "You graduate with clarity, not confusion.",
    color: "from-primary/10 to-primary/5",
  },
  {
    icon: Briefcase,
    emoji: "💼",
    title: "Working Professional",
    points: [
      "Misalignment detection",
      "Safe transition modelling",
      "Skill gap precision",
      "Income-risk comparison",
    ],
    result: "You switch careers strategically, not emotionally.",
    color: "from-accent/10 to-accent/5",
  },
  {
    icon: Rocket,
    emoji: "🚀",
    title: "Aspiring Founder",
    points: [
      "Problem-first validation",
      "Market-backed idea filtering",
      "Founder growth tracking",
      "Capital readiness scoring",
    ],
    result: "You build with structure, not guesswork.",
    color: "from-primary/10 to-primary/5",
  },
  {
    icon: Wrench,
    emoji: "🛠",
    title: "Active Builder",
    points: [
      "Execution consistency tracking",
      "Pivot analysis",
      "Opportunity alerts",
      "Funding eligibility insights",
    ],
    result: "Fewer blind pivots. More measured growth.",
    color: "from-accent/10 to-accent/5",
  },
];

const EditionsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <section id="who" ref={ref} className="py-28 md:py-36 bg-background relative">
      <div className="absolute top-12 right-6 md:right-12">
        <span className="font-display text-[120px] md:text-[180px] text-muted/30 leading-none select-none">04</span>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="font-body text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3"
          >
            What Each User Type Gets
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl lg:text-6xl text-foreground"
          >
            One platform,{" "}
            <em className="text-gradient-warm">every stage of life.</em>
          </motion.h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-6xl mx-auto">
          {userTypes.map((user, i) => (
            <motion.div
              key={user.title}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.08 }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`bg-card rounded-3xl p-6 border border-border shadow-soft hover:shadow-card transition-all duration-500 relative overflow-hidden group`}
            >
              <div className={`absolute inset-0 bg-gradient-to-b ${user.color} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
              
              <div className="relative z-10">
                <span className="text-3xl block mb-3">{user.emoji}</span>
                <h3 className="font-display text-xl text-foreground mb-4">{user.title}</h3>
                <ul className="space-y-2 mb-5">
                  {user.points.map((p) => (
                    <li key={p} className="flex items-start gap-2">
                      <Check size={14} className="text-primary mt-0.5 shrink-0" />
                      <span className="font-body text-xs text-muted-foreground leading-snug">{p}</span>
                    </li>
                  ))}
                </ul>
                <div className="border-t border-border pt-4">
                  <p className="font-display text-sm text-foreground italic leading-snug">
                    {user.result}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EditionsSection;
