import LandingLayout from "@/components/landing/shared/LandingLayout";
import PageHero from "@/components/landing/shared/PageHero";
import Section from "@/components/landing/shared/Section";
import Quote from "@/components/landing/shared/Quote";
import CTABand from "@/components/landing/shared/CTABand";
import raahaMarg from "@/assets/landing/raaha-marg.jpg";

const RaahaMarg = () => (
  <LandingLayout>
    <PageHero
      eyebrow="Raaha × Marg"
      title={<>Two principles. <span className="highlight-mark italic">One system.</span></>}
      intro="Most guidance systems collapse into one of two failures — too soft (all empathy, no structure) or too rigid (all structure, no empathy). MyRaaha holds both."
    />

    <Section>
      <img src={raahaMarg} alt="A hand cradling a glowing seed (Raaha) beside a staircase rising into light (Marg)" className="w-full max-w-5xl mx-auto rounded-3xl" loading="lazy" width={1600} height={900} />
    </Section>

    <Section eyebrow="Raaha — रास्ता" title={<>The hand that <span className="highlight-mark italic">steadies you.</span></>}>
      <div className="grid lg:grid-cols-2 gap-10">
        <p className="font-body text-base text-foreground/80 leading-relaxed">
          Raaha represents the pre-decision phase — the time and structure given to genuine exploration, honest reflection, and unhurried
          self-understanding before any commitment is made.
        </p>
        <ul className="space-y-3">
          {["Confusion is a legitimate starting point", "Uncertainty deserves patience, not pressure", "Self-knowledge cannot be rushed", "The quality of a decision depends on the quality of understanding that precedes it"].map((b) => (
            <li key={b} className="rounded-xl border border-border px-5 py-3 font-body text-sm text-foreground/80 bg-secondary/40">— {b}</li>
          ))}
        </ul>
      </div>
    </Section>

    <Section variant="muted" eyebrow="Marg — मार्ग" title={<>The spine that <span className="highlight-mark italic">keeps you moving.</span></>}>
      <div className="grid lg:grid-cols-2 gap-10">
        <p className="font-body text-base text-foreground/80 leading-relaxed">
          Marg represents the post-clarity phase — the organized, accountable, data-backed execution that follows genuine understanding.
          Skill roadmaps. Market-linked pathways. Structured transitions. Measurable progress.
        </p>
        <ul className="space-y-3">
          {["Empathy without structure is drift", "Readiness changes what guidance looks like", "Clarity must eventually convert to direction", "Direction must eventually convert to action"].map((b) => (
            <li key={b} className="rounded-xl border border-border px-5 py-3 font-body text-sm text-foreground/80 bg-background">— {b}</li>
          ))}
        </ul>
      </div>
    </Section>

    <Section eyebrow="The moment between them" title={<>Readiness is not a date. It's a <span className="highlight-mark italic">condition.</span></>}>
      <p className="font-body text-base text-foreground/80 max-w-3xl leading-relaxed">
        The most important moment in MyRaaha is not the beginning or the end — it is the transition from Raaha to Marg.
        The moment when the system recognizes you have enough self-knowledge to begin moving with intention. This transition is not forced. It is earned.
      </p>
      <Quote>Empathy without structure creates drift. Structure without empathy creates damage.</Quote>
    </Section>

    <Section variant="muted" title="What this looks like in practice.">
      <div className="grid md:grid-cols-2 gap-6">
        {[
          { tag: "Career", raaha: ["Curiosity-led exploration of domains", "Honest assessment of energy vs drain", "Pattern recognition across choices", "Self-understanding stable enough to inform decisions"], marg: ["A skills roadmap aligned to market demand", "Structured progression through learning", "AI-guided transition planning", "Interview readiness, portfolio, job matching"] },
          { tag: "Entrepreneurship", raaha: ["Problem exploration without pressure", "Mindset development before business model", "Honest founder readiness assessment", "Space to explore multiple ideas"], marg: ["Problem validation sprints", "MVP development with structured frameworks", "Market signal & competitive analysis", "Funding readiness scoring"] },
        ].map((p) => (
          <article key={p.tag} className="rounded-2xl bg-background border border-border p-7">
            <p className="font-body text-xs uppercase tracking-[0.22em] text-primary font-semibold">{p.tag}</p>
            <div className="mt-5">
              <p className="font-display text-lg text-primary">Raaha looks like</p>
              <ul className="mt-2 space-y-1.5 font-body text-sm text-foreground/75">{p.raaha.map((i) => <li key={i}>· {i}</li>)}</ul>
            </div>
            <div className="mt-5 pt-5 border-t border-border/60">
              <p className="font-display text-lg text-primary">Marg looks like</p>
              <ul className="mt-2 space-y-1.5 font-body text-sm text-foreground/75">{p.marg.map((i) => <li key={i}>· {i}</li>)}</ul>
            </div>
          </article>
        ))}
      </div>
      <p className="font-display text-xl text-grey-label mt-10 italic max-w-2xl">
        You don't quit your job based on motivation. <span className="text-primary">You move based on readiness.</span>
      </p>
    </Section>

    <CTABand title="Ready to feel what this is actually like?" primaryLabel="The Experience" primaryTo="/experience" secondaryLabel="When MyRaaha Helps" secondaryTo="/when" />
  </LandingLayout>
);

export default RaahaMarg;
