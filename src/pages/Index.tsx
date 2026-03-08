import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import EditionsSection from "@/components/landing/EditionsSection";
import JourneySection from "@/components/landing/JourneySection";
import PhilosophySection from "@/components/landing/PhilosophySection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <FeaturesSection />
      <EditionsSection />
      <JourneySection />
      <PhilosophySection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
