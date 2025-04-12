import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ShoppingCart } from "lucide-react";
import OrderCard from "@/components/OrderCard";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { downloadInvoice } from "@/services/pdfService";
import { toast } from "@/components/ui/use-toast";

interface Order {
  id: string;
  created_at: string;
  quantity: number;
  price: number;
  total_amount: number;
  products: {
    name: string;
  };
  trader: {
    name: string;
  };
  farmer: {
    name: string;
  };
}

const FarmerOrders = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchOrders = async () => {
      if (!profile?.id) return;
      
      try {
        const { data: ordersData, error: ordersError } = await supabase
          .from('orders')
          .select('*')
          .eq('farmer_id', profile.id)
          .order('created_at', { ascending: false });
          
        if (ordersError) throw ordersError;
        
        const ordersWithDetails = await Promise.all(
          ordersData.map(async (order) => {
            const { data: traderData } = await supabase
              .from('profiles')
              .select('name')
              .eq('id', order.trader_id)
              .single();
            
            const { data: productData } = await supabase
              .from('products')
              .select('name')
              .eq('id', order.product_id)
              .single();
            
            return {
              ...order,
              profiles: traderData,
              products: productData,
            };
          })
        );

        setOrders(ordersWithDetails);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [profile?.id]);
  
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.profiles?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.products?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
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
        name: order.profiles?.name || "Trader", 
        avatar: "", 
        initials: order.profiles?.name?.split(' ').map((n: string) => n[0]).join('') || "T"
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
  
  const handleGenerateInvoice = async (orderId: string) => {
    try {
      // First get the order details
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (orderError) throw orderError;

      if (!order) {
        throw new Error('Order not found');
      }

      // Get trader details
      const { data: traderData } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', order.trader_id)
        .single();

      // Get product details
      const { data: productData } = await supabase
        .from('products')
        .select('name')
        .eq('id', order.product_id)
        .single();

      // Get farmer details
      const { data: farmerData } = await supabase
        .from('profiles')
        .select('name')
        .eq('id', order.farmer_id)
        .single();

      const invoiceData = {
        orderId: order.id,
        date: new Date(order.created_at).toLocaleDateString(),
        farmerName: farmerData?.name || 'Farmer',
        traderName: traderData?.name || 'Trader',
        items: [{
          name: productData?.name || 'Product',
          quantity: order.quantity,
          price: order.price,
          total: order.total_amount
        }],
        total: order.total_amount
      };

      await downloadInvoice(invoiceData, `invoice-${order.id}.pdf`);
    } catch (error) {
      console.error('Error generating invoice:', error);
      toast({
        title: "Error",
        description: "Failed to generate invoice",
        variant: "destructive"
      });
    }
  };
  
  return (
    <DashboardLayout userRole="farmer">
      <DashboardHeader 
        title="Orders" 
        userName={profile?.name || "User"} 
        userRole="farmer"
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
                  placeholder="Search by order ID, customer, or product..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            {loading ? (
              <div className="text-center py-12">
                <p>Loading orders...</p>
              </div>
            ) : filteredOrders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    {...formatOrderData(order)}
                    onClick={() => navigate(`/farmer-orders/${order.id}`)}
                    onGenerateInvoice={() => handleGenerateInvoice(order.id)}
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
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default FarmerOrders;
