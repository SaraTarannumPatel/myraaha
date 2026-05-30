import { Link } from 'react-router-dom';
import { Linkedin, Twitter, Mail, Instagram, Facebook } from 'lucide-react';
import './MyRaahaFooter.css';

const MyRaahaFooter = () => {
  return (
    <footer className="myraaha-footer-modern">
      <div className="footer-glow"></div>
      
      <div className="footer-top-cta">
        <h2 className="footer-cta-title">Ready to Make an <span>Impact?</span></h2>
        <p className="footer-cta-desc">Join our community of innovators and changemakers and start building the future today.</p>
        <div className="footer-cta-btns">
          <Link to="/careers" className="btn-cta-primary">Apply Now</Link>
          <Link to="/contact" className="btn-cta-secondary">Contact Us</Link>
        </div>
      </div>

      <div className="footer-main-grid">
        <div className="footer-brand-section">
          <img src="/images/myraaha white.png" alt="MyRaaha Logo" className="footer-logo-modern" />
          <p className="footer-mission">
            Making quality career guidance available for all and at anytime, helping guided capacity building for better demand alignment at local and at national level.
          </p>
          <div className="footer-social-modern">
            <a href="https://www.linkedin.com/company/myraaha/about" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><Linkedin className="w-5 h-5" /></a>
            <a href="https://www.instagram.com/myraaha" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><Instagram className="w-5 h-5" /></a>
            <a href="https://x.com/myraahaorg" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><Twitter className="w-5 h-5" /></a>
            <a href="https://www.facebook.com/people/MyRaaha-Foundation/61589707157375/" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><Facebook className="w-5 h-5" /></a>
            <a href="mailto:contact@myraaha.org" aria-label="Mail"><Mail className="w-5 h-5" /></a>
          </div>
        </div>

        <div className="footer-links-wrapper">
          <div className="footer-nav-col">
            <h4><span>Platform</span></h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/services">Services</Link></li>
              <li><Link to="/partnerships">Partnerships</Link></li>
            </ul>
          </div>
          
          <div className="footer-nav-col">
            <h4><span>Resources</span></h4>
            <ul>
              <li><Link to="/insights">Insights & News</Link></li>
              <li><Link to="/careers">Careers</Link></li>
            </ul>
          </div>
          
          <div className="footer-nav-col">
            <h4><span>Connect</span></h4>
            <ul>
              <li><a href="mailto:contact@myraaha.org">contact@myraaha.org</a></li>
              <li><a href="tel:+916360287699">+91 63602 87699</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-bottom-modern">
        <div className="footer-copyright">
          © {new Date().getFullYear()} MyRaaha Foundation. All rights reserved.
        </div>
        <div className="footer-legal">
          <Link to="/privacy">Privacy Policy</Link>
          <span className="legal-dot">•</span>
          <Link to="/terms">Terms of Service</Link>
          <span className="legal-dot">•</span>
          <Link to="/cookies">Cookie Policy</Link>
        </div>
      </div>
    </footer>
  );
};

export default MyRaahaFooter;
