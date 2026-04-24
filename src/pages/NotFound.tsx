import { useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

const NotFound = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  const handleGoBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="text-center max-w-md">
        <h1 className="mb-2 text-5xl font-display text-foreground">404</h1>
        <p className="mb-6 text-lg text-muted-foreground font-body">
          Oops! We couldn’t find that page.
        </p>
        <Button onClick={handleGoBack} className="rounded-full px-6">
          <ArrowLeft size={16} className="mr-2" /> Go Back
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
