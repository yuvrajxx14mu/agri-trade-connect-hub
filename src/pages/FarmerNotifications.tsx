import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Search, Bell, CheckCheck, BellOff } from "lucide-react";
import NotificationItem from "@/components/NotificationItem";

const FarmerNotifications = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("notifications");
  const [filterType, setFilterType] = useState("all");
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({
    email: {
      bids: true,
      orders: true,
      shipments: true,
      pricingAlerts: true,
      appointments: true,
      promotions: false,
    },
    push: {
      bids: true,
      orders: true,
      shipments: true,
      pricingAlerts: true,
      appointments: true,
      promotions: false,
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', profile?.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform the data to match the expected format
        const transformedNotifications = data.map(notification => ({
          id: notification.id,
          type: notification.type,
          title: notification.title,
          message: notification.message,
          time: new Date(notification.created_at),
          read: notification.is_read
        }));

        setNotifications(transformedNotifications);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (profile?.id) {
      fetchNotifications();
    }
  }, [profile?.id]);

  const fetchNotificationSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', profile?.id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No settings exist yet, create default settings
          const defaultSettings = {
            email: {
              bids: true,
              orders: true,
              shipments: true,
              pricingAlerts: true,
              appointments: true,
              promotions: false,
            },
            push: {
              bids: true,
              orders: true,
              shipments: true,
              pricingAlerts: true,
              appointments: true,
              promotions: false,
            }
          };

          const { error: insertError } = await supabase
            .from('notification_settings')
            .insert({
              user_id: profile?.id,
              settings: defaultSettings
            });

          if (!insertError) {
            setSettings(defaultSettings);
          } else {
            console.error('Error creating default notification settings:', insertError);
          }
        } else {
          console.error('Error fetching notification settings:', error);
        }
        return;
      }

      setSettings(data.settings);
    } catch (err) {
      console.error('Error fetching notification settings:', err);
    }
  };

  useEffect(() => {
    if (profile?.id) {
      fetchNotificationSettings();
    }
  }, [profile?.id]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', notificationId);

      if (error) throw error;

      setNotifications(notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      ));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  const handleUpdateSettings = async (newSettings) => {
    try {
      const { error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: profile?.id,
          settings: newSettings
        });

      if (error) throw error;

      setSettings(newSettings);
    } catch (err) {
      console.error('Error updating notification settings:', err);
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = 
      filterType === "all" ||
      filterType === "unread" && !notification.read ||
      notification.type === filterType;
    
    return matchesSearch && matchesFilter;
  });
  
  const unreadCount = notifications.filter(n => !n.read).length;
  
  const handleNotificationClick = (id: string) => {
    handleMarkAsRead(id);
    
    // Navigate based on notification type
    const notification = notifications.find(n => n.id === id);
    if (notification) {
      switch (notification.type) {
        case "bid":
        case "auction":
          navigate("/farmer-auctions");
          break;
        case "order":
          navigate("/farmer-orders");
          break;
        case "shipment":
          navigate("/farmer-shipments");
          break;
        case "appointment":
          navigate("/farmer-appointments");
          break;
        default:
          // Stay on the notifications page
          break;
      }
    }
  };
  
  const markAllAsRead = () => {
    handleUpdateSettings({
      email: {
        ...settings.email,
        bids: true,
        orders: true,
        shipments: true,
        pricingAlerts: true,
        appointments: true,
        promotions: true,
      },
      push: {
        ...settings.push,
        bids: true,
        orders: true,
        shipments: true,
        pricingAlerts: true,
        appointments: true,
        promotions: true,
      }
    });
  };
  
  const updateEmailSetting = (key: keyof typeof settings.email, value: boolean) => {
    handleUpdateSettings({
      ...settings,
      email: {
        ...settings.email,
        [key]: value
      }
    });
  };
  
  const updatePushSetting = (key: keyof typeof settings.push, value: boolean) => {
    handleUpdateSettings({
      ...settings,
      push: {
        ...settings.push,
        [key]: value
      }
    });
  };
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <DashboardLayout userRole="farmer">
      <DashboardHeader title="Notifications" userName="Rajesh Kumar" userRole="farmer" />
      
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center">
          <div>
            <CardTitle>Notifications Center</CardTitle>
            <CardDescription>Manage your notifications and preferences</CardDescription>
          </div>
          {activeTab === "notifications" && unreadCount > 0 && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={markAllAsRead}
              className="mt-4 sm:mt-0"
            >
              <CheckCheck className="mr-2 h-4 w-4" />
              Mark All as Read
            </Button>
          )}
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="notifications">
                Notifications
                {unreadCount > 0 && (
                  <Badge className="ml-2 bg-primary" variant="default">
                    {unreadCount}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="notifications" className="space-y-4 mt-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Search notifications..."
                    className="pl-8"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-full sm:w-[180px]">
                    <SelectValue placeholder="Filter notifications" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Notifications</SelectItem>
                    <SelectItem value="unread">Unread</SelectItem>
                    <SelectItem value="bid">Bids</SelectItem>
                    <SelectItem value="order">Orders</SelectItem>
                    <SelectItem value="shipment">Shipments</SelectItem>
                    <SelectItem value="auction">Auctions</SelectItem>
                    <SelectItem value="alert">Alerts</SelectItem>
                    <SelectItem value="appointment">Appointments</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="border rounded-md overflow-hidden">
                {filteredNotifications.length > 0 ? (
                  <div className="max-h-[600px] overflow-y-auto">
                    {filteredNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        id={notification.id}
                        type={notification.type as any}
                        title={notification.title}
                        message={notification.message}
                        time={notification.time}
                        read={notification.read}
                        onClick={() => handleNotificationClick(notification.id)}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12">
                    <BellOff className="h-12 w-12 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No notifications found</h3>
                    <p className="text-muted-foreground text-center max-w-md mb-4">
                      {searchTerm 
                        ? "No notifications match your search criteria. Try a different search term or filter."
                        : "You don't have any notifications yet. They will appear here when you receive them."}
                    </p>
                    {searchTerm && (
                      <Button variant="outline" onClick={() => setSearchTerm("")}>
                        Clear Search
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-6 mt-4">
              <div>
                <h3 className="text-lg font-medium mb-4">Notification Preferences</h3>
                <p className="text-sm text-muted-foreground mb-6">
                  Choose how and when you receive notifications from AgriTradeConnect
                </p>
                
                <div className="grid gap-6">
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-medium">Email Notifications</h4>
                      <Badge variant="outline">Connected</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">
                      Notifications will be sent to rajesh.kumar@example.com
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-bids" className="flex flex-col">
                          <span>Bid Notifications</span>
                          <span className="font-normal text-sm text-muted-foreground">
                            Get notified when someone bids on your auction
                          </span>
                        </Label>
                        <Switch
                          id="email-bids"
                          checked={settings.email.bids}
                          onCheckedChange={(value) => updateEmailSetting('bids', value)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-orders" className="flex flex-col">
                          <span>Order Updates</span>
                          <span className="font-normal text-sm text-muted-foreground">
                            Get notified about new orders and status changes
                          </span>
                        </Label>
                        <Switch
                          id="email-orders"
                          checked={settings.email.orders}
                          onCheckedChange={(value) => updateEmailSetting('orders', value)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-shipments" className="flex flex-col">
                          <span>Shipment Updates</span>
                          <span className="font-normal text-sm text-muted-foreground">
                            Get notified about shipping status changes
                          </span>
                        </Label>
                        <Switch
                          id="email-shipments"
                          checked={settings.email.shipments}
                          onCheckedChange={(value) => updateEmailSetting('shipments', value)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-pricing" className="flex flex-col">
                          <span>Pricing Alerts</span>
                          <span className="font-normal text-sm text-muted-foreground">
                            Get notified about market price changes
                          </span>
                        </Label>
                        <Switch
                          id="email-pricing"
                          checked={settings.email.pricingAlerts}
                          onCheckedChange={(value) => updateEmailSetting('pricingAlerts', value)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-appointments" className="flex flex-col">
                          <span>Appointment Reminders</span>
                          <span className="font-normal text-sm text-muted-foreground">
                            Get reminders about upcoming appointments
                          </span>
                        </Label>
                        <Switch
                          id="email-appointments"
                          checked={settings.email.appointments}
                          onCheckedChange={(value) => updateEmailSetting('appointments', value)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="email-promotions" className="flex flex-col">
                          <span>Promotions & News</span>
                          <span className="font-normal text-sm text-muted-foreground">
                            Get updates about promotions and platform news
                          </span>
                        </Label>
                        <Switch
                          id="email-promotions"
                          checked={settings.email.promotions}
                          onCheckedChange={(value) => updateEmailSetting('promotions', value)}
                        />
                      </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <div className="flex items-center justify-between">
                      <h4 className="text-base font-medium">Push Notifications</h4>
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Enabled
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 mb-4">
                      Notifications will appear on your device
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="push-bids" className="flex flex-col">
                          <span>Bid Notifications</span>
                          <span className="font-normal text-sm text-muted-foreground">
                            Get notified when someone bids on your auction
                          </span>
                        </Label>
                        <Switch
                          id="push-bids"
                          checked={settings.push.bids}
                          onCheckedChange={(value) => updatePushSetting('bids', value)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="push-orders" className="flex flex-col">
                          <span>Order Updates</span>
                          <span className="font-normal text-sm text-muted-foreground">
                            Get notified about new orders and status changes
                          </span>
                        </Label>
                        <Switch
                          id="push-orders"
                          checked={settings.push.orders}
                          onCheckedChange={(value) => updatePushSetting('orders', value)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="push-shipments" className="flex flex-col">
                          <span>Shipment Updates</span>
                          <span className="font-normal text-sm text-muted-foreground">
                            Get notified about shipping status changes
                          </span>
                        </Label>
                        <Switch
                          id="push-shipments"
                          checked={settings.push.shipments}
                          onCheckedChange={(value) => updatePushSetting('shipments', value)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="push-pricing" className="flex flex-col">
                          <span>Pricing Alerts</span>
                          <span className="font-normal text-sm text-muted-foreground">
                            Get notified about market price changes
                          </span>
                        </Label>
                        <Switch
                          id="push-pricing"
                          checked={settings.push.pricingAlerts}
                          onCheckedChange={(value) => updatePushSetting('pricingAlerts', value)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="push-appointments" className="flex flex-col">
                          <span>Appointment Reminders</span>
                          <span className="font-normal text-sm text-muted-foreground">
                            Get reminders about upcoming appointments
                          </span>
                        </Label>
                        <Switch
                          id="push-appointments"
                          checked={settings.push.appointments}
                          onCheckedChange={(value) => updatePushSetting('appointments', value)}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <Label htmlFor="push-promotions" className="flex flex-col">
                          <span>Promotions & News</span>
                          <span className="font-normal text-sm text-muted-foreground">
                            Get updates about promotions and platform news
                          </span>
                        </Label>
                        <Switch
                          id="push-promotions"
                          checked={settings.push.promotions}
                          onCheckedChange={(value) => updatePushSetting('promotions', value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="outline">Reset to Defaults</Button>
                <Button>Save Preferences</Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default FarmerNotifications;
