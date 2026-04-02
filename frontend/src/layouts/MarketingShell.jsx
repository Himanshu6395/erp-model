import { Outlet } from "react-router-dom";
import LandingHeader from "../components/LandingHeader";
import SiteFooter from "../components/SiteFooter";

function MarketingShell() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <LandingHeader />
      <main className="flex-1">
        <Outlet />
      </main>
      <SiteFooter />
    </div>
  );
}

export default MarketingShell;
