import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Logo from "@/components/Logo";

const links: { to: string; label: string }[] = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/solutions", label: "Services" },
  { to: "/raaha-marg", label: "Partnerships" },
  { to: "/careers-info", label: "Careers" },
  { to: "/writing", label: "Insights" },
  { to: "/contact", label: "Contact" },
];

const LandingNav = ({ alwaysVisible = true }: { alwaysVisible?: boolean }) => {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  return (
    <motion.header
      initial={false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="fixed top-0 inset-x-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border"
    >
      <div className="container mx-auto px-5 sm:px-8 h-16 sm:h-20 flex items-center justify-between">
        <Logo to="/" size="md" />

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === "/"}
              className={({ isActive }) =>
                `relative px-4 py-2 font-body text-sm font-medium tracking-wide transition-colors ${
                  isActive ? "text-primary" : "text-foreground/70 hover:text-primary"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {l.label}
                  {isActive && (
                    <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 bg-primary rounded-full" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          <Link
            to="/auth"
            className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-accent hover:opacity-90 transition-opacity shadow-accent"
          >
            Partner Portal
          </Link>
        </div>

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
            <div className="container mx-auto px-5 py-5 flex flex-col gap-1">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  end={l.to === "/"}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `font-body text-base py-2.5 px-3 rounded-lg ${
                      isActive ? "text-primary bg-secondary/60 font-semibold" : "text-foreground/80"
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="mt-3 text-center rounded-full bg-primary text-accent px-5 py-3 text-sm font-semibold"
              >
                Partner Portal
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default LandingNav;
export const flatLinks = links.map((l) => ({ to: l.to, label: l.label, desc: "", icon: Menu }));
