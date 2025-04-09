
import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { format, isToday, isYesterday } from "date-fns";
import { useNotifications, Notification } from "@/hooks/useNotifications";

const NotificationItem = ({ notification, onRead }: { notification: Notification, onRead: (id: string) => void }) => {
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return `Today at ${format(date, 'h:mm a')}`;
    } else if (isYesterday(date)) {
      return `Yesterday at ${format(date, 'h:mm a')}`;
    } else {
      return format(date, 'MMM d, yyyy');
    }
  };

  const getTypeStyles = (type: string) => {
    switch (type) {
      case 'bid':
        return 'bg-blue-50 text-blue-800 border-blue-200';
      case 'order':
        return 'bg-green-50 text-green-800 border-green-200';
      case 'auction':
        return 'bg-purple-50 text-purple-800 border-purple-200';
      case 'price':
        return 'bg-yellow-50 text-yellow-800 border-yellow-200';
      case 'message':
        return 'bg-indigo-50 text-indigo-800 border-indigo-200';
      default:
        return 'bg-gray-50 text-gray-800 border-gray-200';
    }
  };

  return (
    <div 
      className={`p-3 border-b last:border-b-0 transition-colors cursor-pointer ${notification.read ? '' : 'bg-muted/30'}`}
      onClick={() => !notification.read && onRead(notification.id)}
    >
      <div className="flex justify-between items-start mb-1">
        <div className="font-medium">{notification.title}</div>
        <Badge variant="outline" className={`text-xs ${getTypeStyles(notification.type)}`}>
          {notification.type}
        </Badge>
      </div>
      <p className="text-sm text-muted-foreground mb-1">{notification.message}</p>
      <p className="text-xs text-muted-foreground">{formatTimestamp(notification.created_at)}</p>
    </div>
  );
};

export function NotificationsPopover() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const [open, setOpen] = useState(false);

  // Group notifications by date
  const groupNotifications = () => {
    const groups: Record<string, Notification[]> = {};
    
    notifications.forEach(notification => {
      const date = new Date(notification.created_at);
      let groupKey = 'Older';
      
      if (isToday(date)) {
        groupKey = 'Today';
      } else if (isYesterday(date)) {
        groupKey = 'Yesterday';
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      
      groups[groupKey].push(notification);
    });
    
    return groups;
  };

  const notificationGroups = groupNotifications();
  
  const handleReadNotification = (id: string) => {
    markAsRead(id);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-medium">Notifications</h4>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={() => markAllAsRead()}>
              Mark all as read
            </Button>
          )}
        </div>
        
        {loading ? (
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground">Loading notifications...</p>
          </div>
        ) : notifications.length > 0 ? (
          <ScrollArea className="h-80">
            {Object.entries(notificationGroups).map(([group, items]) => (
              <div key={group}>
                <div className="p-2 bg-muted/30">
                  <p className="text-xs font-medium text-muted-foreground">{group}</p>
                </div>
                {items.map((notification) => (
                  <NotificationItem 
                    key={notification.id} 
                    notification={notification} 
                    onRead={handleReadNotification} 
                  />
                ))}
              </div>
            ))}
          </ScrollArea>
        ) : (
          <div className="p-4 text-center">
            <p className="text-sm text-muted-foreground">No notifications</p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
