import { useState, useEffect } from 'react';
import { 
  Users, 
  Target, 
  TrendingUp,
  Linkedin,
  Mail,
  Briefcase,
  Star,
  GraduationCap,
  Zap,
  Infinity,
  Map,
  BookOpen,
  Cpu,
  Heart,
  HeartHandshake,
  Medal,
  ShieldCheck,
  Building2,
  BarChart
} from 'lucide-react';
import MyRaahaNavbar from '../components/MyRaahaNavbar';
import MyRaahaNewsletter from '../components/MyRaahaNewsletter';
import MyRaahaFooter from '../components/MyRaahaFooter';
import './MyRaahaAbout.css';
import './MyRaahaLanding.css';
import StandardPageHero from '../components/StandardPageHero';

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  image: string;
  journey: string;
  qualifications: string[];
  plusPoints: string[];
  socials: {
    linkedin?: string;
    twitter?: string;
    mail?: string;
  };
}

const teamMembers: Record<string, TeamMember[]> = {
      'Leadership team': [
    {
      name: 'Mainak Basu',
      role: 'Products and platform',
      bio: 'IIT alumni | Expert in platform strategy and product architecture.',
      image: '/images/team/mainak.jpeg',
      journey: 'Mainak leads the product strategy and platform architecture, ensuring a seamless navigation experience for every user. With an IIT background, he brings a structured approach to building scalable tech infrastructure.',
      qualifications: ['IIT alumni', 'B.Tech in computer science', 'Expert in product management'],
      plusPoints: ['Platform architect', 'Strategic visionary', 'User-centric design'],
      socials: { linkedin: '#', mail: 'contact@myraaha.org' }
    },
    {
      name: 'Rishi Prakash',
      role: 'Fintech expert',
      bio: 'IIT alumni | Specialist in building sustainable, revenue-first models.',
      image: '/images/team/rishi.jpg',
      journey: 'Rishi brings deep fintech expertise to build self-sustaining, revenue-first models for social impact. He ensures that MyRaaha reaches rural India without being beholden to donation cycles.',
      qualifications: ['IIT alumni', 'MBA in finance', 'Certified financial analyst'],
      plusPoints: ['Revenue strategist', 'Economic modeler', 'Impact investor'],
      socials: { linkedin: '#', mail: 'contact@myraaha.org' }
    },
    {
      name: 'Dr. Santosh Srivastava',
      role: 'AI/ML expert',
      bio: 'IIT alumni | Leading the development of the 3A Intelligence Engine.',
      image: '/images/team/santosh.jpeg',
      journey: 'Dr. Santosh spearheads the 3A Intelligence Engine, integrating advanced AI for personalized career guidance. His research focuses on making AI emotionally intelligent and accessible.',
      qualifications: ['PhD in AI/ML', 'IIT alumni', 'Published researcher in neural networks'],
      plusPoints: ['AI pioneer', 'Data scientist', 'Machine learning architect'],
      socials: { linkedin: '#', mail: 'contact@myraaha.org' }
    }
  ],
  'Core team': [
    {
      name: 'Swati Verma',
      role: 'Education expert',
      bio: 'Pedagogy specialist focused on 21st-century skill alignment.',
      image: '/images/team/swati.jpeg',
      journey: 'Swati ensures our frameworks are aligned with the latest educational standards and pedagogical best practices. She bridges the gap between academic theory and industry demand.',
      qualifications: ['M.Ed in educational leadership', 'Certified pedagogy expert', 'B.A. in psychology'],
      plusPoints: ['Curriculum designer', 'Educational consultant', 'Skill mapping expert'],
      socials: { linkedin: '#', mail: 'contact@myraaha.org' }
    },
    {
      name: 'Sara Tarannum',
      role: 'Technology development',
      bio: 'Full-stack developer building the core navigation infrastructure.',
      image: '/images/team/sara.JPG',
      journey: 'Sara drives the core technology development, turning complex navigation logic into intuitive software. She is passionate about building tech that has a real-world social impact.',
      qualifications: ['B.Tech in software engineering', 'Full stack developer', 'Cloud computing certified'],
      plusPoints: ['Agile developer', 'System architect', 'Innovation driven'],
      socials: { linkedin: '#', mail: 'contact@myraaha.org' }
    },
    {
      name: 'Popy Das',
      role: 'Business operations',
      bio: 'Operational lead scaling MyRaaha to tier 3 and 4 cities.',
      image: '/images/team/popy.jpeg',
      journey: 'Popy manages the end-to-end business operations, scaling MyRaaha\'s reach to tier 3 and 4 cities. She ensures that our navigation system is accessible to everyone, everywhere.',
      qualifications: ['MBA in operations management', 'Six sigma green belt', 'Expert in logistics'],
      plusPoints: ['Operational excellence', 'Scaling specialist', 'Process optimizer'],
      socials: { linkedin: '#', mail: 'contact@myraaha.org' }
    }
  ],
  'Domain specialists': [
    {
      name: 'Jovina M',
      role: 'HR expert',
      bio: 'Human resources lead nurturing our growing network of innovators.',
      image: '/images/team/jovina.jpeg',
      journey: 'Jovina builds and nurtures the growing team of innovators and volunteers that power the MyRaaha mission. She focuses on building a culture of radical autonomy and inclusion.',
      qualifications: ['Masters in human resources', 'Certified HR professional', 'B.Sc in psychology'],
      plusPoints: ['Culture builder', 'Talent acquisition', 'Employee well-being'],
      socials: { linkedin: '#', mail: 'contact@myraaha.org' }
    }
  ]
};



const MyRaahaAbout = () => {
  const [expandedMember, setExpandedMember] = useState<string | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="about-page">
      <MyRaahaNavbar />

      <StandardPageHero 
        badge="Who we are"
        title={
          <>
            Clarity to Direction, Action to Outcome, <br />
            Impact for <span>tomorrow</span>
          </>
        }
        subtitle={
          <>
            MyRaaha is a tech-first, emotionally intelligent navigation system that delivers scalable <br /> 
            career decision and entrepreneurship guidance through data driven insights at every stage.
          </>
        }
        features={[]}
      />

      {/* Our Motivation Section: Cinematic Redesign */}
      <section className="motivation-premium">
        <div className="motivation-hero">
          <div className="motivation-hero-image">
            <img src="/myraaha_about_motivation_v2_1778819838845.png" alt="Motivation" />
            <div className="motivation-image-overlay"></div>
          </div>
          <div className="motivation-hero-content">
            <span className="section-badge-white">Our motivation</span>
            <h2 className="motivation-hero-title">The world of work is <span>transforming</span></h2>
            <p className="motivation-hero-lead">
              After extensive research, we found that newer economies and domains remain largely unexplored, creating a gap that MyRaaha is uniquely designed to fill.
            </p>
          </div>
        </div>

        <div className="compounding-effect-premium">
          <div className="compounding-header">
            <div className="ce-icon-box"><Zap size={32} /></div>
            <h3>Confusion magnified by the <span>compounding effect</span></h3>
          </div>
          <div className="compounding-grid">
            <div className="compounding-card">
              <div className="card-number">01</div>
              <h4>Low <span>Confidence</span></h4>
              <p>Uncertainty in career direction leading to hesitation and missed beginnings.</p>
            </div>
            <div className="compounding-card">
              <div className="card-number">02</div>
              <h4>Under <span>employment</span></h4>
              <p>Job dissatisfaction arising from skill-role misalignment in early careers.</p>
            </div>
            <div className="compounding-card">
              <div className="card-number">03</div>
              <h4>No <span>Direction</span></h4>
              <p>Drowning in information without a structured path to convert it to action.</p>
            </div>
            <div className="compounding-card">
              <div className="card-number">04</div>
              <h4>Missed <span>Odds</span></h4>
              <p>Lost opportunities due to lack of awareness of emerging global domains.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Bharat Impact Section: Premium Mosaic Redesign */}
      <section className="bharat-mission-premium">
        <div className="bharat-header">
          <span className="section-badge">Our mission for Bharat</span>
          <h2 className="section-title">Bridging the <span>Bharat gap</span></h2>
          <p className="section-subtitle">Fueling a $30 Tn economy through structural clarity and data-driven guidance.</p>
        </div>

        <div className="bharat-mosaic">
          {/* Opportunity Card */}
          <div className="mosaic-card opportunity-card">
            <div className="mosaic-card-header">
              <span className="mosaic-tag">Strategy</span>
              <h3>The <br /> <span>opportunity</span></h3>
            </div>
            <div className="opportunity-points-grid">
              <div className="opp-point-card">Urban-rural divide</div>
              <div className="opp-point-card">The growing Youth</div>
              <div className="opp-point-card">NEP 2020 thrust</div>
              <div className="opp-point-card">Demand shift</div>
              <div className="opp-point-card">Human-Machine harmony</div>
              <div className="opp-point-card">Tech transformation</div>
            </div>
            <div className="mosaic-card-image">
              <img src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=800&q=80" alt="Opportunity" />
            </div>
          </div>

          {/* Challenge Card */}
          <div className="mosaic-card challenge-card">
            <div className="mosaic-card-header">
              <span className="mosaic-tag">The Problem</span>
              <h3>The <span>challenge</span></h3>
            </div>
            <p className="challenge-lead">India's problem is not unemployment alone — it is <strong>"Mass non-participation"</strong> due to career misalignment.</p>
            <div className="lfpr-visual">
              <div className="lfpr-stat">
                <div className="stat-info">
                  <strong>55%</strong>
                  <span>Current LFPR (2025)</span>
                </div>
                <div className="stat-bar-bg"><div className="stat-bar current" style={{ width: '55%' }}></div></div>
              </div>
              <div className="lfpr-divider"><TrendingUp size={20} /></div>
              <div className="lfpr-stat">
                <div className="stat-info">
                  <strong>70%</strong>
                  <span>Target LFPR (2047)</span>
                </div>
                <div className="stat-bar-bg"><div className="stat-bar target" style={{ width: '70%' }}></div></div>
              </div>
            </div>
          </div>

          {/* Need Card */}
          <div className="mosaic-card need-card">
            <div className="mosaic-card-header">
              <span className="mosaic-tag">The Solution</span>
              <h3>The <span>need</span></h3>
            </div>
            <div className="need-stats-grid">
              <div className="need-stat-item">
                <div className="ns-icon"><Users size={20} /></div>
                <div className="ns-data">
                  <strong>64%</strong>
                  <span>Personal Fit Gap</span>
                </div>
              </div>
              <div className="need-stat-item highlight">
                <div className="ns-icon"><HeartHandshake size={20} /></div>
                <div className="ns-data">
                  <strong>78%</strong>
                  <span>The Trust Deficit</span>
                </div>
              </div>
              <div className="need-stat-item">
                <div className="ns-icon"><Map size={20} /></div>
                <div className="ns-data">
                  <strong>78%</strong>
                  <span>The Awareness Gap</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="value-realization-strip">
          <div className="strip-title">What quality guidance <span>offers</span></div>
          <div className="offers-grid">
            <div className="offer-card">
              <div className="offer-icon"><BookOpen size={20} /></div>
              <div className="offer-info"><strong>Students</strong> <span>Choice clarity</span></div>
            </div>
            <div className="offer-card">
              <div className="offer-icon"><ShieldCheck size={20} /></div>
              <div className="offer-info"><strong>Parents</strong> <span>Risk reduction</span></div>
            </div>
            <div className="offer-card">
              <div className="offer-icon"><GraduationCap size={20} /></div>
              <div className="offer-info"><strong>Schools</strong> <span>NEP compliance</span></div>
            </div>
            <div className="offer-card">
              <div className="offer-icon"><Building2 size={20} /></div>
              <div className="offer-info"><strong>Colleges</strong> <span>Better intake</span></div>
            </div>
            <div className="offer-card">
              <div className="offer-icon"><Briefcase size={20} /></div>
              <div className="offer-info"><strong>Industry</strong> <span>Recruitable talent</span></div>
            </div>
            <div className="offer-card">
              <div className="offer-icon"><BarChart size={20} /></div>
              <div className="offer-info"><strong>CSR</strong> <span>Measurable impact</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Strategic Framework: Theory of Change v7 Premium Redesign */}
      <section className="theory-premium-v7">
        <header className="theory-v7-header">
          <span className="section-badge">Strategic framework</span>
          <h2 className="section-title">The theory of <span>change</span></h2>
          <p className="section-subtitle">A multi-layered approach to democratizing career intelligence.</p>
        </header>

        {/* Layer 1: The North Star (Vision Prism) */}
        <div className="theory-v7-layer prism-layer">
          <div className="prism-container">
            <div className="prism-content">
              <div className="prism-icon-box"><Star size={32} /></div>
              <h3>The North <span>Star</span></h3>
              <p className="prism-lead">To democratize career guidance for students and early professionals by combining human empathy and intelligent technology.</p>
              <div className="prism-mission">
                <p>"Building the world's most empathetic career intelligence platform — where technology scales trust."</p>
              </div>
            </div>
            <div className="prism-visual">
              <img src="/myraaha_about_vision_v2_1778819859500.png" alt="Vision" />
              <div className="prism-overlay"></div>
            </div>
          </div>
        </div>

        {/* Layer 2: The Ecosystem (Resource Grid) */}
        <div className="theory-v7-layer ecosystem-layer">
          <div className="layer-header">
            <span className="layer-num">02</span>
            <h3>The <span>ecosystem</span> resources</h3>
          </div>
          <div className="ecosystem-grid-v7">
            <div className="eco-card">
              <div className="eco-img"><img src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=400&q=80" alt="Human" /></div>
              <div className="eco-content">
                <h4>Human <span>Resources</span></h4>
                <p>Certified counsellors & domain mentors providing the "Empathy Layer".</p>
                <ul className="eco-perks">
                  <li>Personal fit assessment</li>
                  <li>1-on-1 mentorship</li>
                </ul>
              </div>
            </div>
            <div className="eco-card">
              <div className="eco-img"><img src="https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=400&q=80" alt="Tech" /></div>
              <div className="eco-content">
                <h4>Technology <span>Stack</span></h4>
                <p>Proprietary AI profiling engine and recommendation architecture.</p>
                <ul className="eco-perks">
                  <li>Data-driven profiling</li>
                  <li>Automated roadmaps</li>
                </ul>
              </div>
            </div>
            <div className="eco-card">
              <div className="eco-img"><img src="https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=400&q=80" alt="Partners" /></div>
              <div className="eco-content">
                <h4>Partner <span>Network</span></h4>
                <p>Deep integration with schools, NGOs, and Government bodies.</p>
                <ul className="eco-perks">
                  <li>NEP compliance tools</li>
                  <li>CSR impact tracking</li>
                </ul>
              </div>
            </div>
            <div className="eco-card">
              <div className="eco-img"><img src="https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?auto=format&fit=crop&w=400&q=80" alt="Knowledge" /></div>
              <div className="eco-content">
                <h4>Knowledge <span>Base</span></h4>
                <p>The world's most comprehensive library of emerging career paths.</p>
                <ul className="eco-perks">
                  <li>Role-based libraries</li>
                  <li>Tradeoff analysis</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Layer 3: The Engine (Intelligence Architecture) */}
        <div className="theory-v7-layer engine-layer">
          <div className="layer-header">
            <span className="layer-num">03</span>
            <h3>Intelligence <span>Architecture</span></h3>
          </div>
          <div className="engine-flow-v7">
            <div className="engine-hub">
              <div className="hub-icon"><Users size={24} /></div>
              <h5>Student Context</h5>
              <p>Personality, Fit & Values</p>
            </div>
            <div className="engine-connector"><Infinity size={32} /></div>
            <div className="engine-hub core">
              <div className="hub-icon"><Cpu size={24} /></div>
              <h5>AI Profiling Engine</h5>
              <p>The Intelligence Core</p>
            </div>
            <div className="engine-connector"><Infinity size={32} /></div>
            <div className="engine-hub">
              <div className="hub-icon"><Target size={24} /></div>
              <h5>Navigation Output</h5>
              <p>Clarity & Directions</p>
            </div>
          </div>
          <div className="engine-blueprint">
            <p>Our "Career-GPS" combines <strong>Psychometric Depth</strong> with <strong>Economic Realities</strong> to output actionable guidance.</p>
          </div>
        </div>

        {/* Layer 4: The Impact (Value Mosaic) */}
        <div className="theory-v7-layer impact-layer">
          <div className="layer-header">
            <span className="layer-num">04</span>
            <h3>The <span>value</span> we create</h3>
          </div>
          <div className="impact-grid-v7">
            <div className="impact-item highlight">
              <div className="impact-content">
                <strong>Sustainable Workforce</strong>
                <p>Alignment with real industry demands.</p>
              </div>
            </div>
            <div className="impact-item">
              <div className="impact-content">
                <strong>Social Mobility</strong>
                <p>Dignified careers for first-gen learners.</p>
              </div>
            </div>
            <div className="impact-item">
              <div className="impact-content">
                <strong>Educational Equity</strong>
                <p>Standardizing guidance quality across Bharat.</p>
              </div>
            </div>
            <div className="impact-item highlight">
              <div className="impact-content">
                <strong>Emotional Well-being</strong>
                <p>Clarity reduces career-induced anxiety.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Layer 5: Our Hypothesis - UNCHANGED as per request */}
        <div className="theory-v7-layer hypothesis-layer">
          <div className="layer-header">
            <span className="layer-num">05</span>
            <h3>Our <span>hypothesis</span></h3>
          </div>
          <div className="ass-grid-v6">
            <div className="ass-card-v6">
              <p>Confusion is caused by <strong>lack of access</strong>, not lack of talent.</p>
            </div>
            <div className="ass-card-v6">
              <p>Human connection is essential — technology must <strong>scale empathy</strong>.</p>
            </div>
            <div className="ass-card-v6">
              <p>Real change happens when guidance is <strong>localized and experiential</strong>.</p>
            </div>
            <div className="ass-card-v6">
              <p>Sustainable models require <strong>multi-stakeholder participation</strong>.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Journey Section (Timeline) */}
      <section className="about-section about-journey">
        <span className="section-badge">Our journey</span>
        <h2 className="section-title">The road <span>traveled</span></h2>
        
        <div className="timeline-container">
          <div className="timeline-line"></div>
          
          <div className="timeline-item">
            <div className="timeline-content">
              <span className="timeline-date">July 2025</span>
              <h3>The <span>spark</span></h3>
              <p>
                Two colleagues, working together at a previous company, had spent months watching the same problem play out around them. Students picking careers by accident. Young professionals three years into the wrong job with no language to describe why it felt wrong.
              </p>
            </div>
            <div className="timeline-dot"><span>01</span></div>
            <div className="timeline-image">
              <img src="/myraaha_journey_spark_v2_1778819878730.png" alt="The Spark" />
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-image">
              <img src="/myraaha_journey_arch_v2_1778819900048.png" alt="The Architecture of Understanding" />
            </div>
            <div className="timeline-dot"><span>02</span></div>
            <div className="timeline-content">
              <span className="timeline-date">August – September 2025</span>
              <h3>Architecture of <span>understanding</span></h3>
              <p>
                Before any code was written, they mapped the problem with clinical obsession. They arrived at a core insight: this is not a talent gap—it is an infrastructure gap. The philosophical shape of MyRaaha formed here: non-profit by intent, revenue-first by design.
              </p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-content">
              <span className="timeline-date">October – November 2025</span>
              <h3>The <span>team</span></h3>
              <p>
                The CEO called them honestly: no salary yet, no funding, but a mission that felt like it actually mattered. Engineers, designers, and researchers who had watched friends make terrible career choices joined the cause. What started as 2 became 13.
              </p>
            </div>
            <div className="timeline-dot"><span>03</span></div>
            <div className="timeline-image">
              <img src="/myraaha_platform_build_v2_1778819799457.png" alt="The Team" />
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-image">
              <img src="/myraaha_platform_journey_v2_1778819762890.png" alt="Building What Didn't Exist" />
            </div>
            <div className="timeline-dot"><span>04</span></div>
            <div className="timeline-content">
              <span className="timeline-date">November 2025 – February 2026</span>
              <h3>Building what didn't <span>exist</span></h3>
              <p>
                MyRaaha was creating an entirely new category. The 3A Intelligence Engine, The Living Resume™, and The SelfGraph™ took shape. ShuttlEx took shape here—not a quiz, but a living, breathing journey that evolved with every choice.
              </p>
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-content">
              <span className="timeline-date">March – April 2026</span>
              <h3>The hard <span>middle</span></h3>
              <p>
                The quiet, unglamorous stretch. The architecture was defined, the team was assembled, but the product was not yet ready. The culture—no emotional theatrics, no hype—became the thing that kept momentum alive when progress felt slow.
              </p>
            </div>
            <div className="timeline-dot"><span>05</span></div>
            <div className="timeline-image">
              <img src="/myraaha_platform_direction_v2_1778819742277.png" alt="The Hard Middle" />
            </div>
          </div>

          <div className="timeline-item">
            <div className="timeline-image">
              <img src="/myraaha_platform_map_v2_1778819717803.png" alt="MVP. Ready." />
            </div>
            <div className="timeline-dot"><span>06</span></div>
            <div className="timeline-content">
              <span className="timeline-date">May 2026</span>
              <h3>MVP. <span>ready</span>.</h3>
              <p>
                Eleven months after the first phone call, MyRaaha arrives at its MVP release. A product designed not to inspire, but to navigate—with the kind of quiet, structural confidence that comes from building something you believe in completely.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="about-section about-values">
        <span className="section-badge">Our values</span>
        <h2 className="section-title">Our core <span>values</span></h2>
        
        <div className="values-grid">
          <div className="value-card">
            <div className="value-icon"><Medal /></div>
            <h3><span>Honesty</span></h3>
            <p>Building trust through transparency and sincere interactions at every step.</p>
          </div>

          <div className="value-card">
            <div className="value-icon"><Heart /></div>
            <h3><span>Empathy</span></h3>
            <p>Deeply understanding the emotional and professional challenges of those we guide.</p>
          </div>

          <div className="value-card">
            <div className="value-icon"><Zap /></div>
            <h3><span>Agility</span></h3>
            <p>Adapting quickly to the evolving world of work to provide timely guidance.</p>
          </div>

          <div className="value-card">
            <div className="value-icon"><Target /></div>
            <h3><span>Resilience</span></h3>
            <p>Unshakeable conviction in bridging the infrastructure gap for a generation.</p>
          </div>

          <div className="value-card">
            <div className="value-icon"><Users /></div>
            <h3><span>Trust</span></h3>
            <p>Creating a reliable ecosystem where every participant can navigate with confidence.</p>
          </div>
        </div>
      </section>


      {/* Team Section (Merged from Team Page) */}
      <section className="about-section team-grid-section">
        <div className="section-header">
          <span className="section-badge">Our team</span>
          <h2 className="section-title">The people behind the <span>mission</span></h2>
          <p className="section-subtitle">A collective of dreamers and doers committed to scaling empathy and intelligence for Bharat's youth.</p>
        </div>
        
        <div className="team-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '2.5rem', maxWidth: '1100px', margin: '0 auto' }}>
          {Object.values(teamMembers).flat().map((member, idx) => {
            return (
              <div 
                key={idx} 
                className="team-card-premium"
                style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  cursor: 'default'
                }}
              >
                {member.image && (
                  <div 
                    className="team-card-image-container" 
                    style={{ 
                      width: '100%', 
                      aspectRatio: '1/1', 
                      overflow: 'hidden', 
                      borderRadius: '30px', 
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.05)',
                      border: '1px solid rgba(226, 232, 240, 0.6)',
                      background: 'var(--myraaha-bg-grey)',
                      position: 'relative',
                      transition: 'all 0.4s cubic-bezier(0.16, 1, 0.3, 1)'
                    }}
                  >
                    <img 
                      src={member.image} 
                      alt={member.name} 
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover', 
                        transition: 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)' 
                      }} 
                      className="team-member-photo"
                    />
                  </div>
                )}
                
                <h3 
                  style={{ 
                    marginTop: '1.25rem', 
                    marginBottom: 0,
                    fontSize: '1.4rem', 
                    fontWeight: 600, 
                    color: '#5500cb', 
                    textAlign: 'center',
                    transition: 'color 0.3s ease'
                  }}
                  className="team-member-name"
                >
                  {member.name}
                </h3>
              </div>
            );
          })}
        </div>
      </section>

      <MyRaahaNewsletter />
      <MyRaahaFooter />
    </div>
  );
};

export default MyRaahaAbout;
