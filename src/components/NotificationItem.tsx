
import React from "react";
import { formatDistanceToNow } from "date-fns";
import { 
  Bell, 
  ShoppingCart, 
  Gavel, 
  Truck, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Clock
} from "lucide-react";
import { cn } from "@/lib/utils";

type NotificationType = 
  | "order" 
  | "bid" 
  | "auction" 
  | "shipment" 
  | "appointment" 
  | "alert" 
  | "success" 
  | "reminder";

interface NotificationItemProps {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  time: Date;
  read: boolean;
  onClick?: () => void;
}

const NotificationItem = ({
  id,
  type,
  title,
  message,
  time,
  read,
  onClick,
}: NotificationItemProps) => {
  const getIcon = () => {
    switch (type) {
      case "order":
        return <ShoppingCart className="h-4 w-4 sm:h-5 sm:w-5" />;
      case "bid":
        return <Gavel className="h-4 w-4 sm:h-5 sm:w-5" />;
      case "auction":
        return <Gavel className="h-4 w-4 sm:h-5 sm:w-5" />;
      case "shipment":
        return <Truck className="h-4 w-4 sm:h-5 sm:w-5" />;
      case "appointment":
        return <Calendar className="h-4 w-4 sm:h-5 sm:w-5" />;
      case "alert":
        return <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5" />;
      case "success":
        return <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5" />;
      case "reminder":
        return <Clock className="h-4 w-4 sm:h-5 sm:w-5" />;
      default:
        return <Bell className="h-4 w-4 sm:h-5 sm:w-5" />;
    }
  };

  const getIconColor = () => {
    switch (type) {
      case "order":
        return "text-blue-500 bg-blue-50";
      case "bid":
        return "text-purple-500 bg-purple-50";
      case "auction":
        return "text-amber-500 bg-amber-50";
      case "shipment":
        return "text-cyan-500 bg-cyan-50";
      case "appointment":
        return "text-green-500 bg-green-50";
      case "alert":
        return "text-red-500 bg-red-50";
      case "success":
        return "text-emerald-500 bg-emerald-50";
      case "reminder":
        return "text-orange-500 bg-orange-50";
      default:
        return "text-slate-500 bg-slate-50";
    }
  };

  return (
    <div 
      className={cn(
        "flex items-start p-3 sm:p-4 gap-2 sm:gap-3 border-b cursor-pointer transition-colors hover:bg-muted/50",
        !read && "bg-muted/30"
      )}
      onClick={onClick}
    >
      <div className={cn("p-1.5 sm:p-2 rounded-full", getIconColor())}>
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h4 className={cn("font-medium text-sm sm:text-base", !read && "font-semibold")}>{title}</h4>
          <span className="text-xxs sm:text-xs text-muted-foreground whitespace-nowrap ml-2">
            {formatDistanceToNow(time, { addSuffix: true })}
          </span>
        </div>
        <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 line-clamp-2">{message}</p>
      </div>
      {!read && (
        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500 mt-1.5 sm:mt-2"></div>
      )}
    </div>
  );
};

export default NotificationItem;
