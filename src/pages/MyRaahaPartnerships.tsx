import { useEffect } from "react";
import { Link } from "react-router-dom";
import { MessageSquare, Zap, Settings, Globe, Calendar, Search, TrendingUp, Rocket, ArrowRight } from "lucide-react";
import MyRaahaNavbar from "../components/MyRaahaNavbar";
import MyRaahaNewsletter from "../components/MyRaahaNewsletter";
import MyRaahaFooter from "../components/MyRaahaFooter";
import "./MyRaahaPartnerships.css";
import { useMobile } from "../hooks/useMobile";
import MobilePartnerships from "./mobile/MobilePartnerships";

const MyRaahaPartnerships = () => {
  return (
    <div className="myraaha-partnerships-v2">
      <MyRaahaNavbar />

      {/* Hero Section */}
      <section className="partnerships-hero-v2">
        <div className="hero-content-v2">
          <div className="hero-badge-v2">Institutional Partnerships</div>
          <h1 className="hero-title-v2">
            We Don't <span>Sell</span> to Institutions.
            <br />
            We <span>Build</span> With Them.
          </h1>
          <p className="hero-subtitle-v2">
            MyRaaha exists because the system failed students. We're not here to replace what institutions do — we're
            here to give them the infrastructure they never had. A partnership with MyRaaha means your students stop
            guessing and start navigating. From day one.
          </p>
          <div className="hero-btns-v2">
            <button className="btn-primary-v2" onClick={() => (window.location.href = "/contact")}>
              <MessageSquare className="w-5 h-5" />
              Let's Talk
            </button>
          </div>
        </div>
        <div className="hero-image-container-v2">
          <img
            src="/myraaha_service_incubation_1778164176716.png"
            alt="Institutional Partnership"
            className="hero-image-v2"
          />
        </div>
      </section>

      <section className="partnerships-engagement-v2">
        <div className="section-header-v2">
          <span className="section-badge-v2">Engagement</span>
          <h2 className="section-title-v2">
            Our engagement <span>model</span>
          </h2>
          <p className="section-subtitle-v2">We engage with you to design the partnership</p>
        </div>

        <div className="engagement-path-container">
          <div className="path-line"></div>

          {/* Step 1: Discovery */}
          <div className="path-step-v2 left">
            <div className="path-marker">01</div>
            <div className="path-card-v2">
              <div className="path-card-header">
                <div className="path-icon-box">
                  <Search />
                </div>
                <h3>
                  <span>Discovery</span>
                </h3>
              </div>
              <p>First touch point with the institute management, faculties and students</p>
              <div className="path-io-line">
                <div className="io-item input">
                  <span className="io-tag">Input:</span>
                  <span className="io-val">Discovery workshop</span>
                </div>
                <div className="io-divider">|</div>
                <div className="io-item output">
                  <span className="io-tag">Output:</span>
                  <span className="io-val">Need analysis document</span>
                </div>
              </div>
            </div>
            <div className="path-image-v2">
              <img
                src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80"
                alt="Discovery Workshop"
              />
            </div>
          </div>

          {/* Step 2: Proposal */}
          <div className="path-step-v2 right">
            <div className="path-marker">02</div>
            <div className="path-card-v2">
              <div className="path-card-header">
                <div className="path-icon-box">
                  <MessageSquare />
                </div>
                <h3>
                  Proposal & need <span>discussion</span>
                </h3>
              </div>
              <p>Using our discovery assessment, we create the preliminary proposal for discussion</p>
              <div className="path-io-line">
                <div className="io-item input">
                  <span className="io-tag">Input:</span>
                  <span className="io-val">Need analysis document</span>
                </div>
                <div className="io-divider">|</div>
                <div className="io-item output">
                  <span className="io-tag">Output:</span>
                  <span className="io-val">Proposal</span>
                </div>
              </div>
            </div>
            <div className="path-image-v2">
              <img
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80"
                alt="Proposal Discussion"
              />
            </div>
          </div>

          {/* Step 3: Selection */}
          <div className="path-step-v2 left">
            <div className="path-marker">03</div>
            <div className="path-card-v2">
              <div className="path-card-header">
                <div className="path-icon-box">
                  <Settings />
                </div>
                <h3>
                  Service <span>selection</span>
                </h3>
              </div>
              <p>Preliminary proposal is customized to select appropriate services</p>
              <div className="path-io-line">
                <div className="io-item input">
                  <span className="io-tag">Input:</span>
                  <span className="io-val">Proposal</span>
                </div>
                <div className="io-divider">|</div>
                <div className="io-item output">
                  <span className="io-tag">Output:</span>
                  <span className="io-val">Memorandum of Understanding</span>
                </div>
              </div>
            </div>
            <div className="path-image-v2">
              <img
                src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80"
                alt="Service Selection"
              />
            </div>
          </div>

          {/* Step 4: Introduction */}
          <div className="path-step-v2 right">
            <div className="path-marker">04</div>
            <div className="path-card-v2">
              <div className="path-card-header">
                <div className="path-icon-box">
                  <Zap />
                </div>
                <h3>
                  Service <span>introduction</span>
                </h3>
              </div>
              <p>This is all about the service commencement and the arrangements required</p>
              <div className="path-io-line">
                <div className="io-item input">
                  <span className="io-tag">Input:</span>
                  <span className="io-val">Memorandum of Understanding</span>
                </div>
                <div className="io-divider">|</div>
                <div className="io-item output">
                  <span className="io-tag">Output:</span>
                  <span className="io-val">Implementation monitoring</span>
                </div>
              </div>
            </div>
            <div className="path-image-v2">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80"
                alt="Service Introduction"
              />
            </div>
          </div>

          {/* Step 5: Delivery */}
          <div className="path-step-v2 left">
            <div className="path-marker">05</div>
            <div className="path-card-v2">
              <div className="path-card-header">
                <div className="path-icon-box">
                  <Settings />
                </div>
                <h3>
                  Service <span>delivery</span>
                </h3>
              </div>
              <p>We take you through the value journey keeping the key success metrics in mind</p>
            </div>
            <div className="path-image-v2">
              <img
                src="https://images.unsplash.com/photo-1531538606174-0f90ff5dce83?auto=format&fit=crop&w=600&q=80"
                alt="Service Delivery"
              />
            </div>
          </div>

          {/* Step 6: Value Journey */}
          <div className="value-journey-final">
            <div className="final-glow"></div>
            <div className="final-content">
              <div className="final-icon">
                <TrendingUp />
              </div>
              <h3 style={{ color: "#ffffff" }}>Value journey</h3>
              <p>The ultimate outcome of our partnership</p>
            </div>
          </div>
        </div>
      </section>

      {/* Asks Section (Mission style with visuals) */}
      <section className="partnerships-asks-v2 dark-bg">
        <div className="asks-visuals-v2">
          <div className="asks-mesh-pattern-v2"></div>
          <div className="visual-circle-v2 circle-1-v2"></div>
          <div className="visual-circle-v2 circle-2-v2"></div>
        </div>
        <div className="asks-content-v2">
          <span className="section-badge-v2 white-badge-v2" style={{ color: "#ffffff" }}>
            Our mutual commitment
          </span>
          <h2 className="section-title-v2 white-text-v2">
            What we ask of <span>you</span>
          </h2>
          <p className="section-subtitle-v2 gray-text-v2">
            We are an early-stage platform. In return for being part of the first cohort, we ask for three things:
          </p>

          <div className="asks-grid-v2">
            <div className="ask-card-v2">
              <div className="ask-icon-v2">
                <Globe />
              </div>
              <h3>
                <span>Access</span>
              </h3>
              <p>To your students, your staff, and honest feedback on what is working and what isn't.</p>
            </div>
            <div className="ask-card-v2">
              <div className="ask-icon-v2">
                <Calendar />
              </div>
              <h3>
                <span>Time</span>
              </h3>
              <p>To let the platform do what it is designed to do. Navigation takes a semester.</p>
            </div>
            <div className="ask-card-v2">
              <div className="ask-icon-v2">
                <MessageSquare />
              </div>
              <h3>
                <span>Voice</span>
              </h3>
              <p>
                If it works, tell someone. The students who need this most are in institutions that haven't heard of us
                yet.
              </p>
            </div>
          </div>
        </div>
      </section>

      <MyRaahaNewsletter />
      <MyRaahaFooter />
    </div>
  );
};

export default MyRaahaPartnerships;
