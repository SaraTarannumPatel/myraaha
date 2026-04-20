import LandingLayout from "@/components/landing/shared/LandingLayout";
import PageHero from "@/components/landing/shared/PageHero";
import Section from "@/components/landing/shared/Section";
import { ArrowRight } from "lucide-react";
import heroCareers from "@/assets/landing/hero-careers.jpg";

const values = [
  ["The Problem", "Structural, not superficial. Career and entrepreneurship confusion affects hundreds of millions. The work here has stakes."],
  ["The Model", "Non-profit by intent. Revenue-first by design. We build durably, not virally."],
  ["The Approach", "We move deliberately. We think through decisions. We care about quality, not just speed."],
  ["The Access", "India-first — including Tier 3, Tier 4, and rural communities consistently underserved by existing systems."],
  ["The Stage", "We are early. The decisions you make here will be formative. The opportunity to shape something is real."],
];

const roles = [
  ["Product Designer — Navigation Experience", "Designing the core user journey — from onboarding through exploration through execution. Someone who thinks in systems, not screens."],
  ["Backend Engineer — Behavioral Intelligence", "Building the data layer that powers behavioral observation and personalization. Understands the difference between engagement optimization and genuine user benefit."],
  ["Content Strategist — Career & Entrepreneurship", "Creating the editorial, learning, and community content that makes MyRaaha useful beyond the algorithm."],
  ["Research Lead — User Journey & Impact", "Tracking the real-world outcomes of MyRaaha's guidance. Cares about what actually happens to users."],
];

const Careers = () => (
  <LandingLayout>
    <PageHero
      eyebrow="Careers at MyRaaha"
      title={<>We're building something <span className="highlight-mark italic">that matters.</span> We'd like to build it with you.</>}
      intro="MyRaaha is a small, serious team working on a problem that has been unsolved for too long. We don't move fast and break things. We think carefully and build durably."
    />

    <Section eyebrow="Why join" title="Five things to know.">
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
        {values.map(([t, b], i) => (
          <div key={t} className="rounded-2xl border border-border p-6">
            <p className="font-body text-xs uppercase tracking-[0.2em] text-grey-label">Value {String(i + 1).padStart(2, "0")}</p>
            <p className="font-display text-xl text-primary mt-2">{t}</p>
            <p className="font-body text-sm text-foreground/75 mt-2">{b}</p>
          </div>
        ))}
      </div>
    </Section>

    <Section variant="muted" eyebrow="Who we hire" title="Specific qualities we value.">
      <ul className="space-y-3 max-w-3xl">
        {[
          "You find the problem genuinely interesting, not just the solution.",
          "You're comfortable with ambiguity and can make good decisions with incomplete information.",
          "You communicate precisely — not verbosely, not carelessly.",
          "You care more about getting it right than about being right.",
          "You can hold both the human and the technical dimension at once.",
        ].map((q) => (
          <li key={q} className="rounded-xl bg-background border border-border px-5 py-3 font-body text-base text-foreground/80">— {q}</li>
        ))}
      </ul>
    </Section>

    <Section eyebrow="Open roles" title="Currently hiring for.">
      <div className="grid md:grid-cols-2 gap-5">
        {roles.map(([t, b]) => (
          <article key={t} className="rounded-2xl border border-border p-7 group hover:border-primary transition-colors cursor-pointer">
            <p className="font-display text-xl text-primary leading-snug">{t}</p>
            <p className="font-body text-sm text-foreground/75 mt-3 leading-relaxed">{b}</p>
            <span className="inline-flex items-center gap-2 mt-5 text-primary font-medium text-sm">Apply <ArrowRight size={14} /></span>
          </article>
        ))}
      </div>
      <p className="font-body text-sm text-grey-label italic mt-8 max-w-2xl">
        We're a small team. We hire slowly and intentionally. If you don't see a role that fits — but you believe in what we're building — reach out anyway.
      </p>
    </Section>

    <Section variant="muted" title="Apply.">
      <form className="grid sm:grid-cols-2 gap-4 max-w-2xl">
        {[
          ["name", "Full name", "text"],
          ["email", "Email address", "email"],
          ["role", "Role you're applying for", "text"],
          ["location", "Location", "text"],
        ].map(([id, label, type]) => (
          <label key={id} className="block">
            <span className="font-body text-xs text-grey-label">{label}</span>
            <input type={type} className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-body focus:outline-none focus:border-primary" />
          </label>
        ))}
        <label className="block sm:col-span-2">
          <span className="font-body text-xs text-grey-label">What draws you to this work? (250 words max)</span>
          <textarea rows={5} className="mt-1.5 w-full rounded-xl border border-border bg-background px-4 py-3 text-sm font-body focus:outline-none focus:border-primary" />
        </label>
        <button type="submit" className="sm:col-span-2 justify-self-start rounded-full bg-primary text-accent px-6 py-3 text-sm font-semibold">
          Send my application
        </button>
        <p className="sm:col-span-2 font-body text-xs text-grey-meta italic">
          We read every application carefully. We respond to everyone, even if we're not moving forward. Your time matters to us.
        </p>
      </form>
    </Section>
  </LandingLayout>
);

export default Careers;
