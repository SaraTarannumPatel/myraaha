import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, Compass, Heart, Users, Sparkles } from "lucide-react";
import introSlide1 from "@/assets/intro-slide-1.png";
import introSlide2 from "@/assets/intro-slide-2.png";
import introSlide3 from "@/assets/intro-slide-3.png";
import Logo from "@/components/Logo";

type Slide = {
  eyebrow: string;
  title: React.ReactNode;
  body: string;
  pillIcon: React.ComponentType<{ className?: string }>;
  pillText: string;
  image: string;
  decor: { color: string; emoji: string }[];
};

const slides: Slide[] = [
  {
    eyebrow: "Chapter 01 · Clarity",
    title: (
      <>
        You&apos;re <span className="highlight-mark">not lost</span>,
        <br className="hidden sm:block" /> just figuring it out.
      </>
    ),
    body:
      "Feeling unsure about your career, ideas, or direction is more common than you think. We&apos;re here to help you slow down and listen to yourself.",
    pillIcon: Compass,
    pillText: "Find clarity on what really interests you",
    image: introSlide1,
    decor: [
      { color: "bg-accent", emoji: "✨" },
      { color: "bg-primary", emoji: "🧭" },
    ],
  },
  {
    eyebrow: "Chapter 02 · Pace",
    title: (
      <>
        You don&apos;t have to <span className="highlight-mark">rush.</span>
      </>
    ),
    body:
      "There&apos;s no perfect timeline. No fixed path. Just your pace — guided gently by tools that meet you where you are.",
    pillIcon: Heart,
    pillText: "Get guided without pressure or deadlines",
    image: introSlide2,
    decor: [
      { color: "bg-primary", emoji: "🌱" },
      { color: "bg-accent", emoji: "⏳" },
    ],
  },
  {
    eyebrow: "Chapter 03 · Support",
    title: (
      <>
        You are <span className="highlight-mark">not alone</span> in this.
      </>
    ),
    body:
      "Support shows up when you need it — quietly, consistently. Real mentors, real peers, real tools.",
    pillIcon: Users,
    pillText: "Access guidance, tools & people who help",
    image: introSlide3,
    decor: [
      { color: "bg-accent", emoji: "🤝" },
      { color: "bg-primary", emoji: "💫" },
    ],
  },
];

const IntroSlides = () => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const next = params.get("next");
  const targetAuth = next === "signup" ? "/auth?mode=signup" : "/auth?mode=signin";
  const slide = slides[current];
  const PillIcon = slide.pillIcon;

  const handleNext = () => {
    if (current < slides.length - 1) setCurrent(current + 1);
    else navigate(targetAuth);
  };
  const handleSkip = () => navigate(targetAuth);

  return (
    <div className="min-h-[100dvh] bg-background relative overflow-hidden flex flex-col">
      {/* Background decorative blobs */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 -right-32 w-[28rem] h-[28rem] rounded-full bg-accent/40 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-40 -left-32 w-[26rem] h-[26rem] rounded-full bg-primary/15 blur-3xl"
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-5 sm:px-8 lg:px-14 pt-5 sm:pt-6">
        <Logo to={null} size="sm" />

        <button
          onClick={handleSkip}
          className="font-body text-sm text-foreground/70 hover:text-primary transition-colors px-3 py-1.5 rounded-full hover:bg-accent/40"
        >
          Skip intro
        </button>
      </header>

      {/* Main */}
      <main className="relative z-10 flex-1 max-w-7xl mx-auto w-full px-5 sm:px-8 lg:px-14 pt-4 sm:pt-10 lg:pt-14 pb-6 flex items-center">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Illustration card */}
          <div className="order-1 lg:order-2 lg:col-span-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={`img-${current}`}
                initial={{ opacity: 0, scale: 0.94, rotate: -2 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.94, rotate: 2 }}
                transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                className="relative mx-auto w-full max-w-xs sm:max-w-lg lg:max-w-none"
              >
                {/* Yellow card behind */}
                <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-[2rem] bg-accent" />
                {/* Main image card */}
                <div className="relative rounded-[2rem] bg-background border-2 border-primary/10 shadow-card overflow-hidden">
                  <div className="aspect-[4/3] sm:aspect-square lg:aspect-square flex items-center justify-center bg-gradient-to-br from-accent/30 to-background p-4 sm:p-10">
                    <img
                      src={slide.image}
                      alt=""
                      className="w-full h-full object-contain"
                      width={800}
                      height={800}
                    />
                  </div>
                </div>

                {/* Floating decor pills */}
                {slide.decor.map((d, i) => (
                  <motion.div
                    key={`${current}-${i}`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 + i * 0.1, duration: 0.4 }}
                    className={`absolute ${
                      i === 0 ? "-top-3 -left-3 sm:-top-4 sm:-left-4" : "-bottom-3 -right-3 sm:-bottom-4 sm:-right-4"
                    } ${d.color} rounded-2xl px-3 py-2 sm:px-4 sm:py-3 shadow-soft text-xl sm:text-2xl rotate-[-6deg]`}
                  >
                    {d.emoji}
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Text content */}
          <div className="order-2 lg:order-1 lg:col-span-6">
            <AnimatePresence mode="wait">
              <motion.div
                key={`text-${current}`}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
              >
                <span className="pill-chip mb-4 sm:mb-5">
                  <Sparkles className="w-3 h-3" />
                  {slide.eyebrow}
                </span>
                <h1 className="font-display text-primary text-[2rem] leading-[1.1] sm:text-5xl md:text-6xl lg:text-[4.5rem] xl:text-[5rem] tracking-tight mb-3 sm:mb-6">
                  {slide.title}
                </h1>
                <p
                  className="font-body text-sm sm:text-lg lg:text-xl text-foreground/75 leading-relaxed max-w-xl mb-4 sm:mb-8"
                  dangerouslySetInnerHTML={{ __html: slide.body.replace(/&apos;/g, "'") }}
                />

                {/* CTA pill */}
                <div className="hidden sm:inline-flex items-center gap-2 bg-accent text-primary rounded-full pl-3 pr-5 py-2 sm:py-2.5 mb-6 sm:mb-10 shadow-soft">
                  <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary flex items-center justify-center">
                    <PillIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-accent" />
                  </span>
                  <span className="font-body text-sm sm:text-base font-medium">{slide.pillText}</span>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Footer controls */}
            <div className="flex items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      i === current ? "bg-primary w-8" : "bg-primary/20 w-2.5 hover:bg-primary/40"
                    }`}
                  />
                ))}
                <span className="ml-3 font-body text-xs text-muted-foreground">
                  {current + 1} / {slides.length}
                </span>
              </div>

              <button
                onClick={handleNext}
                className="group inline-flex items-center gap-2 bg-primary text-accent rounded-full px-5 sm:px-6 py-3 sm:py-3.5 font-body text-sm sm:text-base font-medium shadow-accent hover:shadow-card transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {current === slides.length - 1 ? "Get started" : "Next"}
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default IntroSlides;
