import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";
import CareerOnboarding from "./CareerOnboarding";
import EntrepreneurshipOnboarding from "./EntrepreneurshipOnboarding";
import BothOnboarding from "./BothOnboarding";

const GuidedOnboarding = () => {
  const { profile } = useAuth();
  const intent = profile?.active_intent || localStorage.getItem("myraaha_guest_intent");

  if (intent === "entrepreneurship") return <EntrepreneurshipOnboarding />;
  if (intent === "both") return <BothOnboarding />;
  if (intent === "career") return <CareerOnboarding />;

  return <Navigate to="/onboarding/intent" replace />;
};

export default GuidedOnboarding;
