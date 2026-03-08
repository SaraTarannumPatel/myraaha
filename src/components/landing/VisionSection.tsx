import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import visionIllustration from "@/assets/vision-illustration.png";

const fragments = [
  "Aptitude tests on one platform",
  "Courses somewhere else",
  "Mentors on Instagram",
  "Job portals disconnected from skill-building",
  "Startup advice scattered across blogs",
  "Funding information hidden behind networks",
];

const VisionSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-24 md:py-32 bg-background overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7 }}
            className="flex justify-center"
          >
            <img
              src={visionIllustration}
              alt="Fragmented tools failing users"
              className="w-full max-w-sm"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.15 }}
          >
            <p className="font-body text-xs uppercase tracking-[0.2em] text-secondary font-semibold mb-4">
              Because The System Is Fragmented
            </p>
            <h2 className="font-display text-3xl md:text-4xl text-foreground mb-6">
              This is not a talent problem.{" "}
              <em className="text-gradient-warm">It's an infrastructure problem.</em>
            </h2>
            <div className="space-y-3 mb-8">
              {fragments.map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, x: 16 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.3 + i * 0.06 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-destructive shrink-0" />
                  <p className="font-body text-sm text-muted-foreground">{item}</p>
                </motion.div>
              ))}
            </div>
            <p className="font-body text-sm text-muted-foreground leading-relaxed">
              You are expected to connect all this yourself. And when something doesn't work, you start over. That's why people feel: <strong className="text-foreground">Late. Behind. Misaligned.</strong>
            </p>
            <p className="font-display text-lg text-foreground italic mt-6">
              So what would a real system look like?
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default VisionSection;
