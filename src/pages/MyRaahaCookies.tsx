import { useEffect } from 'react';
import { Cookie, Info, ShieldCheck, Zap } from 'lucide-react';
import MyRaahaNavbar from '../components/MyRaahaNavbar';
import MyRaahaNewsletter from '../components/MyRaahaNewsletter';
import MyRaahaFooter from '../components/MyRaahaFooter';
import StandardPageHero from '../components/StandardPageHero';
import './MyRaahaLegal.css';
import { useMobile } from '../hooks/useMobile';
import MobileLegal from './mobile/MobileLegal';

const MyRaahaCookies = () => {
  const isMobile = useMobile();

  const sections = [
    { id: 'definition', label: 'What are cookies?' },
    { id: 'usage', label: 'How we use them' },
    { id: 'types', label: 'Cookie types' },
    { id: 'third-party', label: 'Third parties' },
    { id: 'management', label: 'Managing choices' }
  ];

  if (isMobile) {
    return (
      <MobileLegal 
        badge="Cookie Policy"
        title={<>A seamless <span>intelligence</span> <br /> Personalized with care</>}
        subtitle={<>We use cookies to ensure our 3A Intelligence Engine remembers your journey and calibrates your experience for optimal clarity.</>}
        content={
          <div className="legal-editorial-content">
            <span className="last-updated-v2">Version: 1.0 (May 2026)</span>
            
            <div id="definition" className="legal-block">
              <h2><span>01</span> What are <span>cookies?</span></h2>
              <p>Cookies are small data fragments that help us bridge the gap between your previous interactions and your current needs.</p>
            </div>

            <div id="usage" className="legal-block">
              <h2><span>02</span> How we <span>use them</span></h2>
              <p>At MyRaaha, cookies serve a specific purpose: to scale empathy.</p>
              <div className="legal-insight-box">
                <p>"Efficiency in navigation comes from memory."</p>
              </div>
            </div>

            <div id="types" className="legal-block">
              <h2><span>03</span> Cookie <span>types</span></h2>
              <div className="legal-grid">
                <div className="legal-card-v2">
                  <div className="icon-box"><ShieldCheck /></div>
                  <h4>Essential</h4>
                  <p>Necessary for the basic structural integrity of your session.</p>
                </div>
                <div className="legal-card-v2">
                  <div className="icon-box"><Zap /></div>
                  <h4>Intelligence</h4>
                  <p>Powers the Curiosity Compass memory.</p>
                </div>
              </div>
            </div>

            <div id="management" className="legal-block">
              <h2><span>04</span> Managing <span>choices</span></h2>
              <p>You can adjust your cookie settings at any time through your browser.</p>
            </div>
          </div>
        }
      />
    );
  }

  return (
    <div className="legal-page">
      <MyRaahaNavbar />

      <StandardPageHero 
        badge="Cookie Policy"
        title={
          <>
            A seamless <span>intelligence</span> <br />
            Personalized with care
          </>
        }
        subtitle={
          <>
            We use cookies to ensure our 3A Intelligence Engine remembers your journey <br /> 
            and calibrates your experience for optimal clarity.
          </>
        }
        features={[
          { icon: Zap, label: 'Faster' },
          { icon: Info, label: 'Clear' },
          { icon: ShieldCheck, label: 'Reliable' }
        ]}
      />

      <section className="legal-section">
        <aside className="legal-sidebar">
          <div className="legal-nav-header">
            <h4>Contents</h4>
          </div>
          <nav className="legal-nav-links">
            {sections.map((section) => (
              <a key={section.id} href={`#${section.id}`} className="legal-nav-item">
                <div className="legal-nav-dot"></div>
                {section.label}
              </a>
            ))}
          </nav>
        </aside>

        <main className="legal-editorial-content">
          <span className="last-updated-v2">Version: 1.0 (May 2026)</span>
          
          <div id="definition" className="legal-block">
            <h2><span>01</span> What are <span>cookies?</span></h2>
            <p>
              Cookies are small data fragments that help us bridge the gap between your previous interactions and your current needs. They are the "memory" of the ShuttlEx platform.
            </p>
          </div>

          <div id="usage" className="legal-block">
            <h2><span>02</span> How we <span>use them</span></h2>
            <p>
              At MyRaaha, cookies serve a specific purpose: to scale empathy. They allow our engine to remember which career paths you've explored so we don't repeat information, focusing instead on deeper insights.
            </p>
            <div className="legal-insight-box">
              <p>"Efficiency in navigation comes from memory. Cookies help us remember your progress so you can focus on your future."</p>
            </div>
          </div>

          <div id="types" className="legal-block">
            <h2><span>03</span> Cookie <span>types</span></h2>
            <div className="legal-grid">
              <div className="legal-card-v2">
                <div className="icon-box"><ShieldCheck /></div>
                <h4>Essential</h4>
                <p>Necessary for the basic structural integrity of your session and secure login.</p>
              </div>
              <div className="legal-card-v2">
                <div className="icon-box"><Zap /></div>
                <h4>Intelligence</h4>
                <p>Powers the Curiosity Compass memory, ensuring your navigation remains contextual.</p>
              </div>
            </div>
          </div>

          <div id="third-party" className="legal-block">
            <h2><span>04</span> Third <span>parties</span></h2>
            <p>
              We occasionally use analytical tools (like Google Analytics) to observe aggregate patterns across Bharat. This helps us refine our mission for a $30 Tn economy.
            </p>
          </div>

          <div id="management" className="legal-block">
            <h2><span>05</span> Managing <span>choices</span></h2>
            <p>
              You can adjust your cookie settings at any time through your browser or our integrated preference center. Note that disabling certain cookies may impact the "personality" of your AI Career Coach.
            </p>
          </div>

          <div className="legal-footer-simple">
            <div className="footer-links">
              <a href="/privacy" className="legal-nav-item">Privacy Policy</a>
              <a href="/terms" className="legal-nav-item">Terms of Service</a>
            </div>
            <p>© 2026 MyRaaha</p>
          </div>
        </main>
      </section>

      <MyRaahaNewsletter />
      <MyRaahaFooter />
    </div>
  );
};

export default MyRaahaCookies;
