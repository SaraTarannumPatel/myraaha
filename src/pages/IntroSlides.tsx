import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight } from "lucide-react";
import introSlide1 from "@/assets/intro-slide-1.png";
import introSlide2 from "@/assets/intro-slide-2.png";
import introSlide3 from "@/assets/intro-slide-3.png";

const slides = [
  {
    heading: ["You're", "not", "lost"],
    subtitle: "You're just figuring things out. Feeling unsure about your career, ideas, or direction is more common than you think.",
    cta: "Find clarity on what really interests you",
    image: introSlide1,
  },
  {
    heading: ["You", "don't", "have to", "rush"],
    subtitle: "There's no perfect timeline. No fixed path. Just your pace.",
    cta: "Get guided without pressure or deadlines",
    image: introSlide2,
  },
  {
    heading: ["You", "are", "not", "alone"],
    subtitle: "Support shows up when you need it—quietly, consistently.",
    cta: "Access to guidance, tools, & people who help",
    image: introSlide3,
  },
];

const IntroSlides = () => {
  const [current, setCurrent] = useState(0);
  const navigate = useNavigate();
  const slide = slides[current];

  const handleNext = () => {
    if (current < slides.length - 1) {
      setCurrent(current + 1);
    } else {
      navigate("/get-started");
    }
  };

  const handleSkip = () => {
    navigate("/get-started");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 sm:px-8 lg:px-16 pt-6 sm:pt-8 relative z-20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-foreground rounded-md flex items-center justify-center">
            <span className="text-background font-display text-sm sm:text-base font-bold">M</span>
          </div>
          <span className="font-display text-base sm:text-lg text-foreground">MyRaaha</span>
        </div>
        <button
          onClick={handleSkip}
          className="font-body text-sm sm:text-base text-foreground hover:text-muted-foreground transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col lg:flex-row items-center justify-center px-5 sm:px-8 lg:px-16 pb-8 sm:pb-12 lg:pb-16">
        <AnimatePresence mode="wait">
          <motion.div
            key={current}
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -40 }}
            transition={{ duration: 0.4 }}
            className="flex flex-col lg:flex-row items-center lg:items-center gap-4 sm:gap-6 lg:gap-16 w-full max-w-6xl mx-auto"
          >
            {/* Text + Image side by side on desktop, stacked on mobile */}
            <div className="flex-1 w-full relative">
              {/* Heading with overlapping illustration */}
              <div className="relative">
                <h1 className="font-display text-[3rem] sm:text-[4rem] md:text-[5rem] lg:text-[6rem] xl:text-[7rem] text-foreground leading-[0.95] tracking-tight">
                  {slide.heading.map((word, i) => (
                    <span key={i} className="block">{word}</span>
                  ))}
                </h1>
                {/* Illustration overlapping the heading - positioned differently per viewport */}
                <div className="absolute -right-4 sm:right-0 top-1/2 -translate-y-1/2 w-[55%] sm:w-[50%] md:w-[45%] lg:hidden pointer-events-none">
                  <img
                    src={slide.image}
                    alt=""
                    className="w-full h-auto object-contain"
                    width={800}
                    height={800}
                  />
                </div>
              </div>
            </div>

            {/* Desktop illustration - separate column */}
            <div className="hidden lg:flex flex-1 items-center justify-center">
              <img
                src={slide.image}
                alt=""
                className="w-full max-w-md h-auto object-contain"
                width={800}
                height={800}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom section */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="px-5 sm:px-8 lg:px-16 pb-8 sm:pb-12 lg:pb-16 max-w-6xl mx-auto w-full"
        >
          {/* Subtitle */}
          <p className="font-display italic text-lg sm:text-xl md:text-2xl lg:text-3xl text-foreground/80 leading-relaxed max-w-lg mb-6 sm:mb-8">
            {slide.subtitle}
          </p>

          {/* CTA pill */}
          <div className="mb-6 sm:mb-8">
            <span className="inline-block font-body text-sm sm:text-base text-foreground bg-accent/40 rounded-full px-5 sm:px-6 py-2.5 sm:py-3">
              {slide.cta}
            </span>
          </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            {/* Dots */}
            <div className="flex gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === current ? "bg-foreground w-6" : "bg-muted-foreground/30"
                  }`}
                />
              ))}
            </div>

            {/* Next button */}
            <button
              onClick={handleNext}
              className="flex items-center gap-2 font-display text-sm sm:text-base text-background bg-foreground rounded-full px-5 sm:px-6 py-2.5 sm:py-3 hover:opacity-90 transition-opacity"
            >
              {current === slides.length - 1 ? "Get Started" : "Next"}
              <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default IntroSlides;
