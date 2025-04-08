
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  ArrowLeft,
  Calendar,
  CreditCard,
  FileText,
  MessageCircle,
  Package,
  ShieldCheck,
  Truck,
  AlertCircle,
  CheckCircle,
  Clock,
  Download
} from "lucide-react";

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<"farmer" | "trader">("farmer");
  
  // In a real app, we would fetch the order data based on the ID
  const order = {
    id: id || "ORD123456",
    date: new Date(2025, 3, 5),
    customer: { name: "Vikram Sharma", avatar: "", initials: "VS" },
    seller: { name: "Rajesh Kumar", avatar: "", initials: "RK" },
    products: [
      { name: "Organic Wheat", quantity: "20", price: "₹2,200/Quintal" }
    ],
    subtotal: "₹44,000",
    deliveryFee: "₹2,000",
    totalAmount: "₹46,000",
    status: "confirmed" as "confirmed" | "pending" | "shipped" | "delivered" | "cancelled",
    paymentStatus: "paid",
    paymentMethod: "UPI",
    paymentReference: "UPI/123456789",
    deliveryAddress: "123, Green Valley Farms, Sector 14, Gurugram, Haryana - 122001",
    estimatedDelivery: "April 15, 2025",
    trackingNumber: "TRK789654321",
    notes: "Please deliver during daytime hours only."
  };

  // Set user role based on URL path
  useState(() => {
    const path = window.location.pathname;
    if (path.includes("farmer")) {
      setUserRole("farmer");
    } else {
      setUserRole("trader");
    }
  });
  
  const handleCancelOrder = () => {
    toast({
      title: "Order Cancelled",
      description: "Order #" + order.id + " has been cancelled.",
      variant: "destructive"
    });
    
    // In a real app, we would make API call here
    
    // Navigate back to orders page
    if (userRole === "farmer") {
      navigate("/farmer-orders");
    } else {
      navigate("/trader-orders");
    }
  };
  
  const handleMarkAsShipped = () => {
    toast({
      title: "Order Marked as Shipped",
      description: "Order #" + order.id + " has been marked as shipped.",
    });
    
    // In a real app, we would make API call here
  };
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case "confirmed":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "processing":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "shipped":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "delivered":
        return "bg-green-50 text-green-700 border-green-200";
      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };
  
  const getStatusIcon = (status: string) => {
    switch(status) {
      case "confirmed":
        return <Clock className="h-4 w-4 mr-1" />;
      case "processing":
        return <Clock className="h-4 w-4 mr-1" />;
      case "shipped":
        return <Truck className="h-4 w-4 mr-1" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case "cancelled":
        return <AlertCircle className="h-4 w-4 mr-1" />;
      default:
        return <Clock className="h-4 w-4 mr-1" />;
    }
  };
  
  const getPaymentStatusColor = (status: string) => {
    switch(status) {
      case "paid":
        return "bg-green-50 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "failed":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };
  
  const ordersPath = userRole === "farmer" ? "/farmer-orders" : "/trader-orders";
  const userName = userRole === "farmer" ? "Rajesh Kumar" : "Vikram Sharma";
  const counterparty = userRole === "farmer" ? order.customer : order.seller;
  
  return (
    <DashboardLayout userRole={userRole}>
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate(ordersPath)} 
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
        
        <DashboardHeader 
          title="Order Details" 
          userName={userName} 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Details Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">Order #{order.id}</CardTitle>
                  <div className="text-sm text-muted-foreground mt-1">
                    <span>Placed on {order.date.toLocaleDateString("en-IN", { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Badge 
                    variant="outline"
                    className={getStatusColor(order.status)}
                  >
                    <span className="flex items-center">
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </Badge>
                  <Badge 
                    variant="outline"
                    className={getPaymentStatusColor(order.paymentStatus)}
                  >
                    {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <Tabs defaultValue="items">
                <TabsList>
                  <TabsTrigger value="items">Items</TabsTrigger>
                  <TabsTrigger value="shipment">Shipment</TabsTrigger>
                  <TabsTrigger value="payment">Payment</TabsTrigger>
                </TabsList>
                
                <TabsContent value="items" className="mt-6">
                  <div className="space-y-6">
                    {/* Items List */}
                    <div className="border rounded-md">
                      <div className="bg-muted p-4 rounded-t-md">
                        <div className="grid grid-cols-12 text-sm font-medium">
                          <div className="col-span-6">Product</div>
                          <div className="col-span-2 text-center">Quantity</div>
                          <div className="col-span-2 text-center">Unit Price</div>
                          <div className="col-span-2 text-right">Total</div>
                        </div>
                      </div>
                      <div className="p-4 space-y-4">
                        {order.products.map((product, index) => (
                          <div key={index} className="grid grid-cols-12 items-center">
                            <div className="col-span-6">
                              <div className="flex items-center">
                                <div className="h-12 w-12 bg-muted rounded-md flex items-center justify-center mr-3">
                                  <Package className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <div>
                                  <div className="font-medium">{product.name}</div>
                                </div>
                              </div>
                            </div>
                            <div className="col-span-2 text-center">{product.quantity}</div>
                            <div className="col-span-2 text-center">{product.price}</div>
                            <div className="col-span-2 text-right">{order.subtotal}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Order Summary */}
                    <div className="border rounded-md p-4">
                      <div className="text-sm font-medium mb-3">Order Summary</div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>Subtotal</span>
                          <span>{order.subtotal}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>Delivery Fee</span>
                          <span>{order.deliveryFee}</span>
                        </div>
                        <Separator className="my-2" />
                        <div className="flex justify-between font-medium">
                          <span>Total</span>
                          <span>{order.totalAmount}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Notes */}
                    {order.notes && (
                      <div className="border rounded-md p-4">
                        <div className="text-sm font-medium mb-2">Order Notes</div>
                        <div className="text-sm text-muted-foreground">
                          {order.notes}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
                
                <TabsContent value="shipment" className="mt-6">
                  <div className="space-y-6">
                    {/* Delivery Information */}
                    <div className="border rounded-md p-4">
                      <div className="text-sm font-medium mb-3">Delivery Information</div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Delivery Address</div>
                            <div className="font-medium mt-1">{order.deliveryAddress}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Estimated Delivery</div>
                            <div className="font-medium mt-1">{order.estimatedDelivery}</div>
                          </div>
                        </div>
                        {order.trackingNumber && (
                          <div>
                            <div className="text-sm text-muted-foreground">Tracking Number</div>
                            <div className="font-medium mt-1">{order.trackingNumber}</div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Shipment Status */}
                    <div className="border rounded-md p-4">
                      <div className="text-sm font-medium mb-3">Shipment Status</div>
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className={`h-8 w-8 rounded-full ${order.status === "confirmed" || order.status === "processing" || order.status === "shipped" || order.status === "delivered" ? "bg-green-100" : "bg-muted"} flex items-center justify-center`}>
                              <CheckCircle className={`h-4 w-4 ${order.status === "confirmed" || order.status === "processing" || order.status === "shipped" || order.status === "delivered" ? "text-green-600" : "text-muted-foreground"}`} />
                            </div>
                            <div className="ml-3">
                              <div className="font-medium">Order Confirmed</div>
                              <div className="text-sm text-muted-foreground">
                                {order.date.toLocaleDateString("en-IN", { year: 'numeric', month: 'long', day: 'numeric' })}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className={`h-8 w-8 rounded-full ${order.status === "processing" || order.status === "shipped" || order.status === "delivered" ? "bg-green-100" : "bg-muted"} flex items-center justify-center`}>
                              <CheckCircle className={`h-4 w-4 ${order.status === "processing" || order.status === "shipped" || order.status === "delivered" ? "text-green-600" : "text-muted-foreground"}`} />
                            </div>
                            <div className="ml-3">
                              <div className="font-medium">Processing</div>
                              <div className="text-sm text-muted-foreground">
                                Order is being prepared for shipping
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className={`h-8 w-8 rounded-full ${order.status === "shipped" || order.status === "delivered" ? "bg-green-100" : "bg-muted"} flex items-center justify-center`}>
                              <CheckCircle className={`h-4 w-4 ${order.status === "shipped" || order.status === "delivered" ? "text-green-600" : "text-muted-foreground"}`} />
                            </div>
                            <div className="ml-3">
                              <div className="font-medium">Shipped</div>
                              <div className="text-sm text-muted-foreground">
                                Order has been shipped
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex justify-between items-center">
                          <div className="flex items-center">
                            <div className={`h-8 w-8 rounded-full ${order.status === "delivered" ? "bg-green-100" : "bg-muted"} flex items-center justify-center`}>
                              <CheckCircle className={`h-4 w-4 ${order.status === "delivered" ? "text-green-600" : "text-muted-foreground"}`} />
                            </div>
                            <div className="ml-3">
                              <div className="font-medium">Delivered</div>
                              <div className="text-sm text-muted-foreground">
                                Order has been delivered
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="payment" className="mt-6">
                  <div className="space-y-6">
                    {/* Payment Information */}
                    <div className="border rounded-md p-4">
                      <div className="text-sm font-medium mb-3">Payment Information</div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Payment Method</div>
                            <div className="font-medium mt-1">{order.paymentMethod}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Payment Status</div>
                            <div className="font-medium mt-1">
                              <Badge 
                                variant="outline"
                                className={getPaymentStatusColor(order.paymentStatus)}
                              >
                                {order.paymentStatus.charAt(0).toUpperCase() + order.paymentStatus.slice(1)}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        
                        {order.paymentReference && (
                          <div>
                            <div className="text-sm text-muted-foreground">Payment Reference</div>
                            <div className="font-medium mt-1">{order.paymentReference}</div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Download Invoice */}
                    <Button variant="outline" className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      Download Invoice
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              {userRole === "farmer" && order.status !== "cancelled" && (
                <div className="flex space-x-3">
                  {(order.status === "confirmed" || order.status === "processing") && (
                    <Button onClick={handleMarkAsShipped}>
                      <Truck className="mr-2 h-4 w-4" />
                      Mark as Shipped
                    </Button>
                  )}
                  
                  {order.status !== "delivered" && order.status !== "shipped" && (
                    <Button variant="outline" onClick={handleCancelOrder}>
                      Cancel Order
                    </Button>
                  )}
                </div>
              )}
              
              {userRole === "trader" && order.status !== "cancelled" && order.status !== "delivered" && (
                <Button variant="outline" onClick={handleCancelOrder}>
                  Cancel Order
                </Button>
              )}
              
              <Button variant="outline">
                <MessageCircle className="mr-2 h-4 w-4" />
                Contact {userRole === "farmer" ? "Customer" : "Seller"}
              </Button>
            </CardFooter>
          </Card>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer/Seller Card */}
          <Card>
            <CardHeader>
              <CardTitle>{userRole === "farmer" ? "Customer" : "Seller"} Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={counterparty.avatar} alt={counterparty.name} />
                  <AvatarFallback>{counterparty.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{counterparty.name}</div>
                </div>
              </div>
              
              <div className="mt-6 space-y-4">
                <Button variant="outline" className="w-full">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contact {userRole === "farmer" ? "Customer" : "Seller"}
                </Button>
                
                <Button variant="outline" className="w-full">
                  <FileText className="mr-2 h-4 w-4" />
                  View Past Orders
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Order Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Order Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Download Invoice
              </Button>
              
              {order.trackingNumber && (
                <Button variant="outline" className="w-full">
                  <Truck className="mr-2 h-4 w-4" />
                  Track Shipment
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrderDetail;
