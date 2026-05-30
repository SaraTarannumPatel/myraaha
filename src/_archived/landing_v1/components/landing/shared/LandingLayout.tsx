import { ReactNode, useEffect } from "react";
import { useLocation } from "react-router-dom";
import LandingNav from "./LandingNav";
import LandingFooter from "./LandingFooter";

const LandingLayout = ({
  children,
  navAlwaysVisible = true,
}: {
  children: ReactNode;
  navAlwaysVisible?: boolean;
}) => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  }, [pathname]);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <LandingNav alwaysVisible={navAlwaysVisible} />
      <main className="pt-16 sm:pt-20 responsive-page">{children}</main>
      <LandingFooter />
    </div>
  );
};

export default LandingLayout;
