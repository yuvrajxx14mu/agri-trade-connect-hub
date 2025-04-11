import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { User, Truck, Calendar, DollarSign, Package, Clock, CheckCircle2, XCircle, Download, ArrowLeft } from "lucide-react";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";

const getStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "processing":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "completed":
      return "bg-green-50 text-green-700 border-green-200";
    case "cancelled":
      return "bg-red-50 text-red-700 border-red-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

const getPaymentStatusColor = (status: string) => {
  switch (status) {
    case "pending":
      return "bg-yellow-50 text-yellow-700 border-yellow-200";
    case "processing":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "completed":
      return "bg-green-50 text-green-700 border-green-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
};

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [otherParty, setOtherParty] = useState<any>(null);
  
  const userPath = location.pathname.includes('farmer') ? 'farmer' : 'trader';
  const userRole = userPath as "farmer" | "trader";

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!id || !profile?.id) return;
      
      try {
        setLoading(true);
        
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select(`
            *,
            product:product_id (
              name,
              category,
              description,
              unit,
              quality,
              location,
              image_url
            )
          `)
          .eq('id', id)
          .single();
        
        if (orderError) throw orderError;

        // Fetch farmer profile
        const { data: farmerData, error: farmerError } = await supabase
          .from('profiles')
          .select('id, name, phone, address, city, state, pincode')
          .eq('id', orderData.farmer_id)
          .single();

        if (farmerError) throw farmerError;

        // Fetch trader profile
        const { data: traderData, error: traderError } = await supabase
          .from('profiles')
          .select('id, name, phone, address, city, state, pincode')
          .eq('id', orderData.trader_id)
          .single();

        if (traderError) throw traderError;

        // Combine all data
        const completeOrderData = {
          ...orderData,
          farmer: farmerData,
          trader: traderData
        };
        
        setOrder(completeOrderData);
        
        if (userRole === 'farmer') {
          setOtherParty(completeOrderData.trader);
        } else {
          setOtherParty(completeOrderData.farmer);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching order details:', error);
        toast({
          title: "Error",
          description: "Failed to load order details",
          variant: "destructive"
        });
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [id, profile?.id, toast, userRole]);

  const handleUpdateOrderStatus = async (newStatus: string) => {
    if (!id || !profile?.id) return;
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      setOrder({ ...order, status: newStatus });
      
      toast({
        title: "Success",
        description: `Order status updated to ${newStatus}`,
        variant: "default"
      });
      
      await supabase
        .from('notifications')
        .insert({
          user_id: userRole === 'farmer' ? order.trader_id : order.farmer_id,
          title: "Order Status Updated",
          message: `Order #${id.slice(0, 8)} status has been updated to ${newStatus}`,
          type: "order_update",
          read: false
        });
        
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    }
  };

  const handleUpdatePaymentStatus = async (newStatus: string) => {
    if (!id || !profile?.id || userRole !== 'trader') return;
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          payment_status: newStatus,
          payment_date: newStatus === 'completed' ? new Date().toISOString() : order.payment_date
        })
        .eq('id', id);
      
      if (error) throw error;
      
      setOrder({ 
        ...order, 
        payment_status: newStatus,
        payment_date: newStatus === 'completed' ? new Date().toISOString() : order.payment_date
      });
      
      toast({
        title: "Success",
        description: `Payment status updated to ${newStatus}`,
        variant: "default"
      });
      
      await supabase
        .from('notifications')
        .insert({
          user_id: order.farmer_id,
          title: "Payment Status Updated",
          message: `Payment for Order #${id.slice(0, 8)} has been updated to ${newStatus}`,
          type: "payment_update",
          read: false
        });
        
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast({
        title: "Error",
        description: "Failed to update payment status",
        variant: "destructive"
      });
    }
  };

  const handleDownloadInvoice = () => {
    toast({
      title: "Feature Coming Soon",
      description: "The invoice download functionality will be available soon",
      variant: "default"
    });
  };

  if (loading) {
    return (
      <DashboardLayout userRole={userRole}>
        <DashboardHeader title="Order Details" userName={profile?.name || ""} userRole={userRole} />
        <div className="flex items-center justify-center h-[400px]">
          <Clock className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  if (!order) {
    return (
      <DashboardLayout userRole={userRole}>
        <DashboardHeader title="Order Details" userName={profile?.name || ""} userRole={userRole} />
        <Card>
          <CardContent className="flex flex-col items-center justify-center h-[400px]">
            <XCircle className="h-12 w-12 text-destructive mb-4" />
            <h2 className="text-xl font-semibold mb-2">Order Not Found</h2>
            <p className="text-muted-foreground mb-4">The order you are looking for does not exist or you don't have permission to view it.</p>
            <Button onClick={() => navigate(`/${userRole}-orders`)}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
          </CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole={userRole}>
      <DashboardHeader title="Order Details" userName={profile?.name || ""} userRole={userRole} />
      
      <div className="flex items-center justify-between mb-6">
        <Button variant="outline" onClick={() => navigate(`/${userRole}-orders`)}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Orders
        </Button>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleDownloadInvoice}>
            <Download className="h-4 w-4 mr-2" />
            Download Invoice
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
              <CardDescription>Details about this order</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Order ID</p>
                  <p className="text-sm text-muted-foreground">{id}</p>
                </div>
                <div>
                  <p className="text-sm font-medium">Date</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge variant="outline" className={getStatusColor(order.status)}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-medium">Payment Status</p>
                  <Badge variant="outline" className={getPaymentStatusColor(order.payment_status)}>
                    {order.payment_status.charAt(0).toUpperCase() + order.payment_status.slice(1)}
                  </Badge>
                </div>
                {order.payment_date && (
                  <div>
                    <p className="text-sm font-medium">Payment Date</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.payment_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
                {order.delivery_date && (
                  <div>
                    <p className="text-sm font-medium">Delivery Date</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(order.delivery_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
            {userRole === 'trader' && (
              <CardFooter className="flex-col items-start space-y-2">
                <p className="text-sm font-medium">Update Payment Status</p>
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant={order.payment_status === 'pending' ? "default" : "outline"}
                    onClick={() => handleUpdatePaymentStatus('pending')}
                  >
                    Pending
                  </Button>
                  <Button 
                    size="sm" 
                    variant={order.payment_status === 'processing' ? "default" : "outline"}
                    onClick={() => handleUpdatePaymentStatus('processing')}
                  >
                    Processing
                  </Button>
                  <Button 
                    size="sm" 
                    variant={order.payment_status === 'completed' ? "default" : "outline"}
                    onClick={() => handleUpdatePaymentStatus('completed')}
                  >
                    Completed
                  </Button>
                </div>
              </CardFooter>
            )}
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{userRole === 'farmer' ? 'Trader' : 'Farmer'} Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${otherParty?.name}`} 
                    alt={otherParty?.name} 
                  />
                  <AvatarFallback>
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium">{otherParty?.name}</p>
                  <p className="text-xs text-muted-foreground capitalize">{userRole === 'farmer' ? 'Trader' : 'Farmer'}</p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="space-y-2">
                {otherParty?.phone && (
                  <div>
                    <p className="text-xs font-medium">Phone</p>
                    <p className="text-sm">{otherParty.phone}</p>
                  </div>
                )}
                {otherParty?.address && (
                  <div>
                    <p className="text-xs font-medium">Address</p>
                    <p className="text-sm">
                      {otherParty.address}
                      {otherParty.city && `, ${otherParty.city}`}
                      {otherParty.state && `, ${otherParty.state}`}
                      {otherParty.pincode && ` - ${otherParty.pincode}`}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="w-full md:w-1/3">
                  <div className="aspect-square bg-muted rounded-md overflow-hidden mb-4">
                    {order.product.image_url ? (
                      <img 
                        src={order.product.image_url} 
                        alt={order.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-16 w-16 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="w-full md:w-2/3">
                  <h3 className="text-lg font-medium mb-2">{order.product.name}</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-sm font-medium">Category</p>
                      <p className="text-sm text-muted-foreground">{order.product.category}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Quality</p>
                      <p className="text-sm text-muted-foreground">{order.product.quality}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">{order.product.location}</p>
                    </div>
                  </div>
                  {order.product.description && (
                    <div className="mb-4">
                      <p className="text-sm font-medium">Description</p>
                      <p className="text-sm text-muted-foreground">{order.product.description}</p>
                    </div>
                  )}
                  <Separator className="my-4" />
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm font-medium">Price</p>
                      <p className="text-sm text-muted-foreground">
                        {formatCurrency(order.price)}/{order.product.unit}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm font-medium">Quantity</p>
                      <p className="text-sm text-muted-foreground">
                        {order.quantity} {order.product.unit}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm font-medium">Total Amount</p>
                      <p className="text-lg font-bold">
                        {formatCurrency(order.total_amount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Order Actions</CardTitle>
              <CardDescription>
                Manage this order
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium mb-2">Update Order Status</p>
                  <div className="flex flex-wrap gap-2">
                    {['pending', 'processing', 'completed', 'cancelled'].map((status) => (
                      <Button
                        key={status}
                        variant={order.status === status ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleUpdateOrderStatus(status)}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
                
                {order.notes && (
                  <div>
                    <p className="text-sm font-medium mb-2">Order Notes</p>
                    <p className="text-sm text-muted-foreground p-3 bg-muted rounded-md">
                      {order.notes}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrderDetail;
