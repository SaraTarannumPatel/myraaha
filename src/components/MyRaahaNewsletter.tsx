import { useState } from "react";

/** STUB — awaiting upload of the real MyRaahaNewsletter. */
const MyRaahaNewsletter = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  return (
    <section
      style={{
        background: "linear-gradient(135deg, #5500CB 0%, #7c3aed 100%)",
        color: "#fff",
        padding: "4rem 2rem",
        textAlign: "center",
        fontFamily: "Poppins, sans-serif",
      }}
    >
      <h2 style={{ fontSize: "2rem", fontWeight: 600, marginBottom: "1rem" }}>
        Stay in the loop
      </h2>
      <p style={{ opacity: 0.9, marginBottom: "2rem" }}>
        Insights, updates, and stories from the MyRaaha team.
      </p>
      {submitted ? (
        <p style={{ fontWeight: 600 }}>Thanks! We'll be in touch.</p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (email) setSubmitted(true);
          }}
          style={{ display: "flex", justifyContent: "center", gap: "0.5rem", flexWrap: "wrap" }}
        >
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{
              padding: "0.75rem 1.25rem",
              borderRadius: 99,
              border: "none",
              minWidth: 280,
              fontSize: "1rem",
            }}
          />
          <button
            type="submit"
            style={{
              padding: "0.75rem 2rem",
              borderRadius: 99,
              background: "#fff",
              color: "#5500CB",
              border: "none",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Subscribe
          </button>
        </form>
      )}
    </section>
  );
};

export default MyRaahaNewsletter;
