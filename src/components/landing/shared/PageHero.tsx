import { ReactNode } from "react";
import { motion } from "framer-motion";

interface Props {
  eyebrow: string;
  title: ReactNode;
  intro?: ReactNode;
  align?: "left" | "center";
}

const PageHero = ({ eyebrow, title, intro, align = "left" }: Props) => {
  const alignment = align === "center" ? "items-center text-center" : "items-start text-left";
  return (
    <section className="relative overflow-hidden border-b border-border/60">
      <div className="absolute -top-32 -right-20 h-80 w-80 rounded-full bg-accent/30 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-primary/10 blur-3xl pointer-events-none" />
      <div className="container mx-auto px-5 sm:px-8 py-20 sm:py-28 md:py-36 relative">
        <div className={`flex flex-col gap-7 max-w-4xl ${alignment} ${align === "center" ? "mx-auto" : ""}`}>
          <motion.span
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="pill-chip"
          >
            {eyebrow}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-primary leading-[1.05] tracking-tight"
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
      </div>
    </section>
  );
};

export default PageHero;
