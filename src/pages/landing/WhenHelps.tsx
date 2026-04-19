import LandingLayout from "@/components/landing/shared/LandingLayout";
import PageHero from "@/components/landing/shared/PageHero";
import Section from "@/components/landing/shared/Section";
import CTABand from "@/components/landing/shared/CTABand";

const fits = [
  { tag: "If you're still studying", h: "And the question of what comes next is louder than you expected.", b: "You thought you'd have it figured out by now. You consume a lot of information. You take tests. Nothing sticks. Nothing feels like you. MyRaaha is built for this moment — not to decide for you, but to help you understand yourself well enough to decide well." },
  { tag: "If you're already working", h: "And something has started to feel misaligned.", b: "Three years in. Maybe five. The job isn't terrible. But there's a quiet, persistent feeling this isn't quite it. We help you distinguish temporary dissatisfaction from genuine misalignment — and model what a transition would actually cost." },
  { tag: "If you want to build", h: "But you're not sure where to start, or whether you're ready.", b: "You have an idea. Or several. Or the feeling of an idea without the idea itself. MyRaaha helps you move from the feeling of wanting to build — to the structured, validated, grounded process of actually building." },
  { tag: "If you're thinking about a complete change", h: "And it feels both necessary and terrifying.", b: "You have responsibilities. Financial realities. A professional identity tied to what you've been doing. We model transitions with honest data and map the skill gap — making the change feel structured rather than desperate." },
];

const notFits = [
  ["You already have complete clarity.", "If you know exactly what you want and simply need a job board or course marketplace, go directly to what you need."],
  ["You're looking for quick answers.", "MyRaaha works over time, through accumulated understanding. If you need an answer in 48 hours, this isn't that."],
  ["You're in acute crisis.", "If you're experiencing a mental health emergency or severe distress, please seek that kind of support first. MyRaaha is not a crisis service."],
  ["You want someone to decide for you.", "We help you understand yourself well enough to make better decisions. We will never make the decisions for you."],
];

const WhenHelps = () => (
  <LandingLayout>
    <PageHero
      eyebrow="When MyRaaha Helps Most"
      title={<>This page is about <span className="highlight-mark italic">honest self-recognition.</span></>}
      intro="MyRaaha works best for specific people at specific moments. Not everyone. Not every situation. Read through what follows. If something lands, you'll know."
    />

    <Section>
      <div className="space-y-6">
        {fits.map((f) => (
          <article key={f.tag} className="rounded-2xl border border-border p-7 sm:p-9 grid lg:grid-cols-12 gap-6">
            <div className="lg:col-span-3">
              <p className="pill-chip">{f.tag}</p>
            </div>
            <div className="lg:col-span-9">
              <h3 className="font-display text-2xl sm:text-3xl text-primary leading-snug">{f.h}</h3>
              <p className="font-body text-base text-foreground/80 mt-3 leading-relaxed">{f.b}</p>
            </div>
          </article>
        ))}
      </div>
    </Section>

    <Section variant="muted" eyebrow="And when it isn't for you" title="We said we'd be honest. Here it is.">
      <div className="grid sm:grid-cols-2 gap-5">
        {notFits.map(([t, b]) => (
          <div key={t} className="rounded-2xl bg-background border border-border p-6">
            <p className="font-display text-lg text-primary">{t}</p>
            <p className="font-body text-sm text-foreground/75 mt-2 leading-relaxed">{b}</p>
          </div>
        ))}
      </div>
      <p className="font-display text-2xl text-primary mt-10 italic">
        Knowing what you're not is part of <span className="highlight-mark">knowing what you are.</span>
      </p>
    </Section>

    <CTABand title="Ready to understand what we stand for — and what we refuse to do?" primaryLabel="Our Principles" primaryTo="/principles" />
  </LandingLayout>
);

export default WhenHelps;
