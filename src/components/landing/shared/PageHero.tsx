import { ReactNode } from "react";
import { motion } from "framer-motion";

interface Props {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
  illustration?: string;
  illustrationAlt?: string;
}

const PageHero = ({ eyebrow, title, intro, align = "left", illustration, illustrationAlt }: Props) => {
  const hasIllustration = !!illustration;
  const alignment = align === "center" || hasIllustration ? "items-start text-left" : "items-start text-left";

  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="absolute -top-32 -right-20 h-80 w-80 rounded-full bg-accent/30 blur-3xl pointer-events-none hidden sm:block" />
      <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl pointer-events-none hidden sm:block" />

      {/* Decorative SVG dots pattern */}
      <svg className="absolute top-10 right-10 w-32 h-32 opacity-20 pointer-events-none hidden sm:block" viewBox="0 0 100 100" fill="none">
        <pattern id="hero-dots" x="0" y="0" width="10" height="10" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1" className="fill-primary" />
        </pattern>
        <rect width="100" height="100" fill="url(#hero-dots)" />
      </svg>

      <div className="container mx-auto px-5 sm:px-8 py-16 sm:py-24 md:py-28 relative">
        <div className={`grid ${hasIllustration ? "lg:grid-cols-12 gap-10 lg:gap-16 items-center" : ""}`}>
          <div className={`flex flex-col gap-6 sm:gap-7 ${hasIllustration ? "lg:col-span-7" : "max-w-4xl"} ${alignment}`}>
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="pill-chip w-fit"
            >
              {eyebrow}
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-primary leading-[1.05] tracking-tight break-words"
            >
              {title}
            </motion.h1>
            {intro && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="font-body text-base sm:text-lg text-foreground/75 max-w-2xl leading-relaxed"
              >
                {intro}
              </motion.div>
            )}
          </div>

          {hasIllustration && (
            <div className="lg:col-span-5 relative">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="relative"
              >
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                  className="relative"
                >
                  <div className="absolute inset-0 -m-4 rounded-3xl bg-accent/30 blur-2xl pointer-events-none" />
                  <img
                    src={illustration}
                    alt={illustrationAlt || ""}
                    className="relative w-full max-w-md mx-auto rounded-3xl shadow-soft object-cover"
                    width={1280}
                    height={896}
                    loading="eager"
                  />
                </motion.div>

                {/* Decorative floating dot */}
                <motion.span
                  className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-accent shadow-lg hidden sm:block"
                  animate={{ scale: [1, 1.3, 1] }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                />
                <motion.span
                  className="absolute -bottom-3 -left-3 w-3 h-3 rounded-full bg-primary hidden sm:block"
                  animate={{ scale: [1, 1.4, 1] }}
                  transition={{ duration: 3, repeat: Infinity, delay: 0.5 }}
                />
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default PageHero;
