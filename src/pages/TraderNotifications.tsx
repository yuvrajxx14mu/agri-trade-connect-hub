
import { useState, useEffect } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Bell, CheckCircle, Clock, ShoppingCart, Truck, Calendar, Tag, ChevronRight, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: string;
  created_at: string;
  read: boolean;
}

const getNotificationIcon = (type: string) => {
  switch (type) {
    case 'order':
      return <ShoppingCart className="h-5 w-5" />;
    case 'shipment':
      return <Truck className="h-5 w-5" />;
    case 'bid':
      return <Tag className="h-5 w-5" />;
    case 'appointment':
      return <Calendar className="h-5 w-5" />;
    default:
      return <Bell className="h-5 w-5" />;
  }
};

const getNotificationColor = (type: string) => {
  switch (type) {
    case 'order':
      return 'bg-blue-50 text-blue-700';
    case 'shipment':
      return 'bg-green-50 text-green-700';
    case 'bid':
      return 'bg-yellow-50 text-yellow-700';
    case 'appointment':
      return 'bg-purple-50 text-purple-700';
    default:
      return 'bg-gray-50 text-gray-700';
  }
};

const TraderNotifications = () => {
  const { profile } = useAuth();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('all');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifications();
    
    // Set up real-time subscription for new notifications
    const channel = supabase
      .channel('notifications-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${profile?.id}` }, 
        () => { fetchNotifications(); }
      )
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'notifications', filter: `user_id=eq.${profile?.id}` }, 
        () => { fetchNotifications(); }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const fetchNotifications = async () => {
    if (!profile?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setNotifications(data || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      toast({
        title: "Error",
        description: "Failed to load notifications",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId);
        
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, read: true } 
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      toast({
        title: "Error",
        description: "Failed to update notification",
        variant: "destructive"
      });
    }
  };

  const markAllAsRead = async () => {
    try {
      const unreadIds = notifications
        .filter(notification => !notification.read)
        .map(notification => notification.id);
        
      if (unreadIds.length === 0) return;
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .in('id', unreadIds);
        
      if (error) throw error;
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, read: true }))
      );
      
      toast({
        title: "Success",
        description: "All notifications marked as read",
      });
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      toast({
        title: "Error",
        description: "Failed to update notifications",
        variant: "destructive"
      });
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (activeTab === 'all') return true;
    if (activeTab === 'unread') return !notification.read;
    return notification.type === activeTab;
  });

  const unreadCount = notifications.filter(notification => !notification.read).length;

  return (
    <DashboardLayout userRole="trader">
      <DashboardHeader title="Notifications" userName={profile?.name || "User"} userRole="trader" />
      
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              Notifications
              {unreadCount > 0 && (
                <Badge className="ml-2">{unreadCount} unread</Badge>
              )}
            </CardTitle>
            <CardDescription>Stay updated with important information</CardDescription>
          </div>
          <Button 
            variant="outline" 
            className="mt-4 sm:mt-0" 
            onClick={markAllAsRead}
            disabled={unreadCount === 0}
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-2 md:grid-cols-5 mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="order">Orders</TabsTrigger>
              <TabsTrigger value="shipment">Shipments</TabsTrigger>
              <TabsTrigger value="bid">Bids</TabsTrigger>
            </TabsList>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredNotifications.length > 0 ? (
              <div className="space-y-4">
                {filteredNotifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`p-4 rounded-lg border flex items-start justify-between ${
                      !notification.read ? 'bg-muted/50' : ''
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`p-2 rounded-full ${getNotificationColor(notification.type)}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                      <div>
                        <h4 className="font-medium">{notification.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{notification.message}</p>
                        <div className="flex items-center mt-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                        </div>
                      </div>
                    </div>
                    {!notification.read && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => markAsRead(notification.id)}
                      >
                        <CheckCircle className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <Bell className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No notifications found</h3>
                <p className="text-muted-foreground mb-2">
                  {activeTab === 'all' 
                    ? "You don't have any notifications at the moment." 
                    : `You don't have any ${activeTab === 'unread' ? 'unread' : activeTab} notifications.`}
                </p>
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default TraderNotifications;
