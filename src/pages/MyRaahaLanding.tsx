import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Globe,
  Rocket,
  Handshake,
  Lightbulb,
  MessageSquare,
  Target,
  Layout,
  Users,
  Workflow,
  Compass,
  Briefcase,
  ShieldCheck,
  TrendingUp,
  Award,
  ArrowRight
} from 'lucide-react';
import MyRaahaNavbar from '../components/MyRaahaNavbar';
import MyRaahaNewsletter from '../components/MyRaahaNewsletter';
import MyRaahaFooter from '../components/MyRaahaFooter';
import './MyRaahaLanding.css';

type StakeholderType = 'Students' | 'Parents' | 'Institutions' | 'Governments';

const MyRaahaLanding = () => {
  const [activeStakeholder, setActiveStakeholder] = useState<StakeholderType>('Students');
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

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const stakeholders: Record<StakeholderType, { title: string; description: string; icon: JSX.Element }[]> = {
    'Students': [
      {
        title: 'Career Discovery',
        description: 'Enabling students to make stream and career choices with confidence and clarity through data-driven discovery.',
        icon: <Target className="w-6 h-6" />
      },
      {
        title: 'Career Navigation',
        description: 'Helping students discover emerging career paths and expanding their career imagination through personalized guidance.',
        icon: <Compass className="w-6 h-6" />
      },
      {
        title: 'Career Building',
        description: 'Bridging the skill gap with access to industry professionals to enable stronger and more impactful student outcomes.',
        icon: <ShieldCheck className="w-6 h-6" />
      }
    ],
    'Parents': [
      {
        title: 'Decision Intelligence',
        description: 'Data-driven insights to help parents support their child\'s choices with clarity and future-looking career predictions.',
        icon: <Lightbulb className="w-6 h-6" />
      },
      {
        title: 'Positive Parenting',
        description: 'Resources and frameworks for fostering a supportive environment that aligns with the child\'s innate strengths and talents.',
        icon: <Handshake className="w-6 h-6" />
      },
      {
        title: 'Continuous Tracking',
        description: 'Complete visibility into child\'s progress and career readiness milestones throughout their entire academic journey.',
        icon: <TrendingUp className="w-6 h-6" />
      }
    ],
    'Institutions': [
      {
        title: 'Institutional Reputation',
        description: 'Attract better talent by offering a future-ready model with structured and advanced career development programs.',
        icon: <Award className="w-6 h-6" />
      },
      {
        title: 'NEP 2020 Alignment',
        description: 'Full integration with National Education Policy reforms focusing on holistic, vocational, and skill-based development.',
        icon: <Workflow className="w-6 h-6" />
      },
      {
        title: 'Teacher Empowerment',
        description: 'Equipping educators with career intelligence and advanced mentoring tools to become effective guides for all students.',
        icon: <MessageSquare className="w-6 h-6" />
      }
    ],
    'Governments': [
      {
        title: 'Policy Alignment',
        description: 'Institutions increasingly need to align with National Education Policy 2020 for Viksit Bharat goals.',
        icon: <Briefcase className="w-6 h-6" />
      },
      {
        title: 'Ecosystem Integration',
        description: 'Institutions can connect students with alumni mentors and industry professionals for a strong support ecosystem.',
        icon: <Globe className="w-6 h-6" />
      },
      {
        title: 'Talent pipeline',
        description: 'Access to a curated pool of students, who are pre aligned with the labour market requirement.',
        icon: <Users className="w-6 h-6" />
      }
    ]
  };


  return (
    <div className="myraaha-landing">
      <MyRaahaNavbar />

      {/* Hero Section */}
      <section className="myraaha-hero">
        <div className="hero-content" style={{ transform: 'translateY(50px)' }}>
          <h1 className="hero-title">
            Confusion at 16 is <span style={{ color: '#5500cb' }}>not a flaw.</span> <br />
            Uncertainty at 22 is <span>not failure.</span> <br />
            Hesitation is <span>not weakness.</span>
          </h1>
          <p className="hero-subtitle">
            <span className="hero-subtitle-highlight">
              MyRaaha is here to help you avoid these scenarios
            </span>
          </p>
          <div className="hero-btns">
          </div>
        </div>
        <div className="hero-image-container">
          <img
            src="/myraaha_hero_v2_1778819576959.png"
            alt="Collaboration at MyRaaha"
            className="hero-image"
          />
        </div>
      </section>

      {/* Mission Section */}
      <section className="myraaha-mission">
        <div className="mission-visuals">
          <div className="mission-mesh-pattern"></div>
          <div className="visual-circle circle-1"></div>
          <div className="visual-circle circle-2"></div>
          <div className="visual-circle circle-3"></div>
        </div>
        <div className="mission-badge"><span>Our mission</span></div>
        <h2 className="mission-title">
          Empowering students for <span>career clarity</span> and <span>confidence</span>
        </h2>
        <p className="mission-subtitle">
          We bring together entrepreneurs, researchers, and industry leaders to create transformative solutions that shape the future.
        </p>

        <div className="mission-grid">
          <div className="mission-card">
            <div className="mission-icon">
              <Users className="w-8 h-8" />
            </div>
            <h3>Our <span>people</span></h3>
            <p>Community first approach to drive peer-to-peer <br /> learning and active mentorship for every student.</p>
          </div>
          <div className="mission-card">
            <div className="mission-icon">
              <Workflow className="w-8 h-8" />
            </div>
            <h3>Our <span>process</span></h3>
            <p>Career traceability and continuum is at the core of our process and platform design</p>
          </div>
          <div className="mission-card">
            <div className="mission-icon">
              <Globe className="w-8 h-8" />
            </div>
            <h3>The <span>platform</span></h3>
            <p>Tech first approach to give AI enabled solutions directly in the hands of every single student.</p>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="myraaha-services" id="services">
        <div className="section-header">
          <span className="section-badge">Our services</span>
          <h2 className="section-title">What we <span>do</span></h2>
          <p className="section-subtitle">Inclusive and holistic career guidance with early interventions for better skill alignment and market-ready career pathways.</p>
        </div>

        <div className="services-grid">
          {/* Service 1 */}
          <Link to="/services#compass" className="service-card">
            <div className="service-image-box">
              <img src="/myraaha_service_compass_v2_1778819596925.png" alt="Curiosity Compass" />
              <div className="service-icon-overlay">
                <Compass className="w-6 h-6" />
              </div>
            </div>
            <div className="service-content">
              <h3 className="single-line-title">Curiosity <span>compass</span></h3>
              <p>“Self-discovery” before career decisions is essential for long-term career success and fulfilment</p>
            </div>
          </Link>

          {/* Service 2 */}
          <Link to="/services#navigator" className="service-card">
            <div className="service-image-box">
              <img src="/myraaha_service_navigator_v2_1778819617279.png" alt="Career Navigator" />
              <div className="service-icon-overlay">
                <Target className="w-6 h-6" />
              </div>
            </div>
            <div className="service-content">
              <h3>Career <span>navigator</span></h3>
              <p>“Career success” is not just about career choices but also about approaching the journey well</p>
            </div>
          </Link>

          {/* Service 3 */}
          <Link to="/services#builder" className="service-card">
            <div className="service-image-box">
              <img src="/myraaha_service_builder_v2_1778819634075.png" alt="Venture Builder" />
              <div className="service-icon-overlay">
                <Rocket className="w-6 h-6" />
              </div>
            </div>
            <div className="service-content">
              <h3>Venture <span>builder</span></h3>
              <p>“Future of work” is about job creation over job seekers for individual empowerment</p>
            </div>
          </Link>

          {/* Service 4 */}
          <Link to="/services#studio" className="service-card">
            <div className="service-image-box">
              <img src="/myraaha_service_studio_v2_1778819654022.png" alt="Skill Studio" />
              <div className="service-icon-overlay">
                <Lightbulb className="w-6 h-6" />
              </div>
            </div>
            <div className="service-content">
              <h3>Skill <span>studio</span></h3>
              <p>“Continuous learning and skilling” are no longer optional but essential survival tools for future</p>
            </div>
          </Link>

          {/* Service 5 */}
          <Link to="/services#therapist" className="service-card">
            <div className="service-image-box">
              <img src="/myraaha_service_therapist_v2_1778819675226.png" alt="Career Therapist" />
              <div className="service-icon-overlay">
                <MessageSquare className="w-6 h-6" />
              </div>
            </div>
            <div className="service-content">
              <h3>Career <span>therapist</span></h3>
              <p>“Emotionally intelligent support” to help users navigate the mental and emotional aspects of their career journey</p>
            </div>
          </Link>

          {/* Service 6 */}
          <Link to="/services#circles" className="service-card">
            <div className="service-image-box">
              <img src="/myraaha_service_lab_v2_1778819694069.png" alt="Community Circles" />
              <div className="service-icon-overlay">
                <Layout className="w-6 h-6" />
              </div>
            </div>
            <div className="service-content">
              <h3>Community <span>circles</span></h3>
              <p>“Collaborative community ecosystem” for meaningful connections, learnings and shared growth</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Stakeholders Section */}
      <section className="myraaha-stakeholders">
        <div className="section-header">
          <span className="section-badge">Value realization</span>
          <h2 className="section-title">What is in it for our <span>stakeholders</span>?</h2>
          <div className="filter-wrapper stakeholder-filter-wrapper">
            <div className="stakeholder-tabs" ref={scrollRef}>
              {(Object.keys(stakeholders) as StakeholderType[]).map((tab) => (
                <button 
                  key={tab}
                  className={`stakeholder-tab ${activeStakeholder === tab ? 'active' : ''}`}
                  onClick={() => setActiveStakeholder(tab)}
                >
                  {tab}
                </button>
              ))}
            </div>
            <button className="scroll-arrow-btn stakeholder-scroll-arrow" onClick={() => scrollTabs('right')}>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="stakeholder-grid">
          {stakeholders[activeStakeholder].map((card, idx) => (
            <div key={idx} className="stakeholder-card">
              <div className="stakeholder-card-icon">
                {card.icon}
              </div>
              <h3>{card.title.toLowerCase().split(' ').map((word, i) => i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word).slice(0, -1).join(' ')} <span>{card.title.toLowerCase().split(' ').slice(-1)}</span></h3>
              <p>{card.description}</p>
            </div>
          ))}
        </div>
      </section>



      {/* Beacon Section */}
      <section className="myraaha-beacon" id="platform">
        <div className="section-header">
          <span className="section-badge">Our platform</span>
          <h2 className="beacon-title"><span className="text-black-force">The</span> <span>platform</span></h2>
          <p className="beacon-subtitle">We bring the power of integrated intervention for meaningful career journeys. Career success starts with MyRaaha360</p>
        </div>
        
        <div className="beacon-grid">
          {/* Card 1 */}
          <div className="beacon-card">
            <div className="beacon-card-image">
              <img src="/myraaha_platform_map_v2_1778819717803.png" alt="The Map" />
            </div>
            <div className="beacon-card-content">
              <div className="beacon-card-header">
                <h3>Clarity before <span>decision</span></h3>
              </div>
              <p className="beacon-card-lead">We provide a prescriptive solution not to fix you but to build a map for you.</p>
              <ul className="beacon-features">
                <li><span>Real time role proximity</span></li>
                <li><span>Career path optimization.</span></li>
                <li><span>Proactive interventions</span></li>
              </ul>
            </div>
          </div>

          {/* Card 2 */}
          <div className="beacon-card">
            <div className="beacon-card-image">
              <img src="/myraaha_platform_direction_v2_1778819742277.png" alt="Direction" />
            </div>
            <div className="beacon-card-content">
              <div className="beacon-card-header">
                <h3>Direction before <span>destination</span>.</h3>
              </div>
              <p className="beacon-card-lead">We refuse the traditional sequence of committing before understanding</p>
              <ul className="beacon-features">
                <li><span>Explore first. Decide later</span></li>
                <li><span>Every path made visible</span></li>
                <li><span>Explore the trade-offs</span></li>
              </ul>
            </div>
          </div>

          {/* Card 3 */}
          <div className="beacon-card">
            <div className="beacon-card-image">
              <img src="/myraaha_platform_journey_v2_1778819762890.png" alt="Journey" />
            </div>
            <div className="beacon-card-content">
              <div className="beacon-card-header">
                <h3>Persona rather than a <span>resume</span></h3>
              </div>
              <p className="beacon-card-lead">We follow 3A (aptitude, attitude, articulation) framework to build persona</p>
              <ul className="beacon-features">
                <li><span>Persona evolution</span></li>
                <li><span>Proactive guidance</span></li>
                <li><span>No resets, no retests</span></li>
              </ul>
            </div>
          </div>

          {/* Card 4 */}
          <div className="beacon-card">
            <div className="beacon-card-image">
              <img src="/myraaha_platform_navigation_v2_1778819781167.png" alt="Navigation" />
            </div>
            <div className="beacon-card-content">
              <div className="beacon-card-header">
                <h3>Job creator over job <span>seeker</span></h3>
              </div>
              <p className="beacon-card-lead">We handhold potential entrepreneurs to start and sustain their ventures</p>
              <ul className="beacon-features">
                <li><span>Industry relevant mentors</span></li>
                <li><span>Impact investing</span></li>
                <li><span>Incubation support</span></li>
              </ul>
            </div>
          </div>

          {/* Card 5 */}
          <div className="beacon-card">
            <div className="beacon-card-image">
              <img src="/myraaha_platform_build_v2_1778819799457.png" alt="Build" />
            </div>
            <div className="beacon-card-content">
              <div className="beacon-card-header">
                <h3>Contribution over <span>donation</span></h3>
              </div>
              <p className="beacon-card-lead">We welcome all forms of contribution (time, money, material) for a cause</p>
              <ul className="beacon-features">
                <li><span>Enabling last mile giving</span></li>
                <li><span>Expanded capacity</span></li>
                <li><span>Building the trust of giving</span></li>
              </ul>
            </div>
          </div>

          {/* Card 6 */}
          <div className="beacon-card">
            <div className="beacon-card-image">
              <img src="/myraaha_platform_path_v2_1778819819014.png" alt="Your Path" />
            </div>
            <div className="beacon-card-content">
              <div className="beacon-card-header">
                <h3>Your path. Not <span>theirs</span>.</h3>
              </div>
              <p className="beacon-card-lead">We value everyone’s journey, we don’t compare but customize a career path</p>
              <ul className="beacon-features">
                <li><span>Chosen, not assigned</span></li>
                <li><span>Direction, not just data</span></li>
                <li><span>Start anywhere</span></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <MyRaahaNewsletter />
      <MyRaahaFooter />
    </div>
  );
};

export default MyRaahaLanding;
