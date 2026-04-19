import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Search, Bell, Compass, Map as MapIcon, Sparkles, Bike, Layers, Brain, Building2, Users, Eye } from "lucide-react";
import LandingLayout from "@/components/landing/shared/LandingLayout";
import Section from "@/components/landing/shared/Section";
import Quote from "@/components/landing/shared/Quote";
import CTABand from "@/components/landing/shared/CTABand";
import raahaJourney from "@/assets/landing/raaha-journey.jpg";
import raahaMarg from "@/assets/landing/raaha-marg.jpg";
import appFrame from "@/assets/landing/app-frame.jpg";

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6 },
};

const Index = () => {
  return (
    <LandingLayout navAlwaysVisible={false}>
      {/* ===== Chapter 1 — Arrival ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 gradient-hero pointer-events-none" />
        <div className="absolute -top-32 right-[-10%] w-[34rem] h-[34rem] rounded-full bg-accent/30 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10rem] left-[-6rem] w-[28rem] h-[28rem] rounded-full bg-primary/10 blur-3xl pointer-events-none" />

        <div className="container mx-auto px-5 sm:px-8 pt-20 sm:pt-28 pb-24 sm:pb-32 relative">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7">
              <motion.p {...fadeUp} className="font-body text-xs uppercase tracking-[0.28em] text-grey-label mb-6">
                Chapter 1 — Arrival
              </motion.p>
              <motion.h1
                {...fadeUp}
                transition={{ duration: 0.7, delay: 0.05 }}
                className="font-display text-[2.6rem] sm:text-6xl md:text-7xl lg:text-[5.4rem] text-primary leading-[1.02] tracking-tight"
              >
                You don't need to{" "}
                <span className="highlight-mark italic">decide anything</span> here.
              </motion.h1>
              <motion.p
                {...fadeUp}
                transition={{ duration: 0.6, delay: 0.15 }}
                className="font-body text-base sm:text-lg text-foreground/75 mt-7 max-w-xl leading-relaxed"
              >
                A sanctuary for the overthinkers, the late bloomers, and the ambitious souls who feel stuck at 2 AM.{" "}
                <em className="text-primary not-italic font-medium">Breathe. We have time.</em>
              </motion.p>
              <motion.div
                {...fadeUp}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="mt-10 flex flex-col sm:flex-row gap-3"
              >
                <Link
                  to="/begin"
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-accent px-7 py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity"
                >
                  Enter the Sanctuary <ArrowRight size={16} />
                </Link>
                <Link
                  to="/experience"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/20 text-primary px-7 py-3.5 text-sm font-medium hover:bg-primary/5 transition-colors"
                >
                  Watch the Journey
                </Link>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.9 }}
                className="font-body text-xs text-grey-meta mt-10 italic"
              >
                Your journey. At your pace.
              </motion.p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.2 }}
              className="lg:col-span-5"
            >
              <div className="relative">
                <img
                  src={raahaJourney}
                  alt="A traveler walking a soft winding path holding a glowing compass — the MyRaaha journey"
                  className="w-full max-w-md mx-auto"
                  width={1024}
                  height={1024}
                />
                <motion.div
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute top-6 left-2 sm:left-6 bg-background/90 backdrop-blur-md border border-border rounded-2xl px-4 py-3 shadow-soft"
                >
                  <p className="font-display text-sm text-primary">Raaha</p>
                  <p className="font-body text-[10px] text-grey-meta">The hand that steadies you</p>
                </motion.div>
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
                  className="absolute bottom-10 right-2 sm:right-0 bg-background/90 backdrop-blur-md border border-border rounded-2xl px-4 py-3 shadow-soft"
                >
                  <p className="font-display text-sm text-primary">Marg</p>
                  <p className="font-body text-[10px] text-grey-meta">The spine that keeps you moving</p>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ===== Chapter 2 — Identification ===== */}
      <Section
        eyebrow="Chapter 2 — Identification"
        title={
          <>
            You've <span className="italic">probably</span> been{" "}
            <span className="highlight-mark italic">here before.</span>
          </>
        }
      >
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-7 space-y-5">
            {/* Mock browser */}
            <motion.div {...fadeUp} className="rounded-2xl border border-border shadow-soft overflow-hidden bg-background">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-secondary/40">
                <span className="h-2.5 w-2.5 rounded-full bg-destructive/60" />
                <span className="h-2.5 w-2.5 rounded-full bg-warning" />
                <span className="h-2.5 w-2.5 rounded-full bg-success/70" />
                <div className="ml-3 flex-1 flex items-center gap-2 bg-background border border-border rounded-full px-4 py-1.5">
                  <Search size={14} className="text-grey-meta" />
                  <p className="font-body text-xs text-foreground/80 truncate">
                    career paths for people who don't know what they want…
                  </p>
                </div>
                <span className="font-body text-[10px] text-grey-meta whitespace-nowrap">Tab 42 of 42</span>
              </div>
              <div className="p-6 sm:p-8 grid sm:grid-cols-2 gap-4">
                <div className="rounded-xl border border-border p-5">
                  <p className="font-body text-[10px] uppercase tracking-wider text-grey-meta">Internal Monologue · 2:45 AM</p>
                  <p className="font-display text-lg text-primary mt-2 leading-snug">
                    "What am I <em>even doing</em> with my life?"
                  </p>
                </div>
                <div className="rounded-xl border border-border p-5 bg-secondary/40">
                  <div className="flex items-center gap-2 mb-2">
                    <Bell size={14} className="text-primary" />
                    <p className="font-body text-[10px] uppercase tracking-wider text-grey-meta">LinkedIn · just now</p>
                  </div>
                  <p className="font-body text-sm text-foreground/85 leading-relaxed">
                    "Everyone is getting promoted except me."
                  </p>
                </div>
              </div>
            </motion.div>
          </div>

          <div className="lg:col-span-5">
            <ol className="space-y-5">
              {[
                "The endless scroll for 'purpose'.",
                "Winning the race, but on the wrong track.",
                "Asking people for answers they don't have.",
              ].map((line, i) => (
                <motion.li {...fadeUp} key={line} transition={{ duration: 0.5, delay: i * 0.06 }} className="flex gap-4">
                  <span className="font-display text-2xl text-accent-foreground bg-accent rounded-full w-10 h-10 flex items-center justify-center shrink-0">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <p className="font-body text-base text-foreground/85 pt-1.5 leading-relaxed">{line}</p>
                </motion.li>
              ))}
            </ol>

            <motion.div
              {...fadeUp}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-8 rounded-2xl bg-primary text-accent p-6 sm:p-7"
            >
              <p className="font-display text-xl sm:text-2xl text-accent leading-snug">
                Clarity isn't a prize for finishing. It's a method for beginning.
              </p>
              <p className="font-body text-sm text-accent/85 mt-3">
                We don't give you another map. <em>We teach you how to see.</em>
              </p>
            </motion.div>
          </div>
        </div>
      </Section>

      {/* ===== The Disconnection ===== */}
      <Section
        variant="muted"
        eyebrow="The Disconnection"
        title={
          <>
            Everything is <span className="italic">separate.</span>{" "}
            <span className="highlight-mark italic">That's the problem.</span>
          </>
        }
      >
        <div className="grid lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7">
            <div className="flex flex-wrap gap-3">
              {["Aptitude Tests", "Courses", "Mentors", "Job Portals", "Startup Advice", "Funding"].map((tag, i) => (
                <motion.span
                  key={tag}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.05 }}
                  className="rounded-full bg-background border border-border px-5 py-2.5 font-body text-sm text-foreground/80"
                  style={{ transform: `rotate(${(i % 3) - 1}deg)` }}
                >
                  {tag}
                </motion.span>
              ))}
            </div>
            <p className="font-body text-base text-foreground/75 mt-8 max-w-lg leading-relaxed">
              You are expected to connect all this yourself. And when something doesn't work, you start over.
            </p>
          </div>
          <div className="lg:col-span-5 flex items-center">
            <p className="font-display text-3xl sm:text-4xl text-primary leading-tight">
              This is an{" "}
              <span className="highlight-mark italic">infrastructure</span> problem.
            </p>
          </div>
        </div>
      </Section>

      {/* ===== Chapter 3 — Normalization ===== */}
      <Section
        eyebrow="Chapter 3 — Normalization"
        title={
          <>
            Confusion at 22 is <span className="italic">not a flaw.</span>
            <br />
            Uncertainty at 28 is <span className="italic">not failure.</span>
            <br />
            Hesitation is <span className="highlight-mark italic">not weakness.</span>
          </>
        }
        lead="Life isn't linear. Clarity isn't a switch. The pressure to 'figure it out fast' leads to blind choices. Not confident ones."
      >
        <div className="grid sm:grid-cols-2 gap-6 max-w-3xl">
          <div className="rounded-2xl border border-border p-7 bg-secondary/40">
            <p className="font-display text-3xl text-primary">You are not late.</p>
            <p className="font-body text-sm text-foreground/70 mt-3">Where understanding begins.</p>
          </div>
          <div className="rounded-2xl border border-border p-7">
            <p className="font-body text-xs uppercase tracking-[0.2em] text-grey-label mb-3">Reframe</p>
            <p className="font-body text-base text-foreground/80 leading-relaxed">
              Your hesitation is information. Your confusion is a signal. Both deserve patience.
            </p>
          </div>
        </div>
      </Section>

      {/* ===== The Paradox ===== */}
      <Section variant="muted" eyebrow="The Paradox" title={<>You have <span className="italic">information.</span> <span className="highlight-mark italic">Not direction.</span></>}>
        <div className="grid lg:grid-cols-2 gap-10">
          <p className="font-body text-base sm:text-lg text-foreground/80 leading-relaxed">
            You consume a lot of information online and offline. But no one owns your full journey. Unless there is someone or something
            in the flow to tell you whether you are doing it right or not, you get lost. No matter how much information you have,
            if you don't have someone guiding you at every step, you won't know what to do when you are stuck.
          </p>
          <div className="rounded-2xl bg-primary text-accent p-7 sm:p-9">
            <p className="font-display text-2xl sm:text-3xl text-accent leading-snug">
              Information is useless without a bigger picture.
            </p>
            <p className="font-body text-sm text-accent/85 mt-4 leading-relaxed">
              MyRaaha connects what you know to where you're going. It handholds you till you achieve it — and acts as
              emergency support even after.
            </p>
          </div>
        </div>
      </Section>

      {/* ===== Chapter 4 — Rushing ===== */}
      <Section
        eyebrow="Chapter 4 — The Problem With Rushing"
        title={<>Most systems push decisions <span className="highlight-mark italic">too early.</span></>}
        lead="Pick. Choose. Commit. Start. But what if you don't know yourself yet?"
      >
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <div className="lg:col-span-5 relative aspect-square max-w-sm mx-auto">
            {["Pick.", "Start.", "Choose.", "Commit.", "Restart.", "Again."].map((word, i) => (
              <motion.span
                key={word}
                animate={{ rotate: 360 }}
                transition={{ duration: 22 + i * 2, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 flex items-start justify-center font-display text-xl text-primary/70"
                style={{ transform: `rotate(${(i / 6) * 360}deg)` }}
              >
                <span className="-mt-2 px-3 bg-background">{word}</span>
              </motion.span>
            ))}
            <div className="absolute inset-12 rounded-full border border-dashed border-primary/30" />
            <div className="absolute inset-24 rounded-full bg-accent/40 flex items-center justify-center">
              <p className="font-display text-primary text-center text-sm leading-tight px-3">And again.</p>
            </div>
          </div>

          <div className="lg:col-span-7 space-y-6">
            <ul className="space-y-3">
              {["What energizes vs drains you", "Where you flow vs hesitate", "How you respond under pressure"].map((line) => (
                <li key={line} className="flex gap-3 items-start">
                  <span className="mt-2 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                  <p className="font-body text-base text-foreground/80">{line}</p>
                </li>
              ))}
            </ul>
            <div className="rounded-2xl border border-border p-7 bg-secondary/40">
              <p className="font-display text-2xl text-primary leading-snug">Early decisions cost later.</p>
              <p className="font-body text-sm text-foreground/75 mt-3 leading-relaxed">
                Not because they're wrong — but because they lack self-knowledge.
              </p>
            </div>
            <p className="font-body text-sm text-grey-label italic">
              The system is built for speed. Not understanding. <span className="text-primary">But speed is not readiness.</span>
            </p>
          </div>
        </div>
      </Section>

      {/* ===== Practical Walkthrough ===== */}
      <Section
        eyebrow="A Practical Walkthrough"
        title={<>One app. <span className="highlight-mark italic">Pure navigation.</span></>}
        lead="You don't see random content. You move through structured stages."
      >
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              icon: Brain,
              step: "01",
              title: "Personal Intelligence Setup",
              body: "The app observes what you explore, where you hesitate, and what you drop. Not a one-time test result.",
              outputs: ["Risk Tolerance Score", "Energy Gain vs Drain Map", "Work-style Analysis"],
            },
            {
              icon: MapIcon,
              step: "02",
              title: "Pathway Narrowing Engine",
              body: "Instead of 200 paths, it filters based on industry growth signals, skill saturation, and income stability.",
              outputs: ["Skills Gap Breakdown", "Time-to-readiness Estimate", "Transition Feasibility"],
            },
            {
              icon: Layers,
              step: "03",
              title: "Career Execution System",
              body: "A structured skill roadmap and learning sequence. It adjusts if you fall behind or shift interest.",
              outputs: ["Weekly Action Plans", "No Random Course Hopping", "Portfolio Milestones"],
            },
            {
              icon: Building2,
              step: "04",
              title: "Startup Validation & Build",
              body: "Idea → Problem validation → Market testing. It does not let you skip validation or quit on motivation.",
              outputs: ["Market Signal Analysis", "Founder Mindset Score", "Execution Tracker"],
            },
          ].map((s, i) => (
            <motion.article
              key={s.step}
              {...fadeUp}
              transition={{ duration: 0.5, delay: i * 0.05 }}
              className="rounded-2xl border border-border p-7 sm:p-8 hover:shadow-soft transition-shadow bg-background"
            >
              <div className="flex items-start justify-between mb-5">
                <span className="font-body text-xs uppercase tracking-[0.2em] text-grey-label">Step {s.step}</span>
                <s.icon size={22} className="text-primary" />
              </div>
              <h3 className="font-display text-2xl text-primary leading-snug">{s.title}</h3>
              <p className="font-body text-sm text-foreground/75 mt-3 leading-relaxed">{s.body}</p>
              <div className="mt-5 pt-5 border-t border-border/60 flex flex-wrap gap-2">
                {s.outputs.map((o) => (
                  <span key={o} className="rounded-full bg-secondary/60 text-foreground/75 px-3 py-1 text-[11px] font-body">
                    {o}
                  </span>
                ))}
              </div>
            </motion.article>
          ))}
        </div>
      </Section>

      {/* ===== Chapter 5 — Bicycle ===== */}
      <Section variant="muted" eyebrow="Chapter 5 — The Bicycle" title={<>What if you <span className="italic">listened</span> before choosing?</>}>
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <p className="font-body text-base sm:text-lg text-foreground/80 leading-relaxed">
              Learning a bicycle. When you start for the first time, you have no clue. Unless someone guides you in real time —
              someone who holds the seat and stays so you don't fall — it becomes difficult.
            </p>
          </div>
          <div className="lg:col-span-5">
            <div className="rounded-2xl bg-background border border-border p-7 shadow-soft">
              <Bike size={28} className="text-primary mb-4" />
              <p className="font-display text-2xl text-primary leading-snug">
                MyRaaha is that elder for your career.
              </p>
              <p className="font-body text-sm text-foreground/75 mt-3 leading-relaxed">
                Someone who understands your pace.
              </p>
            </div>
          </div>
        </div>
      </Section>

      {/* ===== Safe Exploration / Decision Simulator ===== */}
      <Section
        eyebrow="Safe Exploration"
        title={<>Explore Before <span className="highlight-mark italic">You Commit.</span></>}
        lead="Instead of blindly picking, you simulate paths. If you're a student, you see what a career actually demands before locking in."
      >
        <div className="grid lg:grid-cols-12 gap-10 items-start">
          <motion.div {...fadeUp} className="lg:col-span-7">
            <div className="rounded-3xl bg-secondary/40 p-6 sm:p-8 border border-border">
              <div className="flex items-center justify-between mb-5">
                <p className="font-body text-xs uppercase tracking-wider text-grey-label">Decision Simulator™</p>
                <span className="pill-chip">Live</span>
              </div>
              <p className="font-display text-2xl text-primary">Transition Path: Product Management</p>
              <div className="grid sm:grid-cols-3 gap-4 mt-6">
                {[
                  { label: "Skill Gap", value: "High", tint: "bg-warning/30 text-foreground" },
                  { label: "Market Salary", value: "$110k", tint: "bg-accent text-primary" },
                  { label: "Safe Transition", value: "75%", tint: "bg-primary text-accent" },
                ].map((m) => (
                  <div key={m.label} className={`rounded-xl p-4 ${m.tint}`}>
                    <p className="font-body text-[11px] uppercase tracking-wider opacity-80">{m.label}</p>
                    <p className="font-display text-2xl mt-1">{m.value}</p>
                  </div>
                ))}
              </div>
              <button className="mt-6 inline-flex items-center gap-2 rounded-full border border-primary/30 text-primary px-5 py-2.5 text-sm font-medium">
                Explore Cost vs Reward <ArrowRight size={14} />
              </button>
            </div>
          </motion.div>

          <div className="lg:col-span-5 space-y-5">
            <p className="font-display text-2xl text-primary leading-snug">
              See what a transition really costs — <span className="highlight-mark italic">skills, time, and money.</span>
            </p>
            <ul className="space-y-3">
              {["Market demand analysis", "Income realities", "Effort vs Risk analysis"].map((i) => (
                <li key={i} className="flex gap-3 items-start">
                  <Eye size={16} className="text-primary mt-1 shrink-0" />
                  <p className="font-body text-base text-foreground/80">{i}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      {/* ===== User Outcomes ===== */}
      <Section variant="muted" eyebrow="User Outcomes" title={<><span className="italic">Real</span> outcomes. <span className="highlight-mark italic">No guesswork.</span></>}>
        <div className="grid sm:grid-cols-2 gap-6">
          {[
            {
              who: "Student",
              traits: ["Clear direction before degree", "Career simulation", "Identity tracking"],
              result: "Graduate with clarity, not confusion.",
            },
            {
              who: "Professional",
              traits: ["Misalignment detection", "Safe transition modeling", "Skill gap precision"],
              result: "Switch careers strategically, not emotionally.",
            },
            {
              who: "Aspiring Founder",
              traits: ["Problem-first validation", "Market-backed idea filtering", "Founder mindset score"],
              result: "Build with structure, not motivation.",
            },
            {
              who: "Active Builder",
              traits: ["Execution consistency", "Pivot analysis", "Funding eligibility"],
              result: "Fewer blind pivots. Measured growth.",
            },
          ].map((p) => (
            <article key={p.who} className="rounded-2xl bg-background border border-border p-7 sm:p-8">
              <p className="font-body text-xs uppercase tracking-[0.2em] text-grey-label">For the</p>
              <h3 className="font-display text-2xl text-primary mt-1">{p.who}</h3>
              <ul className="mt-5 space-y-2">
                {p.traits.map((t) => (
                  <li key={t} className="font-body text-sm text-foreground/75 flex gap-2">
                    <span className="text-primary">·</span> {t}
                  </li>
                ))}
              </ul>
              <p className="font-display text-base text-primary mt-6 pt-5 border-t border-border/60 leading-snug">
                The Result: <span className="highlight-mark italic">{p.result}</span>
              </p>
            </article>
          ))}
        </div>
      </Section>

      {/* ===== Recruitment ===== */}
      <Section
        eyebrow="For Companies & Talent Leads"
        title={<>Hire <span className="italic">pre-vetted</span> tech talent, <span className="highlight-mark italic">fast.</span></>}
        lead="Standard resumes don't show growth or work-style. MyRaaha does. We connect you with talent whose Aptitude, Attitude, and Articulation are already validated."
      >
        <div className="grid sm:grid-cols-2 gap-6 max-w-2xl">
          <div className="rounded-2xl bg-primary text-accent p-7">
            <p className="font-body text-xs uppercase tracking-[0.2em] text-accent/75">Efficiency</p>
            <p className="font-display text-4xl text-accent mt-2">2.5×</p>
            <p className="font-body text-sm text-accent/85 mt-1">Faster hiring</p>
          </div>
          <div className="rounded-2xl bg-accent text-primary p-7">
            <p className="font-body text-xs uppercase tracking-[0.2em] text-primary/75">Retention</p>
            <p className="font-display text-4xl text-primary mt-2">90%+</p>
            <p className="font-body text-sm text-primary/80 mt-1">Aligned</p>
          </div>
        </div>
      </Section>

      {/* ===== Chapter 8 — Structure ===== */}
      <Section
        variant="muted"
        eyebrow="Chapter 8 — When Structure Arrives"
        title={<>No <span className="italic">rush.</span> <span className="highlight-mark italic">But no drifting either.</span></>}
        lead="Clarity leads to direction. Direction needs structure."
      >
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              tag: "For Careers",
              items: [
                ["The Assessment", "Identify your true baseline and untapped potential."],
                ["The Decision Sandbox", "Test careers without the risk of quitting."],
                ["The Fast Track", "Accelerated navigation to your first major milestone."],
              ],
            },
            {
              tag: "For Founders",
              items: [
                ["The Founder Match", "Identify your true baseline and untapped potential."],
                ["Market Validation", "Test ideas without the risk of full commitment."],
                ["Growth Precision", "Accelerated navigation to your first major milestone."],
              ],
            },
          ].map((card) => (
            <div key={card.tag} className="rounded-2xl bg-background border border-border p-7 sm:p-9">
              <p className="font-body text-xs uppercase tracking-[0.22em] text-primary mb-5 font-semibold">{card.tag}</p>
              <ul className="divide-y divide-border/60">
                {card.items.map(([t, b]) => (
                  <li key={t} className="py-4 first:pt-0 last:pb-0">
                    <p className="font-display text-lg text-primary">{t}</p>
                    <p className="font-body text-sm text-foreground/75 mt-1">{b}</p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className="font-display text-xl text-grey-label mt-10 italic">
          You don't move on <span className="text-primary">motivation.</span> You move on{" "}
          <span className="highlight-mark text-primary">readiness.</span>
        </p>
      </Section>

      {/* ===== Mission / Automated Navigator ===== */}
      <Section
        eyebrow="Our Mission"
        title={<><span className="italic">Precision,</span> but <span className="highlight-mark italic">still human.</span></>}
        lead="MyRaaha isn't generic AI. It is built for decision modeling and anticipating confusion before it happens. Because it is automated, it scales beyond metro cities to Tier 3 and rural regions."
      >
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl">
          <div className="rounded-2xl border border-border p-7">
            <Users size={22} className="text-primary mb-3" />
            <p className="font-display text-xl text-primary">Accessibility</p>
            <p className="font-body text-sm text-foreground/75 mt-2 leading-relaxed">
              Stays affordable for everyone, not just the elite.
            </p>
          </div>
          <div className="rounded-2xl border border-border p-7 bg-secondary/40">
            <Sparkles size={22} className="text-primary mb-3" />
            <p className="font-display text-xl text-primary">Accountability</p>
            <p className="font-body text-sm text-foreground/75 mt-2 leading-relaxed">
              Revenue-sustained and impact-measured.
            </p>
          </div>
        </div>
      </Section>

      {/* ===== Process Walkthrough ===== */}
      <Section
        variant="muted"
        eyebrow="( Process Walkthrough )"
        title={<>For <span className="italic">Thoughtful</span> Decision Makers.</>}
      >
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7 space-y-5">
            {[
              ["01", "Arrival & Reflection", "We start where you are. No judgment, just baseline clarity."],
              ["02", "Active Simulations", "Experience the work before you sign the contract."],
              ["03", "Direct Alignment", "We place you where you actually belong."],
            ].map(([n, t, b]) => (
              <div key={n} className="flex gap-5 items-start border-b border-border/60 pb-5 last:border-0">
                <span className="font-display text-3xl text-accent-foreground bg-accent rounded-xl w-14 h-14 flex items-center justify-center shrink-0">
                  {n}
                </span>
                <div>
                  <p className="font-display text-xl text-primary">{t}</p>
                  <p className="font-body text-sm text-foreground/75 mt-1">{b}</p>
                </div>
              </div>
            ))}
            <Link
              to="/begin"
              className="inline-flex items-center gap-2 rounded-full bg-primary text-accent px-6 py-3 text-sm font-semibold mt-4"
            >
              Start Your Journey <ArrowRight size={16} />
            </Link>
          </div>
          <div className="lg:col-span-5 relative">
            <img src={appFrame} alt="MyRaaha mobile app frame" className="w-full max-w-xs mx-auto" loading="lazy" width={1024} height={1280} />
            <p className="font-display text-base text-primary text-center mt-4 italic max-w-xs mx-auto">
              "It's not about speed." <br />
              <span className="text-grey-label">"It's about the right direction."</span>
            </p>
          </div>
        </div>
      </Section>

      {/* ===== Raaha × Marg teaser ===== */}
      <Section eyebrow="Raaha × Marg" title={<>Two principles. <span className="highlight-mark italic">One system.</span></>}>
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <img src={raahaMarg} alt="Raaha and Marg — a hand holding a seed beside a staircase rising into light" className="w-full" loading="lazy" width={1600} height={900} />
          </div>
          <div className="lg:col-span-5 space-y-5">
            <div>
              <p className="font-display text-2xl text-primary">Raaha</p>
              <p className="font-body text-sm text-foreground/75 mt-1">The hand that steadies you. The pre-decision space.</p>
            </div>
            <div>
              <p className="font-display text-2xl text-primary">Marg</p>
              <p className="font-body text-sm text-foreground/75 mt-1">The spine that keeps you moving. The post-clarity structure.</p>
            </div>
            <Link to="/raaha-marg" className="inline-flex items-center gap-2 text-primary font-medium text-sm border-b border-primary pb-1">
              Read the philosophy <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </Section>

      {/* ===== Chapter 11 — Afterword ===== */}
      <Section eyebrow="Afterword" title={<>Clarity is <span className="highlight-mark italic">not a race.</span></>}>
        <div className="grid sm:grid-cols-3 gap-6 max-w-3xl">
          {[
            ["Baseline", "You are not behind."],
            ["Growth", "You are not broken."],
            ["Resilience", "You are not weak."],
          ].map(([t, b]) => (
            <div key={t} className="rounded-2xl border border-border p-6 text-center">
              <p className="font-body text-xs uppercase tracking-[0.22em] text-grey-label">{t}</p>
              <p className="font-display text-xl text-primary mt-3">{b}</p>
            </div>
          ))}
        </div>
        <Quote>
          You don't need another direction. <span className="highlight-mark italic">You need something that stays.</span>
        </Quote>
      </Section>

      <CTABand
        eyebrow="Begin when you're ready"
        title="Take the first step. It doesn't commit you to anything."
        body="Free to start. No pressure to continue. Your journey, at your pace."
        secondaryLabel="How MyRaaha Thinks"
        secondaryTo="/how"
      />
    </LandingLayout>
  );
};

export default Index;
