import { ReactNode } from "react";

interface Feature {
  icon?: ReactNode;
  label?: string;
}

interface StandardPageHeroProps {
  badge?: ReactNode;
  title: ReactNode;
  subtitle?: ReactNode;
  features?: Feature[];
}

/** STUB — awaiting upload of the real StandardPageHero. */
const StandardPageHero = ({ badge, title, subtitle, features = [] }: StandardPageHeroProps) => (
  <section className="standard-page-hero" style={{
    background: "var(--myraaha-gradient, linear-gradient(135deg, #5500CB 0%, #7c3aed 100%))",
    color: "#fff",
    padding: "5rem 2rem",
    textAlign: "center",
    fontFamily: "Poppins, sans-serif",
  }}>
    {badge && (
      <span style={{
        display: "inline-block",
        background: "rgba(255,255,255,0.15)",
        backdropFilter: "blur(10px)",
        padding: "0.5rem 1.5rem",
        borderRadius: 99,
        fontSize: "0.85rem",
        fontWeight: 600,
        marginBottom: "1.5rem",
        border: "1px solid rgba(255,255,255,0.2)",
      }}>{badge}</span>
    )}
    <h1 style={{ fontSize: "3rem", fontWeight: 600, lineHeight: 1.1, marginBottom: "1.5rem" }}>
      {title}
    </h1>
    {subtitle && (
      <p style={{ fontSize: "1.1rem", opacity: 0.9, maxWidth: 850, margin: "0 auto 2rem" }}>
        {subtitle}
      </p>
    )}
    {features.length > 0 && (
      <div style={{ display: "flex", justifyContent: "center", gap: "2rem", flexWrap: "wrap" }}>
        {features.map((f, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: "0.5rem", fontSize: "0.9rem", fontWeight: 500 }}>
            {f.icon}{f.label}
          </div>
        ))}
      </div>
    )}
  </section>
);

export default StandardPageHero;
