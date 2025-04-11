import { User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import UserMenu from "./UserMenu";

interface DashboardHeaderProps {
  title: string;
  userName: string;
  userRole?: "farmer" | "trader";
}

const DashboardHeader = ({ title, userName, userRole = "farmer" }: DashboardHeaderProps) => {
  return (
    <div className="border-b pb-5 mb-5">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        
        <div className="flex items-center gap-4">
          <UserMenu userName={userName} userRole={userRole} />
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;
