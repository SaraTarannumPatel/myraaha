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
  <em className="italic text-primary">{children}</em>
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
    <h3 className="font-body text-xl sm:text-2xl text-foreground font-bold leading-tight">
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

const PlatformCard = ({
  img,
  alt,
  Icon,
  title,
  italic,
  titleSuffix,
  lead,
  bullets,
}: {
  img: string;
  alt: string;
  Icon: typeof Globe2;
  title: string;
  italic: string;
  titleSuffix?: string;
  lead: string;
  bullets: { title: string; body: string }[];
}) => (
  <motion.div {...fadeUp} className="bg-card rounded-3xl border border-border shadow-soft overflow-hidden grid sm:grid-cols-2">
    <div className="relative min-h-[280px] sm:min-h-0">
      <img src={img} alt={alt} loading="lazy" className="absolute inset-0 w-full h-full object-cover" />
    </div>
    <div className="p-7 sm:p-8 flex flex-col">
      <div className="flex items-start gap-3 mb-5">
        <div className="w-11 h-11 rounded-2xl bg-accent/40 text-primary flex items-center justify-center shrink-0">
          <Icon size={20} />
        </div>
        <h3 className="font-body text-xl sm:text-2xl text-foreground font-bold leading-tight pt-1">
          {title} <Italic>{italic}</Italic>{titleSuffix}
        </h3>
      </div>
      <p className="font-body text-base text-primary font-semibold italic leading-relaxed mb-6">{lead}</p>
      <ul className="space-y-5">
        {bullets.map((b) => (
          <li key={b.title} className="flex gap-3">
            <ArrowRight size={18} className="text-primary shrink-0 mt-1" />
            <div>
              <p className="font-body text-base text-foreground font-bold">{b.title}</p>
              <p className="font-body text-sm text-muted-foreground mt-1 leading-relaxed">{b.body}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  </motion.div>
);


const NumberedTextCard = ({
  num,
  title,
  italic,
  body,
}: {
  num: string;
  title: string;
  italic: string;
  body: string;
}) => (
  <motion.div {...fadeUp} className="bg-card rounded-3xl border border-border shadow-soft p-8 sm:p-12">
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-10">
      <span className="font-display text-2xl text-primary tracking-wide">{num}</span>
    </div>
    <h3 className="font-body font-bold text-4xl sm:text-5xl md:text-6xl text-foreground leading-[1.1]">
      {title} <Italic>{italic}</Italic>
    </h3>
    <p className="font-body text-base sm:text-lg text-muted-foreground mt-8 leading-relaxed">{body}</p>
  </motion.div>
);

/* ---------- Stakeholder data ---------- */

type StakeholderKey = "students" | "parents" | "institutions" | "governments";

const stakeholderData: Record<
  StakeholderKey,
  { label: string; cards: { Icon: typeof Target; title: string; italic: string; body: string }[] }
> = {
  students: {
    label: "Students",
    cards: [
      {
        Icon: Target,
        title: "Career",
        italic: "Discovery",
        body: "Career discovery before career decisions is essential for long-term career success and fulfilment. Enabling students make stream and career choices with confidence & clarity.",
      },
      {
        Icon: Compass,
        title: "Career",
        italic: "Navigation",
        body: "\u201CSelf-discovery\u201D before career decisions is essential for long-term career success and fulfilment. Students discover emerging career paths, expanding their career imagination.",
      },
      {
        Icon: Rocket,
        title: "Career",
        italic: "Building",
        body: "Bridging the skill gap, access to industry professionals and support students with venture building, enabling stronger student outcomes.",
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
        title: "Policy",
        italic: "Alignment",
        body: "Alignment with Education Reform: Institutions increasingly need to align with National Education Policy 2020.",
      },
      {
        Icon: Globe,
        title: "Ecosystem",
        italic: "Integration",
        body: "Ecosystem Network, Institutions can connect students with alumni mentors & industry professionals for a strong career support ecosystem.",
      },
      {
        Icon: Rocket,
        title: "Future-Ready",
        italic: "Reputation",
        body: "Stand out as a forward-looking institution producing employable, confident graduates ready for tomorrow.",
      },
    ],
  },
  governments: {
    label: "Governments",
    cards: [
      {
        Icon: Crosshair,
        title: "Talent",
        italic: "Discovery",
        body: "Access pre-vetted, skill-matched talent across regions with verified profiles and aptitude signals.",
      },
      {
        Icon: Workflow,
        title: "Workforce",
        italic: "Readiness",
        body: "Reduce skill-to-job mismatch with structured career pathways and aligned national skilling initiatives.",
      },
      {
        Icon: Globe,
        title: "Public-Private",
        italic: "Partnerships",
        body: "Co-create policy, run national programs, and shape the next generation of workforce alongside top institutions.",
      },
    ],
  },
};

const Index = () => {
  const [activeStake, setActiveStake] = useState<StakeholderKey>("students");
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
              className="font-body font-bold text-4xl sm:text-5xl md:text-6xl text-accent mt-7 leading-[1.1]"
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
                className="rounded-3xl bg-accent/10 border border-accent/20 p-7 sm:p-8 backdrop-blur-sm flex flex-col items-center text-center"
              >
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-6">
                  <c.Icon size={22} className="text-primary" />
                </div>
                <h3 className="font-body text-xl sm:text-2xl text-accent font-bold leading-tight">
                  {c.title} <em className="italic">{c.italic}</em>
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
      <section className="bg-background-alt py-20 sm:py-28">
        <div className="container mx-auto px-5 sm:px-8">
          <div className="text-center max-w-3xl mx-auto mb-12">
            <motion.p {...fadeUp} className="font-body text-sm font-bold text-primary tracking-[0.22em] uppercase">
              Value Realization
            </motion.p>
            <motion.h2
              {...fadeUp}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="font-body font-bold text-4xl sm:text-5xl md:text-6xl text-foreground mt-5 leading-[1.1]"
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
                className="font-body font-bold text-4xl sm:text-5xl md:text-6xl text-foreground mb-10 leading-[1.1]"
              >
                Student <Italic>Outcome</Italic>
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
                className="font-body font-bold text-4xl sm:text-5xl md:text-6xl text-foreground mb-10 leading-[1.1]"
              >
                Institutional <Italic>Reputation</Italic>
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

      {/* ===== OUTCOME 03 — Parent Satisfaction ===== */}
      <section className="bg-background-alt/50 py-20 sm:py-28">
        <div className="container mx-auto px-5 sm:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <motion.div {...fadeUp}>
              <img
                src={outcomeParents}
                alt="Family with career counselor reviewing student success report"
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
                <span className="font-display text-2xl text-primary">03</span>
              </motion.div>
              <motion.h2
                {...fadeUp}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="font-body font-bold text-4xl sm:text-5xl md:text-6xl text-foreground mb-10 leading-[1.1]"
              >
                Parent <Italic>Satisfaction</Italic>
              </motion.h2>

              <div className="space-y-7">
                <OutcomeBullet
                  title="Improved Parent"
                  italic="Satisfaction"
                  body="In today's ambiguous world, parents look for clarity, and forward looking predictions."
                />
                <OutcomeBullet
                  title="Positive"
                  italic="Parenting"
                  body="Another critical element is the segment of positive parenting for better student support."
                />
                <OutcomeBullet
                  title="Structured Career Guidance"
                  italic="System"
                  body="myRaaha creates a systematic & integrated program to create a continuous guidance journey."
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== 04 / 05 — Numbered text cards ===== */}
      <section className="bg-background py-20 sm:py-28">
        <div className="container mx-auto px-5 sm:px-8">
          <div className="grid md:grid-cols-2 gap-7">
            <NumberedTextCard
              num="04"
              title="Policy"
              italic="Alignment"
              body="Alignment with Education Reform: Schools increasingly need to align with National Education Policy 2020."
            />
            <NumberedTextCard
              num="05"
              title="Ecosystem"
              italic="Partnerships"
              body="Alumni/Ecosystem Network: Schools can connect students with alumni mentors & industry professionals for a strong career support ecosystem."
            />
          </div>
        </div>
      </section>

      {/* ===== THE PLATFORM ===== */}
      <section className="bg-background-alt/40 py-20 sm:py-28">
        <div className="container mx-auto px-5 sm:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
            <motion.h2
              {...fadeUp}
              className="font-body font-bold text-4xl sm:text-5xl md:text-6xl text-foreground"
            >
              The <Italic>Platform</Italic>
            </motion.h2>
            <motion.p
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="font-body text-base sm:text-lg text-muted-foreground mt-7 leading-relaxed"
            >
              We bring the power of integrated intervention for meaningful career journeys. Career success starts with myRaaha360
            </motion.p>
          </div>

          <div className="grid lg:grid-cols-2 gap-7">
            <PlatformCard
              img={platMap}
              alt="Glowing neural mind map"
              Icon={Globe2}
              title="The Map Was Always"
              italic="Missing"
              titleSuffix=", Not You."
              lead="Confusion is not a flaw. It is data. MyRaaha doesn't fix you. It builds the map."
              bullets={[
                { title: "You are not behind. You are uncharted.", body: "The system starts reading you from day one." },
                { title: "Your uncertainty is the starting point.", body: "We track what lights you up — quietly." },
                { title: "Clarity is a process.", body: "The SelfGraph™ holds it with you, evolving in real time." },
              ]}
            />
            <PlatformCard
              img={platCompass}
              alt="Hand holding compass with sunburst"
              Icon={CompassIcon}
              title="Direction Before"
              italic="Destination."
              lead="The world asks you to commit before you understand. We refuse that sequence."
              bullets={[
                { title: "Explore first. Decide later.", body: "The Curiosity Compass opens before any roadmap." },
                { title: "Every path made visible.", body: "Stories, simulations, lived paths. Not brochures." },
                { title: "See the tradeoffs.", body: "AI roadmaps that make the fine print visible." },
              ]}
            />
            <PlatformCard
              img={platJourney}
              alt="Glowing journey path"
              Icon={RocketIcon}
              title="You Are Not a Resume. You Are a"
              italic="Journey."
              lead="Your aptitude today is not your ceiling tomorrow. Your story deserves to be tracked."
              bullets={[
                { title: "Captured automatically.", body: "The Living Resume™ forgets nothing." },
                { title: "Identity evolves.", body: "The 3A Intelligence Engine evolves with you." },
                { title: "No resets. No re-tests.", body: "Just compounding clarity." },
              ]}
            />
            <PlatformCard
              img={platSystem}
              alt="Person walking with glowing guide"
              Icon={TargetIcon}
              title="The System Navigates. You Are Not"
              italic="Alone."
              lead="Self-navigation is a myth. We end years lost to confusion and missed opportunities."
              bullets={[
                { title: "Proactive guidance.", body: "The AI Career Therapist steps in before burnout." },
                { title: "Matched trajectory.", body: "Real mentors. No gatekeeping." },
                { title: "Inclusive by design.", body: "Built for Tier 3, Tier 4, and rural India." },
              ]}
            />
            <PlatformCard
              img={platBuild}
              alt="Maker working on glowing lamp"
              Icon={LightbulbIcon}
              title="Build Something. Even if You Weren't"
              italic="Told."
              lead="Entrepreneurship is a system — learnable, teachable, and available to anyone."
              bullets={[
                { title: "Serious curiosity.", body: "Startup Sparks helps you follow it." },
                { title: "Validated by reality.", body: "Sprints and MVP Builders turn thinking into doing." },
                { title: "Build the person.", body: "The Funding Path Navigator is already waiting." },
              ]}
            />
            <PlatformCard
              img={platPath}
              alt="Person standing on neon path overlooking city"
              Icon={LayoutIcon}
              title="Your Path. Not"
              italic="Theirs."
              lead="Not every builder wants a boardroom. Some want freedom. All of it counts."
              bullets={[
                { title: "Chosen, not assigned.", body: "The Path Selector adapts to what you actually want." },
                { title: "Hybrid lives are real.", body: "Career and creation are not opposites. You can walk both." },
                { title: "Start anywhere.", body: "No pitch deck or co-founder needed. We are your starting point." },
              ]}
            />
          </div>
        </div>
      </section>


      {/* ===== SUCCESS STORIES ===== */}
      <SuccessStories />

      {/* ===== WEEKLY INSIGHTS ===== */}
      <section className="bg-background py-20 sm:py-28">
        <div className="container mx-auto px-5 sm:px-8">
          <div className="rounded-3xl overflow-hidden border border-border shadow-soft grid lg:grid-cols-2 bg-card">
            <div className="relative bg-primary p-10 sm:p-14 flex flex-col justify-end min-h-[420px]">
              <img
                src={insightsTablet}
                alt="Tablet displaying MyRaaha Insight magazine"
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-luminosity"
              />
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex -space-x-2">
                    <div className="w-9 h-9 rounded-full bg-accent/40 border-2 border-accent" />
                    <div className="w-9 h-9 rounded-full bg-accent/60 border-2 border-accent" />
                    <div className="w-9 h-9 rounded-full bg-accent/80 border-2 border-accent" />
                  </div>
                  <span className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-accent text-primary text-xs font-bold">+5k</span>
                </div>
                <p className="font-body text-accent text-lg sm:text-xl font-semibold leading-snug">
                  Join our thriving community of innovators
                </p>
              </div>
            </div>
            <div className="p-10 sm:p-14 flex flex-col justify-center">
              <p className="font-body text-sm font-bold text-primary tracking-[0.22em] uppercase">Weekly Insights</p>
              <h2 className="font-body font-bold text-4xl sm:text-5xl md:text-6xl text-foreground mt-4 leading-[1.1]">
                Stay ahead of the
                <br />
                <Italic>future of education.</Italic>
              </h2>
              <p className="font-body text-base sm:text-lg text-muted-foreground mt-6 leading-relaxed">
                Get curated insights on career evolution, NEP 2020 transitions, and exclusive ecosystem opportunities delivered every Monday.
              </p>
              <form
                onSubmit={(e) => e.preventDefault()}
                className="mt-8 flex flex-col sm:flex-row gap-3"
              >
                <input
                  type="email"
                  required
                  placeholder="Your professional email"
                  className="flex-1 bg-transparent border-b border-border focus:border-primary outline-none px-2 py-3 font-body text-base text-foreground placeholder:text-muted-foreground"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center gap-2 rounded-2xl bg-primary text-accent px-7 py-3 font-body text-base font-semibold hover:opacity-90 transition-opacity"
                >
                  Subscribe <Send size={16} />
                </button>
              </form>
              <p className="font-body text-sm text-muted-foreground mt-4">
                No spam. Just value. Unsubscribe anytime.
              </p>
            </div>
          </div>
        </div>
      </section>

    </LandingLayout>
  );
};

/* ---------- Success Stories component (with tabs) ---------- */

type StoryTab = "students" | "institutes" | "parents";

const storyData: Record<StoryTab, { label: string; cards: { img: string; quote: string; name: string; role: string }[] }> = {
  students: {
    label: "Students",
    cards: [
      {
        img: storyAlex,
        quote: "The partnerships program provided the resources and network we needed to scale our impact.",
        name: "Alex Chen",
        role: "Founder, TechStart",
      },
      {
        img: storyRahul,
        quote: "Myraaha helped me transition from being an overthinker to a focused entrepreneur with a clear action plan.",
        name: "Rahul S.",
        role: "Entrepreneurship Student",
      },
    ],
  },
  institutes: {
    label: "Institutes",
    cards: [
      {
        img: storyAlex,
        quote: "Our placement velocity improved dramatically after integrating MyRaaha into our career cell workflow.",
        name: "Dr. Priya Menon",
        role: "Dean, Innovation Cell",
      },
      {
        img: storyRahul,
        quote: "The dashboards give us real visibility into student readiness — something no career portal ever offered.",
        name: "Vikram Joshi",
        role: "Director, Skill Council",
      },
    ],
  },
  parents: {
    label: "Parents",
    cards: [
      {
        img: storyAlex,
        quote: "For the first time, I feel informed enough to actually support my daughter's career decisions.",
        name: "Sunita R.",
        role: "Parent, Class XII",
      },
      {
        img: storyRahul,
        quote: "MyRaaha turned dinner-table arguments into real conversations about my son's future.",
        name: "Manoj Kapoor",
        role: "Parent, College Student",
      },
    ],
  },
};

const SuccessStories = () => {
  const [active, setActive] = useState<StoryTab>("students");
  const cards = storyData[active].cards;
  return (
    <section className="bg-background-alt/40 py-20 sm:py-28">
      <div className="container mx-auto px-5 sm:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.h2
            {...fadeUp}
            className="font-body font-bold text-4xl sm:text-5xl md:text-6xl text-foreground"
          >
            Success <Italic>Stories</Italic>
          </motion.h2>
          <motion.p
            {...fadeUp}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="font-body text-base sm:text-lg text-muted-foreground mt-6"
          >
            Hear from our partners, well wishers and participants
          </motion.p>
        </div>

        <div className="flex justify-center mb-12">
          <div className="inline-flex flex-wrap justify-center bg-card rounded-full p-1.5 shadow-soft border border-border max-w-full overflow-x-auto">
            {(Object.keys(storyData) as StoryTab[]).map((k) => (
              <button
                key={k}
                onClick={() => setActive(k)}
                className={`px-6 sm:px-8 py-2.5 sm:py-3 rounded-full font-body text-xs sm:text-sm font-semibold whitespace-nowrap transition-all ${
                  active === k
                    ? "bg-background text-primary shadow-card"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {storyData[k].label}
              </button>
            ))}
          </div>
        </div>

        <motion.div
          key={active}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid md:grid-cols-2 gap-6"
        >
          {cards.map((c) => (
            <div key={c.name} className="bg-card rounded-3xl border border-border shadow-soft overflow-hidden">
              <img src={c.img} alt={c.name} loading="lazy" className="w-full aspect-[16/9] object-cover" />
              <div className="p-7 sm:p-8 text-center">
                <p className="font-body italic text-base sm:text-lg text-foreground leading-relaxed">
                  &ldquo;{c.quote}&rdquo;
                </p>
                <p className="font-body text-lg text-foreground font-bold mt-7">{c.name}</p>
                <p className="font-body text-sm text-primary font-semibold mt-1">{c.role}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Index;
