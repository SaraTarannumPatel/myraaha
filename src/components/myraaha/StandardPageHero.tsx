import { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface Feature {
  icon: LucideIcon;
  label: string;
}

interface StandardPageHeroProps {
  badge?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  features?: Feature[];
}

const StandardPageHero = ({ badge, title, subtitle, features }: StandardPageHeroProps) => (
  <section
    style={{
      background: "var(--myraaha-gradient)",
      color: "white",
      padding: "6rem 5% 5rem",
      textAlign: "center",
      position: "relative",
      overflow: "hidden",
    }}
    className="standard-page-hero"
  >
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)",
        backgroundSize: "32px 32px",
        maskImage: "radial-gradient(circle at center, black, transparent 75%)",
        pointerEvents: "none",
      }}
    />
    <div style={{ maxWidth: 1100, margin: "0 auto", position: "relative", zIndex: 1 }}>
      {badge && (
        <span
          style={{
            display: "inline-block",
            background: "rgba(255,255,255,0.12)",
            color: "white",
            padding: "0.5rem 1.25rem",
            borderRadius: 99,
            fontSize: "0.8rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "1.5rem",
            border: "1px solid rgba(255,255,255,0.18)",
          }}
        >
          {badge}
        </span>
      )}
      <h1
        style={{
          color: "white",
          fontSize: "clamp(2.25rem, 5vw, 3.5rem)",
          fontWeight: 700,
          lineHeight: 1.1,
          marginBottom: "1.5rem",
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          style={{
            color: "rgba(255,255,255,0.88)",
            fontSize: "1.1rem",
            maxWidth: 820,
            margin: "0 auto",
            lineHeight: 1.6,
          }}
        >
          {subtitle}
        </p>
      )}

      {features && features.length > 0 && (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "2rem",
            flexWrap: "wrap",
            marginTop: "2.5rem",
          }}
        >
          {features.map(({ icon: Icon, label }, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                background: "rgba(255,255,255,0.08)",
                border: "1px solid rgba(255,255,255,0.16)",
                padding: "0.65rem 1.25rem",
                borderRadius: 99,
                color: "white",
                fontWeight: 500,
                fontSize: "0.95rem",
              }}
            >
              <Icon size={18} />
              {label}
            </div>
          ))}
        </div>
      )}
    </div>

    <style>{`
      .standard-page-hero h1 span {
        color: #fde68a;
        font-style: italic;
        font-weight: 700;
      }
    `}</style>
  </section>
);

export default StandardPageHero;
