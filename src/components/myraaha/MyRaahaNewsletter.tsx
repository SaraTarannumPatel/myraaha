import { useState } from "react";
import { Send } from "lucide-react";

const MyRaahaNewsletter = () => {
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  return (
    <section
      style={{
        background: "var(--myraaha-bg-grey)",
        padding: "var(--section-spacing) 5%",
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: "0 auto",
          background: "var(--myraaha-gradient)",
          borderRadius: 40,
          padding: "4.5rem 3rem",
          textAlign: "center",
          color: "white",
          boxShadow: "0 30px 60px rgba(85,0,203,0.18)",
        }}
        className="myraaha-newsletter"
      >
        <span
          style={{
            display: "inline-block",
            background: "rgba(255,255,255,0.15)",
            color: "white",
            padding: "0.5rem 1.25rem",
            borderRadius: 99,
            fontSize: "0.8rem",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "1.5rem",
          }}
        >
          Stay in the loop
        </span>
        <h2 style={{ color: "white", fontSize: "clamp(1.75rem, 4vw, 2.75rem)", marginBottom: "1rem" }}>
          Insights, slow-cooked. <span style={{ fontStyle: "italic", color: "white", opacity: 0.85 }}>Once a month.</span>
        </h2>
        <p style={{ color: "rgba(255,255,255,0.85)", maxWidth: 580, margin: "0 auto 2.5rem", fontSize: "1.05rem" }}>
          Honest writing on careers, building, and what we're learning while building MyRaaha.
        </p>

        {done ? (
          <p style={{ color: "white", fontWeight: 600 }}>Thanks — we'll be in touch.</p>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setDone(true);
            }}
            style={{
              display: "flex",
              gap: "0.75rem",
              maxWidth: 500,
              margin: "0 auto",
              flexWrap: "wrap",
              justifyContent: "center",
            }}
          >
            <input
              required
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                flex: "1 1 240px",
                padding: "1rem 1.25rem",
                borderRadius: 99,
                border: 0,
                fontFamily: "Poppins, sans-serif",
                fontSize: "0.95rem",
                background: "rgba(255,255,255,0.95)",
                color: "var(--myraaha-text-dark)",
                outline: "none",
              }}
            />
            <button
              type="submit"
              style={{
                background: "white",
                color: "var(--myraaha-blue)",
                padding: "1rem 1.75rem",
                borderRadius: 99,
                border: 0,
                fontWeight: 700,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
            >
              <Send size={16} /> Subscribe
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default MyRaahaNewsletter;
