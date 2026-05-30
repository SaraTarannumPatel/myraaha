import LandingLayout from "@/components/landing/shared/LandingLayout";
import PageHero from "@/components/landing/shared/PageHero";
import Section from "@/components/landing/shared/Section";
import Quote from "@/components/landing/shared/Quote";
import CTABand from "@/components/landing/shared/CTABand";

const WhyWeExist = () => (
  <LandingLayout>
    <PageHero
      eyebrow="Why We Exist"
      title={<>This isn't a problem of <span className="highlight-mark italic">motivation.</span></>}
      intro="Every year, millions of people — students, professionals, aspiring founders — make career decisions without the information, self-knowledge, or structure to make them well."
    />

    <Section title={<>The system is <span className="italic">fragmented.</span> By design, not by accident.</>}>
      <div className="grid lg:grid-cols-2 gap-10 max-w-5xl">
        <p className="font-body text-base text-foreground/80 leading-relaxed">
          Career guidance, as it exists today, was built for a simpler world. A world where careers were linear. Where industries were stable.
          Where the options were few enough that a one-hour counseling session could reasonably cover them.
        </p>
        <p className="font-body text-base text-foreground/80 leading-relaxed">
          That world is gone. What replaced it is a sprawling, noisy ecosystem of disconnected tools — aptitude tests on one platform, courses
          on another, mentors on Instagram, job portals disconnected from skill-building, startup advice scattered across blogs.
        </p>
      </div>
      <Quote>You are expected to connect all of this yourself. And when it doesn't work — you start over.</Quote>
      <p className="font-display text-2xl text-grey-label">
        This is the real problem. Not talent. Not effort. <span className="text-primary">Infrastructure.</span>
      </p>
    </Section>

    <Section variant="muted" eyebrow="Where the silence is loudest" title="In places no one looks.">
      <div className="grid lg:grid-cols-2 gap-10">
        <p className="font-body text-base text-foreground/80 leading-relaxed">
          In Tier 1 and Tier 2 cities, people have begun to name this problem. There are conferences about it. Startups trying to solve parts of it.
          But in <strong className="text-primary">Tier 3, Tier 4, and rural India</strong> — the silence is different.
        </p>
        <p className="font-body text-base text-foreground/80 leading-relaxed">
          Students there don't just lack guidance. They lack the awareness that guidance is something they deserve. No one asked them what
          they wanted to become. No one showed them what was possible. They were told what to do — not guided toward what they would love to do.
        </p>
      </div>
      <p className="font-display text-2xl text-primary mt-10 max-w-2xl leading-snug">
        The result isn't just career confusion. It's a generation of potential that never gets the chance to{" "}
        <span className="highlight-mark italic">understand itself.</span>
      </p>
    </Section>

    <Section eyebrow="The cost of rushing" title={<>Decisions made too early <span className="highlight-mark italic">cost more later.</span></>}>
      <div className="grid sm:grid-cols-2 gap-6 max-w-3xl">
        {[
          ["They choose based on proximity, not alignment.", "01"],
          ["They discover the mismatch years later.", "02"],
          ["They restart — losing time, money, and confidence.", "03"],
          ["And the system calls this a personal failure. It isn't.", "04"],
        ].map(([t, n]) => (
          <div key={n} className="rounded-2xl border border-border p-6">
            <span className="font-display text-3xl text-accent-foreground bg-accent rounded-full w-12 h-12 flex items-center justify-center">{n}</span>
            <p className="font-body text-base text-foreground/80 mt-4 leading-relaxed">{t}</p>
          </div>
        ))}
      </div>
    </Section>

    <Section variant="muted" eyebrow="A generation is ready" title="They don't need more motivation. They need better navigation.">
      <p className="font-body text-base text-foreground/80 max-w-3xl leading-relaxed">
        The people navigating career decisions today are different from those who came before. They are thoughtful. Reflective. Skeptical of hype.
        They want to understand their choices, not just make them. They save articles, journal their uncertainty, hesitate before committing.
        And they've been waiting long enough.
      </p>
      <Quote>This is why we exist. To build the system that should have existed all along.</Quote>
    </Section>

    <CTABand title="Ready to understand how it works?" primaryLabel="How MyRaaha Thinks" primaryTo="/how" secondaryLabel="See Raaha × Marg" secondaryTo="/raaha-marg" />
  </LandingLayout>
);

export default WhyWeExist;
