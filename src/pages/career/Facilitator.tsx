import { useEffect } from 'react';
import { Handshake, Lightbulb, Target, MapPin, Clock, ArrowRight, Zap, Users, Award } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import MyRaahaNavbar from '../../components/MyRaahaNavbar';
import MyRaahaFooter from '../../components/MyRaahaFooter';
import './CareerRole.css';
import '../MyRaahaCareers.css';
import StandardPageHero from '../../components/StandardPageHero';
import { careersData } from '../../data/careersData';

const Facilitator = () => {
  const navigate = useNavigate();

  const facilitatorRoles = careersData.filter(role => role.classification === 'Facilitator');

  return (
    <div className="role-page">
      <MyRaahaNavbar />

      <StandardPageHero 
        badge="Careers / Facilitator"
        title={
          <>
            Shape the <span>Next Generation</span>
          </>
        }
        subtitle="Lead workshops, mentor founders, and facilitate the transition from curiosity to creation. Help us define the future of entrepreneurship."
        features={[]}
      />

      {/* Redesigned Premium Mission Split Section (Home Mission Inspired) */}
      <section className="role-section dark-mission-bg">
        <div className="asks-mesh-pattern-v2"></div>
        <div className="role-container">
          <div className="role-split-container">
            <div className="role-split-text">
              <span className="role-section-badge">The Impact</span>
              <h2 className="role-section-title">Empowering <span>Others</span></h2>
              <p className="role-section-subtitle">
                Our facilitators are the catalysts for growth. You'll bridge the gap 
                between potential and success in our incubation and guidance programs, 
                mentoring the next wave of founders.
              </p>
            </div>
            <div className="role-split-image">
              <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80" alt="Facilitation Impact" />
            </div>
          </div>
        </div>
      </section>

      {/* Redesigned Premium Perks Grid (Stakeholder Inspired) */}
      <section className="role-section role-alt-bg">
        <div className="role-container">
          <div className="role-section-header">
            <span className="role-section-badge">Why Facilitate</span>
            <h2 className="role-section-title">Facilitator <span>Perks</span></h2>
            <p className="role-section-subtitle">Bridge the transition from curiosity to active startup creation.</p>
          </div>

          <div className="perks-grid">
            <div className="perk-card">
              <div className="perk-icon"><Lightbulb /></div>
              <h3>Thought <span>Leadership</span></h3>
              <p>Share your mastery and build your personal brand as a leading voice in innovation and education.</p>
            </div>
            <div className="perk-card">
              <div className="perk-icon"><Target /></div>
              <h3>Strategic <span>Mentorship</span></h3>
              <p>Directly influence the trajectory of early-stage startups and student-led social ventures.</p>
            </div>
            <div className="perk-card">
              <div className="perk-icon"><Award /></div>
              <h3>Curated <span>Network</span></h3>
              <p>Connect with a high-caliber community of investors, founders, and industry-leading experts.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Current Openings Section */}
      <section className="role-section">
        <div className="role-container">
          <div className="role-section-header">
            <span className="role-section-badge">Opportunities</span>
            <h2 className="role-section-title">Facilitator <span>Roles</span></h2>
            <p className="role-section-subtitle">Current programs seeking facilitators.</p>
          </div>

          <div className="jobs-grid" style={{ maxWidth: '900px', margin: '0 auto' }}>
            {facilitatorRoles.map(job => (
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
                <button className="btn-view-job" aria-label="View details">
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            ))}
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
              <h3>What experience is <span>required?</span></h3>
              <p>We look for individuals with a track record in entrepreneurship, product management, or specialized domain expertise (e.g., Legal, Finance, Tech).</p>
            </div>
            <div className="faq-card">
              <h3>Is this a <span>full-time</span> role?</h3>
              <p>Most facilitator roles are part-time or project-based, designed to complement your primary professional work.</p>
            </div>
            <div className="faq-card">
              <h3>How are workshops <span>structured?</span></h3>
              <p>Workshops are typically structured as hybrid modules (a mix of virtual lectures and interactive physical validation quests) focusing on problem definition and business MVP building.</p>
            </div>
            <div className="faq-card">
              <h3>Are facilitators <span>compensated?</span></h3>
              <p>Yes, absolutely! Facilitators are compensated with premium professional honorariums per session or workshop module, recognizing the high caliber of domain expertise you share.</p>
            </div>
          </div>
        </div>
      </section>

      <MyRaahaFooter />
    </div>
  );
};

export default Facilitator;
