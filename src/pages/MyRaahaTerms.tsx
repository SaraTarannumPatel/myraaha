import { useEffect } from 'react';
import { FileText, CheckCircle, AlertCircle, Scale } from 'lucide-react';
import MyRaahaNavbar from '../components/MyRaahaNavbar';
import MyRaahaNewsletter from '../components/MyRaahaNewsletter';
import MyRaahaFooter from '../components/MyRaahaFooter';
import StandardPageHero from '../components/StandardPageHero';
import './MyRaahaLegal.css';

const MyRaahaTerms = () => {

  const sections = [
    { id: 'acceptance', label: 'Acceptance' },
    { id: 'usage', label: 'Platform use' },
    { id: 'ip', label: 'Intellectual property' },
    { id: 'content', label: 'User content' },
    { id: 'liability', label: 'Liability' },
    { id: 'termination', label: 'Termination' },
    { id: 'governing', label: 'Governing law' }
  ];

 you provide the courage to explore."</p>
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
