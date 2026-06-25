import { useEffect } from 'react';
import { GraduationCap, Rocket, Smile, MapPin, Clock, ArrowRight, BookOpen, Coffee, Users } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import MyRaahaNavbar from '../../components/MyRaahaNavbar';
import MyRaahaFooter from '../../components/MyRaahaFooter';
import './CareerRole.css';
import '../MyRaahaCareers.css';
import StandardPageHero from '../../components/StandardPageHero';
import { careersData } from '../../data/careersData';

const Intern = () => {
  const navigate = useNavigate();

  const internRoles = careersData.filter(role => role.classification === 'Intern');

  return (
    <div className="role-page">
      <MyRaahaNavbar />

      <StandardPageHero 
        badge="Careers / Internship"
        title={
          <>
            Launch Your <span>Career</span>
          </>
        }
        subtitle="Don't just fetch coffee. Build products, launch campaigns, and solve real-world problems alongside industry veterans in a high-impact environment."
        features={[]}
      />

      {/* Redesigned Premium Mission Split Section (Home Mission Inspired) */}
      <section className="role-section dark-mission-bg">
        <div className="asks-mesh-pattern-v2"></div>
        <div className="role-container">
          <div className="role-split-container reversed">
            <div className="role-split-text">
              <span className="role-section-badge">The Experience</span>
              <h2 className="role-section-title">Why Intern with <span>MyRaaha?</span></h2>
              <p className="role-section-subtitle">
                Our internship program is designed to be a definitive career launchpad. 
                You'll be treated as a full team member with the autonomy to make a mark. 
                We provide the mentorship, but you provide the momentum.
              </p>
            </div>
            <div className="role-split-image">
              <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80" alt="Internship Experience" />
            </div>
          </div>
        </div>
      </section>

      {/* Redesigned Premium Perks Grid (Stakeholder Inspired) */}
      <section className="role-section role-alt-bg">
        <div className="role-container">
          <div className="role-section-header">
            <span className="role-section-badge">The Growth Path</span>
            <h2 className="role-section-title">Internship <span>Perks</span></h2>
            <p className="role-section-subtitle">Accelerate your trajectory with dedicated support and genuine building opportunities.</p>
          </div>

          <div className="perks-grid">
            <div className="perk-card">
              <div className="perk-icon"><Rocket /></div>
              <h3>Hands-on <span>Building</span></h3>
              <p>Work on live projects that reach thousands of students. No "shadowing"—you build and ship.</p>
            </div>
            <div className="perk-card">
              <div className="perk-icon"><Users /></div>
              <h3>Expert <span>Mentorship</span></h3>
              <p>Weekly 1-on-1s with founders and leads to guide your growth and professional narrative.</p>
            </div>
            <div className="perk-card">
              <div className="perk-icon"><Smile /></div>
              <h3>Pathway to <span>Core</span></h3>
              <p>Top-performing interns are frequently offered full-time roles or long-term partnerships.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Current Openings Section */}
      <section className="role-section">
        <div className="role-container">
          <div className="role-section-header">
            <span className="role-section-badge">Opportunities</span>
            <h2 className="role-section-title">Open <span>Internships</span></h2>
            <p className="role-section-subtitle">Positions available for 3-6 month durations.</p>
          </div>

          <div className="jobs-grid" style={{ maxWidth: '900px', margin: '0 auto' }}>
            {internRoles.map(job => (
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
              <h3>Is this a <span>paid</span> internship?</h3>
              <p>Yes, all our internships are paid with a competitive stipend based on your skills and contribution.</p>
            </div>
            <div className="faq-card">
              <h3>What are the working hours?</h3>
              <p>We are flexible! Most interns work 20-30 hours a week, allowing you to balance work with your studies.</p>
            </div>
            <div className="faq-card">
              <h3>What is the <span>mentorship</span> structure like?</h3>
              <p>Every intern is paired with a core team mentor for weekly 1-on-1s. You will also participate in strategy reviews directly with our leadership team.</p>
            </div>
            <div className="faq-card">
              <h3>Do interns work on <span>live production</span> code?</h3>
              <p>Absolutely! We do not assign shadow projects. You will build and ship features, systems, or campaigns that serve real students across Bharat.</p>
            </div>
          </div>
        </div>
      </section>

      <MyRaahaFooter />
    </div>
  );
};

export default Intern;
