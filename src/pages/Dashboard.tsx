import { useAuth } from "@/contexts/AuthContext";
import EntrepreneurshipDashboard from "./entrepreneurship/EntrepreneurshipDashboard";
import CareerDashboard from "./CareerDashboard";
import BothDashboard from "./BothDashboard";

const Dashboard = () => {
  const { profile } = useAuth();
  const intent = profile?.active_intent;

  if (intent === "entrepreneurship") return <EntrepreneurshipDashboard />;
  if (intent === "both") return <BothDashboard />;
  return <CareerDashboard />;
};

export default Dashboard;
