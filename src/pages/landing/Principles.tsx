import LandingLayout from "@/components/landing/shared/LandingLayout";
import PageHero from "@/components/landing/shared/PageHero";
import Section from "@/components/landing/shared/Section";
import CTABand from "@/components/landing/shared/CTABand";
import { Check, X } from "lucide-react";

const commitments = [
  ["We will always treat you as a participant, not a beneficiary.", "You are someone who is navigating — and we are the system that makes that navigation better."],
  ["We will always deliver clarity before commitment.", "We will not push you toward a decision before you have the self-knowledge to make it well."],
  ["We will always show you trade-offs.", "Every path has costs. We will never present an option without making its real requirements visible."],
  ["We will always respect your pace.", "Your journey is not on our timeline. The system adapts to where you are."],
  ["We will always protect your data as yours.", "Used to improve your experience. Never sold, never used against you, never shared without your consent."],
  ["We will always be honest about what we are.", "When you need something we cannot provide, we will tell you that clearly."],
];

const refusals = [
  ["We will never create urgency where there is none.", "No countdown timers. No 'limited spots.' No artificial pressure."],
  ["We will never rank you against other people.", "Your journey is not a competition. Growth is measured against your own potential."],
  ["We will never promise outcomes we cannot guarantee.", "We can dramatically improve the quality of your navigation. We cannot control every variable in the world."],
  ["We will never use charity framing.", "You are not a person in need of saving. You are a person in the process of navigating."],
  ["We will never use emotional manipulation.", "We will not exploit anxiety to drive engagement. We will not manufacture fear."],
  ["We will never give generic advice.", "Every recommendation is grounded in your specific behavioral data, not templates."],
  ["We will never treat confusion as a problem to be solved quickly.", "Confusion is data. It deserves time and attention."],
  ["We will never stop at advice.", "Advice without execution support is incomplete guidance. MyRaaha stays with you through action."],
];

const Principles = () => (
  <LandingLayout>
    <PageHero
      eyebrow="Our Principles & Boundaries"
      title={<>Before trust, there must be <span className="highlight-mark italic">transparency.</span></>}
      intro="Most platforms tell you what they offer. We want to tell you something harder to say: what we refuse to do. Trust isn't built through promises — it's built through demonstrated restraint."
    />

    <Section eyebrow="Our commitments" title="What you can always count on us to do.">
      <div className="grid md:grid-cols-2 gap-5">
        {commitments.map(([t, b]) => (
          <div key={t} className="rounded-2xl border border-border p-6 flex gap-4">
            <span className="shrink-0 mt-1 h-9 w-9 rounded-full bg-accent text-primary flex items-center justify-center"><Check size={16} /></span>
            <div>
              <p className="font-display text-lg text-primary leading-snug">{t}</p>
              <p className="font-body text-sm text-foreground/75 mt-2">{b}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>

    <Section variant="muted" eyebrow="Our refusals" title="What we will never optimize for.">
      <div className="grid md:grid-cols-2 gap-5">
        {refusals.map(([t, b]) => (
          <div key={t} className="rounded-2xl bg-background border border-border p-6 flex gap-4">
            <span className="shrink-0 mt-1 h-9 w-9 rounded-full bg-primary text-accent flex items-center justify-center"><X size={16} /></span>
            <div>
              <p className="font-display text-lg text-primary leading-snug">{t}</p>
              <p className="font-body text-sm text-foreground/75 mt-2">{b}</p>
            </div>
          </div>
        ))}
      </div>
    </Section>

    <Section eyebrow="Accountability without coercion" title="There is a meaningful difference.">
      <div className="grid md:grid-cols-2 gap-6 max-w-4xl">
        <div className="rounded-2xl bg-secondary/40 border border-border p-7">
          <p className="font-display text-xl text-primary">Accountability respects your agency.</p>
          <p className="font-body text-sm text-foreground/75 mt-3">It tracks your progress, surfaces your commitments, and asks honest questions when you've been inactive. It believes in your capacity to move.</p>
        </div>
        <div className="rounded-2xl bg-primary text-accent p-7">
          <p className="font-display text-xl text-accent">Pressure overrides your agency.</p>
          <p className="font-body text-sm text-accent/85 mt-3">It creates consequences for not moving fast enough. It replaces your judgment with its own.</p>
        </div>
      </div>
      <p className="font-display text-2xl text-primary mt-10 max-w-xl leading-snug">
        MyRaaha is accountable. <span className="highlight-mark italic">It is never coercive.</span>
      </p>
    </Section>

    <CTABand title="Want to see the technology and thinking underneath the principles?" primaryLabel="Research, Systems & Ethics" primaryTo="/research" />
  </LandingLayout>
);

export default Principles;
