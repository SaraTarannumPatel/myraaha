import { Link } from "react-router-dom";
import { useState } from "react";
import Logo from "@/components/Logo";

const cols = [
  {
    title: "Discover",
    items: [
      { to: "/why", label: "Why We Exist" },
      { to: "/how", label: "How We Think" },
      { to: "/raaha-marg", label: "Raaha × Marg" },
      { to: "/experience", label: "The Experience" },
      { to: "/when", label: "When MyRaaha Helps Most" },
    ],
  },
  {
    title: "Substance",
    items: [
      { to: "/principles", label: "Our Principles & Boundaries" },
      { to: "/research", label: "Research, Systems & Ethics" },
      { to: "/solutions", label: "Solutions" },
      { to: "/begin", label: "Begin Exploring" },
    ],
  },
  {
    title: "Org",
    items: [
      { to: "/about", label: "About" },
      { to: "/writing", label: "Writing & Reflections" },
      { to: "/careers", label: "Careers" },
      { to: "/contact", label: "Contact" },
    ],
  },
];

const LandingFooter = () => {
  const [email, setEmail] = useState("");

  return (
    <footer className="border-t border-border bg-background">
      {/* CTA — Ready to Make an Impact */}
      <div className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-5 sm:px-8 py-20 sm:py-24 text-center">
          <h2 className="font-body font-bold text-3xl sm:text-4xl md:text-5xl text-primary-foreground leading-tight max-w-4xl mx-auto">
            Ready to Make an <em className="italic font-normal">Impact?</em>
          </h2>
          <p className="font-body text-base sm:text-lg text-primary-foreground/85 mt-6 max-w-2xl mx-auto leading-relaxed">
            Join our community of innovators and changemakers and start building the future today.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent text-accent-foreground px-10 py-4 text-base font-bold hover:opacity-90 transition-opacity shadow-accent"
            >
              Apply Now
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-card text-foreground px-10 py-4 text-base font-bold hover:bg-card/90 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>

      {/* Newsletter band */}
      <div className="border-b border-border/60">
        <div className="container mx-auto px-5 sm:px-8 py-14 sm:py-20 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="font-body text-xs uppercase tracking-[0.22em] text-grey-label mb-4">
              Stay close to the thinking.
            </p>
            <h3 className="font-display text-3xl sm:text-4xl text-primary leading-tight max-w-lg">
              We write occasionally — about careers, clarity, uncertainty, and what it means to navigate with intention.
            </h3>
            <p className="font-body text-sm text-foreground/70 mt-4 max-w-md">
              No noise. No urgency. Just honest thinking.
            </p>
          </div>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              setEmail("");
            }}
            className="w-full max-w-md justify-self-start lg:justify-self-end"
          >
            <label className="block font-body text-xs text-grey-label mb-2">Your email address</label>
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="flex-1 rounded-full border border-border bg-background px-5 py-3 text-sm font-body focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                className="rounded-full bg-primary text-accent px-6 py-3 text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Receive it quietly
              </button>
            </div>
            <p className="font-body text-[11px] text-grey-meta mt-3">
              No weekly newsletters. No marketing. Only when we have something worth saying.
            </p>
          </form>
        </div>
      </div>

      <div className="container mx-auto px-5 sm:px-8 py-14 grid sm:grid-cols-2 lg:grid-cols-5 gap-10">
        <div className="lg:col-span-2">
          <Logo to="/" size="lg" />
          <p className="font-body text-sm text-foreground/70 mt-4 max-w-xs leading-relaxed">
            Your journey. At your pace.
          </p>
          <p className="font-body text-xs text-grey-meta mt-6 max-w-xs leading-relaxed">
            MyRaaha is non-profit by intent. Revenue-sustained by design. Built for India. Built to scale.
          </p>
          <p className="font-body text-xs text-grey-label mt-3 italic">
            Clarity before commitment. Direction with responsibility.
          </p>
        </div>

        {cols.map((col) => (
          <div key={col.title}>
            <p className="font-body text-[11px] uppercase tracking-[0.2em] text-primary font-semibold mb-4">
              {col.title}
            </p>
            <ul className="flex flex-col gap-2.5">
              {col.items.map((i) => (
                <li key={i.to}>
                  <Link
                    to={i.to}
                    className="font-body text-sm text-foreground/75 hover:text-primary transition-colors"
                  >
                    {i.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-border/60">
        <div className="container mx-auto px-5 sm:px-8 py-6 flex flex-col sm:flex-row gap-3 sm:gap-6 items-center justify-between">
          <p className="font-body text-[11px] text-grey-meta">
            © {new Date().getFullYear()} MyRaaha. We use minimal data to make this experience yours. Nothing sold. Nothing shared without your knowledge.
          </p>
          <div className="flex gap-5">
            <Link to="/privacy" className="font-body text-[11px] text-grey-meta hover:text-primary">Privacy Policy</Link>
            <Link to="/terms" className="font-body text-[11px] text-grey-meta hover:text-primary">Terms of Use</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default LandingFooter;
