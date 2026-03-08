import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import missionIllustration from "@/assets/mission-illustration.png";

const milestones = [
  { age: "22", feeling: "Lost" },
  { age: "30", feeling: "Stuck" },
  { age: "40", feeling: "Irrelevant" },
];

const MissionSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="mission" ref={ref} className="py-28 md:py-36 bg-muted/30 overflow-hidden relative">
      <div className="absolute top-12 left-6 md:left-12">
        <span className="font-display text-[120px] md:text-[180px] text-muted/30 leading-none select-none">10</span>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
          >
            <p className="font-body text-xs uppercase tracking-[0.25em] text-primary font-semibold mb-3">
              The Future MyRaaha Is Building
            </p>
            <h2 className="font-display text-4xl md:text-5xl text-foreground mb-8 leading-tight">
              Navigation became{" "}
              <em className="text-gradient-warm">structured.</em>
            </h2>

            {/* Age milestone cards */}
            <div className="flex gap-3 mb-8">
              {milestones.map((m, i) => (
                <motion.div
                  key={m.age}
                  initial={{ opacity: 0, y: 16 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.2 + i * 0.08 }}
                  className="bg-card rounded-2xl p-4 border border-border shadow-soft flex-1 text-center"
                >
                  <p className="font-display text-2xl text-foreground">{m.age}</p>
                  <p className="font-body text-xs text-destructive/80 mt-1 line-through decoration-destructive/40">
                    {m.feeling}
                  </p>
                </motion.div>
              ))}
            </div>

            <div className="space-y-4 font-body text-sm text-muted-foreground leading-relaxed">
              <p>
                Not because life became easy. But because <strong className="text-foreground">navigation became structured.</strong>
              </p>
              <p>
                One system. Full journey ownership.
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.5 }}
              className="mt-8 bg-card rounded-2xl p-6 border border-primary/20 shadow-accent/10"
            >
              <div className="flex items-center gap-3 font-display text-xl text-foreground">
                <span>Clarity</span>
                <span className="text-primary">→</span>
                <span>Direction</span>
                <span className="text-primary">→</span>
                <span>Action</span>
                <span className="text-primary">→</span>
                <span className="text-gradient-warm">Outcome</span>
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
              <div className="absolute -inset-8 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl" />
              <img
                src={missionIllustration}
                alt="Structured navigation for every stage of life"
                className="relative w-full max-w-sm"
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default MissionSection;
