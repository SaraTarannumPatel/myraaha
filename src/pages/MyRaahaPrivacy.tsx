import { useEffect } from 'react';
import { Shield, Lock, Eye, FileText, Zap } from 'lucide-react';
import MyRaahaNavbar from '../components/MyRaahaNavbar';
import MyRaahaNewsletter from '../components/MyRaahaNewsletter';
import MyRaahaFooter from '../components/MyRaahaFooter';
import StandardPageHero from '../components/StandardPageHero';
import './MyRaahaLegal.css';

const MyRaahaPrivacy = () => {

  const sections = [
    { id: 'introduction', label: 'Introduction' },
    { id: 'collection', label: 'Data collection' },
    { id: 'usage', label: 'How we use data' },
    { id: 'sharing', label: 'Sharing policy' },
    { id: 'choices', label: 'Your choices' },
    { id: 'security', label: 'Data security' },
    { id: 'contact', label: 'Contact us' }
  ];

 we protect the narrative of your future.</p>
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
