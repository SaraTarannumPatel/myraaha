import { Link } from "react-router-dom";
import { Linkedin, Twitter, Instagram, Mail } from "lucide-react";

const cols = [
  {
    title: "Platform",
    links: [
      { label: "Services", to: "/solutions" },
      { label: "Partnerships", to: "/raaha-marg" },
      { label: "Careers", to: "/careers-info" },
      { label: "Insights", to: "/writing" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", to: "/about" },
      { label: "Team", to: "/team" },
      { label: "Contact", to: "/contact" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy", to: "/privacy" },
      { label: "Terms", to: "/terms" },
    ],
  },
];

const MyRaahaFooter = () => (
  <footer
    style={{
      background: "#0f172a",
      color: "white",
      padding: "5rem 5% 2.5rem",
    }}
  >
    <div style={{ maxWidth: 1400, margin: "0 auto" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "2fr repeat(3, 1fr)",
          gap: "3rem",
          marginBottom: "4rem",
        }}
        className="myraaha-footer-grid"
      >
        <div>
          <h3 style={{ color: "white", fontSize: "1.5rem", fontWeight: 800, marginBottom: "1rem" }}>
            MyRaaha
          </h3>
          <p style={{ color: "rgba(255,255,255,0.7)", lineHeight: 1.6, maxWidth: 360 }}>
            An empathetic navigation system that scales career and entrepreneurship guidance
            through data-driven insights — built for Bharat.
          </p>
          <div style={{ display: "flex", gap: "0.75rem", marginTop: "1.5rem" }}>
            {[Linkedin, Twitter, Instagram, Mail].map((Icon, i) => (
              <a
                key={i}
                href="#"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  background: "rgba(255,255,255,0.06)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  textDecoration: "none",
                }}
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>

        {cols.map((c) => (
          <div key={c.title}>
            <h4
              style={{
                color: "white",
                fontSize: "0.85rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                marginBottom: "1.25rem",
              }}
            >
              {c.title}
            </h4>
            <ul style={{ listStyle: "none", padding: 0, display: "flex", flexDirection: "column", gap: "0.85rem" }}>
              {c.links.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    style={{
                      color: "rgba(255,255,255,0.7)",
                      textDecoration: "none",
                      fontSize: "0.95rem",
                    }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div
        style={{
          borderTop: "1px solid rgba(255,255,255,0.08)",
          paddingTop: "2rem",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          gap: "1rem",
          color: "rgba(255,255,255,0.5)",
          fontSize: "0.85rem",
        }}
      >
        <span>© {new Date().getFullYear()} MyRaaha. All rights reserved.</span>
        <span>Built with empathy for Bharat.</span>
      </div>
    </div>

    <style>{`
      @media (max-width: 900px) {
        .myraaha-footer-grid { grid-template-columns: 1fr 1fr !important; }
      }
      @media (max-width: 560px) {
        .myraaha-footer-grid { grid-template-columns: 1fr !important; gap: 2rem !important; }
      }
    `}</style>
  </footer>
);

export default MyRaahaFooter;
