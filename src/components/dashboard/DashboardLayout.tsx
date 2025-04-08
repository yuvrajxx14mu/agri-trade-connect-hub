import { SidebarProvider } from "@/components/ui/sidebar";
import DashboardSidebar from "@/components/DashboardSidebar";
import { ReactNode } from "react";

interface DashboardLayoutProps {
  children: ReactNode;
  userRole: "farmer" | "trader";
}

const DashboardLayout = ({ children, userRole }: DashboardLayoutProps) => {
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex h-screen bg-background overflow-hidden">
        <div className="fixed left-0 top-0 h-full">
          <DashboardSidebar userRole={userRole} />
        </div>
        <div className="flex-1 overflow-auto ml-64">
          <main className="p-6 md:p-8 w-full">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
