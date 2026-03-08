const Footer = () => {
  return (
    <footer className="border-t border-border py-12 bg-background">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <a href="/" className="font-display text-xl text-foreground">
              My<span className="text-gradient-warm">Raaha</span>
            </a>
            <p className="font-body text-xs text-muted-foreground mt-1">
              Career and business decisions — without guesswork.
            </p>
          </div>
          <div className="flex items-center gap-6">
            {[
              { label: "How It Works", href: "#how-it-works" },
              { label: "Who It's For", href: "#who" },
              { label: "Mission", href: "#mission" },
            ].map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
          <p className="font-body text-xs text-muted-foreground">
            © {new Date().getFullYear()} MyRaaha. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
