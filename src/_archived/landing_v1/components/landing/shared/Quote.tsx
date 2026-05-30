import { ReactNode } from "react";

const Quote = ({ children, attribution }: { children: ReactNode; attribution?: string }) => (
  <figure className="relative max-w-3xl mx-auto py-10 sm:py-14">
    <span className="absolute -top-2 left-0 font-display text-7xl sm:text-8xl text-accent leading-none select-none">
      “
    </span>
    <blockquote className="pl-10 sm:pl-14 font-display text-2xl sm:text-3xl md:text-4xl text-primary leading-snug">
      {children}
    </blockquote>
    {attribution && (
      <figcaption className="pl-10 sm:pl-14 mt-4 font-body text-sm text-grey-label">
        — {attribution}
      </figcaption>
    )}
  </figure>
);

export default Quote;
