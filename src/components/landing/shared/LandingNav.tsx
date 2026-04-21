import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Sparkles, Compass, Map as MapIcon, Layers, Heart, BookOpen, Microscope, Briefcase, Mail, Users, Lightbulb, FileText, GraduationCap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

type NavChild = { to: string; label: string; desc: string; icon: typeof Sparkles };
type NavGroup = { label: string; children: NavChild[] };

const groups: NavGroup[] = [
  {
    label: "Philosophy",
    children: [
      { to: "/why", label: "Why We Exist", desc: "The infrastructure problem in career guidance.", icon: Heart },
      { to: "/how", label: "How We Think", desc: "Listening before answering. The 3A engine.", icon: Compass },
      { to: "/principles", label: "Principles", desc: "What we hold true and won't compromise.", icon: BookOpen },
      { to: "/raaha-marg", label: "Raaha × Marg", desc: "The rest and the road, working together.", icon: Sparkles },
    ],
  },
  {
    label: "Product",
    children: [
      { to: "/experience", label: "The Experience", desc: "What it actually feels like to use MyRaaha.", icon: MapIcon },
      { to: "/solutions", label: "Solutions", desc: "For students, professionals, founders, builders.", icon: Layers },
      { to: "/when", label: "When MyRaaha Helps", desc: "The moments this matters most.", icon: Lightbulb },
    ],
  },
  {
    label: "Company",
    children: [
      { to: "/about", label: "About", desc: "Who we are and what we're building toward.", icon: Users },
      { to: "/research", label: "Research & Ethics", desc: "How we treat your data and what we publish.", icon: Microscope },
      { to: "/writing", label: "Writing", desc: "Essays on careers, building, and clarity.", icon: FileText },
      { to: "/careers-info", label: "Careers", desc: "Help us build the system that should exist.", icon: Briefcase },
      { to: "/contact", label: "Contact", desc: "Reach out. We read everything.", icon: Mail },
    ],
  },
];

const flatLinks: NavChild[] = groups.flatMap((g) => g.children);

const LandingNav = ({ alwaysVisible = false }: { alwaysVisible?: boolean }) => {
  const [open, setOpen] = useState(false);
  const [revealed, setRevealed] = useState(alwaysVisible);
  const [scrolled, setScrolled] = useState(false);
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [mobileGroup, setMobileGroup] = useState<string | null>(null);
  const { pathname } = useLocation();

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

  useEffect(() => {
    if (pathname !== "/") setRevealed(true);
    setOpen(false);
    setActiveGroup(null);
    setMobileGroup(null);
  }, [pathname]);

  return (
    <motion.header
      initial={false}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 inset-x-0 z-50 bg-background/95 backdrop-blur-xl border-b border-border shadow-soft transition-colors"
    >
      <div className="container mx-auto px-5 sm:px-8 h-16 sm:h-20 flex items-center justify-between">
        <Link to="/" className="font-display text-2xl sm:text-3xl text-primary tracking-tight shrink-0">
          MyRaaha
        </Link>

        {/* Desktop */}
        <nav
          className="hidden lg:flex items-center gap-1"
          onMouseLeave={() => setActiveGroup(null)}
        >
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `px-3 py-2 rounded-full font-body text-[13px] tracking-wide transition-colors ${
                isActive ? "text-primary" : "text-foreground/70 hover:text-primary"
              }`
            }
          >
            Home
          </NavLink>

          {groups.map((group) => (
            <div
              key={group.label}
              className="relative"
              onMouseEnter={() => setActiveGroup(group.label)}
            >
              <button
                onClick={() => setActiveGroup(activeGroup === group.label ? null : group.label)}
                className={`px-3 py-2 rounded-full font-body text-[13px] tracking-wide inline-flex items-center gap-1.5 transition-colors ${
                  activeGroup === group.label ? "text-primary" : "text-foreground/70 hover:text-primary"
                }`}
              >
                {group.label}
                <ChevronDown size={13} className={`transition-transform ${activeGroup === group.label ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {activeGroup === group.label && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-1/2 -translate-x-1/2 top-full pt-3 w-[28rem]"
                  >
                    <div className="rounded-3xl border border-border bg-background shadow-2xl overflow-hidden">
                      <div className="p-3 grid grid-cols-1 gap-1">
                        {group.children.map((c) => (
                          <Link
                            key={c.to}
                            to={c.to}
                            className="group flex items-start gap-3 rounded-2xl p-3 hover:bg-secondary/60 transition-colors"
                          >
                            <span className="shrink-0 w-10 h-10 rounded-xl bg-accent/40 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                              <c.icon size={18} />
                            </span>
                            <span className="min-w-0">
                              <p className="font-display text-base text-primary leading-tight">{c.label}</p>
                              <p className="font-body text-xs text-foreground/65 mt-0.5 leading-snug">{c.desc}</p>
                            </span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}

          <Link
            to="/auth"
            className="ml-2 px-3 py-2 rounded-full font-body text-[13px] text-foreground/70 hover:text-primary transition-colors"
          >
            Log in
          </Link>
          <Link
            to="/begin"
            className="ml-1 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2 text-[13px] font-medium text-accent hover:opacity-90 transition-opacity"
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

      {/* Mobile */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="lg:hidden border-t border-border bg-background max-h-[calc(100vh-4rem)] overflow-y-auto"
          >
            <div className="container mx-auto px-5 py-5 flex flex-col gap-5">
              <Link
                to="/"
                onClick={() => setOpen(false)}
                className="font-body text-base font-medium text-primary py-1"
              >
                Home
              </Link>
              {groups.map((g) => (
                <div key={g.label} className="rounded-2xl border border-border bg-card overflow-hidden">
                  <button
                    onClick={() => setMobileGroup(mobileGroup === g.label ? null : g.label)}
                    className="w-full flex items-center justify-between px-4 py-3 text-left"
                  >
                    <span className="font-body text-[11px] uppercase tracking-[0.22em] text-grey-label">{g.label}</span>
                    <ChevronDown size={15} className={`text-primary transition-transform ${mobileGroup === g.label ? "rotate-180" : ""}`} />
                  </button>
                  <AnimatePresence initial={false}>
                    {mobileGroup === g.label && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="flex flex-col gap-1 px-3 pb-3">
                          {g.children.map((c) => (
                            <Link
                              key={c.to}
                              to={c.to}
                              onClick={() => setOpen(false)}
                              className="flex items-start gap-3 rounded-xl py-2.5 px-1 hover:bg-secondary/60 transition-colors"
                            >
                              <span className="w-8 h-8 rounded-lg bg-accent/40 flex items-center justify-center text-primary shrink-0">
                                <c.icon size={15} />
                              </span>
                              <span className="min-w-0">
                                <p className="font-body text-sm text-foreground">{c.label}</p>
                                <p className="font-body text-[11px] text-foreground/55 leading-snug">{c.desc}</p>
                              </span>
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
              <div className="pt-3 border-t border-border flex flex-col gap-2">
                <Link
                  to="/auth"
                  onClick={() => setOpen(false)}
                  className="text-center rounded-full border border-primary/30 text-primary px-5 py-3 text-sm font-medium"
                >
                  Log in
                </Link>
                <Link
                  to="/begin"
                  onClick={() => setOpen(false)}
                  className="text-center rounded-full bg-primary text-accent px-5 py-3 text-sm font-medium"
                >
                  Begin Exploring
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default LandingNav;
export { flatLinks };
