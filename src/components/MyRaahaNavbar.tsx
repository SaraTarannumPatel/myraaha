import { Link } from "react-router-dom";

/**
 * STUB — awaiting upload of the real MyRaahaNavbar.
 * Minimal navbar so landing pages compile and remain navigable.
 */
const MyRaahaNavbar = () => (
  <nav
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      background: "#fff",
      borderBottom: "1px solid #eee",
      padding: "1rem 2rem",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      fontFamily: "Poppins, sans-serif",
    }}
  >
    <Link to="/" style={{ fontWeight: 700, color: "#5500CB", textDecoration: "none" }}>
      MyRaaha
    </Link>
    <div style={{ display: "flex", gap: "1.5rem" }}>
      <Link to="/" style={{ color: "#000", textDecoration: "none" }}>Home</Link>
      <Link to="/about" style={{ color: "#000", textDecoration: "none" }}>About</Link>
      <Link to="/services" style={{ color: "#000", textDecoration: "none" }}>Services</Link>
      <Link to="/contact" style={{ color: "#000", textDecoration: "none" }}>Contact</Link>
      <Link to="/auth" style={{ color: "#5500CB", textDecoration: "none", fontWeight: 600 }}>Sign in</Link>
    </div>
  </nav>
);

export default MyRaahaNavbar;
