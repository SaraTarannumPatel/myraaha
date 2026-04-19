import LandingLayout from "@/components/landing/shared/LandingLayout";
import PageHero from "@/components/landing/shared/PageHero";
import Section from "@/components/landing/shared/Section";
import CTABand from "@/components/landing/shared/CTABand";

const careerPhases = [
  ["Phase 1 — Discovery", "Curiosity Compass", "A gamified, pressure-free exploration of your interests, strengths, and learning styles. No wrong answers. No ticking clock."],
  ["Phase 2 — Direction", "AI-Powered Roadmaps", "A personalized roadmap built from your actual behavior. It evolves as you do — not a fixed plan, a living direction."],
  ["Phase 3 — Development", "SkillStacker", "Maps the gap between where your skills are now and where they need to be — using real-time industry demand."],
  ["Phase 4 — Support", "Mentor Matchmaking + AI Career Guide", "AI-paired mentor relationships and continuous AI guidance — handling nudges, resources, and setbacks in real time."],
  ["Phase 5 — Identity", "Living Resume™ + SelfGraph", "Two living records of your journey and your evolving identity — always current, always honest."],
  ["Phase 6 — Opportunities", "Job & Internship Match", "A precision matching system — not a mass job board. Opportunities find you."],
];

const entPhases = [
  ["Phase 1 — Discovery", "Startup Sparks + Problem Spotting Lens", "Curiosity-led exploration of entrepreneurial domains and real-world challenges."],
  ["Phase 2 — Direction", "Mindset Builder + Path Selector", "Develop the thinking patterns that sustain founders. Identify your specific direction."],
  ["Phase 3 — Learning", "Founder's Learning Library", "A personalized learning hub — material mapped to your specific stage and challenges."],
  ["Phase 4 — Development", "MVP Builders + Validation Sprints + Co-Creation Labs", "Turn validated ideas into working prototypes with structured frameworks."],
  ["Phase 5 — Real World", "Startup Creation Lab + Showcase", "Where validated ideas become real ventures — with team, GTM, and funding readiness."],
  ["Phase 6 — Support", "AI Coach + AI Guide", "A 24/7 thinking partner — tactical guidance and structured emotional intelligence."],
  ["Phase 7 — Identity", "Founder Profiling + Startup Profiling", "A complete, honest picture of where you are and how you got there."],
];

const PhaseList = ({ items, color }: { items: string[][]; color: "primary" | "secondary" }) => (
  <div className="space-y-4">
    {items.map(([phase, name, body]) => (
      <article key={name} className="rounded-2xl border border-border p-6 bg-background grid sm:grid-cols-12 gap-4">
        <p className={`sm:col-span-3 font-body text-xs uppercase tracking-[0.18em] ${color === "primary" ? "text-primary" : "text-grey-label"} font-semibold pt-1`}>{phase}</p>
        <div className="sm:col-span-9">
          <p className="font-display text-xl text-primary">{name}</p>
          <p className="font-body text-sm text-foreground/75 mt-1.5 leading-relaxed">{body}</p>
        </div>
      </article>
    ))}
  </div>
);

const Solutions = () => (
  <LandingLayout>
    <PageHero
      eyebrow="Solutions"
      title={<>Everything you need to navigate. <span className="highlight-mark italic">Nothing you don't.</span></>}
      intro="Not a course marketplace. Not a job portal. Not a collection of tools you have to figure out. A structured navigation system — with two interconnected paths — that moves you from wherever you are to wherever you're ready to go."
    />

    <Section eyebrow="Choose your journey" title="Or explore both.">
      <div className="grid md:grid-cols-3 gap-5">
        {[
          ["Career & Jobs", "For students finding direction, professionals navigating misalignment, and anyone making a career transition with real information."],
          ["Entrepreneurship & Building", "For aspiring founders, freelancers, and first-time builders who want to move from idea to launch with structure, not just motivation."],
          ["Both", "Many users navigate career growth and entrepreneurial exploration at the same time. MyRaaha is built to hold both paths without confusion."],
        ].map(([t, b]) => (
          <div key={t} className="rounded-2xl border border-border p-7 bg-secondary/40">
            <p className="font-display text-xl text-primary">{t}</p>
            <p className="font-body text-sm text-foreground/75 mt-2 leading-relaxed">{b}</p>
          </div>
        ))}
      </div>
    </Section>

    <Section eyebrow="The Career path" title="Six structured phases.">
      <PhaseList items={careerPhases} color="primary" />
    </Section>

    <Section variant="muted" eyebrow="The Entrepreneurship path" title="Seven structured phases.">
      <PhaseList items={entPhases} color="secondary" />
    </Section>

    <Section eyebrow="How to begin" title="Five steps.">
      <ol className="space-y-4 max-w-3xl">
        {[
          ["Choose your path", "Career, Entrepreneurship, or Both. Not a permanent commitment."],
          ["Complete your initial exploration", "A few questions. The more you engage, the more accurately the system understands you."],
          ["Receive your personalized starting point", "The system surfaces the most relevant modules for where you are right now."],
          ["Progress at your pace", "No deadlines. No forced sequences. The next step appears when you're ready."],
          ["Move toward outcomes", "Jobs. Internships. Validated ideas. Funded ventures. Real-world results."],
        ].map(([t, b], i) => (
          <li key={t} className="rounded-2xl border border-border p-5 flex gap-4 items-start">
            <span className="font-display text-2xl text-accent-foreground bg-accent rounded-full w-11 h-11 flex items-center justify-center shrink-0">{i + 1}</span>
            <div>
              <p className="font-display text-lg text-primary">{t}</p>
              <p className="font-body text-sm text-foreground/75 mt-1">{b}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="font-body text-sm text-grey-label italic mt-8 max-w-2xl">
        Available as a Progressive Web App — accessible on mobile and desktop, designed for connectivity conditions across India including Tier 3, Tier 4, and rural areas.
      </p>
    </Section>

    <CTABand title="Begin Exploring →" primaryLabel="Start your journey" primaryTo="/begin" />
  </LandingLayout>
);

export default Solutions;
