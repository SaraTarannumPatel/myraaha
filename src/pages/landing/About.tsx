import LandingLayout from "@/components/landing/shared/LandingLayout";
import PageHero from "@/components/landing/shared/PageHero";
import Section from "@/components/landing/shared/Section";
import Quote from "@/components/landing/shared/Quote";
import CTABand from "@/components/landing/shared/CTABand";
import heroAbout from "@/assets/landing/hero-about.jpg";

const About = () => (
  <LandingLayout>
    <PageHero
      eyebrow="About Us"
      title={<>MyRaaha is not a career app. It is a <span className="highlight-mark italic">navigation infrastructure.</span></>}
      intro="A technology-first, emotionally intelligent system that delivers personalized, continuous career and entrepreneurship guidance — through automation, behavioral data, and human judgment working together."
      illustration={heroAbout}
      illustrationAlt="A hand cradling a glowing seedling growing from soil that holds the MyRaaha name"
    />

    <Section eyebrow="The name" title={<>MyRaaha — <span className="italic">my journey, at my pace.</span></>}>
      <div className="grid lg:grid-cols-2 gap-10 max-w-5xl">
        <p className="font-body text-base text-foreground/80 leading-relaxed">
          <strong className="text-primary">Raah (राह)</strong> means way. Path. Passage. Journey. It implies flow — not a fixed destination, but movement through time
          with intention. Softer than a road. More personal than a route.
        </p>
        <p className="font-body text-base text-foreground/80 leading-relaxed">
          <strong className="text-primary">MyRaaha</strong> means: my journey. Consciously chosen. Lived at my own pace. The name carries the whole philosophy.
        </p>
      </div>
      <Quote>You don't need a map for life. You need awareness, patience, and trust in your path.</Quote>
    </Section>

    <Section variant="muted" eyebrow="Two verticals. One continuous system." title="We own the full journey.">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-background border border-border p-7">
          <p className="font-display text-2xl text-primary">Career Navigation</p>
          <p className="font-body text-sm text-foreground/75 mt-3 leading-relaxed">
            From early exploration through school and college, to career commitment, to transitions and pivots. The system tracks your evolution,
            narrows your options responsibly, and supports execution.
          </p>
        </div>
        <div className="rounded-2xl bg-background border border-border p-7">
          <p className="font-display text-2xl text-primary">Entrepreneurship & Freelancing</p>
          <p className="font-body text-sm text-foreground/75 mt-3 leading-relaxed">
            From the first spark of curiosity, through problem validation, MVP development, launch, and funding readiness. Build with structure — not just motivation.
          </p>
        </div>
      </div>
    </Section>

    <Section eyebrow="Five beliefs we build by" title="The foundation.">
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {[
          ["Every path is unique.", "There is no universal roadmap. We serve your specific journey, not an average."],
          ["Growth is non-linear.", "Careers curve, backtrack, accelerate, pause. We map this — we don't punish it."],
          ["Pace matters as much as progress.", "Moving quickly in the wrong direction is not progress."],
          ["Reflection precedes direction.", "Every recommendation is built on a foundation of self-understanding."],
          ["Gentle guidance is more sustainable than force.", "Strong enough to move you, gentle enough to respect your agency."],
        ].map(([t, b]) => (
          <div key={t} className="rounded-2xl border border-border p-6">
            <p className="font-display text-lg text-primary">{t}</p>
            <p className="font-body text-sm text-foreground/75 mt-2 leading-relaxed">{b}</p>
          </div>
        ))}
      </div>
    </Section>

    <Section variant="muted" eyebrow="Our voice" title="We are not a hype machine.">
      <p className="font-body text-base text-foreground/80 max-w-3xl leading-relaxed">
        MyRaaha speaks the way a trusted person speaks. Not a motivational speaker. Not a clinical advisor. Not a cheerleader.
        A thoughtful, grounded presence that names what you're feeling without dramatizing it, makes your thinking visible without overwhelming it,
        and moves you forward without pushing you.
      </p>
      <p className="font-display text-xl text-primary mt-8 italic">We are warm. Reflective. Calmly confident.</p>
    </Section>

    <Section eyebrow="Our vision" title={<>A world where no one feels lost at 22, stuck at 30, or <span className="highlight-mark italic">irrelevant at 40.</span></>}>
      <p className="font-body text-base text-foreground/80 max-w-3xl leading-relaxed">
        MyRaaha envisions a world where career confusion is a temporary state — not a permanent condition. Where the tools for navigating
        life decisions are as accessible in a Tier 4 town as they are in a metro.
      </p>
      <Quote>Not to make careers faster. To make lives better.</Quote>
    </Section>

    <CTABand title="Ready to step into your own path?" primaryLabel="Begin Exploring" primaryTo="/begin" />
  </LandingLayout>
);

export default About;
