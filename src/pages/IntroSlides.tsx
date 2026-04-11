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
      navigate("/auth");
    }
  };

  const handleSkip = () => {
    navigate("/auth");
  };

  return (
    <div className="h-[100dvh] bg-[hsl(60,14%,98%)] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 sm:px-8 lg:px-16 pt-5 sm:pt-6 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-[hsl(230,40%,25%)] rounded-md flex items-center justify-center">
            <span className="text-[hsl(45,80%,65%)] font-display text-sm font-bold">M</span>
          </div>
          <span className="font-display text-base text-[hsl(230,40%,25%)] tracking-tight">MyRaaha</span>
        </div>
        <button
          onClick={handleSkip}
          className="font-body text-sm text-[hsl(230,40%,25%,0.7)] hover:text-[hsl(230,40%,25%)] transition-colors"
        >
          Skip
        </button>
      </div>

      {/* Content wrapper */}
      <div className="flex-1 flex flex-col px-6 sm:px-8 lg:px-16 max-w-7xl mx-auto w-full min-h-0">

        {/* Heading + Illustration area */}
        <div className="flex-[3] flex items-center min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={`heading-${current}`}
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.35 }}
              className="w-full"
            >
              <div className="relative lg:flex lg:items-center lg:gap-16 xl:gap-24">
                {/* Heading */}
                <div className="relative z-10 lg:flex-1">
                  <h1 className="font-display text-[4.2rem] sm:text-[5rem] md:text-[6rem] lg:text-[7rem] xl:text-[8rem] text-[hsl(230,40%,25%)] leading-[0.88] tracking-[-0.02em] font-bold">
                    {slide.heading.map((word, i) => (
                      <span key={i} className="block">{word}</span>
                    ))}
                  </h1>
                </div>

                {/* Illustration */}
                <div className="absolute -right-2 top-1/2 -translate-y-[40%] w-[65%] sm:w-[55%] md:w-[48%] lg:static lg:translate-y-0 lg:w-auto lg:flex-1 lg:flex lg:justify-center pointer-events-none z-0 lg:z-10">
                  <img
                    src={slide.image}
                    alt=""
                    className="w-full lg:w-[90%] xl:w-[80%] h-auto object-contain"
                    width={800}
                    height={800}
                  />
                </div>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Bottom section */}
        <div className="flex-[2] flex flex-col justify-end pb-8 sm:pb-10 lg:pb-12 min-h-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={`bottom-${current}`}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              {/* Subtitle */}
              <p className="font-display italic text-[1.15rem] sm:text-xl md:text-2xl lg:text-[1.65rem] text-[hsl(230,40%,25%,0.8)] leading-[1.35] max-w-[22rem] sm:max-w-md lg:max-w-lg mb-5 sm:mb-6">
                {slide.subtitle}
              </p>

              {/* CTA pill */}
              <div className="mb-6 sm:mb-8">
                <span className="inline-block font-body text-[0.8rem] sm:text-sm text-[hsl(230,40%,25%)] bg-[hsl(45,80%,80%)] rounded-full px-5 sm:px-6 py-2.5 sm:py-3">
                  {slide.cta}
                </span>
              </div>

              {/* Navigation */}
              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  {slides.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrent(i)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        i === current
                          ? "bg-[hsl(230,40%,25%)] w-6"
                          : "bg-[hsl(230,40%,25%,0.2)] w-2"
                      }`}
                    />
                  ))}
                </div>

                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 font-display text-sm text-[hsl(45,80%,65%)] bg-[hsl(230,40%,25%)] rounded-full px-6 py-3 hover:bg-[hsl(230,40%,20%)] transition-colors"
                >
                  {current === slides.length - 1 ? "Get Started" : "Next"}
                  <ArrowRight size={16} />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default IntroSlides;
