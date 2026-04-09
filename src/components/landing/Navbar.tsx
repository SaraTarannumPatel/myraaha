import { useState } from "react";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const navItems = [
    { label: "Problem", href: "#problem" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Who It's For", href: "#who" },
    { label: "Mission", href: "#mission" },
  ];

  return (
    <motion.nav
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-background/80 border-b border-border"
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <a href="/" className="font-display text-2xl tracking-tight text-foreground">
          My<span className="text-gradient-warm">Raaha</span>
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={item.href}
              className="text-sm font-body font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.label}
            </a>
          ))}
          <Link
            to="/auth"
            className="text-sm font-body font-medium text-foreground hover:text-primary transition-colors"
          >
            Log In
          </Link>
          <Link
            to="/intro"
            className="gradient-warm text-primary-foreground px-5 py-2 rounded-full text-sm font-body font-semibold shadow-accent hover:opacity-90 transition-opacity"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="md:hidden text-foreground"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          className="md:hidden bg-card border-b border-border"
        >
          <div className="px-6 py-4 flex flex-col gap-4">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-body font-medium text-muted-foreground"
                onClick={() => setIsOpen(false)}
              >
                {item.label}
              </a>
            ))}
            <Link
              to="/auth"
              className="text-sm font-body font-medium text-foreground"
              onClick={() => setIsOpen(false)}
            >
              Log In
            </Link>
            <Link
              to="/intro"
              className="gradient-warm text-primary-foreground px-5 py-2.5 rounded-full text-sm font-body font-semibold w-full text-center"
              onClick={() => setIsOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </motion.div>
      )}
    </motion.nav>
  );
};

export default Navbar;
