import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import discoveryImg from "@/assets/journey-discovery.png";
import directionImg from "@/assets/journey-direction.png";
import buildImg from "@/assets/journey-build.png";
import launchImg from "@/assets/journey-launch.png";
import evolveImg from "@/assets/journey-evolve.png";

const stages = [
  { age: "13–16", label: "Discovery", image: discoveryImg, description: "Explore curiosity & self-awareness" },
  { age: "17–19", label: "Direction", image: directionImg, description: "Choose your path with AI guidance" },
  { age: "19–22", label: "Development", image: buildImg, description: "Build real skills & projects" },
  { age: "22–25", label: "Launch", image: launchImg, description: "Validate, showcase & get hired" },
  { age: "25+", label: "Evolve", image: evolveImg, description: "Scale, pivot, or reinvent yourself" },
];

const JourneySection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="journey" ref={ref} className="py-24 md:py-32 gradient-dark relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] gradient-glow opacity-40 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
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
            A co-pilot that <em className="text-gradient-warm">evolves with you</em>
          </motion.h2>
        </div>

        {/* Illustrated timeline — horizontal on desktop, vertical on mobile */}
        <div className="relative max-w-5xl mx-auto">
          {/* Horizontal connector line (desktop) */}
          <div className="hidden md:block absolute top-24 left-0 right-0 h-px bg-secondary/20" />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-8 md:gap-4">
            {stages.map((stage, i) => (
              <motion.div
                key={stage.label}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: 0.2 + i * 0.12, duration: 0.5 }}
                className="flex flex-col items-center text-center"
              >
                {/* Illustration */}
                <div className="w-36 h-36 mb-4 relative">
                  <motion.img
                    src={stage.image}
                    alt={stage.label}
                    className="w-full h-full object-contain"
                    whileHover={{ scale: 1.08 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  />
                </div>

                {/* Dot on line */}
                <div className="hidden md:block w-3 h-3 rounded-full bg-secondary mb-4" />

                <span className="font-body text-[10px] uppercase tracking-wider text-secondary font-semibold">
                  Age {stage.age}
                </span>
                <h3 className="font-display text-xl text-primary-foreground mt-1">{stage.label}</h3>
                <p className="font-body text-xs text-primary-foreground/60 mt-1 leading-snug max-w-[140px]">
                  {stage.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default JourneySection;
