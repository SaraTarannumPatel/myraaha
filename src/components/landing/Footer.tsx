import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border py-12 sm:py-16 bg-background">
      <div className="container mx-auto px-5 sm:px-6">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8 sm:gap-10 items-start">
          {/* Brand */}
          <div>
            <a href="/" className="font-display text-xl sm:text-2xl text-foreground">
              My<span className="text-gradient-warm">Raaha</span>
            </a>
            <p className="font-body text-xs sm:text-sm text-muted-foreground mt-2 max-w-xs leading-relaxed">
              Career and business decisions — without guesswork. Soft direction. Real outcomes.
            </p>
          </div>

          {/* Nav */}
          <div className="flex flex-col gap-2 sm:gap-3">
            <p className="font-body text-[10px] sm:text-xs uppercase tracking-wider text-primary font-semibold mb-1">Navigate</p>
            {[
              { label: "How It Works", href: "#how-it-works" },
              { label: "Who It's For", href: "#who" },
              { label: "Mission", href: "#mission" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="font-body text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 sm:gap-3">
            <p className="font-body text-[10px] sm:text-xs uppercase tracking-wider text-primary font-semibold mb-1">Get Started</p>
            <Link
              to="/get-started"
              className="font-body text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Start Your Journey
            </Link>
            <Link
              to="/auth"
              className="font-body text-xs sm:text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Log In
            </Link>
          </div>
        </div>

        <div className="border-t border-border mt-10 sm:mt-12 pt-6 sm:pt-8 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
          <p className="font-body text-[10px] sm:text-xs text-grey-meta">
            © {new Date().getFullYear()} MyRaaha. All rights reserved.
          </p>
          <p className="font-body text-[10px] sm:text-xs text-grey-meta">
            Clarity → Direction → Action → Outcome
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;