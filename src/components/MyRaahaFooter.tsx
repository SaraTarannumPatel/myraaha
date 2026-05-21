import { Link } from "react-router-dom";

/** STUB — awaiting upload of the real MyRaahaFooter. */
const MyRaahaFooter = () => (
  <footer
    style={{
      background: "#0a0a0a",
      color: "#fff",
      padding: "3rem 2rem",
      fontFamily: "Poppins, sans-serif",
      textAlign: "center",
    }}
  >
    <p style={{ marginBottom: "1rem", fontWeight: 600, color: "#5500CB" }}>MyRaaha</p>
    <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center", marginBottom: "1rem", flexWrap: "wrap" }}>
      <Link to="/about" style={{ color: "#fff", textDecoration: "none" }}>About</Link>
      <Link to="/services" style={{ color: "#fff", textDecoration: "none" }}>Services</Link>
      <Link to="/privacy" style={{ color: "#fff", textDecoration: "none" }}>Privacy</Link>
      <Link to="/terms" style={{ color: "#fff", textDecoration: "none" }}>Terms</Link>
      <Link to="/cookies" style={{ color: "#fff", textDecoration: "none" }}>Cookies</Link>
    </div>
    <p style={{ fontSize: "0.85rem", opacity: 0.6 }}>© {new Date().getFullYear()} MyRaaha. All rights reserved.</p>
  </footer>
);

export default MyRaahaFooter;
