import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Package, Tag, MapPin, Calendar, CreditCard, Truck, CheckCircle2, XCircle } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

const TraderOrderDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [order, setOrder] = useState<any>(null);
  const [product, setProduct] = useState<any>(null);
  const [farmer, setFarmer] = useState<any>(null);
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      try {
        // Fetch order details
        const { data: orderData, error: orderError } = await supabase
          .from("orders")
          .select("*")
          .eq("id", id)
          .single();
          
        if (orderError) throw orderError;
        
        if (!orderData) {
          toast({
            title: "Error",
            description: "Order not found",
            variant: "destructive"
          });
          navigate("/trader-orders");
          return;
        }

        // Fetch product details
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("*")
          .eq("id", orderData.product_id)
          .single();

        if (productError) throw productError;

        // Fetch farmer details
        const { data: farmerData, error: farmerError } = await supabase
          .from("profiles")
          .select("id, name, phone, address, city, state, pincode")
          .eq("id", orderData.farmer_id)
          .single();

        if (farmerError) throw farmerError;

        setOrder(orderData);
        setProduct(productData);
        setFarmer(farmerData);
      } catch (error) {
        console.error("Error fetching order details:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch order details. Please try again.",
        });
        navigate("/trader-orders");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) fetchOrderDetails();
  }, [id, navigate, toast]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!order) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", order.id);

      if (error) throw error;

      setOrder({ ...order, status: newStatus });
      toast({
        title: "Success",
        description: `Order status updated to ${newStatus}`,
        variant: "default"
      });
    } catch (error) {
      console.error("Error updating order status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update order status. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePaymentUpdate = async (newPaymentStatus: string) => {
    if (!order) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from("orders")
        .update({ 
          payment_status: newPaymentStatus,
          payment_date: newPaymentStatus === "paid" ? new Date().toISOString() : null
        })
        .eq("id", order.id);

      if (error) throw error;

      setOrder({ 
        ...order, 
        payment_status: newPaymentStatus,
        payment_date: newPaymentStatus === "paid" ? new Date().toISOString() : null
      });
      toast({
        title: "Success",
        description: `Payment status updated to ${newPaymentStatus}`,
        variant: "default"
      });
    } catch (error) {
      console.error("Error updating payment status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update payment status. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout userRole="trader">
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  if (!order || !product || !farmer) {
    return null;
  }

  return (
    <DashboardLayout userRole="trader">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate(`/trader-orders`)} 
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
        
        <DashboardHeader 
          title={`Order #${order.id}`} 
          userName={profile?.name || "User"} 
          userRole="trader"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Order Information</CardTitle>
              <CardDescription>
                Details about your order and its current status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Order Status</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant={order.status === "completed" ? "default" : "secondary"}>
                      {order.status}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Payment Status</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant={order.payment_status === "paid" ? "default" : "secondary"}>
                      {order.payment_status}
                    </Badge>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <Package className="h-6 w-6 text-muted-foreground" />
                  <div>
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {order.quantity} {product.unit} × {formatCurrency(product.price)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Tag className="h-6 w-6 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Total Amount</div>
                    <div className="text-2xl font-bold">
                      {formatCurrency(order.total_amount)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Order Date</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(order.created_at)}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button
                variant="outline"
                onClick={() => handleStatusUpdate("cancelled")}
                disabled={order.status === "completed" || order.status === "cancelled" || isLoading}
              >
                <XCircle className="mr-2 h-4 w-4" />
                Cancel Order
              </Button>
              <Button
                onClick={() => handleStatusUpdate("completed")}
                disabled={order.status === "completed" || order.status === "cancelled" || isLoading}
              >
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Mark as Completed
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Payment Information</CardTitle>
              <CardDescription>
                Manage payment status and details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <CreditCard className="h-6 w-6 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Payment Status</div>
                    <div className="text-sm text-muted-foreground">
                      {order.payment_status === "paid" ? "Paid" : "Pending"}
                    </div>
                  </div>
                </div>

                {order.payment_date && (
                  <div className="flex items-center gap-4">
                    <Calendar className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <div className="font-medium">Payment Date</div>
                      <div className="text-sm text-muted-foreground">
                        {formatDate(order.payment_date)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={() => handlePaymentUpdate("paid")}
                disabled={order.payment_status === "paid" || isLoading}
                className="w-full"
              >
                <CreditCard className="mr-2 h-4 w-4" />
                Mark as Paid
              </Button>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Farmer Information</CardTitle>
              <CardDescription>
                Contact details of the farmer
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div>
                  <div className="font-medium">{farmer.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {farmer.phone}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <MapPin className="h-6 w-6 text-muted-foreground" />
                <div>
                  <div className="font-medium">Address</div>
                  <div className="text-sm text-muted-foreground">
                    {farmer.address}, {farmer.city}, {farmer.state} - {farmer.pincode}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Delivery Information</CardTitle>
              <CardDescription>
                Track your order delivery
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Truck className="h-6 w-6 text-muted-foreground" />
                <div>
                  <div className="font-medium">Delivery Status</div>
                  <div className="text-sm text-muted-foreground">
                    {order.status === "completed" ? "Delivered" : "In Transit"}
                  </div>
                </div>
              </div>

              {order.delivery_date && (
                <div className="flex items-center gap-4">
                  <Calendar className="h-6 w-6 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Delivery Date</div>
                    <div className="text-sm text-muted-foreground">
                      {formatDate(order.delivery_date)}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TraderOrderDetails; 