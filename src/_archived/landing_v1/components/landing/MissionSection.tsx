import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import missionIllustration from "@/assets/mission-illustration.png";

const milestones = [
  { age: "22", feeling: "Lost", color: "border-blue/20 bg-blue/5" },
  { age: "30", feeling: "Stuck", color: "border-terracotta/20 bg-terracotta/5" },
  { age: "40", feeling: "Irrelevant", color: "border-maroon/20 bg-maroon/5" },
];

const MissionSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="mission" ref={ref} className="py-20 sm:py-28 md:py-36 bg-background-alt overflow-hidden relative">
      <div className="absolute top-8 sm:top-12 left-4 sm:left-6 md:left-12">
        <span className="font-display text-[80px] sm:text-[120px] md:text-[180px] text-grey-divider/30 leading-none select-none">10</span>
      </div>

      <div className="container mx-auto px-5 sm:px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 sm:gap-16 items-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <p className="font-body text-[10px] sm:text-xs uppercase tracking-[0.25em] text-maroon font-semibold mb-3">
              The Future MyRaaha Is Building
            </p>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-foreground mb-6 sm:mb-8 leading-tight">
              Navigation became{" "}
              <em className="text-gradient-milestone">structured.</em> finally.
            </h2>

            <div className="flex gap-2 sm:gap-3 mb-6 sm:mb-8">
              {milestones.map((m, i) => (
                <motion.div
                  key={m.age}
                  initial={{ opacity: 0, y: 16 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className={`${m.color} rounded-xl sm:rounded-2xl p-3 sm:p-4 border shadow-soft flex-1 text-center`}
                >
                  <p className="font-display text-xl sm:text-2xl text-foreground">{m.age}</p>
                  <p className="font-body text-[10px] sm:text-xs text-destructive/80 mt-1 line-through decoration-destructive/40">
                    {m.feeling}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="space-y-3 sm:space-y-4 font-body text-xs sm:text-sm text-muted-foreground leading-relaxed">
              <p>
                Not because life got easier lol. But because <strong className="text-foreground">navigation became structured.</strong>
              </p>
              <p>
                One system. Full journey ownership. that's the glow up.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5 }}
              className="mt-6 sm:mt-8 bg-card rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-border shadow-soft"
            >
              <div className="flex items-center gap-2 sm:gap-3 font-display text-base sm:text-xl text-foreground flex-wrap">
                <span>Clarity</span>
                <span className="text-blue">→</span>
                <span>Direction</span>
                <span className="text-terracotta">→</span>
                <span>Action</span>
                <span className="text-maroon">→</span>
                <span className="text-gradient-milestone">Outcome 🔥</span>
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
            className="flex justify-center"
          >
            <div className="relative">
              <div className="absolute -inset-8 bg-gradient-to-br from-warmth/10 via-maroon/8 to-blue/6 rounded-full blur-3xl" />
              <img
                src={missionIllustration}
                alt="Structured navigation for every stage of life"
                className="relative w-full max-w-[240px] sm:max-w-xs md:max-w-md"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
