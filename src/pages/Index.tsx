import Navbar from "@/components/landing/Navbar";
import HeroSection from "@/components/landing/HeroSection";
import ProblemSection from "@/components/landing/ProblemSection";
import VisionSection from "@/components/landing/VisionSection";
import FeaturesSection from "@/components/landing/FeaturesSection";
import USPsSection from "@/components/landing/USPsSection";
import EditionsSection from "@/components/landing/EditionsSection";
import EntrepreneurshipSection from "@/components/landing/EntrepreneurshipSection";
import LoopSection from "@/components/landing/LoopSection";
import JourneySection from "@/components/landing/JourneySection";
import TransitionSection from "@/components/landing/TransitionSection";
import StagesSection from "@/components/landing/StagesSection";
import RolloutSection from "@/components/landing/RolloutSection";
import PhilosophySection from "@/components/landing/PhilosophySection";
import MissionSection from "@/components/landing/MissionSection";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />
      <ProblemSection />
      <VisionSection />
      <FeaturesSection />
      <USPsSection />
      <EditionsSection />
      <EntrepreneurshipSection />
      <LoopSection />
      <JourneySection />
      <TransitionSection />
      <StagesSection />
      <RolloutSection />
      <PhilosophySection />
      <MissionSection />
      <CTASection />
      <Footer />
    </div>
  );
};

export default Index;
