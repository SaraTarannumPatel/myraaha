import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const primary = [
  { to: "/why", label: "Why We Exist" },
  { to: "/how", label: "How We Think" },
  { to: "/raaha-marg", label: "Raaha × Marg" },
  { to: "/experience", label: "The Experience" },
];

const secondary = [
  { to: "/when", label: "When MyRaaha Helps" },
  { to: "/principles", label: "Principles" },
  { to: "/research", label: "Research & Ethics" },
  { to: "/solutions", label: "Solutions" },
  { to: "/about", label: "About" },
  { to: "/writing", label: "Writing" },
  { to: "/careers", label: "Careers" },
  { to: "/contact", label: "Contact" },
];

const LandingNav = ({ alwaysVisible = false }: { alwaysVisible?: boolean }) => {
  const [open, setOpen] = useState(false);
  const [revealed, setRevealed] = useState(alwaysVisible);
  const [scrolled, setScrolled] = useState(false);
  const { pathname } = useLocation();

  // Reveal nav after the user scrolls past first three "chapters" (≈ 1600px)
  useEffect(() => {
    if (alwaysVisible) return;
    const onScroll = () => {
      setScrolled(window.scrollY > 60);
      if (window.scrollY > 1600) setRevealed(true);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [alwaysVisible]);

  // Always show on non-home pages
  useEffect(() => {
    if (pathname !== "/") setRevealed(true);
  }, [pathname]);

  return (
    <motion.header
      initial={false}
      animate={{ opacity: revealed ? 1 : 0.35 }}
      transition={{ duration: 0.6 }}
      className={`fixed top-0 inset-x-0 z-50 transition-colors ${
        scrolled || pathname !== "/"
          ? "bg-background/85 backdrop-blur-xl border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="container mx-auto px-5 sm:px-8 h-16 sm:h-20 flex items-center justify-between">
        <Link to="/" className="font-display text-2xl sm:text-3xl text-primary tracking-tight">
          MyRaaha
        </Link>

        <nav className="hidden lg:flex items-center gap-7">
          {primary.map((i) => (
            <NavLink
              key={i.to}
              to={i.to}
              className={({ isActive }) =>
                `font-body text-[13px] tracking-wide transition-colors ${
                  isActive ? "text-primary" : "text-foreground/70 hover:text-primary"
                }`
              }
            >
              {i.label}
            </NavLink>
          ))}
          <Link
            to="/begin"
            className="ml-2 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-[13px] font-medium text-accent hover:opacity-90 transition-opacity"
          >
            Begin Exploring
          </Link>
        </nav>

        <button
          aria-label="Open menu"
          className="lg:hidden text-primary"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="lg:hidden border-t border-border bg-background"
          >
            <div className="container mx-auto px-5 py-6 flex flex-col gap-1">
              {[...primary, ...secondary].map((i) => (
                <NavLink
                  key={i.to}
                  to={i.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `font-body text-base py-2.5 border-b border-border/60 ${
                      isActive ? "text-primary" : "text-foreground/80"
                    }`
                  }
                >
                  {i.label}
                </NavLink>
              ))}
              <Link
                to="/begin"
                onClick={() => setOpen(false)}
                className="mt-4 inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-medium text-accent"
              >
                Begin Exploring
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default LandingNav;
