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
    <div className="min-h-[100dvh] bg-background flex flex-col overflow-hidden relative">
      {/* Header - fixed at top */}
      <div className="flex items-center justify-between px-6 sm:px-8 lg:px-16 pt-5 sm:pt-6 relative z-20">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-foreground rounded-md flex items-center justify-center">
            <span className="text-background font-display text-sm font-bold">M</span>
          </div>
          <span className="font-display text-base text-foreground tracking-tight">MyRaaha</span>
        </div>
        <button
          onClick={handleSkip}
          className="font-body text-sm text-foreground/70 hover:text-foreground transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Main content area - fills remaining space */}
      <div className="flex-1 flex flex-col justify-between px-6 sm:px-8 lg:px-16 pt-6 sm:pt-8 lg:pt-12 pb-6 sm:pb-8 lg:pb-12 max-w-7xl mx-auto w-full">
        {/* Top: Heading + Illustration */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`heading-${current}`}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35 }}
            className="flex-1 flex items-start lg:items-center"
          >
            {/* Mobile/Tablet: heading with overlapping illustration */}
            <div className="relative w-full lg:flex lg:items-center lg:gap-12 xl:gap-20">
              {/* Heading */}
              <div className="relative z-10 lg:flex-1">
                <h1 className="font-display text-[4.5rem] sm:text-[5.5rem] md:text-[6.5rem] lg:text-[7rem] xl:text-[8rem] text-foreground leading-[0.9] tracking-[-0.02em] font-bold">
                  {slide.heading.map((word, i) => (
                    <span key={i} className="block">{word}</span>
                  ))}
                </h1>
              </div>

              {/* Illustration - overlaps heading on mobile, separate column on desktop */}
              <div className="absolute right-0 top-1/2 -translate-y-[45%] w-[60%] sm:w-[50%] md:w-[45%] lg:static lg:translate-y-0 lg:w-auto lg:flex-1 lg:flex lg:justify-center pointer-events-none z-0 lg:z-10">
                <img
                  src={slide.image}
                  alt=""
                  className="w-full lg:w-[85%] xl:w-[75%] h-auto object-contain max-h-[50vh] lg:max-h-[55vh]"
                  width={800}
                  height={800}
                />
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Bottom: Subtitle + CTA + Navigation */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`bottom-${current}`}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="mt-auto pt-4"
          >
            {/* Subtitle - italic serif */}
            <p className="font-display italic text-lg sm:text-xl md:text-2xl lg:text-[1.7rem] text-foreground/80 leading-[1.35] max-w-md lg:max-w-lg mb-5 sm:mb-6">
              {slide.subtitle}
            </p>

            {/* CTA pill - yellow/gold rounded */}
            <div className="mb-6 sm:mb-8">
              <span className="inline-block font-body text-[0.8rem] sm:text-sm text-foreground bg-[hsl(45,80%,80%)] rounded-full px-5 sm:px-6 py-2.5 sm:py-3">
                {slide.cta}
              </span>
            </div>

            {/* Navigation row */}
            <div className="flex items-center justify-between">
              {/* Dots */}
              <div className="flex gap-2">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrent(i)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      i === current
                        ? "bg-foreground w-6"
                        : "bg-muted-foreground/25 w-2"
                    }`}
                  />
                ))}
              </div>

              {/* Next button - dark navy pill */}
              <button
                onClick={handleNext}
                className="flex items-center gap-2 font-display text-sm text-background bg-[hsl(240,50%,20%)] rounded-full px-6 py-3 hover:bg-[hsl(240,50%,25%)] transition-colors"
              >
                {current === slides.length - 1 ? "Get Started" : "Next"}
                <ArrowRight size={16} />
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default IntroSlides;
