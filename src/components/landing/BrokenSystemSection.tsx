import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import brokenCareer from "@/assets/broken-career.png";
import brokenEntrepreneurship from "@/assets/broken-entrepreneurship.png";

const careerPains = [
  { text: "Career planning starts too late", color: "bg-maroon/5 border-maroon/15", icon: "text-maroon" },
  { text: "Generic tests decide your future", color: "bg-indigo/5 border-indigo/15", icon: "text-indigo" },
  { text: "No exposure, no roadmap, no clarity", color: "bg-blue/5 border-blue/15", icon: "text-blue" },
  { text: "Transitions feel risky & lonely", color: "bg-terracotta/5 border-terracotta/15", icon: "text-terracotta" },
];

const entrepreneurPains = [
  { text: "Entrepreneurship is glamorized, not demystified", color: "bg-terracotta/5 border-terracotta/15", icon: "text-terracotta" },
  { text: "No one teaches you to build — only to become", color: "bg-indigo/5 border-indigo/15", icon: "text-indigo" },
  { text: "Ideas die without validation or support", color: "bg-maroon/5 border-maroon/15", icon: "text-maroon" },
  { text: "Natural founders get buried inside jobs", color: "bg-blue/5 border-blue/15", icon: "text-blue" },
];

const BrokenSystemSection = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [activeTab, setActiveTab] = useState<"career" | "entrepreneurship">("career");

  const pains = activeTab === "career" ? careerPains : entrepreneurPains;

  return (
    <section ref={ref} className="py-20 sm:py-28 md:py-36 bg-background relative overflow-hidden">
      <div className="absolute top-8 sm:top-12 right-4 sm:right-6 md:right-12">
        <span className="font-display text-[80px] sm:text-[120px] md:text-[180px] text-muted/60 leading-none select-none">00</span>
      </div>

      <div className="container mx-auto px-5 sm:px-6 relative z-10 max-w-5xl">
        <div className="text-center mb-10 sm:mb-14">
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            className="font-body text-[10px] sm:text-xs uppercase tracking-[0.25em] text-maroon font-semibold mb-3"
          >
            The Uncomfortable Truth
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.1 }}
            className="font-display text-3xl sm:text-4xl md:text-5xl lg:text-6xl text-foreground leading-tight"
          >
            Why is the current system{" "}
            <em className="text-gradient-milestone">broken?</em>
          </motion.h2>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
          className="flex justify-center gap-2 mb-10 sm:mb-14"
        >
          {(["career", "entrepreneurship"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`font-body text-xs sm:text-sm px-5 sm:px-6 py-2.5 rounded-full border transition-all duration-300 ${
                activeTab === tab
                  ? activeTab === "career"
                    ? "bg-indigo text-white border-indigo shadow-sm"
                    : "bg-terracotta text-white border-terracotta shadow-sm"
                  : "bg-card border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "career" ? "Jobs & Careers" : "Entrepreneurship"}
            </button>
          ))}
        </motion.div>

        {activeTab === "career" && (
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              key="career-img"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative flex justify-center"
            >
              <div className="absolute -inset-8 bg-gradient-to-br from-maroon/8 via-indigo/6 to-transparent rounded-full blur-3xl" />
              <img
                src={brokenCareer}
                alt="A confused student at a crossroads"
                className="w-full max-w-[220px] sm:max-w-xs md:max-w-sm relative"
              />
            </motion.div>

            <motion.div
              key="career-content"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <p className="font-body text-sm sm:text-base text-muted-foreground leading-relaxed mb-5">
                Students finish college confused and unclear — making career choices based on{" "}
                <strong className="text-foreground">pressure, hearsay, or sheer lack of exposure.</strong>{" "}
                By the time they "figure it out," it's already too late.
              </p>
              <p className="font-body text-sm sm:text-base text-muted-foreground leading-relaxed mb-6">
                Or worse — you're 3–5 years into a job and realize:{" "}
                <em className="text-foreground">"This isn't what I want."</em>{" "}
                Especially in Tier 3, 4 & rural India, where many don't even know they're stuck until it's too late.
              </p>

              <div className="space-y-2.5">
                {pains.map((pain, i) => (
                  <motion.div
                    key={pain.text}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.07 }}
                    className={`flex items-center gap-3 ${pain.color} rounded-xl px-4 py-3 border`}
                  >
                    <span className={`${pain.icon} text-sm font-bold`}>✕</span>
                    <p className="font-body text-xs sm:text-sm text-foreground">{pain.text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        )}

        {activeTab === "entrepreneurship" && (
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <motion.div
              key="ent-content"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <p className="font-body text-sm sm:text-base text-muted-foreground leading-relaxed mb-5">
                Most people in Tier 3, 4, and rural India don't grow up knowing{" "}
                <strong className="text-foreground">entrepreneurship is a real option.</strong>{" "}
                They hear "job" or "government exam" — never "build your own thing."
              </p>
              <p className="font-body text-sm sm:text-base text-muted-foreground leading-relaxed mb-6">
                Gen Z aren't just job seekers — they're{" "}
                <em className="text-foreground">idea-seekers, freedom-lovers, and impact-hunters.</em>{" "}
                But the system never shows them how to start.
              </p>

              <div className="space-y-2.5">
                {pains.map((pain, i) => (
                  <motion.div
                    key={pain.text}
                    initial={{ opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.07 }}
                    className={`flex items-center gap-3 ${pain.color} rounded-xl px-4 py-3 border`}
                  >
                    <span className={`${pain.icon} text-sm font-bold`}>✕</span>
                    <p className="font-body text-xs sm:text-sm text-foreground">{pain.text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              key="ent-img"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="relative flex justify-center order-first lg:order-last"
            >
              <div className="absolute -inset-8 bg-gradient-to-br from-terracotta/10 via-accent/8 to-transparent rounded-full blur-3xl" />
              <img
                src={brokenEntrepreneurship}
                alt="A young person with ideas blocked by barriers"
                className="w-full max-w-[220px] sm:max-w-xs md:max-w-sm relative"
              />
            </motion.div>
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.6 }}
          className="bg-card rounded-2xl p-5 sm:p-6 border border-terracotta/20 shadow-sm max-w-lg mx-auto mt-12 sm:mt-16 text-center"
        >
          <p className="font-display text-lg sm:text-xl md:text-2xl text-foreground italic leading-snug">
            "Careers are chosen by <span className="text-gradient-milestone">chance</span>, not choice. And founders are{" "}
            <span className="text-gradient-milestone">buried</span> before they begin."
          </p>
        </motion.div>
      </div>
    </section>
  );
};

export default BrokenSystemSection;
