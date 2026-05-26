import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  CheckCircle, 
  Upload, 
  Send,
  Briefcase,
  AlertTriangle,
  FileText,
  Trash2
} from 'lucide-react';
import MyRaahaNavbar from '../../components/MyRaahaNavbar';
import MyRaahaFooter from '../../components/MyRaahaFooter';
import StandardPageHero from '../../components/StandardPageHero';
import { careersData } from '../../data/careersData';
import { supabase } from '@/integrations/supabase/client';
import './CareerRole.css';

const RoleDetails = () => {
  const { roleId } = useParams<{ roleId: string }>();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumePreviewName, setResumePreviewName] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  const role = careersData.find(r => r.id === roleId);

  if (!role) {
    return (
      <div className="role-page min-h-screen flex flex-col">
        <MyRaahaNavbar />
        <div className="container flex-grow flex flex-col items-center justify-center py-20 text-center">
          <h2 className="text-3xl font-bold mb-4">Position Not Found</h2>
          <p className="text-slate-500 mb-8">The career role you are looking for does not exist or has been filled.</p>
          <Link to="/careers" className="btn-search py-3 px-6 rounded-xl text-white font-bold bg-primary hover:opacity-90 transition">
            Back to Careers
          </Link>
        </div>
        <MyRaahaFooter />
      </div>
    );
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        setErrorMsg('File size exceeds the 5MB limit. Please upload a smaller file.');
        return;
      }
      setResumeFile(file);
      setResumePreviewName(file.name);
      setErrorMsg('');
    }
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setResumeFile(null);
    setResumePreviewName('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleApplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !resumeFile) {
      setErrorMsg('Please fill in all required fields and upload your resume.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      // 1. Upload Resume PDF to Supabase Storage resumes bucket
      const fileExt = resumeFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 11)}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('resumes')
        .upload(fileName, resumeFile, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error(`Resume upload failed: ${uploadError.message}`);
      }

      // 2. Fetch the public URL of the resume
      const { data } = supabase.storage
        .from('resumes')
        .getPublicUrl(fileName);

      if (!data || !data.publicUrl) {
        throw new Error('Failed to retrieve the resume URL.');
      }

      const resumeUrl = data.publicUrl;

      // 3. Save Candidate details in Database
      const { error: insertError } = await supabase
        .from('career_applications')
        .insert([{
          role_id: role.id,
          role_title: role.title,
          full_name: fullName.trim(),
          email: email.trim(),
          linkedin_url: linkedinUrl.trim() || null,
          resume_url: resumeUrl,
          status: 'pending'
        }]);

      if (insertError) throw insertError;

      // 4. Set Success state and clear fields
      setSubmitted(true);
      setFullName('');
      setEmail('');
      setLinkedinUrl('');
      setResumeFile(null);
      setResumePreviewName('');

    } catch (err: any) {
      console.error('Career application submission error:', err);
      setErrorMsg(err.message || 'An error occurred while submitting your application. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to split title for styling last word with span
  const titleParts = role.title.split(' ');
  const lastWord = titleParts[titleParts.length - 1];
  const firstPart = titleParts.slice(0, -1).join(' ');

  return (
    <div className="role-page">
      <MyRaahaNavbar />

      <div className="role-container pt-8 px-4">
        <Link to="/careers" className="inline-flex items-center text-slate-500 hover:text-primary transition gap-2 mb-4" style={{ textDecoration: 'none', color: 'var(--myraaha-text-gray)', fontWeight: 600 }}>
          <ArrowLeft size={16} />
          <span>Back to All Openings</span>
        </Link>
      </div>

      <StandardPageHero 
        badge={`Careers / ${role.classification}`}
        title={
          <>
            {firstPart} <span>{lastWord}</span>
          </>
        }
        subtitle={role.description}
        features={[]}
      />

      <section className="role-section">
        <div className="role-container">
          <div className="role-details-grid">
            
            {/* Redesigned Premium Details Section */}
            <div className="role-details-content">
              
              {/* About Role Card */}
              <div className="role-details-card">
                <span className="role-section-badge">The Role</span>
                <h2 className="role-section-title" style={{ fontSize: '2.25rem' }}>About the <span>Position</span></h2>
                <p className="role-section-subtitle" style={{ marginTop: '1rem', fontSize: '1.05rem' }}>
                  As the {role.title} at MyRaaha, you will play an active role in shaping a tech-first, 
                  AI-driven career and entrepreneurship navigation infrastructure. You will collaborate 
                  across functional domains to deliver revenue-sustained, automation-led systems that own the full journey 
                  from clarity to real-world outcomes.
                </p>
              </div>

              {/* Requirements Card */}
              <div className="role-details-card">
                <h2 className="role-section-title" style={{ fontSize: '2.25rem', marginBottom: '2rem' }}>What we are <span>looking for</span></h2>
                <ul className="role-requirements-list">
                  {role.requirements.map((req, i) => (
                    <li key={i} className="role-requirement-item">
                      <div className="role-requirement-icon">
                        <CheckCircle size={14} />
                      </div>
                      <span className="role-section-subtitle" style={{ fontSize: '1.05rem', color: 'var(--myraaha-text-dark)' }}>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Skills/Expertise Section */}
              <div>
                <h2 className="role-section-title" style={{ fontSize: '2.25rem', marginBottom: '2rem' }}>{role.skillsLabel}</h2>
                <div className="role-skills-grid">
                  {role.skills.map((skill, i) => (
                    <div key={i} className="role-skill-card">
                      <div className="role-skill-icon">
                        <Briefcase size={18} />
                      </div>
                      <div>
                        <h4>{skill}</h4>
                        <p>Essential Domain Expertise</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Redesigned Application Form Sidebar Widget */}
            <div className="role-sidebar-sticky">
              <div className="role-application-card">
                {submitted ? (
                  <div className="text-center py-10 flex flex-col items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-6" style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#ecfdf5', color: '#10b981', display: 'flex', alignItems: 'center', justify: 'center' }}>
                      <CheckCircle size={32} />
                    </div>
                    <h3 className="role-form-title" style={{ color: 'var(--myraaha-blue)' }}>Application Received!</h3>
                    <p className="role-form-subtitle" style={{ marginTop: '0.5rem' }}>
                      Thank you for applying to join the MyRaaha mission. Our team will review your credentials and get back to you shortly.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleApplySubmit} className="flex flex-col">
                    <div>
                      <h3 className="role-form-title">Apply for this <span>Role</span></h3>
                      <p className="role-form-subtitle">Join our revenue-sustained mission</p>
                    </div>

                    <div className="role-form-group">
                      <label className="role-form-label">Full Name *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="John Doe" 
                        className="role-form-input"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="role-form-group">
                      <label className="role-form-label">Email Address *</label>
                      <input 
                        type="email" 
                        required 
                        placeholder="john@example.com" 
                        className="role-form-input"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="role-form-group">
                      <label className="role-form-label">LinkedIn / Portfolio</label>
                      <input 
                        type="url" 
                        placeholder="https://linkedin.com/in/username" 
                        className="role-form-input"
                        value={linkedinUrl}
                        onChange={(e) => setLinkedinUrl(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>

                    <div className="role-form-group">
                      <label className="role-form-label">Resume (PDF) *</label>
                      <div 
                        className="role-upload-zone"
                        onClick={triggerFileInput}
                        style={{ cursor: 'pointer', border: resumeFile ? '2px dashed var(--myraaha-blue)' : '2px dashed #e2e8f0', background: resumeFile ? '#f8fafc' : 'transparent', transition: 'all 0.2s', padding: '1.25rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem', textAlign: 'center' }}
                      >
                        {resumeFile ? (
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                            <FileText size={32} style={{ color: 'var(--myraaha-blue)' }} />
                            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginTop: '0.5rem', display: 'block', maxWidth: '100%', wordBreak: 'break-all' }}>
                              {resumePreviewName}
                            </span>
                            <span style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>
                              {(resumeFile.size / (1024 * 1024)).toFixed(2)} MB
                            </span>
                            <button
                              type="button"
                              onClick={handleRemoveFile}
                              style={{
                                marginTop: '0.75rem',
                                background: '#fef2f2',
                                border: '1px solid #fee2e2',
                                color: '#ef4444',
                                padding: '0.4rem 0.8rem',
                                borderRadius: '8px',
                                fontSize: '0.75rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.25rem',
                                transition: 'all 0.2s'
                              }}
                              onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                              onMouseLeave={(e) => e.currentTarget.style.background = '#fef2f2'}
                            >
                              <Trash2 size={12} /> Remove
                            </button>
                          </div>
                        ) : (
                          <>
                            <Upload size={22} style={{ color: '#64748b' }} />
                            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--myraaha-text-dark)' }}>Upload PDF / DOCX</span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--myraaha-text-gray)' }}>Max size 5MB</span>
                          </>
                        )}
                        <input 
                          type="file" 
                          ref={fileInputRef}
                          style={{ display: 'none' }}
                          accept=".pdf,.docx,.doc"
                          onChange={handleFileChange}
                          disabled={isSubmitting}
                        />
                      </div>
                    </div>

                    {errorMsg && (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: '#dc2626',
                        fontSize: '0.85rem',
                        fontWeight: 500,
                        marginTop: '0.5rem',
                        marginBottom: '1rem',
                        padding: '0.6rem',
                        background: '#fef2f2',
                        borderRadius: '8px',
                        border: '1px solid #fee2e2'
                      }}>
                        <AlertTriangle size={14} />
                        <span>{errorMsg}</span>
                      </div>
                    )}

                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="role-submit-btn"
                      style={{ marginTop: '1rem' }}
                    >
                      {isSubmitting ? 'Submitting...' : (
                        <>
                          <span>Submit Application</span>
                          <Send size={14} />
                        </>
                      )}
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      <MyRaahaFooter />
    </div>
  );
};

export default RoleDetails;
