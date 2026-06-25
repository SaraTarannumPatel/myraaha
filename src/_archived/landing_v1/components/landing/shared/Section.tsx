import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
  eyebrow?: string;
  title?: ReactNode;
  lead?: ReactNode;
  variant?: "default" | "muted" | "primary";
  id?: string;
}

const variants = {
  default: "bg-background",
  muted: "bg-secondary/40",
  primary: "bg-primary text-accent",
};

const Section = ({ children, className = "", eyebrow, title, lead, variant = "default", id }: Props) => {
  const isPrimary = variant === "primary";
  return (
    <section id={id} className={`${variants[variant]} ${className}`}>
      <div className="container mx-auto px-5 sm:px-8 py-20 sm:py-28">
        {(eyebrow || title || lead) && (
          <header className="max-w-3xl mb-12 sm:mb-16">
            {eyebrow && (
              <p
                className={`font-body text-xs uppercase tracking-[0.22em] mb-4 ${
                  isPrimary ? "text-accent/80" : "text-grey-label"
                }`}
              >
                {eyebrow}
              </p>
            )}
            {title && (
              <h2
                className={`font-display text-3xl sm:text-4xl md:text-5xl leading-[1.1] tracking-tight ${
                  isPrimary ? "text-accent" : "text-primary"
                }`}
              >
                {title}
              </h2>
            )}
            {lead && (
              <div
                className={`font-body text-base sm:text-lg leading-relaxed mt-5 ${
                  isPrimary ? "text-accent/85" : "text-foreground/75"
                }`}
              >
                {lead}
              </div>
            )}
          </header>
        )}
        {children}
      </div>
    </section>
  );
};

export default Section;
