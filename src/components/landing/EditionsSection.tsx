import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Briefcase, Rocket } from "lucide-react";

const editions = [
  {
    icon: Briefcase,
    title: "Careers Edition",
    subtitle: "Discover → Develop → Deploy",
    points: [
      "AI roadmaps from Class 8 to first job",
      "Living Resume that grows with you",
      "Mentor matchmaking & domain communities",
      "Virtual career coach & AI therapist",
      "Job & internship matching",
    ],
  },
  {
    icon: Rocket,
    title: "Entrepreneurship Edition",
    subtitle: "Discover → Build → Launch",
    points: [
      "Startup Sparks & Problem Spotting Lens",
      "MVP Builders & Validation Sprints",
      "Startup Creation Lab & Showcase",
      "AI Entrepreneurship Coach & Therapist",
      "Funding Path Navigator & Launchpad",
    ],
  },
];

const EditionsSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section id="careers" ref={ref} className="py-24 md:py-32 bg-background">
      <div className="container mx-auto px-6">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="font-body text-xs uppercase tracking-[0.2em] text-secondary font-semibold mb-4"
          >
            Two Paths, One Ecosystem
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-4xl md:text-5xl text-foreground"
          >
            Whether you seek a career or{" "}
            <em className="text-gradient-warm">create one</em>
          </motion.h2>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {editions.map((edition, i) => (
            <motion.div
              key={edition.title}
              initial={{ opacity: 0, y: 24 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.5 }}
              className="bg-card rounded-3xl p-8 border border-border shadow-card hover:shadow-accent/20 transition-shadow duration-500"
            >
              <div className="w-12 h-12 rounded-2xl gradient-warm flex items-center justify-center mb-5">
                <edition.icon size={22} className="text-secondary-foreground" />
              </div>
              <h3 className="font-display text-2xl text-foreground mb-1">
                {edition.title}
              </h3>
              <p className="font-body text-sm text-muted-foreground mb-6">
                {edition.subtitle}
              </p>
              <ul className="space-y-3">
                {edition.points.map((point) => (
                  <li key={point} className="flex items-start gap-3">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary mt-2 shrink-0" />
                    <span className="font-body text-sm text-muted-foreground">
                      {point}
                    </span>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default EditionsSection;
