import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Rocket, 
  Globe, 
  Users, 
  CheckCircle2,
  GraduationCap
} from 'lucide-react';
import MyRaahaNavbar from '../components/MyRaahaNavbar';
import MyRaahaNewsletter from '../components/MyRaahaNewsletter';
import MyRaahaFooter from '../components/MyRaahaFooter';
import './MyRaahaServices.css';
import './MyRaahaLanding.css';
import StandardPageHero from '../components/StandardPageHero';
const MyRaahaServices = () => {
  const location = useLocation();
  useEffect(() => {
    if (location.hash) {
      const id = location.hash.substring(1);
      setTimeout(() => {
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  }, [location.hash]);

  return (
    <div className="services-page">
      <MyRaahaNavbar />

      <StandardPageHero
        badge="Our Solutions"
        title={
          <>
            Our professional <br />
            ecosystem <span>services</span>
          </>
        }
        subtitle={
          <>
            MyRaaha is a tech-first, emotionally intelligent navigation system that delivers scalable <br />
            career decision and entrepreneurship guidance through data driven insights at every stage
          </>
        }
        features={[]}
      />

      {/* Curiosity Compass Section */}
      <section id="compass" className="incubation-program-section">
        <div className="split-section" style={{ padding: 0, maxWidth: '100%', margin: '0 0 var(--section-spacing) 0' }}>
          <div className="split-image">
            <img src="/myraaha_service_compass_v2_1778819596925.png" alt="Curiosity Compass" />
          </div>
          <div className="split-content">
            <h2>Curiosity <span>compass</span></h2>
            <p>Self-discovery before career decisions is essential to align career paths with
              personal values, strengths, and passions, leading to increased motivation and better long-term success. </p>
            <div className="bullet-list">
              <div className="bullet-item"><CheckCircle2 /> Explore interests, passions, and possibilities</div>
              <div className="bullet-item"><CheckCircle2 /> Discover through stories, prompts, and challenges</div>
              <div className="bullet-item"><CheckCircle2 /> Track curiosity, emotions, and evolving preferences</div>
            </div>
          </div>
        </div>

        {/* Curiosity Compass Extensions Cards */}
        <div className="incubation-extension-grid">
          {/* Card 1 */}
          <div className="incubation-extension-card">
            <img src="/myraaha_about_motivation_v2_1778819838845.png" alt="Explore" />
            <div className="incubation-extension-content">
              <h3>Explore <span>possibilities</span></h3>
              <p>Discover interests, passions, and possibilities through interactive prompts, stories, challenges, and visual exploration — helping users uncover what naturally excites and motivates them.</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="incubation-extension-card">
            <img src="/myraaha_platform_map_v2_1778819717803.png" alt="Reflect" />
            <div className="incubation-extension-content">
              <h3>Reflect <span>patterns</span></h3>
              <p>Capture thoughts, emotions, behaviors, and emerging patterns through psychometrics, reflections, mood inputs, and adaptive insights — building a deeper understanding of identity, environments, strengths, and preferences over time.</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="incubation-extension-card">
            <img src="/myraaha_platform_path_v2_1778819819014.png" alt="Navigate" />
            <div className="incubation-extension-content">
              <h3>Navigate <span>smartly</span></h3>
              <p>Transform curiosity into direction with personalized domain suggestions, learning pathways, peer communities, and guided next steps that help users move confidently toward meaningful opportunities.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Transfer Section */}
      <section id="navigator" className="incubation-program-section">
        <div className="split-section reverse" style={{ padding: 0, maxWidth: '100%', margin: '0 0 var(--section-spacing) 0' }}>
          <div className="split-image">
            <img src="/myraaha_service_navigator_v2_1778819617279.png" alt="Technology Transfer" />
          </div>
          <div className="split-content">
            <h2>Career <span>navigator</span></h2>
            <p>Deciding where to go (geographical location, industry, or company) and how to go (the method, skills, and path taken) are critical components of career planning that determine long-term success.</p>
            <div className="bullet-list">
              <div className="bullet-item"><CheckCircle2 /> Explore careers, opportunities, and emerging pathways</div>
              <div className="bullet-item"><CheckCircle2 /> Discover personalized matches based on skills and interests</div>
              <div className="bullet-item"><CheckCircle2 /> Evaluate readiness through AI-powered fit insights</div>
            </div>
          </div>
        </div>

        {/* Career Navigator Extensions Cards */}
        <div className="incubation-extension-grid">
          {/* Card 1 */}
          <div className="incubation-extension-card">
            <img src="/myraaha_platform_journey_v2_1778819762890.png" alt="Personalize" />
            <div className="incubation-extension-content">
              <h3>Personalize <span>pathways</span></h3>
              <p>Build adaptive career/startup pathways based on curiosity, skills, behavior, mood, and goals.</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="incubation-extension-card">
            <img src="/myraaha_platform_direction_v2_1778819742277.png" alt="Guide" />
            <div className="incubation-extension-content">
              <h3>Guide <span>action</span></h3>
              <p>Deliver actionable milestones, learning steps, projects, mentor connections, and opportunity recommendations in sequence.</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="incubation-extension-card">
            <img src="/myraaha_service_lab_v2_1778819694069.png" alt="Adapt" />
            <div className="incubation-extension-content">
              <h3>Adapt <span>continuously</span></h3>
              <p>Continuously refine the roadmap using engagement patterns, reflections, progress tracking, and AI-driven recalibration.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Skill Studio Section */}
      <section id="studio" className="incubation-program-section">
        <div className="split-section" style={{ padding: 0, maxWidth: '100%', margin: '0 0 var(--section-spacing) 0' }}>
          <div className="split-image">
            <img src="/myraaha_service_studio_v2_1778819654022.png" alt="Skill Studio" />
          </div>
          <div className="split-content">
            <h2>Skill <span>studio</span></h2>
            <p>Empowering users with the tools and resources to build future-ready skills through adaptive learning.</p>
            <div className="bullet-list">
              <div className="bullet-item"><CheckCircle2 /> Personalized AI-powered skill development journeys</div>
              <div className="bullet-item"><CheckCircle2 /> Curated learning capsules, courses, and domain-based content discovery</div>
              <div className="bullet-item"><CheckCircle2 /> Progress tracking aligned with career and roadmap readiness</div>
            </div>
          </div>
        </div>

        {/* Skill Studio Extensions Cards */}
        <div className="incubation-extension-grid">
          {/* Card 1 */}
          <div className="incubation-extension-card">
            <img src="/myraaha_platform_build_v2_1778819799457.png" alt="SkillStacker" />
            <div className="incubation-extension-content">
              <h3>Skill <span>stacker</span></h3>
              <p>Identify, build, and strengthen future-ready skills through personalized learning paths, adaptive recommendations, practice-based progression, and continuous skill tracking aligned to individual goals and career direction.</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="incubation-extension-card">
            <img src="/myraaha_journey_arch_v2_1778819900048.png" alt="Learning Library" />
            <div className="incubation-extension-content">
              <h3>Learning <span>library</span></h3>
              <p>Access curated courses, learning capsules, certifications, guides, and domain-based resources designed to help users explore interests, deepen understanding, and continuously grow at their own pace.</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="incubation-extension-card">
            <img src="/myraaha_platform_navigation_v2_1778819781167.png" alt="Project Playground" />
            <div className="incubation-extension-content">
              <h3>Project <span>playground</span></h3>
              <p>Apply learning through real-world projects, challenges, collaborations, hackathons, and experiential tasks that transform knowledge into practical experience, portfolio proof, and career readiness.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Career Therapist Section */}
      <section id="therapist" className="incubation-program-section">
        <div className="split-section reverse" style={{ padding: 0, maxWidth: '100%', margin: '0 0 var(--section-spacing) 0' }}>
          <div className="split-image">
            <img src="/myraaha_service_therapist_v2_1778819675226.png" alt="Career Therapist" />
          </div>
          <div className="split-content">
            <h2>Career <span>therapist</span></h2>
            <p>Providing emotionally intelligent support to help users navigate the mental and emotional aspects of their career journey.</p>
            <div className="bullet-list">
              <div className="bullet-item"><CheckCircle2 /> AI-powered emotional and career wellness support system</div>
              <div className="bullet-item"><CheckCircle2 /> Reflective conversations for stress, burnout, uncertainty, and self-doubt</div>
              <div className="bullet-item"><CheckCircle2 /> Helps users regain clarity, confidence, and emotional balance</div>
            </div>
          </div>
        </div>

        {/* Career Therapist Extensions Cards */}
        <div className="incubation-extension-grid">
          {/* Card 1 */}
          <div className="incubation-extension-card">
            <img src="/myraaha_service_therapist_v2_1778819675226.png" alt="Career Therapist" />
            <div className="incubation-extension-content">
              <h3>Career <span>therapist</span></h3>
              <p>An emotionally intelligent support space that helps users process uncertainty, burnout, stress, self-doubt, and identity-related challenges through reflective and adaptive AI interactions.</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="incubation-extension-card">
            <img src="/myraaha_service_events_1778164239649.png" alt="Inspiration Layer" />
            <div className="incubation-extension-content">
              <h3>Inspiration <span>layer</span></h3>
              <p>A discovery-driven ecosystem of stories, creators, journeys, lifestyles, and unconventional paths designed to spark curiosity, aspiration, and emotional connection.</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="incubation-extension-card">
            <img src="/myraaha_service_academic_1778164220116.png" alt="Career Moodboard" />
            <div className="incubation-extension-content">
              <h3>Career <span>moodboard</span></h3>
              <p>A visual reflection space where users collect inspirations, aspirations, goals, aesthetics, and future possibilities — helping transform abstract ambitions into clearer personal direction.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Venture Builder Section */}
      <section id="builder" className="incubation-program-section">
        <div className="split-section" style={{ padding: 0, maxWidth: '100%', margin: '0 0 2.5rem 0' }}>
          <div className="split-image">
            <img src="/myraaha_service_builder_v2_1778819634075.png" alt="Venture Builder" />
          </div>
          <div className="split-content">
            <h2>Venture <span>builder</span></h2>
            <p>A startup ecosystem that helps users transform ideas into ventures through validation, collaboration, mentorship, execution support, and founder-driven growth.</p>
            <div className="bullet-list">
              <div className="bullet-item"><CheckCircle2 /> Explore and validate startup ideas and opportunities</div>
              <div className="bullet-item"><CheckCircle2 /> Collaborate with founders, mentors, and startup communities</div>
              <div className="bullet-item"><CheckCircle2 /> Access funding, launch support, and growth ecosystems</div>
            </div>
          </div>
        </div>

        {/* Venture Builder Extensions Cards */}
        <div className="incubation-extension-grid">
          {/* Card 1 */}
          <div className="incubation-extension-card">
            <img src="/myraaha_service_incubation_1778164176716.png" alt="Startup Sparks" />
            <div className="incubation-extension-content">
              <h3>Startup <span>sparks</span></h3>
              <p>Explore ideas, validate opportunities, build entrepreneurial thinking, and discover startup possibilities through structured exploration, creativity, and innovation-driven experiences.</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="incubation-extension-card">
            <img src="/myraaha_hero_collaboration_1778164155630.png" alt="Creation Lab" />
            <div className="incubation-extension-content">
              <h3>Creation <span>lab</span></h3>
              <p>Build ventures through MVP development, founder collaboration, startup roadmaps, team building, mentorship, execution support, and launch-focused systems.</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="incubation-extension-card">
            <img src="/myraaha_service_community_1778164199256.png" alt="Founder Ecosystem" />
            <div className="incubation-extension-content">
              <h3>Founder <span>ecosystem</span></h3>
              <p>Access founder communities, emotional support, coaching, learning resources, funding pathways, networking, and growth opportunities within a connected entrepreneurial ecosystem.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Community Circles Section */}
      <section id="circles" className="incubation-program-section">
        <div className="split-section reverse" style={{ padding: 0, maxWidth: '100%', margin: '0 0 2.5rem 0' }}>
          <div className="split-image">
            <img src="/myraaha_service_therapist_v2_1778819675226.png" alt="Community Circles" />
          </div>
          <div className="split-content">
            <h2>Community <span>circles</span></h2>
            <p>A collaborative community ecosystem where users connect, learn, share, build relationships, and grow together through meaningful conversations and shared opportunities.</p>
            <div className="bullet-list">
              <div className="bullet-item"><CheckCircle2 /> Connect with like-minded peers through interest-based communities</div>
              <div className="bullet-item"><CheckCircle2 /> Collaborate through discussions, shared learning, and group activities</div>
              <div className="bullet-item"><CheckCircle2 /> Build networks with mentors, creators, founders, and collaborators</div>
            </div>
          </div>
        </div>

        {/* Community Circles Extensions Cards */}
        <div className="incubation-extension-grid">
          {/* Card 1 */}
          <div className="incubation-extension-card">
            <img src="/culture_impact.png" alt="Community" />
            <div className="incubation-extension-content">
              <h3>Community <span>growth</span></h3>
              <p>A shared ecosystem for conversations, networking, collaboration, mentorship, shared learning, and meaningful connections across interests, careers, and aspirations.</p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="incubation-extension-card">
            <img src="/culture_workspace.png" alt="Startup Circles" />
            <div className="incubation-extension-content">
              <h3>Startup <span>circles</span></h3>
              <p>Founder-driven communities focused on idea validation, collaboration, accountability, mentorship, co-building, and entrepreneurial growth.</p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="incubation-extension-card">
            <img src="/myraaha_beacon_community.png" alt="Forums" />
            <div className="incubation-extension-content">
              <h3>Community <span>forums</span></h3>
              <p>Open discussion spaces for asking questions, exchanging knowledge, sharing experiences, discovering opportunities, and engaging with the wider ecosystem.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Career Identity Section */}
      <section className="beacon-platform-section">
        <h2 className="about-section-title">Your evolving career <span>identity</span></h2>
        <p className="about-section-subtitle">A dynamic system that maps identity, tracks growth, showcases achievements, and connects users to meaningful opportunities.</p>

        <div className="beacon-platform-grid">
          <div className="beacon-platform-image" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <img src="/myraaha_beacon_career.png" alt="Career Identity Top" style={{ width: '100%', height: '50%', objectFit: 'cover' }} />
            <img src="/myraaha_beacon_resources.png" alt="Career Identity Bottom" style={{ width: '100%', height: '50%', objectFit: 'cover' }} />
          </div>
          <div className="beacon-platform-content">
            <h3>Track, grow and <span>showcase</span></h3>
            <p className="beacon-platform-lead">Transform experiences, skills, and personal growth into a living profile that evolves with every step forward. A real-time view of growth, capability, ambition, and readiness designed for the future of careers.</p>

            <div className="platform-cards-grid">
              <div className="platform-mini-card">
                <Users className="w-6 h-6 text-blue-600" />
                <h4>Identity <span>mapping</span></h4>
                <p>Visualize evolving strengths, interests, behaviors, emotional patterns, and personality insights to build deeper self-awareness.</p>
              </div>
              <div className="platform-mini-card">
                <GraduationCap className="w-6 h-6 text-blue-600" />
                <h4>Live <span><br/>resume</span></h4>
                <p>Dynamically capture skills, projects, achievements, certifications, and experiences into a continuously evolving career profile.</p>
              </div>
              <div className="platform-mini-card">
                <Rocket className="w-6 h-6 text-blue-600" />
                <h4>Opportunity <span>profile</span></h4>
                <p>Measure career readiness and connect users with relevant jobs, internships, mentors, collaborations, and growth opportunities.</p>
              </div>
              <div className="platform-mini-card">
                <Globe className="w-6 h-6 text-blue-600" />
                <h4>Growth <span><br/>layer</span></h4>
                <p>Track progress, milestones, learning evolution, and practical achievements to showcase continuous development</p>
              </div>
            </div>

             <div className="bullet-list">
              <div className="bullet-item"><CheckCircle2 />AI-driven insights based on user activity, reflections, and engagement trends</div>
              <div className="bullet-item"><CheckCircle2 /> Visual tracking of personal growth, learning evolution, and career readiness</div>
              <div className="bullet-item"><CheckCircle2 /> Personalized recommendations for opportunities, roadmaps, and next-step actions</div>
            </div>

          </div>
        </div>
      </section>



      <MyRaahaNewsletter />
      <MyRaahaFooter />
    </div >
  );
};

export default MyRaahaServices;
