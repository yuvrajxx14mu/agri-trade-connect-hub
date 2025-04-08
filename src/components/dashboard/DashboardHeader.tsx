
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Mail, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "@/hooks/use-mobile";

export interface DashboardHeaderProps {
  title: string;
  userName: string;
  userRole?: "farmer" | "trader";
  onMenuToggle?: () => void;
}

const DashboardHeader = ({ title, userName, userRole = "farmer", onMenuToggle }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleNotificationClick = () => {
    navigate(`/${userRole}-notifications`);
  };

  const handleMailClick = () => {
    navigate(`/${userRole}-messages`);
  };

  const handleProfileClick = () => {
    navigate(`/${userRole}-profile`);
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6">
      <div className="flex items-center w-full sm:w-auto">
        {isMobile && (
          <Button variant="ghost" size="icon" className="mr-2" onClick={onMenuToggle}>
            <Menu className="h-5 w-5" />
          </Button>
        )}
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">{title}</h1>
          <p className="text-sm text-muted-foreground">Welcome back, {userName}</p>
        </div>
      </div>
      <div className="flex items-center space-x-2 sm:space-x-3 mt-4 sm:mt-0 w-full sm:w-auto justify-end">
        <Button variant="outline" size="icon" onClick={handleNotificationClick}>
          <Bell className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleMailClick}>
          <Mail className="h-4 w-4 sm:h-5 sm:w-5" />
        </Button>
        <Avatar className="h-8 w-8 sm:h-9 sm:w-9 cursor-pointer" onClick={handleProfileClick}>
          <AvatarImage src="" />
          <AvatarFallback className="text-xs sm:text-sm">
            {userName.split(' ').map(name => name[0]).join('')}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

export default DashboardHeader;
