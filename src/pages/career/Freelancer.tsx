import { useEffect } from 'react';
import { Clock, Zap, Layers, MapPin, ArrowRight, Shield, Heart, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';
import MyRaahaNavbar from '../../components/MyRaahaNavbar';
import MyRaahaFooter from '../../components/MyRaahaFooter';
import './CareerRole.css';
import StandardPageHero from '../../components/StandardPageHero';

const Freelancer = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);

  return (
    <div className="role-page">
      <MyRaahaNavbar />

      <StandardPageHero 
        badge="Careers / Freelance"
        title={
          <>
            Scale with <span className="italic">Specialized Skills</span>
          </>
        }
        subtitle="Bring your high-fidelity expertise to specific high-impact projects. Flexible, project-based collaboration for the world's most talented creators."
        features={[
          { icon: Clock, label: 'Flexibility' },
          { icon: Zap, label: 'Velocity' },
          { icon: Layers, label: 'Focus' }
        ]}
      />

      {/* Redesigned Premium Mission Split Section (Home Mission Inspired) */}
      <section className="role-section dark-mission-bg">
        <div className="asks-mesh-pattern-v2"></div>
        <div className="role-container">
          <div className="role-split-container">
            <div className="role-split-text">
              <span className="role-section-badge">The Partnership</span>
              <h2 className="role-section-title">Why Freelance with <span>Us?</span></h2>
              <p className="role-section-subtitle">
                We value specialized mastery. As a freelancer at MyRaaha, you'll tackle 
                clear challenges with creative freedom and zero administrative friction. 
                We provide the context, you provide the craft. Join our talent roster to be 
                commissioned for specialized development, design, and content sprints.
              </p>
            </div>
            <div className="role-split-image">
              <img src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?auto=format&fit=crop&w=800&q=80" alt="Freelance Mastery" />
            </div>
          </div>
        </div>
      </section>

      {/* Redesigned Premium Perks Grid (Stakeholder Inspired) */}
      <section className="role-section role-alt-bg">
        <div className="role-container">
          <div className="role-section-header">
            <span className="role-section-badge">The Freedom</span>
            <h2 className="role-section-title">Freelancer <span>Perks</span></h2>
            <p className="role-section-subtitle">Retain complete creative ownership and structural independence.</p>
          </div>

          <div className="perks-grid">
            <div className="perk-card">
              <div className="perk-icon"><Clock /></div>
              <h3>True <span>Autonomy</span></h3>
              <p>Work on your own terms. We prioritize high-quality outcomes over rigid desk hours.</p>
            </div>
            <div className="perk-card">
              <div className="perk-icon"><Zap /></div>
              <h3>High <span>Velocity</span></h3>
              <p>Focus on your craft. We provide clear briefs and direct access to stakeholders for fast execution.</p>
            </div>
            <div className="perk-card">
              <div className="perk-icon"><Layers /></div>
              <h3>Specialized <span>Impact</span></h3>
              <p>Apply your niche skills to critical product milestones that move the needle for our users.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Current Openings Section */}
      <section className="role-section">
        <div className="role-container">
          <div className="role-section-header">
            <span className="role-section-badge">Opportunities</span>
            <h2 className="role-section-title">Freelance <span>Opportunities</span></h2>
            <p className="role-section-subtitle">Join our talent roster to be contacted for future project sprints.</p>
          </div>

          <div className="openings-list">
            <div className="opening-card" style={{ cursor: 'default' }}>
              <div className="opening-info">
                <h3>General Freelance Talent <span>Roster</span></h3>
                <div className="opening-meta">
                  <span><MapPin size={14} /> Remote (Global)</span>
                  <span><Clock size={14} /> Project-based</span>
                </div>
              </div>
              <Link to="/careers" className="btn-apply-small">Submit Portfolio</Link>
            </div>
          </div>
        </div>
      </section>

      {/* Redesigned Premium FAQ Grid */}
      <section className="role-section role-alt-bg">
        <div className="role-container">
          <div className="role-section-header">
            <span className="role-section-badge">FAQ</span>
            <h2 className="role-section-title">Common <span>Questions</span></h2>
          </div>

          <div className="faq-grid">
            <div className="faq-card">
              <h3>How does payment work?</h3>
              <p>We work on a milestone-based payment structure. Payments are released promptly upon successful completion of project stages.</p>
            </div>
            <div className="faq-card">
              <h3>Can I work with other clients?</h3>
              <p>Absolutely. We respect your autonomy and the freelance lifestyle. As long as our project goals are met, you are free to manage your portfolio.</p>
            </div>
          </div>
        </div>
      </section>

      <MyRaahaFooter />
    </div>
  );
};

export default Freelancer;
