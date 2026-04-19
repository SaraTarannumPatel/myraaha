import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

interface Props {
  eyebrow?: string;
  title: string;
  body?: string;
  primaryLabel?: string;
  primaryTo?: string;
  secondaryLabel?: string;
  secondaryTo?: string;
}

const CTABand = ({
  eyebrow = "Ready when you are",
  title,
  body,
  primaryLabel = "Begin Exploring",
  primaryTo = "/begin",
  secondaryLabel,
  secondaryTo,
}: Props) => (
  <section className="bg-primary text-accent">
    <div className="container mx-auto px-5 sm:px-8 py-20 sm:py-28">
      <div className="max-w-3xl">
        <p className="font-body text-xs uppercase tracking-[0.22em] text-accent/75 mb-5">{eyebrow}</p>
        <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-accent leading-tight">{title}</h2>
        {body && <p className="font-body text-base sm:text-lg text-accent/85 mt-5 max-w-2xl leading-relaxed">{body}</p>}
        <div className="mt-9 flex flex-col sm:flex-row gap-3">
          <Link
            to={primaryTo}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-accent text-primary px-7 py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            {primaryLabel}
            <ArrowRight size={16} />
          </Link>
          {secondaryLabel && secondaryTo && (
            <Link
              to={secondaryTo}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-accent/40 text-accent px-7 py-3.5 text-sm font-medium hover:bg-accent/10 transition-colors"
            >
              {secondaryLabel}
            </Link>
          )}
        </div>
      </div>
    </div>
  </section>
);

export default CTABand;
