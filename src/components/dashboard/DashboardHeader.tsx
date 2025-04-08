import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Mail } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface DashboardHeaderProps {
  title: string;
  userName: string;
  userRole: "farmer" | "trader";
}

const DashboardHeader = ({ title, userName, userRole }: DashboardHeaderProps) => {
  const navigate = useNavigate();

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
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground">Welcome back, {userName}</p>
      </div>
      <div className="flex items-center space-x-3 mt-4 md:mt-0">
        <Button variant="outline" size="icon" onClick={handleNotificationClick}>
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="icon" onClick={handleMailClick}>
          <Mail className="h-5 w-5" />
        </Button>
        <Avatar className="cursor-pointer" onClick={handleProfileClick}>
          <AvatarImage src="" />
          <AvatarFallback>
            {userName.split(' ').map(name => name[0]).join('')}
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

export default DashboardHeader;
