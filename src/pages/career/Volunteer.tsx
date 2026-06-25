import { useEffect } from 'react';
import { Smile, Heart, Globe, MapPin, Clock, ArrowRight, Sun, Users, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import MyRaahaNavbar from '../../components/MyRaahaNavbar';
import MyRaahaFooter from '../../components/MyRaahaFooter';
import './CareerRole.css';
import '../MyRaahaCareers.css';
import StandardPageHero from '../../components/StandardPageHero';
import { careersData } from '../../data/careersData';

const Volunteer = () => {
  const navigate = useNavigate();

  const volunteerRoles = careersData.filter(role => role.classification === 'Volunteer');

  return (
    <div className="role-page">
      <MyRaahaNavbar />

      <StandardPageHero 
        badge="Careers / Volunteer"
        title={
          <>
            Empower Through <span>Contribution</span>
          </>
        }
        subtitle="Help us bridge the guidance gap for students in rural and underserved communities. Your time and empathy can change a life."
        features={[]}
      />

      {/* Redesigned Premium Mission Split Section (Home Mission Inspired) */}
      <section className="role-section dark-mission-bg">
        <div className="asks-mesh-pattern-v2"></div>
        <div className="role-container">
          <div className="role-split-container reversed">
            <div className="role-split-text">
              <span className="role-section-badge">The Mission</span>
              <h2 className="role-section-title">Making a <span>Difference</span></h2>
              <p className="role-section-subtitle">
                Volunteering at MyRaaha is about radical empathy. You'll contribute to 
                initiatives that provide direct clarity to those who need it most, 
                bridging the gap between potential and opportunity in rural India.
              </p>
            </div>
            <div className="role-split-image">
              <img src="https://images.unsplash.com/photo-1559027615-cd26714e93bc?auto=format&fit=crop&w=800&q=80" alt="Volunteer Impact" />
            </div>
          </div>
        </div>
      </section>

      {/* Redesigned Premium Perks Grid (Stakeholder Inspired) */}
      <section className="role-section role-alt-bg">
        <div className="role-container">
          <div className="role-section-header">
            <span className="role-section-badge">Why Volunteer</span>
            <h2 className="role-section-title">Volunteer <span>Impact</span></h2>
            <p className="role-section-subtitle">Bridge the gap with dedicated, mission-aligned, social contributions.</p>
          </div>

          <div className="perks-grid">
            <div className="perk-card">
              <div className="perk-icon"><Heart /></div>
              <h3>Direct Social <span>Impact</span></h3>
              <p>See firsthand how your contribution helps a student navigate their career and life choices.</p>
            </div>
            <div className="perk-card">
              <div className="perk-icon"><Users /></div>
              <h3>Global <span>Network</span></h3>
              <p>Join a network of individuals dedicated to systemic change and educational equity.</p>
            </div>
            <div className="perk-card">
              <div className="perk-icon"><Star /></div>
              <h3>Mission <span>Certification</span></h3>
              <p>Receive formal recognition and recommendations for your contribution to our social mission.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Current Openings Section */}
      <section className="role-section">
        <div className="role-container">
          <div className="role-section-header">
            <span className="role-section-badge">Opportunities</span>
            <h2 className="role-section-title">Volunteer <span>Opportunities</span></h2>
            <p className="role-section-subtitle">Ways you can contribute your time today.</p>
          </div>

          <div className="jobs-grid" style={{ maxWidth: '900px', margin: '0 auto' }}>
            {volunteerRoles.map(job => (
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
              <h3>Who can <span>volunteer?</span></h3>
              <p>Anyone with a passion for education and helping others! We have roles for students, professionals, and retirees alike.</p>
            </div>
            <div className="faq-card">
              <h3>Is there a <span>minimum</span> commitment?</h3>
              <p>It varies by role. Some require just a couple of hours a week, while others are project-based. We work with your availability.</p>
            </div>
            <div className="faq-card">
              <h3>Can I volunteer <span>remotely?</span></h3>
              <p>Yes, absolutely! The vast majority of our volunteering programs are hybrid or fully remote, allowing you to manage your time flexibly alongside your studies or professional work.</p>
            </div>
            <div className="faq-card">
              <h3>What kind of <span>projects</span> will I support?</h3>
              <p>Volunteers play a massive role in our mission. You will help with regional community translation, mentor local students, support offline workshops, and aid our grass-roots outreach campaigns.</p>
            </div>
          </div>
        </div>
      </section>

      <MyRaahaFooter />
    </div>
  );
};

export default Volunteer;
