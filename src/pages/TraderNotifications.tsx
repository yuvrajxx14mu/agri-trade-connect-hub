
import { useState } from "react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import NotificationItem from "@/components/NotificationItem";
import { Bell, CheckSquare, Trash2 } from "lucide-react";

const notifications = [
  {
    id: "n1",
    title: "New Auction Available",
    message: "Rajesh Kumar has listed 20 Quintals of Organic Wheat for auction.",
    time: "10 minutes ago",
    type: "auction",
    read: false
  },
  {
    id: "n2",
    title: "Bid Update",
    message: "Your bid for Premium Rice has been outbid by another trader.",
    time: "35 minutes ago",
    type: "bid",
    read: false
  },
  {
    id: "n3",
    title: "Auction Ending Soon",
    message: "An auction for Yellow Lentils you're participating in ends in 2 hours.",
    time: "1 hour ago",
    type: "auction",
    read: false
  },
  {
    id: "n4",
    title: "Order Confirmed",
    message: "Your order #ORD123456 for Organic Wheat has been confirmed.",
    time: "3 hours ago",
    type: "order",
    read: true
  },
  {
    id: "n5",
    title: "Shipment Update",
    message: "Your order #ORD123457 has been shipped and is on the way.",
    time: "5 hours ago",
    type: "shipment",
    read: true
  },
  {
    id: "n6",
    title: "Price Alert",
    message: "Prices for Rice have decreased by 5% in the last 24 hours.",
    time: "Yesterday",
    type: "price",
    read: true
  },
  {
    id: "n7",
    title: "Appointment Reminder",
    message: "You have a product inspection meeting with Meena Patel tomorrow at 10:00 AM.",
    time: "Yesterday",
    type: "appointment",
    read: true
  }
];

const TraderNotifications = () => {
  const [activeTab, setActiveTab] = useState("all");
  const [notificationsList, setNotificationsList] = useState(notifications);
  
  const filteredNotifications = notificationsList.filter(notification => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !notification.read;
    return notification.type === activeTab;
  });
  
  const markAllAsRead = () => {
    setNotificationsList(notificationsList.map(notification => ({
      ...notification,
      read: true
    })));
  };
  
  const markAsRead = (id: string) => {
    setNotificationsList(notificationsList.map(notification => 
      notification.id === id ? { ...notification, read: true } : notification
    ));
  };
  
  const clearAllNotifications = () => {
    setNotificationsList([]);
  };
  
  const unreadCount = notificationsList.filter(n => !n.read).length;
  
  return (
    <DashboardLayout userRole="trader">
      <DashboardHeader title="Notifications" userName="Vikram Sharma" />
      
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center">
          <div>
            <CardTitle className="flex items-center">
              <Bell className="h-5 w-5 mr-2" />
              Notifications Center
              {unreadCount > 0 && (
                <span className="ml-2 text-sm bg-agri-trader text-white rounded-full w-6 h-6 inline-flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </CardTitle>
            <CardDescription>Stay updated with important events</CardDescription>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-2">
            <Button variant="outline" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
              <CheckSquare className="h-4 w-4 mr-2" />
              Mark All Read
            </Button>
            <Button variant="outline" size="sm" onClick={clearAllNotifications} disabled={notificationsList.length === 0}>
              <Trash2 className="h-4 w-4 mr-2" />
              Clear All
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="w-full grid grid-cols-3 md:grid-cols-6 mb-6">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="auction">Auctions</TabsTrigger>
              <TabsTrigger value="bid">Bids</TabsTrigger>
              <TabsTrigger value="order">Orders</TabsTrigger>
              <TabsTrigger value="shipment">Shipments</TabsTrigger>
            </TabsList>
            
            <div className="space-y-1">
              {filteredNotifications.length > 0 ? (
                filteredNotifications.map((notification) => (
                  <NotificationItem
                    key={notification.id}
                    id={notification.id}
                    title={notification.title}
                    message={notification.message}
                    time={notification.time}
                    type={notification.type}
                    read={notification.read}
                    onMarkAsRead={() => markAsRead(notification.id)}
                  />
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                    <Bell className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">No notifications</h3>
                  <p className="text-muted-foreground">
                    {activeTab === "all" 
                      ? "You don't have any notifications at the moment." 
                      : `You don't have any ${activeTab === "unread" ? "unread" : activeTab} notifications.`}
                  </p>
                </div>
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default TraderNotifications;
