import { useEffect } from 'react';
import { FileText, CheckCircle, AlertCircle, Scale } from 'lucide-react';
import MyRaahaNavbar from '../components/MyRaahaNavbar';
import MyRaahaNewsletter from '../components/MyRaahaNewsletter';
import MyRaahaFooter from '../components/MyRaahaFooter';
import StandardPageHero from '../components/StandardPageHero';
import './MyRaahaLegal.css';
import { useMobile } from '../hooks/useMobile';
import MobileLegal from './mobile/MobileLegal';

const MyRaahaTerms = () => {
  const isMobile = useMobile();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const sections = [
    { id: 'acceptance', label: 'Acceptance' },
    { id: 'usage', label: 'Platform use' },
    { id: 'ip', label: 'Intellectual property' },
    { id: 'content', label: 'User content' },
    { id: 'liability', label: 'Liability' },
    { id: 'termination', label: 'Termination' },
    { id: 'governing', label: 'Governing law' }
  ];

  if (isMobile) {
    return (
      <MobileLegal 
        badge="Terms of Service"
        title={<>A foundation of <span>clarity</span> & <br /> Mutual commitment</>}
        subtitle={<>By using MyRaaha, you join a ecosystem built on honesty, resilience, and the shared goal of democratizing career guidance.</>}
        content={
          <div className="legal-editorial-content">
            <span className="last-updated-v2">Effective: May 15, 2026</span>
            
            <div id="acceptance" className="legal-block">
              <h2><span>01</span> Acceptance of <span>terms</span></h2>
              <p>Welcome to MyRaaha. By accessing the ShuttlEx platform, you agree to these terms. We don't believe in fine print—we believe in clear expectations.</p>
            </div>

            <div id="usage" className="legal-block">
              <h2><span>02</span> Platform <span>use</span></h2>
              <p>MyRaaha is a space for professional and entrepreneurial growth.</p>
            </div>

            <div id="ip" className="legal-block">
              <h2><span>03</span> Intellectual <span>property</span></h2>
              <p>Our frameworks are owned by MyRaaha but licensed to you for your personal journey.</p>
            </div>

            <div id="content" className="legal-block">
              <h2><span>04</span> User <span>content</span></h2>
              <p>Your reflections are yours. We provide the mirror (SelfGraph™), but you own the image.</p>
              <div className="legal-insight-box">
                <p>"Guidance is a two-way street."</p>
              </div>
            </div>

            <div id="liability" className="legal-block">
              <h2><span>05</span> Liability <span>limitations</span></h2>
              <p>While our AI is sophisticated, it is a guide, not a crystal ball.</p>
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
        badge="Terms of Service"
        title={
          <>
            A foundation of <span>clarity</span> & <br />
            Mutual commitment
          </>
        }
        subtitle={
          <>
            By using MyRaaha, you join a ecosystem built on honesty, resilience, and <br /> 
            the shared goal of democratizing career guidance.
          </>
        }
        features={[
          { icon: FileText, label: 'Fair' },
          { icon: CheckCircle, label: 'Clear' },
          { icon: Scale, label: 'Balanced' }
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
          <span className="last-updated-v2">Effective: May 15, 2026</span>
          
          <div id="acceptance" className="legal-block">
            <h2><span>01</span> Acceptance of <span>terms</span></h2>
            <p>
              Welcome to MyRaaha. By accessing the ShuttlEx platform, you agree to these terms. We don't believe in fine print—we believe in clear expectations that protect our community.
            </p>
          </div>

          <div id="usage" className="legal-block">
            <h2><span>02</span> Platform <span>use</span></h2>
            <p>
              MyRaaha is a space for professional and entrepreneurial growth. We expect users to engage with sincerity.
            </p>
            <div className="legal-grid">
              <div className="legal-card-v2">
                <div className="icon-box"><CheckCircle /></div>
                <h4>Intent</h4>
                <p>The platform is for those seeking career clarity, startup validation, or meaningful skill growth.</p>
              </div>
              <div className="legal-card-v2">
                <div className="icon-box"><AlertCircle /></div>
                <h4>Age</h4>
                <p>Designed for users 13 and above, with parental guidance encouraged for school-age explorers.</p>
              </div>
            </div>
          </div>

          <div id="ip" className="legal-block">
            <h2><span>03</span> Intellectual <span>property</span></h2>
            <p>
              Our frameworks—from the <strong>Curiosity Compass™</strong> to the <strong>3A Intelligence Engine™</strong>—are the result of relentless structural obsession. They are owned by MyRaaha but licensed to you for your personal journey.
            </p>
          </div>

          <div id="content" className="legal-block">
            <h2><span>04</span> User <span>content</span></h2>
            <p>
              Your reflections are yours. We provide the mirror (SelfGraph™), but you own the image. By participating in community pods, you contribute to a shared knowledge base.
            </p>
            <div className="legal-insight-box">
              <p>"Guidance is a two-way street. We provide the infrastructure; you provide the courage to explore."</p>
            </div>
          </div>

          <div id="liability" className="legal-block">
            <h2><span>05</span> Liability <span>limitations</span></h2>
            <p>
              While our AI is sophisticated, it is a guide, not a crystal ball. MyRaaha does not guarantee specific employment outcomes but promises unshakeable support in your preparation.
            </p>
          </div>

          <div id="termination" className="legal-block">
            <h2><span>06</span> Account <span>termination</span></h2>
            <p>
              We reserve the right to remove users who disrupt the safe, empathetic environment of our community labs or mentorship circles.
            </p>
          </div>

          <div id="governing" className="legal-block">
            <h2><span>07</span> Governing <span>law</span></h2>
            <p>
              Our operations are based in Bangalore, India, and are governed by the local legal frameworks of the region.
            </p>
          </div>

          <div className="legal-footer-simple">
            <div className="footer-links">
              <a href="/privacy" className="legal-nav-item">Privacy Policy</a>
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

export default MyRaahaTerms;
