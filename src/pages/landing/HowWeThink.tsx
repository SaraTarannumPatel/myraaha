import LandingLayout from "@/components/landing/shared/LandingLayout";
import PageHero from "@/components/landing/shared/PageHero";
import Section from "@/components/landing/shared/Section";
import Quote from "@/components/landing/shared/Quote";
import CTABand from "@/components/landing/shared/CTABand";
import { Brain, Compass, MessageSquare } from "lucide-react";

const HowWeThink = () => (
  <LandingLayout>
    <PageHero
      eyebrow="How We Think"
      title={<>MyRaaha doesn't start with answers. <span className="highlight-mark italic">It starts with listening.</span></>}
      intro="Most career platforms give you a result. The test ends. The platform moves on. You're left with a label and no path. MyRaaha is built differently."
    />

    <Section title="Your confusion is not a weakness. It's information.">
      <p className="font-body text-base sm:text-lg text-foreground/80 max-w-3xl leading-relaxed">
        Hesitation is data. Confusion is a signal. Uncertainty is the beginning of self-knowledge, not the absence of it.
        The system doesn't rush you through these states — it pays attention to them.
      </p>
      <div className="grid sm:grid-cols-2 gap-4 mt-10 max-w-3xl">
        {["Where do you hesitate?", "What do you come back to?", "What do you drop without noticing?", "Where do you spend time without being asked?"].map((q) => (
          <div key={q} className="rounded-2xl border border-border p-5 bg-secondary/40">
            <p className="font-display text-lg text-primary leading-snug">{q}</p>
          </div>
        ))}
      </div>
    </Section>

    <Section variant="muted" eyebrow="The 3A Intelligence Engine" title="Three things the system tracks. Continuously.">
      <div className="grid md:grid-cols-3 gap-6">
        {[
          { icon: Brain, t: "Aptitude", b: "What you can do — not just what you've been taught, but what you demonstrate when given real problems, real choices, real constraints." },
          { icon: Compass, t: "Attitude", b: "How you respond to difficulty. Whether you persist or pause. Your genuine relationship with uncertainty — not positive thinking." },
          { icon: MessageSquare, t: "Articulation", b: "How clearly you express your own thinking. Can you distinguish between what you're told to want and what you actually want?" },
        ].map((d) => (
          <article key={d.t} className="rounded-2xl bg-background border border-border p-7">
            <d.icon size={26} className="text-primary mb-4" />
            <h3 className="font-display text-2xl text-primary">{d.t}</h3>
            <p className="font-body text-sm text-foreground/75 mt-3 leading-relaxed">{d.b}</p>
          </article>
        ))}
      </div>
    </Section>

    <Section eyebrow="Living Resume™" title={<>Not a document. <span className="highlight-mark italic">A record of becoming.</span></>}>
      <p className="font-body text-base text-foreground/80 max-w-3xl leading-relaxed">
        Traditional resumes are snapshots. MyRaaha builds a machine-readable journey graph that evolves with every interaction, every decision,
        every course completed, every pivot made. Not a PDF you update every two years — a living record that grows with you.
      </p>
    </Section>

    <Section variant="muted" eyebrow="Clarity before commitment" title="Understand before you decide.">
      <div className="grid sm:grid-cols-3 gap-4 max-w-3xl">
        {["Understand before you decide.", "Explore before you commit.", "Know yourself before you choose."].map((t) => (
          <div key={t} className="rounded-2xl border border-border p-6 bg-background">
            <p className="font-display text-lg text-primary leading-snug">{t}</p>
          </div>
        ))}
      </div>
      <Quote>The system stays one step ahead — not to push you, but to ensure you always have what you need when you need it.</Quote>
    </Section>

    <Section eyebrow="A clear line" title="What MyRaaha is not.">
      <ul className="grid sm:grid-cols-2 gap-3 max-w-3xl font-body text-base text-foreground/80">
        {["Not a chatbot.", "Not a content library.", "Not a motivational tool.", "Not a career counselor in app form.", "Not therapy.", "Not a job board."].map((i) => (
          <li key={i} className="rounded-xl border border-border px-5 py-3">— {i}</li>
        ))}
      </ul>
      <p className="font-display text-2xl text-primary mt-8 max-w-2xl leading-snug">
        It is a <span className="highlight-mark italic">navigation system.</span>
      </p>
    </Section>

    <CTABand title="See how the two philosophies work together." primaryLabel="Raaha × Marg" primaryTo="/raaha-marg" />
  </LandingLayout>
);

export default HowWeThink;
