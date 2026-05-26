import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ChevronDown, Menu, X, Mail } from 'lucide-react';

export function FadeInView({ children, className = "", delay = 0, direction = "up" }: { children: React.ReactNode, className?: string, delay?: number, direction?: "up" | "down" | "left" | "right" | "none" }) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setIsVisible(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });

    if (ref.current) {
      observer.observe(ref.current);
    }
    return () => observer.disconnect();
  }, []);

  const getDirectionClasses = () => {
    if (isVisible) return 'opacity-100 translate-x-0 translate-y-0';
    switch (direction) {
      case 'up': return 'opacity-0 translate-y-10';
      case 'down': return 'opacity-0 -translate-y-10';
      case 'left': return 'opacity-0 translate-x-10';
      case 'right': return 'opacity-0 -translate-x-10';
      case 'none': return 'opacity-0';
      default: return 'opacity-0 translate-y-10';
    }
  };

  return (
    <div
      ref={ref}
      className={`transition-all duration-1000 ease-out fill-mode-forwards ${getDirectionClasses()} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

const NavigationBar = () => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { title: 'Home', path: '/' },
    { 
      title: 'About', 
      items: [
        { title: 'About us', path: '/about' },
        { title: 'Principles', path: '/principles' },
        { title: 'Research & systems', path: '/research' },
      ]
    },
    {
      title: 'Platform',
      items: [
        { title: 'Solutions', path: '/solutions' },
        { title: 'The experience', path: '/experience' },
        { title: 'How we think', path: '/how-we-think' },
      ]
    },
    {
      title: 'Philosophy',
      items: [
        { title: 'Why we exist', path: '/why-we-exist' },
        { title: 'Raaha × Marg', path: '/raaha-marg' },
      ]
    },
    {
      title: 'Insights',
      items: [
        { title: 'Writing & reflections', path: '/reflections' },
        { title: 'When it helps most', path: '/when-helps-most' },
      ]
    },
    { title: 'Careers', path: '/careers' },
    { title: 'Contact Us', path: '/contact' }
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 text-black/60 p-4 md:px-12 lg:px-20 backdrop-blur-md border-b border-remaining bg-white/90">
      <div className="max-w-[1500px] mx-auto flex items-center justify-between tracking-wide">
        <Link to="/" className="text-2xl md:text-3xl font-bold text-primary tracking-tighter">MyRaaha</Link>
        <div className="hidden lg:flex gap-2 items-center">
          {navItems.map((item, idx) => (
            <div 
              key={idx} 
              className="relative group px-4 py-2"
              onMouseEnter={() => setOpenDropdown(item.title)}
              onMouseLeave={() => setOpenDropdown(null)}
            >
              {item.items ? (
                <button className="flex items-center gap-1 hover:text-primary transition-colors cursor-pointer type-ui-nav">
                  {item.title} <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${openDropdown === item.title ? 'rotate-180 text-primary' : ''}`} />
                </button>
              ) : (
                <Link to={item.path} className="hover:text-primary transition-colors type-ui-nav">{item.title}</Link>
              )}
              
              {item.items && (
                <div 
                  className={`absolute top-full left-1/2 -translate-x-1/2 pt-4 w-64 transition-all duration-300 origin-top opacity-0 translate-y-2 pointer-events-none group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto`}
                >
                  <div className="bg-white border border-remaining rounded-[24px] shadow-2xl p-3 flex flex-col gap-1">
                    {item.items.map((sub, i) => (
                      <Link key={i} to={sub.path} className="px-4 py-3 rounded-xl hover:bg-primary/5 hover:text-primary transition-colors flex items-center justify-between group type-ui-nav">
                        <span>{sub.title}</span>
                        <ArrowRight className="w-3 h-3 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-primary" />
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="hidden lg:flex items-center gap-4">
          <Link to="/begin" className="group flex items-center gap-2 bg-primary text-highlight px-3 py-1 rounded-full hover:scale-105 transition-all shadow-lg text-sm font-medium hover:shadow-primary/20">
            Begin exploring
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <button className="lg:hidden p-2 text-primary" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-full left-0 right-0 bg-white border-b border-remaining shadow-2xl flex flex-col max-h-[80vh] overflow-y-auto pb-10">
          {navItems.map((item, idx) => (
            <div key={idx} className="border-b border-remaining/50 p-4">
              {item.items ? (
                <div>
                  <button 
                    onClick={() => setOpenDropdown(openDropdown === item.title ? null : item.title)}
                    className="flex items-center justify-between w-full type-h3 text-primary"
                  >
                    {item.title} <ChevronDown className={`w-5 h-5 transition-transform ${openDropdown === item.title ? 'rotate-180' : ''}`} />
                  </button>
                  {openDropdown === item.title && (
                    <div className="flex flex-col gap-2 mt-4 pl-4 border-l-2 border-primary/20">
                      {item.items.map((sub, i) => (
                        <Link 
                          key={i} 
                          to={sub.path} 
                          className="py-3 text-black/70 hover:text-primary transition-colors flex items-center gap-3 type-body-primary"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                           <ArrowRight className="w-3 h-3 opacity-50 text-highlight" /> {sub.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                <Link to={item.path} className="type-h3 text-primary block" onClick={() => setMobileMenuOpen(false)}>{item.title}</Link>
              )}
            </div>
          ))}
          <div className="p-6">
            <Link to="/begin" onClick={() => setMobileMenuOpen(false)} className="flex items-center justify-center gap-2 bg-primary text-highlight px-4 py-2 rounded-full shadow-lg type-ui-button w-full">
              Begin Exploring
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
};


const Footer = () => (
  <footer className="bg-primary text-white py-20 md:py-32 px-6 md:px-12 lg:px-20 border-t-8 border-highlight relative overflow-hidden">
    {/* Abstract Background element */}
    <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-highlight/10 rounded-full blur-[100px] translate-y-1/2 translate-x-1/2 pointer-events-none" />
    
    <div className="max-w-[1500px] mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 md:gap-8 relative z-10">
      
      <div className="md:col-span-4 space-y-6">
        <Link to="/" className="type-hero text-highlight hover:text-white transition-colors tracking-tighter block mb-6">
          MyRaaha
        </Link>
        <p className="type-body-primary text-white/80 leading-relaxed max-w-sm">
          A navigation infrastructure balancing human judgment with behavioral intelligence. Because clarity is not a race.
        </p>
        <div className="pt-8">
           <a href="mailto:contact@myraaha.org" className="inline-flex items-center gap-3 text-white hover:text-highlight transition-colors type-ui-nav">
             <Mail className="w-5 h-5" /> contact@myraaha.org
           </a>
        </div>
      </div>

      <div className="md:col-span-8 flex flex-wrap md:justify-end gap-12 md:gap-24">
         <div>
            <h4 className="type-ui-meta text-white mb-6 opacity-60">About</h4>
            <ul className="space-y-4">
               <li><Link to="/about" className="text-white/70 hover:text-highlight transition-colors type-ui-nav">About us</Link></li>
               <li><Link to="/principles" className="text-white/70 hover:text-highlight transition-colors type-ui-nav">Principles</Link></li>
               <li><Link to="/research" className="text-white/70 hover:text-highlight transition-colors type-ui-nav">Research</Link></li>
            </ul>
         </div>
         <div>
            <h4 className="type-ui-meta text-white mb-6 opacity-60">Platform</h4>
            <ul className="space-y-4">
               <li><Link to="/solutions" className="text-white/70 hover:text-highlight transition-colors type-ui-nav">Solutions</Link></li>
               <li><Link to="/experience" className="text-white/70 hover:text-highlight transition-colors type-ui-nav">The experience</Link></li>
               <li><Link to="/how-we-think" className="text-white/70 hover:text-highlight transition-colors type-ui-nav">How we think</Link></li>
            </ul>
         </div>
         <div>
            <h4 className="type-ui-meta text-white mb-6 opacity-60">Philosophy</h4>
            <ul className="space-y-4">
               <li><Link to="/why-we-exist" className="text-white/70 hover:text-highlight transition-colors type-ui-nav">Why we exist</Link></li>
               <li><Link to="/raaha-marg" className="text-white/70 hover:text-highlight transition-colors type-ui-nav">Raaha × Marg</Link></li>
            </ul>
         </div>
         <div>
            <h4 className="type-ui-meta text-white mb-6 opacity-60">More</h4>
            <ul className="space-y-4">
               <li><Link to="/reflections" className="text-white/70 hover:text-highlight transition-colors type-ui-nav">Insights</Link></li>
               <li><Link to="/careers" className="text-white/70 hover:text-highlight transition-colors type-ui-nav">Careers</Link></li>
               <li><Link to="/contact" className="text-white/70 hover:text-highlight transition-colors type-ui-nav">Contact</Link></li>
            </ul>
         </div>
      </div>
      
    </div>
    
    <div className="max-w-[1500px] mx-auto mt-20 pt-8 border-t border-white/20 flex flex-col md:flex-row items-center justify-between gap-4 relative z-10">
      <p className="text-white/60 type-ui-label">© {new Date().getFullYear()} MyRaaha. All rights reserved.</p>
      <div className="flex items-center gap-6 text-white/60 type-ui-meta">
        <Link to="#" className="hover:text-white transition-colors">Privacy policy</Link>
        <Link to="#" className="hover:text-white transition-colors">Terms of service</Link>
      </div>
    </div>
  </footer>
);

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white min-h-screen selection:bg-highlight selection:text-black antialiased pt-24">
      <NavigationBar />
      <main>
        {children}
      </main>
      <Footer />
    </div>
  );
}

