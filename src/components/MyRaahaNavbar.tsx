import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const MyRaahaNavbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path ? 'active' : '';
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <>
      <nav className={`myraaha-navbar ${isMenuOpen ? 'menu-open' : ''}`}>
      <div className="myraaha-logo">
        <Link to="/" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}>
          <img src="/images/myraaha-logo.png" alt="MyRaaha Logo" className="nav-logo-img" loading="eager" decoding="async" onError={(e)=>{const t=e.currentTarget;if(!t.dataset.fb){t.dataset.fb='1';t.src='/images/myraaha%20logo.png';}}} />
        </Link>
      </div>

      <button className="mobile-menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
        {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <div className={`myraaha-nav-links ${isMenuOpen ? 'open' : ''}`}>
        <Link to="/" className={isActive('/')} onClick={closeMenu}>Home</Link>
        <Link to="/about" className={isActive('/about')} onClick={closeMenu}>About</Link>
        <Link to="/services" className={isActive('/services')} onClick={closeMenu}>Services</Link>
        <Link to="/partnerships" className={isActive('/partnerships')} onClick={closeMenu}>Partnerships</Link>
        <Link to="/careers" className={isActive('/careers')} onClick={closeMenu}>Careers</Link>
        <Link to="/insights" className={isActive('/insights')} onClick={closeMenu}>Insights</Link>
        <Link to="/contact" className={isActive('/contact')} onClick={closeMenu}>Contact</Link>
        
        {/* Mobile Auth Buttons */}
        <div className="mobile-only flex flex-col gap-3 w-full mt-6 px-6">
          <Link to="/auth?mode=signin" style={{ color: 'var(--myraaha-text-dark)', fontSize: '1rem', fontWeight: 500, textDecoration: 'none', textAlign: 'center', padding: '0.75rem 0', border: '1px solid #e2e8f0', borderRadius: '8px' }} onClick={closeMenu}>Sign In</Link>
          <Link to="/intro?next=signup" style={{ background: 'var(--myraaha-gradient)', color: 'white', fontSize: '1rem', fontWeight: 600, textDecoration: 'none', textAlign: 'center', padding: '0.75rem 0', borderRadius: '8px' }} onClick={closeMenu}>Sign Up</Link>
        </div>
      </div>

      <div className="desktop-only flex items-center gap-5 ml-6">
        <Link to="/auth?mode=signin" style={{ color: 'var(--myraaha-text-dark)', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>Sign In</Link>
        <Link to="/intro?next=signup" style={{ background: 'var(--myraaha-gradient)', color: 'white', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none', padding: '0.45rem 1.25rem', borderRadius: '99px', boxShadow: '0 4px 10px rgba(85,0,203,0.15)' }}>Sign Up</Link>
      </div>
    </nav>
    <div className="navbar-spacer" />
    </>
  );
};

export default MyRaahaNavbar;
