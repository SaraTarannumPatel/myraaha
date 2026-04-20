import LandingLayout from "@/components/landing/shared/LandingLayout";
import PageHero from "@/components/landing/shared/PageHero";
import Section from "@/components/landing/shared/Section";
import CTABand from "@/components/landing/shared/CTABand";
import Quote from "@/components/landing/shared/Quote";
import heroResearch from "@/assets/landing/hero-research.jpg";

const Research = () => (
  <LandingLayout>
    <PageHero
      eyebrow="Research, Systems & Ethics"
      title={<>There is real thinking <span className="highlight-mark italic">underneath this.</span></>}
      intro="MyRaaha is not a chatbot with a career-focused prompt. Not a personality quiz with better branding. Not an LLM wrapper. What sits underneath is domain-specific behavioral intelligence — built for career and entrepreneurship guidance, and only that."
      illustration={heroResearch}
      illustrationAlt="A research desk with floating data visualizations and behavioral pattern nodes"
    />

    <Section eyebrow="Behavioral data, not generic LLMs" title="The intelligence is built on what you do — not what you describe.">
      <div className="grid lg:grid-cols-2 gap-10">
        <p className="font-body text-base text-foreground/80 leading-relaxed">
          Most AI-powered career tools today are built on general-purpose language models. They respond to what you ask — they don't track
          what you do over time. MyRaaha is different in a fundamental way.
        </p>
        <ul className="space-y-2.5 font-body text-sm text-foreground/80">
          {["What you click.", "What you complete.", "What you abandon.", "How long you stay.", "What you return to.", "How your patterns change over time."].map((i) => (
            <li key={i} className="rounded-xl border border-border px-5 py-3 bg-secondary/40">— {i}</li>
          ))}
        </ul>
      </div>
    </Section>

    <Section variant="muted" eyebrow="The SelfGraph" title={<>A living mirror of <span className="highlight-mark italic">professional identity.</span></>}>
      <p className="font-body text-base text-foreground/80 max-w-3xl leading-relaxed">
        Unlike a personality profile that freezes you in a single moment, the SelfGraph evolves. It is not shown as a report — it is woven into every recommendation.
      </p>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
        {[
          ["Strengths", "Emerging skills and growing capabilities."],
          ["Energy zones", "What activates engagement vs what drains it."],
          ["Decision alignment", "Are your choices moving toward your stated values?"],
          ["Confidence patterns", "Where you move freely vs where you hesitate."],
          ["Weekly evolution", "How your professional identity is changing."],
          ["Reasoning trail", "Transparent logic for every recommendation."],
        ].map(([t, b]) => (
          <div key={t} className="rounded-2xl bg-background border border-border p-6">
            <p className="font-display text-lg text-primary">{t}</p>
            <p className="font-body text-sm text-foreground/75 mt-2">{b}</p>
          </div>
        ))}
      </div>
    </Section>

    <Section eyebrow="Automation × Human" title="Automation serves humans. Not the other way around.">
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
        <div className="rounded-2xl border border-border p-7">
          <p className="font-display text-xl text-primary">Automation does</p>
          <ul className="mt-3 space-y-2 font-body text-sm text-foreground/75">
            <li>· Process behavioral patterns at scale</li>
            <li>· Match skills to real-time market demand</li>
            <li>· Surface relevant resources at the right moment</li>
            <li>· Track progress without manual input</li>
          </ul>
        </div>
        <div className="rounded-2xl bg-secondary/40 border border-border p-7">
          <p className="font-display text-xl text-primary">Human judgment does</p>
          <ul className="mt-3 space-y-2 font-body text-sm text-foreground/75">
            <li>· Provide nuanced guidance in emotionally complex moments</li>
            <li>· Escalate when signals suggest more is needed</li>
            <li>· Make qualitative distinctions data alone can't make</li>
          </ul>
        </div>
      </div>
    </Section>

    <Section variant="muted" eyebrow="Data ethics" title="Your data is yours. Completely.">
      <div className="grid md:grid-cols-2 gap-6">
        <div className="rounded-2xl bg-background border border-border p-6">
          <p className="font-display text-lg text-primary">We use it to</p>
          <p className="font-body text-sm text-foreground/75 mt-2">Improve your experience. Improve the system's accuracy. With your consent, allow human mentors to provide better guidance.</p>
        </div>
        <div className="rounded-2xl bg-background border border-border p-6">
          <p className="font-display text-lg text-primary">We will never</p>
          <p className="font-body text-sm text-foreground/75 mt-2">Sell it. Share it with third parties without consent. Use it in ways you haven't agreed to. Keep it after you've asked us to remove it.</p>
        </div>
      </div>
      <Quote>Your journey is yours. The data that records it should be too.</Quote>
    </Section>

    <Section eyebrow="What we measure" title="Outcomes, not engagement.">
      <div className="grid sm:grid-cols-3 gap-5 max-w-4xl">
        {[
          ["Career Outcomes", "Jobs, internships, role relevance, time to first opportunity."],
          ["Entrepreneurship Outcomes", "Validated ideas, MVPs launched, revenue, funding secured."],
          ["Journey Health", "Are people progressing without unnecessary resets?"],
        ].map(([t, b]) => (
          <div key={t} className="rounded-2xl border border-border p-6">
            <p className="font-display text-lg text-primary">{t}</p>
            <p className="font-body text-sm text-foreground/75 mt-2">{b}</p>
          </div>
        ))}
      </div>
    </Section>

    <CTABand title="Ready to begin?" primaryLabel="Begin Exploring" primaryTo="/begin" />
  </LandingLayout>
);

export default Research;
