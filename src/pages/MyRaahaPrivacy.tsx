import { useEffect } from 'react';
import { Shield, Lock, Eye, FileText, Zap } from 'lucide-react';
import MyRaahaNavbar from '../components/MyRaahaNavbar';
import MyRaahaNewsletter from '../components/MyRaahaNewsletter';
import MyRaahaFooter from '../components/MyRaahaFooter';
import StandardPageHero from '../components/StandardPageHero';
import './MyRaahaLegal.css';
import { useMobile } from '../hooks/useMobile';
import MobileLegal from './mobile/MobileLegal';

const MyRaahaPrivacy = () => {
  const isMobile = useMobile();

  const sections = [
    { id: 'introduction', label: 'Introduction' },
    { id: 'collection', label: 'Data collection' },
    { id: 'usage', label: 'How we use data' },
    { id: 'sharing', label: 'Sharing policy' },
    { id: 'choices', label: 'Your choices' },
    { id: 'security', label: 'Data security' },
    { id: 'contact', label: 'Contact us' }
  ];

  if (isMobile) {
    return (
      <MobileLegal 
        badge="Privacy Policy"
        title={<>Data <span>empathy</span> & <br /> Personalized trust</>}
        subtitle={<>At MyRaaha, privacy isn't a checkbox — it's the core of how we scale trust across Bharat's diverse career landscapes.</>}
        content={
          <div className="legal-editorial-content">
            <span className="last-updated-v2">Published: May 15, 2026</span>
            
            <div id="introduction" className="legal-block">
              <h2><span>01</span> Introduction <span>overview</span></h2>
              <p>MyRaaha ("we", "us", or "our") operates the ShuttlEx platform. We believe that career guidance requires a safe space for exploration.</p>
              <div className="legal-insight-box">
                <p>Privacy is the bridge between clinical data and emotional intelligence.</p>
              </div>
            </div>

            <div id="collection" className="legal-block">
              <h2><span>02</span> Data <span>collection</span></h2>
              <p>We collect information that helps our AI understand your personal fit.</p>
            </div>

            <div id="usage" className="legal-block">
              <h2><span>03</span> How we <span>use data</span></h2>
              <p>Your information fuels the 3A Intelligence Engine, ensuring every roadmap we generate is unique.</p>
            </div>

            <div id="sharing" className="legal-block">
              <h2><span>04</span> Sharing <span>policy</span></h2>
              <p>Data sharing is always consent-first. We never trade your career journey for profit.</p>
            </div>

            <div id="contact" className="legal-block">
              <h2><span>05</span> Contact <span>us</span></h2>
              <p>Questions? Email us at privacy@myraaha.org</p>
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
        badge="Privacy Policy"
        title={
          <>
            Data <span>empathy</span> & <br />
            Personalized trust
          </>
        }
        subtitle={
          <>
            At MyRaaha, privacy isn't a checkbox — it's the core of how we scale trust <br /> 
            across Bharat's diverse career landscapes.
          </>
        }
        features={[
          { icon: Shield, label: 'Secure' },
          { icon: Lock, label: 'Private' },
          { icon: Eye, label: 'Transparent' }
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
          <span className="last-updated-v2">Published: May 15, 2026</span>
          
          <div id="introduction" className="legal-block">
            <h2><span>01</span> Introduction <span>overview</span></h2>
            <p>
              MyRaaha ("we", "us", or "our") operates the ShuttlEx platform. We believe that career guidance requires a safe space for exploration. This policy outlines how we protect that space by handling your data with unshakeable conviction and structural clarity.
            </p>
            <div className="legal-insight-box">
              <p>Privacy is the bridge between clinical data and emotional intelligence. We don't just protect data; we protect the narrative of your future.</p>
            </div>
          </div>

          <div id="collection" className="legal-block">
            <h2><span>02</span> Data <span>collection</span></h2>
            <p>
              We collect information that helps our AI understand your personal fit, from cognitive strengths to emotional energy zones.
            </p>
            
            <div className="legal-grid">
              <div className="legal-card-v2">
                <div className="icon-box"><FileText /></div>
                <h4>Account Data</h4>
                <p>Basic information used to maintain your secure identity across the ShuttlEx ecosystem.</p>
              </div>
              <div className="legal-card-v2">
                <div className="icon-box"><Zap /></div>
                <h4>Behavioral Insights</h4>
                <p>Tracking patterns in the Curiosity Compass and SelfGraph to build your unique Identity Mirror.</p>
              </div>
            </div>
          </div>

          <div id="usage" className="legal-block">
            <h2><span>03</span> How we <span>use data</span></h2>
            <p>
              Your information fuels the <strong>3A Intelligence Engine</strong>, ensuring every roadmap we generate is as unique as your thumbprint.
            </p>
            <ul>
              <li>To calibrate <strong>AI Powered Roadmaps</strong> for optimal direction.</li>
              <li>To update the <strong>Living Resume™</strong> with real-time achievements.</li>
              <li>To provide the Virtual Career Coach with context for empathetic nudging.</li>
            </ul>
          </div>

          <div id="sharing" className="legal-block">
            <h2><span>04</span> Sharing <span>policy</span></h2>
            <p>
              Data sharing is always <strong>consent-first</strong>. We never trade your career journey for profit.
            </p>
            <p>
              We only disclose information when you choose to connect with mentors, apply for jobs, or engage in community pods. Every share is a conscious decision by you.
            </p>
          </div>

          <div id="choices" className="legal-block">
            <h2><span>05</span> Your <span>choices</span></h2>
            <p>
              You own your story. Our dashboard provides granular controls over what data is collected and how it is displayed in your <strong>SelfGraph</strong>.
            </p>
          </div>

          <div id="security" className="legal-block">
            <h2><span>06</span> Data <span>security</span></h2>
            <p>
              We implement enterprise-grade encryption to ensure your career aspirations remain confidential and protected from unauthorized access.
            </p>
          </div>

          <div id="contact" className="legal-block">
            <h2><span>07</span> Contact <span>us</span></h2>
            <p>
              Questions about your data empathy? Our privacy team is here to help.
            </p>
            <p>
              <strong>Email:</strong> privacy@myraaha.org<br />
              <strong>Base:</strong> MyRaaha Foundation, Bangalore.
            </p>
          </div>

          <div className="legal-footer-simple">
            <div className="footer-links">
              <a href="/terms" className="legal-nav-item">Terms of Service</a>
              <a href="/cookies" className="legal-nav-item">Cookie Policy</a>
            </div>
            <p>© 2026 MyRaaha Foundation</p>
          </div>
        </main>
      </section>

      <MyRaahaNewsletter />
      <MyRaahaFooter />
    </div>
  );
};

export default MyRaahaPrivacy;
