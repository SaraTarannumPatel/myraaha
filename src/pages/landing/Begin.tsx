import { Link } from "react-router-dom";
import LandingLayout from "@/components/landing/shared/LandingLayout";
import PageHero from "@/components/landing/shared/PageHero";
import Section from "@/components/landing/shared/Section";
import { ArrowRight } from "lucide-react";

const paths = [
  { to: "/intro", title: "Career & Jobs", body: "You're exploring what to do, figuring out where you fit, building toward a career that aligns with who you are — or navigating a transition." },
  { to: "/intro", title: "Entrepreneurship & Building", body: "You're drawn to creating something — a startup, a venture, a freelance path. You want to build, and you want to build it right." },
  { to: "/intro", title: "Both — I'm not sure yet", body: "You're exploring the intersection. Or you genuinely haven't decided. That's a completely valid place to start. The system can hold both." },
];

const Begin = () => (
  <LandingLayout>
    <PageHero
      eyebrow="Begin Exploring"
      title={<>Begin when <span className="highlight-mark italic">you're ready.</span></>}
      intro="This is not a sign-up form. It's an entrance. You can step through it now, or come back when it feels right. Either is fine. The system will be here."
    />

    <Section eyebrow="Which part of your journey are you in?" title="Choose your path. You can change this anytime.">
      <div className="grid md:grid-cols-3 gap-5">
        {paths.map((p) => (
          <Link key={p.title} to={p.to} className="group rounded-2xl border border-border p-7 bg-background hover:border-primary hover:shadow-soft transition-all">
            <p className="font-display text-2xl text-primary group-hover:translate-x-1 transition-transform">{p.title}</p>
            <p className="font-body text-sm text-foreground/75 mt-3 leading-relaxed">{p.body}</p>
            <span className="inline-flex items-center gap-2 mt-6 text-primary font-medium text-sm">Continue <ArrowRight size={14} /></span>
          </Link>
        ))}
      </div>
      <p className="font-body text-xs text-grey-meta italic mt-6">Choosing here doesn't commit you to anything.</p>
    </Section>

    <Section variant="muted" title="Here's what beginning looks like.">
      <div className="grid sm:grid-cols-2 gap-6 max-w-3xl">
        <p className="font-body text-base text-foreground/80 leading-relaxed">
          Once you choose your path, the system will ask you a few questions — not to categorize you, but to understand where you are right now.
          Your answers shape your starting point. Your behavior shapes everything after that.
        </p>
        <p className="font-body text-base text-foreground/80 leading-relaxed">
          There are no wrong answers. There is no test to pass. There's just you, and a system that is genuinely interested in helping you understand
          yourself better.
        </p>
      </div>
    </Section>

    <Section eyebrow="Your journey is personal" title="It stays that way.">
      <p className="font-body text-base text-foreground/80 max-w-2xl leading-relaxed">
        The information you share with MyRaaha is used to make your experience better. Nothing else. You control what is shared, with whom, and when.
      </p>
      <Link to="/research" className="inline-flex items-center gap-2 text-primary font-medium text-sm mt-5 border-b border-primary pb-1">
        How we handle your data <ArrowRight size={14} />
      </Link>
    </Section>

    <section className="bg-primary text-accent">
      <div className="container mx-auto px-5 sm:px-8 py-20 sm:py-28 text-center">
        <p className="font-display text-3xl sm:text-4xl text-accent leading-tight max-w-2xl mx-auto">
          Starting doesn't mean deciding. It means you've given yourself <span className="italic">the beginning of clarity.</span>
        </p>
        <Link to="/intro" className="inline-flex items-center gap-2 rounded-full bg-accent text-primary px-8 py-4 text-base font-semibold mt-10 hover:opacity-90">
          Begin Exploring <ArrowRight size={18} />
        </Link>
        <p className="font-body text-sm text-accent/80 mt-4">Free to start. No pressure to continue.</p>
      </div>
    </section>
  </LandingLayout>
);

export default Begin;
