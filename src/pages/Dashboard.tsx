import { useAuth } from "@/contexts/AuthContext";
import EntrepreneurshipDashboard from "./entrepreneurship/EntrepreneurshipDashboard";
import CareerDashboard from "./CareerDashboard";

const Dashboard = () => {
  const { profile } = useAuth();
  const isCareer = profile?.active_intent === "career";
  const isEntrepreneurship = profile?.active_intent === "entrepreneurship";
  const isBoth = profile?.active_intent === "both";

  if (isEntrepreneurship) return <EntrepreneurshipDashboard />;
  if (isBoth) return <BothDashboard />;
  return <CareerDashboard />;
};

// Both dashboard shows entrepreneurship as primary with career tools section
const BothDashboard = () => <EntrepreneurshipDashboard />;

export default Dashboard;
