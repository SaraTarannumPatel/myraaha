import { motion, useInView } from "framer-motion";
import { useRef } from "react";

const stages = [
  {
    age: "13–16",
    label: "Discovery",
    emoji: "🔍",
    description:
      "Explore curiosity, spot problems, build early self-awareness through games and stories.",
  },
  {
    age: "17–19",
    label: "Direction",
    emoji: "🧭",
    description:
      "Develop entrepreneurial mindset, choose your path, get AI-powered guidance.",
  },
  {
    age: "19–22",
    label: "Development",
    emoji: "🛠️",
    description:
      "Build real skills, create MVPs, connect with mentors, start projects.",
  },
  {
    age: "22–25",
    label: "Launch",
    emoji: "🚀",
    description:
      "Validate ideas, showcase work, access funding & industry networks.",
  },
  {
    age: "25+",
    label: "Evolve",
    emoji: "🔄",
    description:
      "Scale your venture, transition careers, or reinvent yourself — with full support.",
  },
];

const JourneySection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="journey" ref={ref} className="py-24 md:py-32 gradient-dark relative overflow-hidden">
      {/* Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] gradient-glow opacity-40 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="font-body text-xs uppercase tracking-[0.2em] text-secondary font-semibold mb-4"
          >
            The Journey
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl text-primary-foreground"
          >
            A lifelong co-pilot that{" "}
            <em className="text-gradient-warm">evolves with you</em>
          </motion.h2>
        </div>

        <div className="max-w-3xl mx-auto relative">
          {/* Vertical line */}
          <div className="absolute left-6 md:left-8 top-0 bottom-0 w-px bg-secondary/20" />

          <div className="space-y-8">
            {stages.map((stage, i) => (
              <motion.div
                key={stage.label}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
                className="relative pl-16 md:pl-20"
              >
                {/* Dot */}
                <div className="absolute left-4 md:left-6 top-1 w-4 h-4 rounded-full bg-secondary border-4 border-primary" />

                <div className="bg-primary/40 backdrop-blur-sm rounded-2xl p-5 border border-secondary/10">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xl">{stage.emoji}</span>
                    <span className="font-body text-xs uppercase tracking-wider text-secondary font-semibold">
                      Age {stage.age}
                    </span>
                    <span className="font-body text-xs text-primary-foreground/50">
                      •
                    </span>
                    <span className="font-display text-lg text-primary-foreground">
                      {stage.label}
                    </span>
                  </div>
                  <p className="font-body text-sm text-primary-foreground/70 leading-relaxed">
                    {stage.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default JourneySection;
