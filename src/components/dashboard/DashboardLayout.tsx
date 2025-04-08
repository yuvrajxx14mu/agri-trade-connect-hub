
import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/DashboardSidebar";
import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: "farmer" | "trader";
}

const DashboardLayout = ({ children, userRole }: DashboardLayoutProps) => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex flex-col md:flex-row w-full">
        <DashboardSidebar userRole={userRole} />
        <main className="flex-1 p-6 md:p-8 ml-0 md:ml-64 mt-16 md:mt-0">
          {children}
        </main>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
