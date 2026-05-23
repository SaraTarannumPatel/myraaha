import { useEffect } from 'react';
import { Users, Zap, MapPin, Clock, ArrowRight, Shield, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import MyRaahaNavbar from '../../components/MyRaahaNavbar';
import MyRaahaFooter from '../../components/MyRaahaFooter';
import './CareerRole.css';
import '../MyRaahaCareers.css';
import StandardPageHero from '../../components/StandardPageHero';
import { careersData } from '../../data/careersData';

const CareerCoreTeam = () => {
  const navigate = useNavigate();
  useEffect(() => { window.scrollTo(0, 0); }, []);
  const coreTeamRoles = careersData.filter(role => role.classification === 'Core Team');

  return (
    <div className="role-page">
      <MyRaahaNavbar />
      <StandardPageHero
        badge="Careers / Full-time"
        title={<>Join the <span>Core Team</span></>}
        subtitle="Drive the long-term vision of MyRaaha. We're looking for dedicated builders ready to architect the future of human potential and social impact."
        features={[]}
      />

      <section className="role-section dark-mission-bg">
        <div className="asks-mesh-pattern-v2"></div>
        <div className="role-container">
          <div className="role-split-container">
            <div className="role-split-text">
              <span className="role-section-badge">The Mission</span>
              <h2 className="role-section-title">A Foundation for <span>Impact</span></h2>
              <p className="role-section-subtitle">
                As a core team member, you aren't just an employee; you're a steward of our mission.
                You'll have the radical autonomy to lead initiatives that bridge the gap for millions across India.
              </p>
            </div>
            <div className="role-split-image">
              <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" alt="Core Team Collaboration" />
            </div>
          </div>
        </div>
      </section>

      <section className="role-section role-alt-bg">
        <div className="role-container">
          <div className="role-section-header">
            <span className="role-section-badge">Our Culture</span>
            <h2 className="role-section-title">The Perks of <span>Stewardship</span></h2>
            <p className="role-section-subtitle">We invest heavily in the people who build our long-term vision.</p>
          </div>
          <div className="perks-grid">
            <div className="perk-card"><div className="perk-icon"><Shield /></div><h3>Strategic <span>Ownership</span></h3><p>Directly influence our product roadmap and lead cross-functional initiatives from day one.</p></div>
            <div className="perk-card"><div className="perk-icon"><Zap /></div><h3>Accelerated <span>Growth</span></h3><p>Work at the cutting edge of AI and social tech in a high-velocity startup environment.</p></div>
            <div className="perk-card"><div className="perk-icon"><Heart /></div><h3>Mission <span>Alignment</span></h3><p>Wake up every day knowing your work contributes to a more equitable and guided world.</p></div>
          </div>
        </div>
      </section>

      <section className="role-section">
        <div className="role-container">
          <div className="role-section-header">
            <span className="role-section-badge">Opportunities</span>
            <h2 className="role-section-title">Current <span>Openings</span></h2>
            <p className="role-section-subtitle">Full-time positions for passionate builders.</p>
          </div>
          <div className="jobs-grid" style={{ maxWidth: '900px', margin: '0 auto' }}>
            {coreTeamRoles.map(job => (
              <div key={job.id} className="job-card" onClick={() => navigate(`/careers/role/${job.id}`)}>
                <div className="job-card-main">
                  <span className="job-category-tag">{job.department}</span>
                  <div className="job-info-text">
                    <h3>{job.title.split(' ').slice(0, -1).join(' ')} <span>{job.title.split(' ').slice(-1)}</span></h3>
                    <div className="job-meta">
                      <div className="meta-item"><MapPin className="w-4 h-4" /> <span>{job.location}</span></div>
                      <div className="meta-item"><Clock className="w-4 h-4" /> <span>{job.type}</span></div>
                    </div>
                  </div>
                </div>
                <button className="btn-view-job" aria-label="View details"><ArrowRight className="w-5 h-5" /></button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="role-section role-alt-bg">
        <div className="role-container">
          <div className="role-section-header">
            <span className="role-section-badge">FAQ</span>
            <h2 className="role-section-title">Common <span>Questions</span></h2>
          </div>
          <div className="faq-grid">
            <div className="faq-card"><h3>What is the work <span>culture</span> like?</h3><p>We are hybrid-first and value deep work. We believe in radical autonomy and trust our team to manage their own time and results.</p></div>
            <div className="faq-card"><h3>Are there opportunities for <span>remote work?</span></h3><p>Yes, many of our core team roles are remote-friendly, though we do have hubs in major cities for collaborative sessions.</p></div>
            <div className="faq-card"><h3>How is MyRaaha <span>structured?</span></h3><p>We are non-profit by intent and revenue-first by design. We focus deeply on social impact while maintaining a product-driven, self-sustaining operational framework.</p></div>
            <div className="faq-card"><h3>What candidate <span>backgrounds</span> do you value?</h3><p>We prioritize high agency, deep domain expertise, and a genuine passion for systemic social equity.</p></div>
          </div>
        </div>
      </section>

      <MyRaahaFooter />
    </div>
  );
};

export default CareerCoreTeam;
