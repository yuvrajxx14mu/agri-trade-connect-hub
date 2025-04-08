
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Bell, Mail } from "lucide-react";

interface DashboardHeaderProps {
  title: string;
  userName: string;
}

const DashboardHeader = ({ title, userName }: DashboardHeaderProps) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-muted-foreground">Welcome back, {userName}</p>
      </div>
      <div className="flex items-center space-x-3 mt-4 md:mt-0">
        <Button variant="outline" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="icon">
          <Mail className="h-5 w-5" />
        </Button>
        <Avatar>
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
