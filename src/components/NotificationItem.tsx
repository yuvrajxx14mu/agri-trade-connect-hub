
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
        return <ShoppingCart className="h-5 w-5" />;
      case "bid":
        return <Gavel className="h-5 w-5" />;
      case "auction":
        return <Gavel className="h-5 w-5" />;
      case "shipment":
        return <Truck className="h-5 w-5" />;
      case "appointment":
        return <Calendar className="h-5 w-5" />;
      case "alert":
        return <AlertTriangle className="h-5 w-5" />;
      case "success":
        return <CheckCircle className="h-5 w-5" />;
      case "reminder":
        return <Clock className="h-5 w-5" />;
      default:
        return <Bell className="h-5 w-5" />;
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
        "flex items-start p-4 gap-3 border-b cursor-pointer transition-colors hover:bg-muted/50",
        !read && "bg-muted/30"
      )}
      onClick={onClick}
    >
      <div className={cn("p-2 rounded-full", getIconColor())}>
        {getIcon()}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <h4 className={cn("font-medium", !read && "font-semibold")}>{title}</h4>
          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
            {formatDistanceToNow(time, { addSuffix: true })}
          </span>
        </div>
        <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{message}</p>
      </div>
      {!read && (
        <div className="w-2 h-2 rounded-full bg-blue-500 mt-2"></div>
      )}
    </div>
  );
};

export default NotificationItem;
