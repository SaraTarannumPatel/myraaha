import LandingLayout from "@/components/landing/shared/LandingLayout";
import PageHero from "@/components/landing/shared/PageHero";
import Section from "@/components/landing/shared/Section";
import { ArrowRight } from "lucide-react";

const articles = [
  ["Why career confusion is an infrastructure problem — not a personal failure", "Career Navigation", "8 min", "Every year, millions blame themselves for not knowing what they want. But the system was never designed to help them figure it out."],
  ["The problem with deciding too early", "Decision-Making", "6 min", "There's a cost to premature commitment that no one talks about. It accumulates quietly, in the form of misalignment discovered too late."],
  ["What Raaha and Marg mean — and why the sequence matters", "Philosophy", "7 min", "Most guidance systems collapse into either pure empathy or pure structure. Both fail in predictable ways."],
  ["Why we built MyRaaha for Tier 3 India first", "Mission", "5 min", "The career guidance crisis is everywhere. But it is most acute — and most invisible — in the places with the least access."],
  ["Information is not direction — why having more data doesn't produce clarity", "Career Navigation", "6 min", "We have more career information available to us than any generation before. And yet career confusion is at an all-time high."],
  ["The bicycle analogy for career guidance — and why it explains everything", "Philosophy", "5 min", "You can read every book about riding a bicycle. What changes the outcome isn't information — it's the person holding the seat."],
  ["What it means to be a founder before you have a startup", "Entrepreneurship", "7 min", "Entrepreneurship isn't a role you step into — it's a way of seeing problems that develops over time."],
  ["On living resumes — why static CVs are structurally dishonest", "Career Tools", "6 min", "A PDF resume shows where you ended up. It says nothing about how you got there."],
];

const cases = [
  ["From 'I don't know what I want' to a first job in UX design — in 14 months.", "A 20-year-old commerce student found structure for her exploration."],
  ["A 31-year-old software engineer who suspected misalignment — and found it.", "How behavioral data revealed what reflection had been circling for years."],
  ["A founder who stopped treating motivation as evidence.", "Slowing down to build the foundation properly produced a stronger launch."],
  ["From a Tier 3 city — with no startup ecosystem — to a funded venture.", "Access to a system that didn't require local mentors or accelerators."],
];

const Writing = () => (
  <LandingLayout>
    <PageHero
      eyebrow="Writing & Reflections"
      title={<>Thinking, <span className="highlight-mark italic">carefully done.</span></>}
      intro="On careers, clarity, and the navigation of uncertainty. We write occasionally — when we have something worth saying."
    />

    <Section eyebrow="Essays" title="Articles.">
      <div className="grid md:grid-cols-2 gap-5">
        {articles.map(([title, cat, time, summary]) => (
          <article key={title} className="group rounded-2xl border border-border p-7 bg-background hover:border-primary transition-colors cursor-pointer">
            <div className="flex items-center gap-3 mb-4">
              <span className="pill-chip">{cat}</span>
              <span className="font-body text-xs text-grey-meta">Read time: {time}</span>
            </div>
            <h3 className="font-display text-xl text-primary leading-snug group-hover:underline">{title}</h3>
            <p className="font-body text-sm text-foreground/75 mt-3 leading-relaxed">{summary}</p>
            <span className="inline-flex items-center gap-2 mt-5 text-primary font-medium text-sm">Read essay <ArrowRight size={14} /></span>
          </article>
        ))}
      </div>
    </Section>

    <Section variant="muted" eyebrow="Case studies" title="Real journeys. Real outcomes.">
      <div className="grid sm:grid-cols-2 gap-5">
        {cases.map(([t, b]) => (
          <article key={t} className="rounded-2xl bg-background border border-border p-7">
            <p className="font-display text-lg text-primary leading-snug">{t}</p>
            <p className="font-body text-sm text-foreground/75 mt-3 leading-relaxed">{b}</p>
          </article>
        ))}
      </div>
      <p className="font-body text-xs text-grey-meta italic mt-6">Drawn from composite user experiences — patterns are real, identifying details are not.</p>
    </Section>

    <Section eyebrow="Events" title="Conversations worth having.">
      <div className="rounded-2xl border border-border p-7 max-w-2xl bg-secondary/40">
        <p className="font-body text-xs uppercase tracking-[0.2em] text-grey-label">Webinar</p>
        <p className="font-display text-2xl text-primary mt-2">Why confusion is the beginning — not the problem</p>
        <p className="font-body text-sm text-foreground/75 mt-3 leading-relaxed">
          A conversation about why career confusion is a structural issue, not a personal failure — and what a genuinely useful navigation system looks like.
        </p>
        <button className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary text-accent px-5 py-2.5 text-sm font-semibold">
          Register for the next session <ArrowRight size={14} />
        </button>
      </div>
    </Section>
  </LandingLayout>
);

export default Writing;
