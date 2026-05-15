import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";

const links = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/solutions", label: "Services" },
  { to: "/raaha-marg", label: "Partnerships" },
  { to: "/careers-info", label: "Careers" },
  { to: "/writing", label: "Insights" },
  { to: "/contact", label: "Contact" },
];

const MyRaahaNavbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className="myraaha-navbar"
      style={{
        position: "sticky",
        top: 0,
        zIndex: 50,
        background: scrolled ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.85)",
        backdropFilter: "blur(18px)",
        borderBottom: "1px solid #f1f5f9",
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "1rem 5%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "1rem",
        }}
      >
        <Link
          to="/"
          style={{
            fontFamily: "Poppins, sans-serif",
            fontSize: "1.4rem",
            fontWeight: 800,
            color: "var(--myraaha-blue)",
            textDecoration: "none",
            letterSpacing: "-0.02em",
          }}
        >
          MyRaaha
        </Link>

        <nav className="myraaha-nav-desktop" style={{ display: "none", gap: "0.5rem" }}>
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              style={({ isActive }) => ({
                padding: "0.5rem 1rem",
                fontFamily: "Poppins, sans-serif",
                fontSize: "0.95rem",
                fontWeight: 500,
                color: isActive ? "var(--myraaha-blue)" : "var(--myraaha-text-dark)",
                textDecoration: "none",
                borderRadius: 10,
                background: isActive ? "var(--myraaha-blue-light)" : "transparent",
                transition: "all 0.2s",
              })}
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <Link
            to="/auth"
            className="myraaha-nav-cta"
            style={{
              display: "none",
              alignItems: "center",
              gap: "0.5rem",
              background: "var(--myraaha-blue)",
              color: "white",
              padding: "0.7rem 1.6rem",
              borderRadius: 99,
              fontWeight: 600,
              fontSize: "0.9rem",
              textDecoration: "none",
              boxShadow: "0 8px 20px rgba(85,0,203,0.2)",
            }}
          >
            Partner Portal
          </Link>

          <button
            aria-label="Open menu"
            onClick={() => setOpen((v) => !v)}
            className="myraaha-nav-burger"
            style={{
              background: "transparent",
              border: 0,
              color: "var(--myraaha-blue)",
              cursor: "pointer",
            }}
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {open && (
        <div
          style={{
            borderTop: "1px solid #f1f5f9",
            background: "white",
            padding: "1rem 5%",
            display: "flex",
            flexDirection: "column",
            gap: "0.25rem",
          }}
        >
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              onClick={() => setOpen(false)}
              style={({ isActive }) => ({
                padding: "0.85rem 1rem",
                fontFamily: "Poppins, sans-serif",
                fontWeight: 500,
                color: isActive ? "var(--myraaha-blue)" : "var(--myraaha-text-dark)",
                textDecoration: "none",
                borderRadius: 10,
                background: isActive ? "var(--myraaha-blue-light)" : "transparent",
              })}
            >
              {l.label}
            </NavLink>
          ))}
          <Link
            to="/auth"
            onClick={() => setOpen(false)}
            style={{
              marginTop: "0.5rem",
              textAlign: "center",
              background: "var(--myraaha-blue)",
              color: "white",
              padding: "0.85rem 1rem",
              borderRadius: 99,
              fontWeight: 600,
              textDecoration: "none",
            }}
          >
            Partner Portal
          </Link>
        </div>
      )}

      <style>{`
        @media (min-width: 1024px) {
          .myraaha-nav-desktop { display: flex !important; }
          .myraaha-nav-cta { display: inline-flex !important; }
          .myraaha-nav-burger { display: none !important; }
        }
      `}</style>
    </header>
  );
};

export default MyRaahaNavbar;
