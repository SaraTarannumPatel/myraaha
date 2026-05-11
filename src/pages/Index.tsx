import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Rocket,
  Users,
  Workflow,
  Globe,
  Compass,
  Target,
  Lightbulb,
  MessageSquare,
  LayoutPanelLeft,
  Crosshair,
  ShieldCheck,
  CheckCircle2,
  Globe2,
  Compass as CompassIcon,
  Rocket as RocketIcon,
  Target as TargetIcon,
  Lightbulb as LightbulbIcon,
  LayoutPanelLeft as LayoutIcon,
  Home as HomeIcon,
  Handshake,
  Send,
} from "lucide-react";
import { useState } from "react";
import LandingLayout from "@/components/landing/shared/LandingLayout";

import heroImg from "@/assets/landing/home-hero.jpg";
import svcCuriosity from "@/assets/landing/svc-curiosity.jpg";
import svcNavigator from "@/assets/landing/svc-navigator.jpg";
import svcVenture from "@/assets/landing/svc-venture.jpg";
import svcSkill from "@/assets/landing/svc-skill.jpg";
import svcTherapist from "@/assets/landing/svc-therapist.jpg";
import svcLab from "@/assets/landing/svc-lab.jpg";
import outcomeStudents from "@/assets/landing/outcome-students.jpg";
import outcomeInstitution from "@/assets/landing/outcome-institution.jpg";
import outcomeParents from "@/assets/landing/outcome-parents.jpg";
import platMap from "@/assets/landing/plat-map.jpg";
import platCompass from "@/assets/landing/plat-compass.jpg";
import platJourney from "@/assets/landing/plat-journey.jpg";
import platSystem from "@/assets/landing/plat-system.jpg";
import platBuild from "@/assets/landing/plat-build.jpg";
import platPath from "@/assets/landing/plat-path.jpg";
import storyAlex from "@/assets/landing/story-alex.jpg";
import storyRahul from "@/assets/landing/story-rahul.jpg";
import insightsTablet from "@/assets/landing/insights-tablet.jpg";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6 },
};

/* ---------- Reusable bits ---------- */

const Italic = ({ children }: { children: React.ReactNode }) => (
  <em className="font-display not-italic italic text-primary font-normal">{children}</em>
);

const ServiceCard = ({
  img,
  alt,
  Icon,
  title,
  italic,
  body,
}: {
  img: string;
  alt: string;
  Icon: typeof Rocket;
  title: string;
  italic: string;
  body: string;
}) => (
  <motion.div {...fadeUp} className="bg-card rounded-3xl border border-border shadow-soft overflow-hidden flex flex-col">
    <div className="relative">
      <img src={img} alt={alt} loading="lazy" className="w-full aspect-[4/3] object-cover" />
      <div className="absolute -bottom-5 left-5 w-12 h-12 rounded-2xl bg-primary text-accent flex items-center justify-center shadow-accent">
        <Icon size={22} />
      </div>
    </div>
    <div className="p-6 sm:p-7 pt-9 flex-1 flex flex-col">
      <h3 className="font-body text-xl sm:text-2xl text-foreground font-bold leading-tight">
        {title} <Italic>{italic}</Italic>
      </h3>
      <p className="font-body text-sm sm:text-base text-muted-foreground mt-4 leading-relaxed">{body}</p>
    </div>
  </motion.div>
);

const StakeholderCard = ({
  Icon,
  title,
  italic,
  body,
}: {
  Icon: typeof Target;
  title: string;
  italic: string;
  body: string;
}) => (
  <motion.div {...fadeUp} className="bg-card rounded-3xl border border-border shadow-soft p-7 sm:p-8 flex flex-col">
    <div className="w-12 h-12 rounded-2xl bg-accent/40 text-primary flex items-center justify-center mb-6">
      <Icon size={22} />
    </div>
    <h3 className="font-body text-xl text-foreground font-semibold leading-snug">
      {title}
      <br />
      <Italic>{italic}</Italic>
    </h3>
    <p className="font-body text-sm text-muted-foreground mt-5 leading-relaxed">{body}</p>
  </motion.div>
);

const OutcomeBullet = ({ title, italic, body }: { title: string; italic: string; body: string }) => (
  <div className="flex gap-4 items-start">
    <CheckCircle2 size={22} className="text-primary shrink-0 mt-1" />
    <div>
      <h4 className="font-body text-lg sm:text-xl text-foreground font-bold">
        {title} <Italic>{italic}</Italic>
      </h4>
      <p className="font-body text-sm sm:text-base text-muted-foreground mt-2 leading-relaxed max-w-md">{body}</p>
    </div>
  </div>
);

/* ---------- Stakeholder data ---------- */

type StakeholderKey = "school" | "college" | "parents" | "institutions" | "companies";

const stakeholderData: Record<
  StakeholderKey,
  { label: string; cards: { Icon: typeof Target; title: string; italic: string; body: string }[] }
> = {
  school: {
    label: "School Students",
    cards: [
      {
        Icon: Target,
        title: "Stream Selection",
        italic: "Clarity",
        body: "Guided discovery to choose the right academic streams (Science, Commerce, Arts) based on aptitude and future growth.",
      },
      {
        Icon: Compass,
        title: "Early Career",
        italic: "Discovery",
        body: "Exposure to emerging 21st-century careers beyond the traditional options, expanding their professional imagination.",
      },
      {
        Icon: ShieldCheck,
        title: "Confidence",
        italic: "Building",
        body: "Reducing transition anxiety by providing a clear, step-by-step roadmap for their educational journey.",
      },
    ],
  },
  college: {
    label: "College Students",
    cards: [
      {
        Icon: Target,
        title: "Career",
        italic: "Alignment",
        body: "Align majors and electives with real-world career outcomes through evidence-based pathways and industry insights.",
      },
      {
        Icon: Lightbulb,
        title: "Skill",
        italic: "Stacking",
        body: "Build job-ready skills layered on top of degrees through curated micro-learning, projects, and certifications.",
      },
      {
        Icon: Rocket,
        title: "Placement",
        italic: "Readiness",
        body: "From resume to interview prep — be confident and prepared when opportunity comes knocking.",
      },
    ],
  },
  parents: {
    label: "Parents",
    cards: [
      {
        Icon: ShieldCheck,
        title: "Informed",
        italic: "Decisions",
        body: "Move beyond hearsay with data-backed insights on streams, colleges, and careers tailored to your child.",
      },
      {
        Icon: Users,
        title: "Family",
        italic: "Conversations",
        body: "Bridge the generational gap with shared dashboards, progress notes and meaningful conversations about the future.",
      },
      {
        Icon: Compass,
        title: "Trusted",
        italic: "Guidance",
        body: "An always-on counselor that understands modern career paths your child is actually curious about.",
      },
    ],
  },
  institutions: {
    label: "Institutions",
    cards: [
      {
        Icon: LayoutPanelLeft,
        title: "Career",
        italic: "Infrastructure",
        body: "A whole-school transformation framework that activates your 5 strategic pillars without extra workload on staff.",
      },
      {
        Icon: Target,
        title: "Outcome",
        italic: "Tracking",
        body: "Measure student readiness, placement velocity, and skill alignment through a single integrated dashboard.",
      },
      {
        Icon: Rocket,
        title: "Future-Ready",
        italic: "Reputation",
        body: "Stand out as a forward-looking institution producing employable, confident graduates ready for tomorrow.",
      },
    ],
  },
  companies: {
    label: "Companies",
    cards: [
      {
        Icon: Crosshair,
        title: "Talent",
        italic: "Discovery",
        body: "Access pre-vetted, skill-matched talent across regions with verified profiles and aptitude signals.",
      },
      {
        Icon: Workflow,
        title: "Hiring",
        italic: "Velocity",
        body: "Reduce time-to-hire with smart shortlisting, structured assessments, and curated talent pipelines.",
      },
      {
        Icon: Globe,
        title: "Industry",
        italic: "Partnerships",
        body: "Co-create curriculum, run hackathons, and shape the next generation of workforce alongside top institutions.",
      },
    ],
  },
};

const Index = () => {
  const [activeStake, setActiveStake] = useState<StakeholderKey>("school");
  const stake = stakeholderData[activeStake];

  return (
    <LandingLayout navAlwaysVisible>
      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden bg-background">
        <div className="absolute -top-32 right-[-10%] w-[34rem] h-[34rem] rounded-full bg-accent/30 blur-3xl pointer-events-none" />
        <div className="container mx-auto px-5 sm:px-8 pt-12 sm:pt-20 pb-20 sm:pb-28 relative">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
            <div className="lg:col-span-6">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-block rounded-full bg-accent/40 px-5 py-2 mb-7"
              >
                <span className="font-body text-sm font-semibold text-primary">
                  Connecting Academia with Community Impact
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.05 }}
                className="font-body font-bold text-[2.2rem] sm:text-5xl md:text-6xl text-foreground leading-[1.1] tracking-tight"
              >
                Confusion at 16 is not a <Italic>flaw.</Italic>
                <br />
                Uncertainty at 22 is not <Italic>failure.</Italic>
                <br />
                Hesitation is not <Italic>weakness.</Italic>
              </motion.h1>

              <motion.p
                {...fadeUp}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="font-body text-base sm:text-lg text-muted-foreground mt-7 max-w-lg leading-relaxed"
              >
                But the bigger question is, is this avoidable and who can help solve this?
              </motion.p>

              <motion.div
                {...fadeUp}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-9"
              >
                <Link
                  to="/begin"
                  className="inline-flex items-center justify-center gap-3 rounded-full bg-primary text-accent px-8 py-4 text-sm sm:text-base font-semibold shadow-accent hover:opacity-90 transition-opacity uppercase tracking-wide"
                >
                  <Rocket size={18} />
                  Explore MyRaaha to get your answers
                </Link>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-6"
            >
              <img
                src={heroImg}
                alt="Diverse team collaborating around a table with laptops"
                width={1280}
                height={1024}
                className="w-full rounded-3xl shadow-card object-cover aspect-[5/4]"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== MISSION ===== */}
      <section className="bg-primary text-accent py-20 sm:py-28">
        <div className="container mx-auto px-5 sm:px-8">
          <div className="text-center max-w-3xl mx-auto">
            <motion.span
              {...fadeUp}
              className="inline-block rounded-full bg-accent/15 border border-accent/30 px-6 py-2 font-body text-sm text-accent font-medium"
            >
              Our Mission
            </motion.span>
            <motion.h2
              {...fadeUp}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl md:text-6xl text-accent mt-7 leading-[1.1]"
            >
              Empowering <em className="italic">Innovation</em>
              <br />
              Through Collaboration
            </motion.h2>
            <motion.p
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-body text-base sm:text-lg text-accent/85 mt-6 leading-relaxed max-w-2xl mx-auto"
            >
              We bring together entrepreneurs, researchers, and industry leaders to create transformative solutions that shape the future.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-3 gap-5 sm:gap-6 mt-14 sm:mt-16">
            {[
              {
                Icon: Users,
                title: "Our",
                italic: "People",
                body: "Community first approach to drive P2P connections that transform individual journeys.",
              },
              {
                Icon: Workflow,
                title: "Our",
                italic: "Process",
                body: "Tech first approach to give AI enabled solutions in the hands of every student.",
              },
              {
                Icon: Globe,
                title: "The",
                italic: "Platform",
                body: "Creating a one stop guided solution that make a real difference in the student's career journey.",
              },
            ].map((c) => (
              <motion.div
                key={c.italic}
                {...fadeUp}
                className="rounded-3xl bg-accent/10 border border-accent/20 p-7 sm:p-8 backdrop-blur-sm"
              >
                <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center mb-6">
                  <c.Icon size={22} className="text-accent" />
                </div>
                <h3 className="font-body text-xl sm:text-2xl text-accent font-semibold">
                  {c.title} <em className="italic font-display font-normal">{c.italic}</em>
                </h3>
                <p className="font-body text-sm sm:text-base text-accent/85 mt-4 leading-relaxed">{c.body}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section className="bg-background py-20 sm:py-28">
        <div className="container mx-auto px-5 sm:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
            <motion.p {...fadeUp} className="font-body text-sm font-bold text-primary tracking-[0.22em] uppercase">
              Our Services
            </motion.p>
            <motion.h2
              {...fadeUp}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-body font-bold text-4xl sm:text-5xl md:text-6xl text-foreground mt-5"
            >
              What We <Italic>Do</Italic>
            </motion.h2>
            <motion.p
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-body text-base sm:text-lg text-muted-foreground mt-6 leading-relaxed"
            >
              Inclusive and holistic career guidance with early interventions for better skill and labour market alignment and career pathways
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-7">
            <ServiceCard
              img={svcCuriosity}
              alt="Laptop showing analytics dashboard"
              Icon={Compass}
              title="Curiosity"
              italic="Compass"
              body="Supporting innovative ideas from concept to market with expert mentorship and resources."
            />
            <ServiceCard
              img={svcNavigator}
              alt="Community brainstorming with sticky notes"
              Icon={Target}
              title="Career"
              italic="Navigator"
              body="Bridging academia with real-world social impact through collaborative community initiatives."
            />
            <ServiceCard
              img={svcVenture}
              alt="Mentor and student collaborating"
              Icon={Rocket}
              title="Venture"
              italic="Builder"
              body="Creating opportunities for students and faculty to engage in industry-leading research."
            />
            <ServiceCard
              img={svcSkill}
              alt="Hackathon event with many participants"
              Icon={Lightbulb}
              title="Skill"
              italic="Studio"
              body="Hosting hackathons, workshops, and conferences to spark creativity and networking."
            />
            <ServiceCard
              img={svcTherapist}
              alt="Career therapist portrait"
              Icon={MessageSquare}
              title="Career"
              italic="Therapist"
              body="Address mental well being by bridging career planning with emotional health, helping individuals manage anxiety, align professional goals with personal values, attain clarity for confidence."
            />
            <ServiceCard
              img={svcLab}
              alt="Modern corporate skyscrapers"
              Icon={LayoutPanelLeft}
              title="Career"
              italic="Lab"
              body="Modern workforce solutions for high speed, high-scale job and talent fitment. Smart marketplace for covering jobs and talent, that are either unexplored or not properly leveraged."
            />
          </div>
        </div>
      </section>

      {/* ===== IMPACT GROUPS ===== */}
      <section className="bg-secondary/40 py-20 sm:py-28">
        <div className="container mx-auto px-5 sm:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <motion.p {...fadeUp} className="font-body text-sm font-bold text-primary tracking-[0.22em] uppercase">
              Impact Groups
            </motion.p>
            <motion.h2
              {...fadeUp}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-body font-bold text-3xl sm:text-4xl md:text-5xl text-foreground mt-5 leading-tight"
            >
              What is in it for our <Italic>stakeholders?</Italic>
            </motion.h2>
          </div>

          {/* Tabs */}
          <div className="flex justify-center mb-12 sm:mb-14">
            <div className="inline-flex flex-wrap justify-center bg-background rounded-full p-1.5 shadow-soft border border-border max-w-full overflow-x-auto">
              {(Object.keys(stakeholderData) as StakeholderKey[]).map((k) => (
                <button
                  key={k}
                  onClick={() => setActiveStake(k)}
                  className={`px-5 sm:px-7 py-2.5 sm:py-3 rounded-full font-body text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                    activeStake === k
                      ? "bg-foreground text-background shadow-card"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {stakeholderData[k].label}
                </button>
              ))}
            </div>
          </div>

          <motion.div
            key={activeStake}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid md:grid-cols-3 gap-6"
          >
            {stake.cards.map((c) => (
              <StakeholderCard key={c.italic} {...c} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* ===== STRATEGIC TRANSFORMATION ===== */}
      <section className="bg-background py-20 sm:py-28">
        <div className="container mx-auto px-5 sm:px-8">
          <motion.p {...fadeUp} className="font-body text-sm font-bold text-primary tracking-[0.22em] uppercase">
            Strategic Transformation
          </motion.p>
          <motion.h2
            {...fadeUp}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-display text-4xl sm:text-5xl md:text-6xl text-foreground mt-7 leading-[1.05]"
          >
            WE ENABLE
            <br />
            <em className="italic text-primary">"FUTURE READY COLLEGE MODEL"</em>
          </motion.h2>

          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 mt-14">
            <motion.h3
              {...fadeUp}
              className="font-body text-2xl sm:text-3xl text-primary font-bold leading-snug"
            >
              Our unique value proposition is to guide students with clarity, confidence, and career
            </motion.h3>
            <motion.p
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="font-body text-base sm:text-lg text-muted-foreground leading-relaxed"
            >
              myRaaha 360 is not just a career guidance ecosystem platform, but a whole-school transformation framework
              aligned with the future of education, employability, and innovation, activating school's 5 strategic pillars
            </motion.p>
          </div>
        </div>
      </section>

      {/* ===== OUTCOME 01 — Student Outcome ===== */}
      <section className="bg-background-alt/50 py-20 sm:py-28">
        <div className="container mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div {...fadeUp}>
              <img
                src={outcomeStudents}
                alt="Students at digital screen showing career growth paths"
                loading="lazy"
                width={1280}
                height={1024}
                className="w-full rounded-3xl shadow-card object-cover aspect-[5/4]"
              />
            </motion.div>

            <div>
              <motion.div
                {...fadeUp}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-7"
              >
                <span className="font-display text-2xl text-primary">01</span>
              </motion.div>
              <motion.h2
                {...fadeUp}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="font-display text-4xl sm:text-5xl md:text-6xl text-foreground mb-10 leading-[1.05]"
              >
                Student <em className="italic text-primary">Outcome</em>
              </motion.h2>

              <div className="space-y-7">
                <OutcomeBullet
                  title="Career Clarity for"
                  italic="Students"
                  body="Enabling students make stream and career choices with confidence & clarity."
                />
                <OutcomeBullet
                  title="Stronger Student"
                  italic="Outcomes"
                  body="Schools are increasingly judged by what students achieve after graduation."
                />
                <OutcomeBullet
                  title="Exposure to Emerging"
                  italic="Careers"
                  body="Students discover emerging career paths, expanding their career imagination."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== OUTCOME 02 — Institutional Reputation ===== */}
      <section className="bg-background py-20 sm:py-28">
        <div className="container mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="lg:order-1 order-2">
              <motion.div
                {...fadeUp}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-7"
              >
                <span className="font-display text-2xl text-primary">02</span>
              </motion.div>
              <motion.h2
                {...fadeUp}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="font-display text-4xl sm:text-5xl md:text-6xl text-foreground mb-10 leading-[1.05]"
              >
                Institutional <em className="italic text-primary">Reputation</em>
              </motion.h2>

              <div className="space-y-7">
                <OutcomeBullet
                  title="Future-Ready Skill"
                  italic="Development"
                  body="The global job landscape is shifting due to AI, automation, & sustainability transitions."
                />
                <OutcomeBullet
                  title="Student"
                  italic="Acquisition"
                  body="Future-ready school model with structured career development programs attract better student to beat peers."
                />
                <OutcomeBullet
                  title="Teacher"
                  italic="Enablement"
                  body="Teachers are equipped with career intelligence, insights to become career mentors."
                />
              </div>
            </div>

            <motion.div {...fadeUp} className="lg:order-2 order-1">
              <img
                src={outcomeInstitution}
                alt="Modern futuristic university campus building"
                loading="lazy"
                width={1280}
                height={1024}
                className="w-full rounded-3xl shadow-card object-cover aspect-[5/4]"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== Final CTA ===== */}
      <section className="bg-primary text-accent">
        <div className="container mx-auto px-5 sm:px-8 py-20 sm:py-24 text-center">
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl text-accent leading-tight max-w-3xl mx-auto">
            Ready to build a <em className="italic">future-ready</em> institution?
          </h2>
          <p className="font-body text-base sm:text-lg text-accent/85 mt-5 max-w-2xl mx-auto">
            Partner with MyRaaha and transform how your students discover, decide, and thrive.
          </p>
          <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/auth"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-accent text-primary px-8 py-4 text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              Partner Portal <ArrowRight size={16} />
            </Link>
            <Link
              to="/contact"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-accent/40 text-accent px-8 py-4 text-sm font-medium hover:bg-accent/10 transition-colors"
            >
              Talk to us
            </Link>
          </div>
        </div>
      </section>
    </LandingLayout>
  );
};

export default Index;
