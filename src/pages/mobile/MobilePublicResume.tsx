import { ArrowLeft, Globe, Shield } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import './MobilePublicResume.css';

interface MobilePublicResumeProps {
  resume: any;
  payload: any;
}

const MobilePublicResume: React.FC<MobilePublicResumeProps> = ({ resume, payload }) => {
  return (
    <div className="mobile-resume-page">
      <header className="resume-header-mobile">
        <div className="resume-top-mobile">
          <RouterLink to="/" className="btn-back-circle">
            <ArrowLeft size={20} />
          </RouterLink>
          <div className="resume-badge-mobile">
            <Globe size={14} /> <span>Public Living Resume</span>
          </div>
        </div>
        
        <h1 className="resume-name-mobile">{resume.name || 'Living Resume'}</h1>
        {resume.headline && <p className="resume-headline-mobile">{resume.headline}</p>}
      </header>

      <main className="resume-body-mobile">
        {resume.summary && (
          <section className="resume-section-mobile">
            <h2 className="section-title-mobile">Summary</h2>
            <p className="resume-text-mobile">{resume.summary}</p>
          </section>
        )}

        {Array.isArray(resume.skills) && resume.skills.length > 0 && (
          <section className="resume-section-mobile">
            <h2 className="section-title-mobile">Skills</h2>
            <div className="skills-grid-mobile">
              {resume.skills.map((s: any, idx: number) => (
                <div key={idx} className="skill-tag-mobile">
                  <span className="skill-name">{s.name}</span>
                  <span className="skill-level">{s.level}</span>
                </div>
              ))}
            </div>
          </section>
        )}

        {Array.isArray(resume.projects) && resume.projects.length > 0 && (
          <section className="resume-section-mobile">
            <h2 className="section-title-mobile">Projects</h2>
            <div className="projects-stack-mobile">
              {resume.projects.map((p: any, idx: number) => (
                <div key={idx} className="project-card-mobile">
                  <h4>{p.title}</h4>
                  <p>{p.role}</p>
                  <p className="project-outcome">{p.outcome}</p>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="resume-footer-mobile">
        <Shield size={16} /> <span>Verified by MyRaaha</span>
      </footer>
    </div>
  );
};

export default MobilePublicResume;
