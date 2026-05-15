import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
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
  TrendingUp,
  Award,
} from "lucide-react";
import MyRaahaNavbar from "@/components/myraaha/MyRaahaNavbar";
import MyRaahaNewsletter from "@/components/myraaha/MyRaahaNewsletter";
import MyRaahaFooter from "@/components/myraaha/MyRaahaFooter";
import "@/styles/myraaha/MyRaahaLanding.css";

type StakeholderType = "Students" | "Parents" | "Institutions" | "Governments";

const PLACEHOLDER = "/placeholder.svg";

const Index = () => {
  const [activeStakeholder, setActiveStakeholder] = useState<StakeholderType>("Students");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const stakeholders: Record<
    StakeholderType,
    { title: string; description: string; icon: JSX.Element }[]
  > = {
    Students: [
      {
        title: "Career Discovery",
        description:
          "Enabling students to make stream and career choices with confidence and clarity through data-driven discovery.",
        icon: <Target className="w-6 h-6" />,
      },
      {
        title: "Career Navigation",
        description:
          "Helping students discover emerging career paths and expanding their career imagination through personalized guidance.",
        icon: <Compass className="w-6 h-6" />,
      },
      {
        title: "Career Building",
        description:
          "Bridging the skill gap with access to industry professionals to enable stronger and more impactful student outcomes.",
        icon: <Briefcase className="w-6 h-6" />,
      },
    ],
    Parents: [
      {
        title: "Decision Intelligence",
        description:
          "Data-driven insights to help parents support their child's choices with clarity and future-looking career predictions.",
        icon: <Lightbulb className="w-6 h-6" />,
      },
      {
        title: "Positive Parenting",
        description:
          "Resources and frameworks for fostering a supportive environment that aligns with the child's innate strengths and talents.",
        icon: <Handshake className="w-6 h-6" />,
      },
      {
        title: "Continuous Tracking",
        description:
          "Complete visibility into child's progress and career readiness milestones throughout their entire academic journey.",
        icon: <TrendingUp className="w-6 h-6" />,
      },
    ],
    Institutions: [
      {
        title: "Institutional Reputation",
        description:
          "Attract better talent by offering a future-ready model with structured and advanced career development programs.",
        icon: <Award className="w-6 h-6" />,
      },
      {
        title: "NEP 2020 Alignment",
        description:
          "Full integration with National Education Policy reforms focusing on holistic, vocational, and skill-based development.",
        icon: <Workflow className="w-6 h-6" />,
      },
      {
        title: "Teacher Empowerment",
        description:
          "Equipping educators with career intelligence and advanced mentoring tools to become effective guides for all students.",
        icon: <MessageSquare className="w-6 h-6" />,
      },
    ],
    Governments: [
      {
        title: "Policy Alignment",
        description:
          "Alignment with Education Reform: Institutions increasingly need to align with National Education Policy 2020 mandates.",
        icon: <Briefcase className="w-6 h-6" />,
      },
      {
        title: "Ecosystem Integration",
        description:
          "Institutions can connect students with alumni mentors and industry professionals for a strong support ecosystem.",
        icon: <Globe className="w-6 h-6" />,
      },
    ],
  };

  return (
    <div className="myraaha-landing">
      <MyRaahaNavbar />

      {/* Hero */}
      <section className="myraaha-hero">
        <div className="hero-content">
          <div className="mission-badge">
            <span>Connecting Academia with Community Impact</span>
          </div>
          <h1 className="hero-title">
            Confusion at 16 is <span>not</span> a <span>flaw</span>.<br />
            Uncertainty at 22 is <span>not</span> <span>failure</span>.<br />
            Hesitation is <span>not</span> <span>weakness</span>.
          </h1>
          <p className="hero-subtitle">
            <span className="hero-subtitle-highlight">
              But the bigger question is, is this avoidable and who can help solve this?
            </span>
          </p>
        </div>
        <div className="hero-image-container">
          <img src={PLACEHOLDER} alt="Collaboration at MyRaaha" className="hero-image" />
        </div>
      </section>

      {/* Mission */}
      <section className="myraaha-mission">
        <div className="mission-visuals">
          <div className="mission-mesh-pattern" />
          <div className="visual-circle circle-1" />
          <div className="visual-circle circle-2" />
          <div className="visual-circle circle-3" />
        </div>
        <div className="mission-badge">
          <span>Our mission</span>
        </div>
        <h2 className="mission-title">
          Empowering innovation through <span>collaboration</span>
        </h2>
        <p className="mission-subtitle">
          We bring together entrepreneurs, researchers, and industry leaders to create
          transformative solutions that shape the future.
        </p>

        <div className="mission-grid">
          <div className="mission-card">
            <div className="mission-icon">
              <Users className="w-8 h-8" />
            </div>
            <h3>
              Our <span>people</span>
            </h3>
            <p>
              Community first approach to drive peer-to-peer learning and active mentorship for
              every student.
            </p>
          </div>
          <div className="mission-card">
            <div className="mission-icon">
              <Workflow className="w-8 h-8" />
            </div>
            <h3>
              Our <span>process</span>
            </h3>
            <p>
              Tech first approach to give AI enabled solutions directly in the hands of every
              single student.
            </p>
          </div>
          <div className="mission-card">
            <div className="mission-icon">
              <Globe className="w-8 h-8" />
            </div>
            <h3>
              The <span>platform</span>
            </h3>
            <p>
              Creating a one stop guided solution that makes a real difference in the student's
              career journey.
            </p>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="myraaha-services" id="services">
        <div className="section-header">
          <span className="section-badge">Our services</span>
          <h2 className="section-title">
            What we <span>do</span>
          </h2>
          <p className="section-subtitle">
            Inclusive and holistic career guidance with early interventions for better skill
            alignment and market-ready career pathways.
          </p>
        </div>

        <div className="services-grid">
          {[
            { to: "/solutions#compass", label: "Curiosity", em: "compass", icon: Compass, desc: "Empowering innovative ideas from concept to market through expert mentorship, strategic resources, and a global support ecosystem for aspiring entrepreneurs." },
            { to: "/solutions#navigator", label: "Career", em: "navigator", icon: Target, desc: "Bridging academic excellence with real-world social impact through collaborative community initiatives, internships, and purpose-driven social projects." },
            { to: "/solutions#builder", label: "Venture", em: "builder", icon: Rocket, desc: "Enabling students and faculty to transform ground-breaking research and creative ideas into scalable industry solutions and high-impact commercial ventures." },
            { to: "/solutions#studio", label: "Skill", em: "studio", icon: Lightbulb, desc: "Immersive professional workshops, hackathons, and global networking events designed to spark creativity and develop essential future-ready skills for the modern economy." },
            { to: "/solutions#therapist", label: "Career", em: "therapist", icon: MessageSquare, desc: "Integrating personalized career planning with emotional well-being to build clarity, confidence, and long-term resilience in complex professional journeys." },
            { to: "/solutions#circles", label: "Community", em: "circles", icon: Layout, desc: "A collaborative community ecosystem where users connect, learn, share, build relationships, and grow together through meaningful conversations and shared opportunities." },
          ].map((s) => (
            <Link key={s.em} to={s.to} className="service-card">
              <div className="service-image-box">
                <img src={PLACEHOLDER} alt={`${s.label} ${s.em}`} />
                <div className="service-icon-overlay">
                  <s.icon className="w-6 h-6" />
                </div>
              </div>
              <div className="service-content">
                <h3>
                  {s.label} <span>{s.em}</span>
                </h3>
                <p>{s.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Stakeholders */}
      <section className="myraaha-stakeholders">
        <div className="section-header">
          <span className="section-badge">Value realization</span>
          <h2 className="section-title">
            What is in it for our <span>stakeholders</span>?
          </h2>
          <div className="stakeholder-tabs">
            {(Object.keys(stakeholders) as StakeholderType[]).map((tab) => (
              <button
                key={tab}
                className={`stakeholder-tab ${activeStakeholder === tab ? "active" : ""}`}
                onClick={() => setActiveStakeholder(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="stakeholder-grid">
          {stakeholders[activeStakeholder].map((card, idx) => {
            const words = card.title.split(" ");
            const last = words.slice(-1).join(" ");
            const head = words.slice(0, -1).join(" ");
            return (
              <div key={idx} className="stakeholder-card">
                <div className="stakeholder-card-icon">{card.icon}</div>
                <h3>
                  {head} <span>{last}</span>
                </h3>
                <p>{card.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Beacon / Platform */}
      <section className="myraaha-beacon" id="platform">
        <div className="section-header">
          <span className="section-badge">Our platform</span>
          <h2 className="beacon-title">
            <span className="text-black-force">The</span> <span>platform</span>
          </h2>
          <p className="beacon-subtitle">
            We bring the power of integrated intervention for meaningful career journeys. Career
            success starts with MyRaaha360.
          </p>
        </div>

        <div className="beacon-grid">
          {[
            { t: "The map was always", em: "missing", em2: ", not you.", lead: "Confusion is not a flaw. It is data. MyRaaha doesn't fix you. It builds the map.", li: ["You are not behind. You are uncharted.", "Your uncertainty is the starting point.", "Clarity is a process."] },
            { t: "Direction before", em: "destination", em2: ".", lead: "The world asks you to commit before you understand. We refuse that sequence.", li: ["Explore first. Decide later.", "Every path made visible.", "See the tradeoffs."] },
            { t: "You are not a resume. You are a", em: "journey", em2: ".", lead: "Your aptitude today is not your ceiling tomorrow. Your story deserves to be tracked.", li: ["Captured automatically.", "Identity evolves.", "No resets. No re-tests."] },
            { t: "The system navigates. You are not", em: "alone", em2: ".", lead: "Self-navigation is a myth. We end years lost to confusion and missed opportunities.", li: ["Proactive guidance.", "Matched trajectory.", "Inclusive by design."] },
            { t: "Build something. Even if you weren't", em: "told", em2: ".", lead: "Entrepreneurship is a system—learnable, teachable, and available to anyone.", li: ["Serious curiosity.", "Validated by reality.", "Build the person."] },
            { t: "Your path. Not", em: "theirs", em2: ".", lead: "Not every builder wants a boardroom. Some want freedom. All of it counts.", li: ["Chosen, not assigned.", "Hybrid lives are real.", "Start anywhere."] },
          ].map((c, i) => (
            <div key={i} className="beacon-card">
              <div className="beacon-card-image">
                <img src={PLACEHOLDER} alt={c.em} />
              </div>
              <div className="beacon-card-content">
                <div className="beacon-card-header">
                  <h3>
                    {c.t} <span>{c.em}</span>
                    {c.em2}
                  </h3>
                </div>
                <p className="beacon-card-lead">{c.lead}</p>
                <ul className="beacon-features">
                  {c.li.map((x) => (
                    <li key={x}>
                      <span>{x}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      <MyRaahaNewsletter />
      <MyRaahaFooter />
    </div>
  );
};

export default Index;
