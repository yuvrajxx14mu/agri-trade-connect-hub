
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart, Loader2 } from "lucide-react";
import OrderCard from "@/components/OrderCard";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const TraderOrders = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchOrders();

    // Set up real-time subscription for order updates
    const channel = supabase
      .channel('orders-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'orders', filter: `trader_id=eq.${profile?.id}` }, 
        () => { fetchOrders(); }
      )
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'orders', filter: `trader_id=eq.${profile?.id}` }, 
        () => { fetchOrders(); }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);
  
  const fetchOrders = async () => {
    if (!profile?.id) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          created_at,
          status,
          payment_status,
          quantity,
          price,
          total_amount,
          farmer_id,
          profiles(id, name),
          products(id, name, image_url)
        `)
        .eq('trader_id', profile.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: "Error",
        description: "Failed to load orders. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.profiles?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.products?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = 
      (activeTab === "active" && ["pending", "confirmed", "processing", "shipped"].includes(order.status)) ||
      (activeTab === "completed" && ["delivered", "completed", "cancelled"].includes(order.status));
    
    return matchesSearch && matchesTab;
  });
  
  const formatOrderData = (order: any) => {
    return {
      id: order.id,
      orderDate: new Date(order.created_at),
      customer: { 
        name: order.profiles?.name || "Farmer", 
        avatar: "", 
        initials: order.profiles?.name?.split(' ').map((n: string) => n[0]).join('') || "F"
      },
      products: [
        { 
          name: order.products?.name || "Product", 
          quantity: `${order.quantity}`, 
          price: `₹${order.price}/Quintal` 
        }
      ],
      totalAmount: `₹${order.total_amount}`,
      status: order.status,
      paymentStatus: order.payment_status
    };
  };
  
  return (
    <DashboardLayout userRole="trader">
      <DashboardHeader 
        title="Orders" 
        userName={profile?.name || "User"} 
        userRole="trader"
      />
      
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center">
          <div>
            <CardTitle>Order Management</CardTitle>
            <CardDescription>Manage and track all your product orders</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="active">Active Orders</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            <div className="mb-6">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by order ID, farmer, or product..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : filteredOrders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    {...formatOrderData(order)}
                    onClick={() => navigate(`/trader-orders/${order.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <ShoppingCart className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No orders found</h3>
                <p className="text-muted-foreground mb-6">
                  {activeTab === "active" 
                    ? "You don't have any active orders at the moment." 
                    : "You don't have any completed orders yet."}
                </p>
                <Button onClick={() => navigate("/trader-market")}>
                  Browse Products
                </Button>
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default TraderOrders;
