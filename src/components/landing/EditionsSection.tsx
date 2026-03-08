import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { GraduationCap, Briefcase, Rocket, Wrench } from "lucide-react";
import editionsIllustration from "@/assets/editions-illustration.png";

const userTypes = [
  {
    icon: GraduationCap,
    title: "Student",
    points: [
      "Clear direction before selecting degree",
      "Skill roadmap aligned with demand",
      "Career simulation before commitment",
      "Identity evolution tracking",
    ],
    result: "You graduate with clarity, not confusion.",
  },
  {
    icon: Briefcase,
    title: "Working Professional",
    points: [
      "Misalignment detection",
      "Safe transition modelling",
      "Skill gap precision",
      "Income-risk comparison",
    ],
    result: "You switch careers strategically, not emotionally.",
  },
  {
    icon: Rocket,
    title: "Aspiring Founder",
    points: [
      "Problem-first validation",
      "Market-backed idea filtering",
      "Founder growth tracking",
      "Capital readiness scoring",
    ],
    result: "You build with structure, not guesswork.",
  },
  {
    icon: Wrench,
    title: "Active Builder",
    points: [
      "Execution consistency tracking",
      "Pivot analysis",
      "Opportunity alerts",
      "Funding eligibility insights",
    ],
    result: "Fewer blind pivots. More measured growth.",
  },
];

const EditionsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="who" ref={ref} className="py-24 md:py-32 bg-muted/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-12">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="font-body text-xs uppercase tracking-[0.2em] text-secondary font-semibold mb-4"
          >
            What Each User Type Gets
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl text-foreground"
          >
            One platform, <em className="text-gradient-warm">every stage of life</em>
          </motion.h2>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {userTypes.map((user, i) => (
            <motion.div
              key={user.title}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.08 }}
              className="bg-card rounded-3xl p-6 border border-border shadow-card"
            >
              <div className="w-12 h-12 rounded-2xl gradient-warm flex items-center justify-center mb-4">
                <user.icon size={22} className="text-secondary-foreground" />
              </div>
              <h3 className="font-display text-xl text-foreground mb-3">{user.title}</h3>
              <ul className="space-y-2 mb-4">
                {user.points.map((p) => (
                  <li key={p} className="flex items-start gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    <span className="font-body text-sm text-muted-foreground">{p}</span>
                  </li>
                ))}
              </ul>
              <p className="font-display text-sm text-foreground italic border-t border-border pt-3">
                {user.result}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EditionsSection;
