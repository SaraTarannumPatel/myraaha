import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { GraduationCap, Briefcase, Rocket, Wrench, Check } from "lucide-react";

const userTypes = [
  {
    icon: GraduationCap,
    emoji: "🎓",
    title: "Student",
    points: [
      "Clear direction before picking a degree",
      "Skill roadmap aligned with actual demand",
      "Career simulation before you commit",
      "Identity evolution tracking",
    ],
    result: "You graduate with clarity, not an existential crisis.",
    accentColor: "text-blue",
    headerBg: "bg-blue",
    borderHover: "hover:border-blue/30",
    checkColor: "text-blue",
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
    result: "You switch careers strategically — not on a random Tuesday meltdown.",
    accentColor: "text-primary",
    headerBg: "bg-primary",
    borderHover: "hover:border-primary/30",
    checkColor: "text-primary",
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
    result: "You build with structure, not just vibes and hope.",
    accentColor: "text-terracotta",
    headerBg: "bg-terracotta",
    borderHover: "hover:border-terracotta/30",
    checkColor: "text-terracotta",
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
    result: "Fewer blind pivots. More measured growth. W energy.",
    accentColor: "text-maroon",
    headerBg: "bg-maroon",
    borderHover: "hover:border-maroon/30",
    checkColor: "text-maroon",
  },
];

const EditionsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  return (
    <section id="who" ref={ref} className="py-20 sm:py-28 md:py-36 bg-background relative">
      <div className="absolute top-8 sm:top-12 right-4 sm:right-6 md:right-12">
        <span className="font-display text-[80px] sm:text-[120px] md:text-[180px] text-grey-divider/30 leading-none select-none">04</span>
      </div>

      <div className="container mx-auto px-5 sm:px-6 relative z-10">
        <div className="text-center mb-12 sm:mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="font-body text-[10px] sm:text-xs uppercase tracking-[0.25em] text-terracotta font-semibold mb-3"
          >
            What Each User Type Gets
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground"
          >
            One platform,{" "}
            <em className="text-gradient-milestone">every stage of life.</em> literally.
          </motion.h2>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5 max-w-6xl mx-auto">
          {userTypes.map((user, i) => (
            <motion.div
              key={user.title}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.08 }}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              className={`bg-card rounded-2xl sm:rounded-3xl border border-border shadow-soft ${user.borderHover} transition-all duration-500 relative overflow-hidden group`}
            >
              {/* Colored top bar */}
              <div className={`h-1.5 ${user.headerBg}`} />
              
              <div className="p-4 sm:p-6">
                <div className="relative z-10">
                  <span className="text-2xl sm:text-3xl block mb-2 sm:mb-3">{user.emoji}</span>
                  <h3 className={`font-display text-base sm:text-xl ${user.accentColor} mb-3 sm:mb-4`}>{user.title}</h3>
                  <ul className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-5">
                    {user.points.map((p) => (
                      <li key={p} className="flex items-start gap-1.5 sm:gap-2">
                        <Check size={12} className={`${user.checkColor} mt-0.5 shrink-0 sm:w-[14px] sm:h-[14px]`} />
                        <span className="font-body text-[10px] sm:text-xs text-muted-foreground leading-snug">{p}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="border-t border-border pt-3 sm:pt-4">
                    <p className="font-display text-xs sm:text-sm text-foreground italic leading-snug">
                      {user.result}
                    </p>
                  </div>
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
