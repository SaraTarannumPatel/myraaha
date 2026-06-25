import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, LogIn, UserPlus, Compass, Sparkles, Map as MapIcon } from "lucide-react";
import LandingLayout from "@/components/landing/shared/LandingLayout";
import Section from "@/components/landing/shared/Section";
import beginJourney from "@/assets/landing/begin-journey.jpg";

const paths = [
  { to: "/intro", title: "Career & Jobs", body: "You're exploring what to do, figuring out where you fit, building toward a career that aligns with who you are — or navigating a transition.", icon: MapIcon },
  { to: "/intro", title: "Entrepreneurship & Building", body: "You're drawn to creating something — a startup, a venture, a freelance path. You want to build, and you want to build it right.", icon: Sparkles },
  { to: "/intro", title: "Both — I'm not sure yet", body: "You're exploring the intersection. Or you genuinely haven't decided. That's a completely valid place to start. The system can hold both.", icon: Compass },
];

const Begin = () => (
  <LandingLayout>
    {/* HERO */}
    <section className="relative overflow-hidden bg-background">
      <div className="absolute -top-24 -right-24 w-[28rem] h-[28rem] rounded-full bg-accent/40 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-[24rem] h-[24rem] rounded-full bg-primary/10 blur-3xl pointer-events-none" />

      <div className="container mx-auto px-5 sm:px-8 pt-12 sm:pt-20 pb-20 sm:pb-28 relative">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-16 items-center">
          <div className="lg:col-span-6">
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="font-body text-xs uppercase tracking-[0.28em] text-grey-label mb-5"
            >
              Begin Exploring
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.05 }}
              className="font-display text-[2.4rem] sm:text-5xl md:text-6xl text-primary leading-[1.05] tracking-tight"
            >
              Begin when <span className="highlight-mark italic">you're ready.</span>
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="font-body text-base sm:text-lg text-foreground/75 mt-6 leading-relaxed max-w-xl"
            >
              This is not a sign-up form. It's an entrance. You can step through it now, or come back when it feels right.
              Either is fine. <em className="not-italic text-primary font-medium">The system will be here.</em>
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25 }}
              className="mt-9 flex flex-col sm:flex-row gap-3"
            >
              <Link
                to="/auth?mode=signup"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-accent px-7 py-3.5 text-sm font-semibold hover:opacity-90 transition-opacity"
              >
                <UserPlus size={16} /> Create account
              </Link>
              <Link
                to="/auth"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-primary/25 bg-background text-primary px-7 py-3.5 text-sm font-medium hover:bg-secondary/50 transition-colors"
              >
                <LogIn size={16} /> Log in
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-8 flex items-center gap-3"
            >
              <span className="inline-block w-10 h-px bg-foreground/20" />
              <p className="font-body text-xs text-grey-meta italic">
                Free to start. No pressure to continue.
              </p>
            </motion.div>
          </div>

          {/* Animated journey illustration */}
          <div className="lg:col-span-6 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="relative"
            >
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              >
                <img
                  src={beginJourney}
                  alt="A winding journey path with floating compass, phone, sapling, book, and clouds"
                  className="w-full max-w-md mx-auto rounded-3xl"
                  width={1024}
                  height={1024}
                />
              </motion.div>

              {/* Floating UI cards */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
                className="absolute top-6 -left-2 sm:-left-6 hidden sm:block"
              >
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="rounded-2xl bg-background border border-border shadow-lg px-3 py-2 flex items-center gap-2"
                >
                  <span className="w-7 h-7 rounded-lg bg-accent/60 flex items-center justify-center text-primary">
                    <Compass size={15} />
                  </span>
                  <span className="font-body text-[11px] text-foreground">Curiosity Compass</span>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 1 }}
                className="absolute bottom-12 -right-2 sm:-right-4 hidden sm:block"
              >
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                  className="rounded-2xl bg-primary text-accent shadow-xl px-3 py-2 flex items-center gap-2"
                >
                  <Sparkles size={14} />
                  <span className="font-body text-[11px]">Your UID — MR-A1B2C3</span>
                </motion.div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.2 }}
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 hidden sm:block"
              >
                <motion.div
                  animate={{ y: [0, -4, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut" }}
                  className="rounded-2xl bg-accent text-primary shadow-lg px-3 py-2 flex items-center gap-2"
                >
                  <MapIcon size={14} />
                  <span className="font-body text-[11px] font-medium">Step 1 of 5 — Welcome</span>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>

    {/* PATH PICKER */}
    <Section eyebrow="Which part of your journey are you in?" title="Choose your path. You can change this anytime.">
      <div className="grid md:grid-cols-3 gap-5">
        {paths.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.08 }}
          >
            <Link
              to={p.to}
              className="group block rounded-3xl border border-border p-7 bg-background hover:border-primary hover:shadow-soft transition-all h-full"
            >
              <span className="inline-flex w-12 h-12 rounded-2xl bg-accent/50 items-center justify-center text-primary group-hover:scale-110 transition-transform">
                <p.icon size={22} />
              </span>
              <p className="font-display text-2xl text-primary mt-5 group-hover:translate-x-1 transition-transform">{p.title}</p>
              <p className="font-body text-sm text-foreground/75 mt-3 leading-relaxed">{p.body}</p>
              <span className="inline-flex items-center gap-2 mt-6 text-primary font-medium text-sm">
                Continue <ArrowRight size={14} />
              </span>
            </Link>
          </motion.div>
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
        <Link to="/auth?mode=signup" className="inline-flex items-center gap-2 rounded-full bg-accent text-primary px-8 py-4 text-base font-semibold mt-10 hover:opacity-90">
          Create your account <ArrowRight size={18} />
        </Link>
        <p className="font-body text-sm text-accent/80 mt-4">Free to start. No pressure to continue.</p>
      </div>
    </section>
  </LandingLayout>
);

export default Begin;
