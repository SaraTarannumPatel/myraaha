import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Search, 
  MapPin, 
  Clock, 
  ArrowRight, 
  X, 
  CheckCircle, 
  Upload, 
  Send,
  Zap,
  Heart,
  Globe,
  Rocket,
  Shield,
  Coffee,
  Sun,
  Smile,
  Briefcase,
  Users,
  GraduationCap,
  Cpu,
  Handshake,
  Target
} from 'lucide-react';
import MyRaahaNavbar from '../components/MyRaahaNavbar';
import MyRaahaFooter from '../components/MyRaahaFooter';
import { careersData } from '../data/careersData';
import './MyRaahaCareers.css';
import './careers/CareerRole.css';
import StandardPageHero from '../components/StandardPageHero';

interface Job {
  id: string;
  title: string;
  category: string;
  location: string;
  type: string;
  description: string;
  requirements: string[];
  perks: string[];
}

const jobs: Job[] = careersData.map(role => ({
  id: role.id,
  title: role.title,
  category: role.department,
  location: role.location,
  type: `${role.type} (${role.classification})`,
  description: role.description,
  requirements: role.requirements,
  perks: role.skills
}));

const MyRaahaCareers = () => {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollTabs = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 150;
      scrollRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const [searchTerm, setSearchTerm] = useState(() => {
    return sessionStorage.getItem('myraaha_careers_search') || '';
  });
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return sessionStorage.getItem('myraaha_careers_category') || 'All';
  });
  const [selectedClassification, setSelectedClassification] = useState(() => {
    return sessionStorage.getItem('myraaha_careers_classification') || 'All Paths';
  });

  useEffect(() => {
    sessionStorage.setItem('myraaha_careers_search', searchTerm);
  }, [searchTerm]);

  useEffect(() => {
    sessionStorage.setItem('myraaha_careers_category', selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    sessionStorage.setItem('myraaha_careers_classification', selectedClassification);
  }, [selectedClassification]);

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const categories = ['All', ...Array.from(new Set(jobs.map(j => j.category)))];

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || job.category === selectedCategory;
    
    const role = careersData.find(r => r.id === job.id);
    const matchesClassification = selectedClassification === 'All Paths' || (role && role.classification === selectedClassification);
    
    return matchesSearch && matchesCategory && matchesClassification;
  });

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate API call
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        setShowApplyForm(false);
        setSelectedJob(null);
        setSubmitted(false);
      }, 3000);
    }, 2000);
  };

  return (
    <div className="careers-page">
      <MyRaahaNavbar />

      <StandardPageHero 
        badge="We're hiring"
        title={
          <>
            Build the future of <br />
            human <span>potential</span>
          </>
        }
        subtitle="Join a collective of visionaries, builders, and dreamers dedicated to redefining how the world discovers purpose and builds ventures."
        features={[]}
      />

      {/* Why Work with Us Section */}
      <section className="careers-section why-work-with-us">
        <div className="container">
          <div className="role-split-container">
            <div className="role-split-text">
              <span className="section-badge">Our purpose</span>
              <h2 className="section-title">Why join <span>us?</span></h2>
              <p className="section-subtitle">
                We aren't just building a company; we're building a movement to unlock human potential at scale. 
                Our mission is to ensure that every individual, regardless of their background, has 
                access to the guidance they need to thrive.
              </p>
              
              <div className="mini-values-grid">
                <div className="mini-value-item">
                  <Rocket className="w-5 h-5 text-purple-600" />
                  <span>Radical autonomy</span>
                </div>
                <div className="mini-value-item">
                  <Heart className="w-5 h-5 text-pink-500" />
                  <span>Meaningful impact</span>
                </div>
                <div className="mini-value-item">
                  <Globe className="w-5 h-5 text-blue-500" />
                  <span>Global inclusion</span>
                </div>
                <div className="mini-value-item">
                  <Zap className="w-5 h-5 text-primary" />
                  <span>Hyper growth</span>
                </div>
              </div>
            </div>
            <div className="role-split-image">
              <img src="/myraaha_hero_v2_1778819576959.png" alt="Working at MyRaaha" />
            </div>
          </div>
        </div>
      </section>

      {/* Ways to Join Us Section */}
      <section className="careers-section ways-to-join">
        <div className="container">
          <div className="section-header-centered">
            <span className="section-badge">Join the mission</span>
            <h2 className="section-title">Choose your <span>path</span></h2>
            <p className="section-subtitle">Whether you're looking for a full-time role or a flexible contribution, there's a place for you at MyRaaha.</p>
          </div>

          <div className="join-paths-grid">
            {[
              { title: 'Core <span>team</span>', icon: <Users />, path: '/careers/core-team', desc: 'Drive the long-term vision and build the foundation of MyRaaha.' },
              { title: '<span>Intern</span>', icon: <GraduationCap />, path: '/careers/intern', desc: 'Launch your career with hands-on experience in a fast-paced startup.' },
              { title: '<span>Volunteer</span>', icon: <Smile />, path: '/careers/volunteer', desc: 'Dedicate your time to help bridge the gap for rural and underserved students.' },
              { title: '<span>Facilitator</span>', icon: <Handshake />, path: '/careers/facilitator', desc: 'Guide and mentor the next generation of innovators and entrepreneurs.' }
            ].map((role, i) => (
              <Link to={role.path} key={i} className="join-path-card">
                <div className="path-icon">{role.icon}</div>
                <h3 dangerouslySetInnerHTML={{ __html: role.title }}></h3>
                <p>{role.desc}</p>
                <div className="path-link">
                  <span>Explore role</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Team Culture Section */}
      <section className="about-section team-culture">
        <div className="culture-header">
          <span className="culture-badge">Our Culture</span>
          <h2 className="culture-title">The MyRaaha <span>Way</span></h2>
          <p className="culture-subtitle">We are building an ecosystem based on radical autonomy, unshakeable conviction, and a quiet, structural confidence.</p>
        </div>

        <div className="culture-row">
          <div className="culture-text">
            <h3>Autonomy and <span>Accountability</span></h3>
            <p>We don't manage people; we manage missions. Every team member has the freedom to own their work and the responsibility to deliver excellence.</p>
            <div className="culture-features">
              <div className="culture-feature">
                <Zap size={24} />
                <h4>Speed</h4>
                <span>We move fast and iterate constantly to bridge the gap.</span>
              </div>
              <div className="culture-feature">
                <Target size={24} />
                <h4>Focus</h4>
                <span>Every action is aligned with our north star.</span>
              </div>
            </div>
          </div>
          <div className="culture-image">
            <img src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" alt="Culture" />
          </div>
        </div>

        <div className="culture-row reversed">
          <div className="culture-text">
            <h3>Empathy and <span>Precision</span></h3>
            <p>We combine deep human understanding with clinical precision. Our technology scales empathy to reach every student in Bharat.</p>
            <div className="culture-features">
              <div className="culture-feature">
                <Heart size={24} />
                <h4>Empathy</h4>
                <span>Understanding the learner's journey at its core.</span>
              </div>
              <div className="culture-feature">
                <Shield size={24} />
                <h4>Trust</h4>
                <span>Building a reliable platform for life-changing decisions.</span>
              </div>
            </div>
          </div>
          <div className="culture-image">
            <img src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=800&q=80" alt="Culture" />
          </div>
        </div>
      </section>

      {/* Life at MyRaaha */}
      <section className="life-at-myraaha">
        <div className="life-container">
          <div className="life-image">
            <img src="/myraaha_service_builder_v2_1778819634075.png" alt="Life at MyRaaha" />
          </div>
          <div className="life-content">
            <div className="life-chapter life-intro">
              <span className="section-badge" style={{ color: '#ffffff' }}>Life at MyRaaha</span>
              <h2 className="section-title">Where work meets <span style={{ color: '#ffffff' }}>purpose</span></h2>
            </div>
            
            <div className="life-chapter life-narrative">
              <p>
                We are a hybrid-first team that values asynchronous collaboration and deep work. 
                Our culture is built on transparency, empathy, and a shared passion for social innovation.
              </p>
            </div>

            <div className="life-chapter life-benefits">
              <div className="perks-mini-grid">
                <div className="perk-item"><Coffee className="w-4 h-4" /> <span>Flexible Hours</span></div>
                <div className="perk-item"><Sun className="w-4 h-4" /> <span>Remote-First</span></div>
                <div className="perk-item"><Shield className="w-4 h-4" /> <span>Health & Wellness</span></div>
                <div className="perk-item"><Smile className="w-4 h-4" /> <span>Team Offsites</span></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Job List Section */}
      <section className="job-list-section" id="open-roles">
        <div className="container">
          <div className="careers-hero-search">
            <div className="search-input-wrapper">
              <Search className="w-5 h-5 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search for roles (e.g. Engineer, Designer)" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button className="btn-search">Find Roles</button>
          </div>

          <div className="careers-layout-grid">
            {/* Sidebar Filters Widget - Left (Both Stacked) */}
            <aside className="careers-sidebar left-sidebar">
              <div className="sidebar-widget">
                <h3 className="widget-title">Filter by <span>Department</span></h3>
                <div className="department-links">
                  {categories.map(cat => {
                    const count = jobs.filter(j => cat === 'All' || j.category === cat).length;
                    return (
                      <button
                        key={cat}
                        className={`dept-link-btn ${selectedCategory === cat ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(cat)}
                      >
                        <span className="dept-name">{cat}</span>
                        <span className="dept-count">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="sidebar-widget">
                <h3 className="widget-title">Filter by <span>Path</span></h3>
                <div className="classification-pills vertical-pills">
                  {['All Paths', 'Core Team', 'Intern', 'Volunteer', 'Facilitator'].map(path => {
                    const count = path === 'All Paths' 
                      ? careersData.length 
                      : careersData.filter(r => r.classification === path).length;
                    return (
                      <button
                        key={path}
                        className={`class-pill-btn ${selectedClassification === path ? 'active' : ''}`}
                        onClick={() => setSelectedClassification(path)}
                      >
                        <span className="class-name">{path}</span>
                        <span className="class-count">{count}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* Active Openings Results List - Right */}
            <div className="careers-main-content">
              <div className="openings-header-row">
                <h2 className="section-title">Current <span>openings</span> ({filteredJobs.length})</h2>
                <div className="active-filters-summary">
                  {selectedCategory !== 'All' && (
                    <span className="active-filter-tag">
                      {selectedCategory}
                      <button className="clear-tag-btn" onClick={() => setSelectedCategory('All')}>×</button>
                    </span>
                  )}
                  {selectedClassification !== 'All Paths' && (
                    <span className="active-filter-tag">
                      {selectedClassification}
                      <button className="clear-tag-btn" onClick={() => setSelectedClassification('All Paths')}>×</button>
                    </span>
                  )}
                </div>
              </div>

              <div className="jobs-grid">
                {filteredJobs.length > 0 ? (
                  filteredJobs.map(job => (
                    <div key={job.id} className="job-card" onClick={() => navigate(`/careers/role/${job.id}`)}>
                      <div className="job-card-main">
                        <span className="job-category-tag">{job.category}</span>
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
                  ))
                ) : (
                  <div className="no-jobs">
                    <p>No open roles found matching your filter criteria.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="job-modal-overlay" onClick={() => setSelectedJob(null)}>
          <div className="job-modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setSelectedJob(null)}>
              <X />
            </button>
            
            <div className="modal-header">
              <span className="job-category-tag">{selectedJob.category}</span>
              <h2>{selectedJob.title.split(' ').slice(0, -1).join(' ')} <span>{selectedJob.title.split(' ').slice(-1).toLowerCase()}</span></h2>
              <div className="job-meta">
                <div className="meta-item"><MapPin className="w-4 h-4" /> <span>{selectedJob.location}</span></div>
                <div className="meta-item"><Clock className="w-4 h-4" /> <span>{selectedJob.type}</span></div>
              </div>
            </div>

            <div className="modal-body">
              <section className="modal-section">
                <h3>About the <span>role</span></h3>
                <p>{selectedJob.description}</p>
              </section>

              <section className="modal-section">
                <h3>What we're <span>looking for</span></h3>
                <ul>
                  {selectedJob.requirements.map((req, i) => <li key={i}>{req}</li>)}
                </ul>
              </section>

              <section className="modal-section">
                <h3>Perks & <span>benefits</span></h3>
                <div className="perks-grid">
                  {selectedJob.perks.map((perk, i) => (
                    <div key={i} className="perk-box">
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                      <span>{perk}</span>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <div className="modal-footer">
              <button 
                className="btn-apply-now"
                onClick={() => setShowApplyForm(true)}
              >
                Apply for this Position
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Apply Form Modal */}
      {showApplyForm && selectedJob && (
        <div className="apply-modal-overlay" onClick={() => setShowApplyForm(false)}>
          <div className="apply-modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={() => setShowApplyForm(false)}>
              <X />
            </button>

            {submitted ? (
              <div className="success-message">
                <div className="success-icon"><CheckCircle /></div>
                <h2>Application <span>submitted!</span></h2>
                <p>Thank you for applying to be a part of MyRaaha. Our team will review your application and get back to you soon.</p>
              </div>
            ) : (
              <form className="apply-form" onSubmit={handleApplySubmit}>
                <div className="form-header">
                  <h2>Apply for <span>{selectedJob.title}</span></h2>
                  <p>Tell us a bit about yourself and why you'd be a great fit.</p>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>Full Name</label>
                    <input type="text" required placeholder="John Doe" />
                  </div>
                  <div className="form-group">
                    <label>Email Address</label>
                    <input type="email" required placeholder="john@example.com" />
                  </div>
                  <div className="form-group full-width">
                    <label>LinkedIn Profile URL</label>
                    <input type="url" placeholder="https://linkedin.com/in/username" />
                  </div>
                  <div className="form-group full-width">
                    <label>Resume / Portfolio</label>
                    <div className="file-upload-zone">
                      <Upload className="w-8 h-8 text-slate-300" />
                      <p>Click to upload or drag and drop</p>
                      <span>PDF, DOCX (Max 5MB)</span>
                      <input type="file" className="hidden-file-input" />
                    </div>
                  </div>
                  <div className="form-group full-width">
                    <label>Why MyRaaha?</label>
                    <textarea rows={4} placeholder="Tell us what motivates you..."></textarea>
                  </div>
                </div>

                <button className="btn-submit-apply" disabled={isSubmitting}>
                  {isSubmitting ? 'Sending...' : (
                    <>
                      Submit Application
                      <Send className="w-4 h-4 ml-2" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      <MyRaahaFooter />
    </div>
  );
};

export default MyRaahaCareers;
