import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare, Zap, Settings, Globe, Calendar, Search, TrendingUp, Rocket
} from 'lucide-react';
import MyRaahaNavbar from '../components/MyRaahaNavbar';
import MyRaahaNewsletter from '../components/MyRaahaNewsletter';
import MyRaahaFooter from '../components/MyRaahaFooter';
import './MyRaahaPartnerships.css';

const MyRaahaPartnerships = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="myraaha-partnerships-v2">
      <MyRaahaNavbar />

      {/* Hero */}
      <section className="partnerships-hero-v2">
        <div className="hero-content-v2">
          <div className="hero-badge-v2">Institutional Partnerships</div>
          <h1 className="hero-title-v2">
            We don't sell to institutions.<br />
            We build with <span>them</span>.
          </h1>
          <p className="hero-subtitle-v2">
            MyRaaha exists because the system failed students. We're not here to replace what institutions do — we're here to give them the infrastructure they never had. A partnership with MyRaaha means your students stop guessing and start navigating. From day one.
          </p>
          <div className="hero-btns-v2">
            <Link to="/contact" className="btn-primary-v2" style={{ textDecoration: 'none' }}>
              <MessageSquare className="w-5 h-5" />
              Let's Talk
            </Link>
          </div>
        </div>
        <div className="hero-image-container-v2">
          <img src="/myraaha_hero_v2_1778819576959.png" alt="Institutional Partnership" className="hero-image-v2" />
        </div>
      </section>

      <section className="partnerships-engagement-v2">
        <div className="section-header-v2">
          <span className="section-badge-v2">Engagement</span>
          <h2 className="section-title-v2">Our engagement <span>model</span></h2>
          <p className="section-subtitle-v2">We engage with you to design the partnership</p>
        </div>

        <div className="engagement-path-container">
          <div className="path-line"></div>

          {[
            { n: '01', side: 'left', Icon: Search, title: <>Discovery</>, desc: 'First touch point with the institute management, faculties and students', input: 'Discovery workshop', output: 'Need analysis document' },
            { n: '02', side: 'right', Icon: MessageSquare, title: <>Proposal & need <span>discussion</span></>, desc: 'Using our discovery assessment, we create the preliminary proposal for discussion', input: 'Need analysis document', output: 'Proposal' },
            { n: '03', side: 'left', Icon: Settings, title: <>Service <span>selection</span></>, desc: 'Preliminary proposal is customized to select appropriate services', input: 'Proposal', output: 'Memorandum of Understanding' },
            { n: '04', side: 'right', Icon: Zap, title: <>Service <span>introduction</span></>, desc: 'This is all about the service commencement and the arrangements required', input: 'Memorandum of Understanding', output: 'Implementation monitoring' },
          ].map(s => (
            <div key={s.n} className={`path-step-v2 ${s.side}`}>
              <div className="path-marker">{s.n}</div>
              <div className="path-card-v2">
                <div className="path-card-header">
                  <div className="path-icon-box"><s.Icon /></div>
                  <h3>{s.title}</h3>
                </div>
                <p>{s.desc}</p>
                <div className="path-io-line">
                  <div className="io-item input"><span className="io-tag">Input:</span><span className="io-val">{s.input}</span></div>
                  <div className="io-divider">|</div>
                  <div className="io-item output"><span className="io-tag">Output:</span><span className="io-val">{s.output}</span></div>
                </div>
              </div>
            </div>
          ))}

          <div className="path-step-v2 left">
            <div className="path-marker">05</div>
            <div className="path-card-v2 delivery-card">
              <div className="path-card-header">
                <div className="path-icon-box"><Rocket /></div>
                <h3>Service <span>delivery</span></h3>
              </div>
              <p>We take you through the value journey keeping the key success metrics in mind</p>
            </div>
          </div>

          <div className="value-journey-final">
            <div className="final-glow"></div>
            <div className="final-content">
              <div className="final-icon"><TrendingUp /></div>
              <h3>Value <span>journey</span></h3>
              <p>The ultimate outcome of our partnership</p>
            </div>
          </div>
        </div>
      </section>

      <section className="partnerships-asks-v2 dark-bg">
        <div className="asks-visuals-v2">
          <div className="asks-mesh-pattern-v2"></div>
          <div className="visual-circle-v2 circle-1-v2"></div>
          <div className="visual-circle-v2 circle-2-v2"></div>
        </div>
        <div className="asks-content-v2">
          <span className="section-badge-v2 white-badge-v2">Our mutual commitment</span>
          <h2 className="section-title-v2 white-text-v2">What we ask of <span>you</span></h2>
          <p className="section-subtitle-v2 gray-text-v2">We are an early-stage platform. In return for being part of the first cohort, we ask for three things:</p>

          <div className="asks-grid-v2">
            {[
              { Icon: Globe, title: 'Access', desc: 'To your students, your staff, and honest feedback on what is working and what isn\'t.' },
              { Icon: Calendar, title: 'Time', desc: 'To let the platform do what it is designed to do. Navigation takes a semester.' },
              { Icon: MessageSquare, title: 'Voice', desc: 'If it works, tell someone. The students who need this most are in institutions that haven\'t heard of us yet.' },
            ].map(a => (
              <div key={a.title} className="ask-card-v2">
                <div className="ask-icon-v2"><a.Icon /></div>
                <h3><span>{a.title}</span></h3>
                <p>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <MyRaahaNewsletter />
      <MyRaahaFooter />
    </div>
  );
};

export default MyRaahaPartnerships;
