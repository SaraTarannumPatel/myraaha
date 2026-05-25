import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import './MyRaahaNavbar.css';

const MyRaahaNavbar = () => {
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => (location.pathname === path ? 'active' : '');
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  return (
    <nav className={`myraaha-navbar ${isMenuOpen ? 'menu-open' : ''}`}>
      <div className="myraaha-logo">
        <Link
          to="/"
          onClick={closeMenu}
          style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit' }}
        >
          <img src="/myraaha-logo.png" alt="MyRaaha Logo" className="nav-logo-img" />
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

        <div className="myraaha-nav-cta">
          <Link to="/auth" className="nav-btn-signin" onClick={closeMenu}>Sign In</Link>
          <Link to="/intro" className="nav-btn-getstarted" onClick={closeMenu}>Get Started</Link>
        </div>
      </div>
    </nav>
  );
};

export default MyRaahaNavbar;
