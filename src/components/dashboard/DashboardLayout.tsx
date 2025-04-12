import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/DashboardSidebar";
import { ReactNode, useEffect, useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: "farmer" | "trader";
}

const DashboardLayout = ({ children, userRole }: DashboardLayoutProps) => {
  const isMobile = useIsMobile();
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile);

  useEffect(() => {
    setSidebarOpen(!isMobile);
  }, [isMobile]);

  return (
    <SidebarProvider defaultOpen={!isMobile}>
      <div className="flex h-screen bg-background overflow-hidden">
        <div className={`fixed left-0 top-0 h-full z-40 transition-transform duration-300 ${isMobile && !sidebarOpen ? "-translate-x-full" : "translate-x-0"}`}>
          <DashboardSidebar userRole={userRole} />
        </div>
        <div className={`flex-1 overflow-auto transition-all duration-300 ${isMobile ? "ml-0" : "ml-0 md:ml-64"}`}>
          <main className="p-4 md:p-6 lg:p-8 w-full">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
