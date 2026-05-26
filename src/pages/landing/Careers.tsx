import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, GraduationCap, Heart, Handshake, Layers, ArrowRight } from 'lucide-react';
import MyRaahaNavbar from '../../components/MyRaahaNavbar';
import MyRaahaFooter from '../../components/MyRaahaFooter';
import StandardPageHero from '../../components/StandardPageHero';
import './CareerRole.css';

const paths = [
  { slug: 'core-team', title: 'Core Team', icon: Users, description: 'Full-time builders shaping the long-term vision of MyRaaha across product, engineering, AI, and operations.' },
  { slug: 'intern', title: 'Internships', icon: GraduationCap, description: 'Launch your career with hands-on building, expert mentorship, and a pathway to core team roles.' },
  { slug: 'volunteer', title: 'Volunteer', icon: Heart, description: 'Empower students in Tier 3 & 4 India through community moderation, translation, and grass-roots outreach.' },
  { slug: 'facilitator', title: 'Facilitator', icon: Handshake, description: 'Lead workshops, mentor founders, and facilitate the transition from curiosity to creation.' },
  { slug: 'freelance', title: 'Freelance', icon: Layers, description: 'Bring specialized expertise to high-impact, project-based collaborations on our talent roster.' },
];

const CareersHub = () => {
  useEffect(() => { window.scrollTo(0, 0); }, []);
  return (
    <div className="role-page">
      <MyRaahaNavbar />

      <StandardPageHero
        badge="Careers at MyRaaha"
        title={<>Build something <span>that matters.</span></>}
        subtitle="MyRaaha is a small, serious team working on a problem that has been unsolved for too long. We don't move fast and break things — we think carefully and build durably. Choose the path that fits you."
        features={[]}
      />

      <section className="role-section role-alt-bg">
        <div className="role-container">
          <div className="role-section-header">
            <span className="role-section-badge">Five paths in</span>
            <h2 className="role-section-title">Find your <span>way in</span></h2>
            <p className="role-section-subtitle">Whether you want to commit full-time, intern, volunteer, facilitate, or freelance — there's a place for you.</p>
          </div>

          <div className="perks-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
            {paths.map(p => (
              <Link key={p.slug} to={`/careers/${p.slug}`} className="perk-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="perk-icon"><p.icon /></div>
                <h3>{p.title.split(' ').slice(0, -1).join(' ')} <span>{p.title.split(' ').slice(-1)}</span></h3>
                <p>{p.description}</p>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', marginTop: '1.25rem', color: 'var(--myraaha-blue)', fontWeight: 600, fontSize: '0.9rem' }}>
                  Explore <ArrowRight size={14} />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <MyRaahaFooter />
    </div>
  );
};

export default CareersHub;
