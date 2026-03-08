import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import visionIllustration from "@/assets/vision-illustration.png";

const VisionSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 md:py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          {/* Illustration */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="flex justify-center"
          >
            <img
              src={visionIllustration}
              alt="Telescope looking toward future possibilities"
              className="w-full max-w-sm"
            />
          </motion.div>

          {/* Copy */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <p className="font-body text-xs uppercase tracking-[0.2em] text-secondary font-semibold mb-4">
              The Vision
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-6">
              A guided, tech-first, <em className="text-gradient-warm">emotionally intelligent</em> ecosystem
            </h2>
            <div className="space-y-4 font-body text-sm text-muted-foreground leading-relaxed">
              <p>
                What if we started at <strong className="text-foreground">14, not 24</strong>? What if a student could discover who they are — not just their marks — and make informed decisions, not panic picks?
              </p>
              <p>
                We're building an ecosystem where every student gets a living resume from class 8, connects with real people and real projects, and designs a life they'll actually want to live.
              </p>
            </div>

            {/* Visual highlights */}
            <div className="grid grid-cols-2 gap-3 mt-8">
              {[
                { num: "13+", label: "Starting age" },
                { num: "6", label: "Life phases covered" },
                { num: "24/7", label: "AI co-pilot" },
                { num: "∞", label: "Evolving with you" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.08 }}
                  className="bg-muted/50 rounded-2xl p-4 text-center"
                >
                  <p className="font-display text-2xl text-gradient-warm">{stat.num}</p>
                  <p className="font-body text-xs text-muted-foreground mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default VisionSection;
