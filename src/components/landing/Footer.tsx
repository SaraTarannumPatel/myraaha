const Footer = () => {
  return (
    <footer className="border-t border-border py-12 bg-background">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <a href="/" className="font-display text-xl text-foreground">
              Shuttl<span className="text-gradient-warm">Ex</span>
            </a>
            <p className="font-body text-xs text-muted-foreground mt-1">
              The Future of Careers & Creation.
            </p>
          </div>
          <div className="flex items-center gap-6">
            {["Features", "Journey", "Careers", "Entrepreneurship"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="font-body text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
          <p className="font-body text-xs text-muted-foreground">
            © {new Date().getFullYear()} ShuttlEx. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
