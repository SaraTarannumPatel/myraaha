import LandingLayout from "@/components/landing/shared/LandingLayout";
import Section from "@/components/landing/shared/Section";
import Quote from "@/components/landing/shared/Quote";
import CTABand from "@/components/landing/shared/CTABand";
import { motion } from "framer-motion";
import appFrame from "@/assets/landing/app-frame.jpg";
import heroExperience from "@/assets/landing/hero-experience.jpg";

const phases = [
  ["It begins quietly.", "Your first experience isn't an overwhelming dashboard. Not a list of tasks. Not a form that makes you summarize your career in three fields. It begins with a few simple questions — not about what you want to do, but about who you are right now."],
  ["You start to notice things about yourself.", "The system surfaces patterns. Not conclusions — patterns. What you've consistently been drawn to. What you've consistently avoided. Where engagement spikes and where it drops. And it asks you what you make of that."],
  ["It doesn't announce itself. It accumulates.", "Clarity in MyRaaha doesn't arrive as a dramatic revelation. It arrives the way understanding always arrives — gradually. One day you realize what felt like confusion has quietly become direction."],
  ["And then the path becomes visible.", "Once you have clarity, MyRaaha shifts. Not prescribed — structured. You're shown what doing would look like, with real information about skills, market, timeline, and trade-offs. You make the decision."],
  ["If you're thinking about building something.", "The entrepreneurship experience begins with a question most startup tools skip: are you actually ready to build? Not motivated — ready. By the time you're building an MVP, you're not building on motivation. You're building on readiness."],
  ["It grows with you. Without making you start over.", "Most tools reset. MyRaaha remembers. Every decision. Every path explored. Every skill built. So when you return — six months later, two years later — you don't start over. You continue."],
];

const Experience = () => (
  <LandingLayout>
    <section className="relative overflow-hidden bg-background">
      <div className="absolute -top-24 right-0 w-[28rem] h-[28rem] rounded-full bg-accent/40 blur-3xl pointer-events-none" />
      <div className="container mx-auto px-5 sm:px-8 pt-16 sm:pt-24 pb-12 sm:pb-16 relative">
        <div className="grid lg:grid-cols-12 gap-10 items-center">
          <div className="lg:col-span-7">
            <p className="font-body text-xs uppercase tracking-[0.28em] text-grey-label mb-5">The Experience</p>
            <h1 className="font-display text-[2.4rem] sm:text-5xl md:text-6xl text-primary leading-[1.05] tracking-tight">
              This is not a product tour. It's what it <span className="highlight-mark italic">feels like.</span>
            </h1>
            <p className="font-body text-base sm:text-lg text-foreground/75 mt-6 leading-relaxed max-w-xl">
              We're not going to walk you through screens or list features. What we want to describe is something harder to capture —
              what it actually feels like to use a system built for your journey, not against it.
            </p>
          </div>
          <div className="lg:col-span-5">
            <motion.img
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              src={heroExperience}
              alt="A hand holding a glowing phone showing a winding map with a compass and sapling"
              className="w-full max-w-sm mx-auto rounded-3xl"
              loading="lazy"
              width={1024}
              height={1024}
            />
          </div>
        </div>
      </div>
    </section>

    <Section>
      <div className="grid lg:grid-cols-12 gap-10 items-start">
        <div className="lg:col-span-7 space-y-12">
          {phases.map(([t, b], i) => (
            <article key={t} className="border-l-2 border-accent pl-7">
              <p className="font-body text-xs uppercase tracking-[0.22em] text-grey-label mb-2">Phase {String(i + 1).padStart(2, "0")}</p>
              <h3 className="font-display text-2xl sm:text-3xl text-primary leading-snug">{t}</h3>
              <p className="font-body text-base text-foreground/80 mt-3 leading-relaxed">{b}</p>
            </article>
          ))}
        </div>
        <div className="lg:col-span-5 lg:sticky lg:top-28">
          <img src={appFrame} alt="MyRaaha mobile app frame floating on a warm yellow background" className="w-full max-w-sm mx-auto" loading="lazy" width={1024} height={1280} />
          <Quote>You answer. The system listens. And then it asks a little more — not to interrogate. To understand.</Quote>
        </div>
      </div>
    </Section>

    <CTABand title="Want to know if this is right for where you are?" primaryLabel="When MyRaaha Helps Most" primaryTo="/when" />
  </LandingLayout>
);

export default Experience;
