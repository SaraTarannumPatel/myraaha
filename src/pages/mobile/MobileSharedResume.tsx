import { ArrowLeft, Eye, Lock, Shield } from 'lucide-react';
import { Link as RouterLink } from 'react-router-dom';
import './MobileSharedResume.css';

interface MobileSharedResumeProps {
  resume: any;
  payload: any;
  isLocked: boolean;
  unlocked: boolean;
  enteredPassword: string;
  setEnteredPassword: (v: string) => void;
  onUnlock: () => void;
}

const MobileSharedResume: React.FC<MobileSharedResumeProps> = ({ 
  resume, payload, isLocked, unlocked, enteredPassword, setEnteredPassword, onUnlock 
}) => {
  if (isLocked && !unlocked) {
    return (
      <div className="mobile-resume-page locked">
        <header className="resume-header-mobile">
          <RouterLink to="/" className="btn-back-circle">
            <ArrowLeft size={20} />
          </RouterLink>
          <div className="resume-badge-mobile">
            <Lock size={14} /> <span>Protected</span>
          </div>
        </header>
        <main className="resume-body-mobile">
          <div className="lock-card-mobile">
            <h2>Password Required</h2>
            <p>This living resume is password protected.</p>
            <input 
              type="password" 
              value={enteredPassword} 
              onChange={(e) => setEnteredPassword(e.target.value)} 
              placeholder="Enter password"
              className="mobile-input"
            />
            <button className="mobile-btn-primary" onClick={onUnlock}>Unlock Resume</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="mobile-resume-page">
      <header className="resume-header-mobile">
        <div className="resume-top-mobile">
          <RouterLink to="/" className="btn-back-circle">
            <ArrowLeft size={20} />
          </RouterLink>
          <div className="resume-badge-mobile">
            <Eye size={14} /> <span>Shared Living Resume</span>
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
        <Shield size={16} /> <span>Shared via ShuttlEx</span>
      </footer>
    </div>
  );
};

export default MobileSharedResume;
