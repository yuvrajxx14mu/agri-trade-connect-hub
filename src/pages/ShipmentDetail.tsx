
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
  MessageCircle,
  Package,
  FileText,
  Truck,
  AlertCircle,
  CheckCircle,
  Clock,
  MapPin,
  Download,
  Phone
} from "lucide-react";

const ShipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userRole, setUserRole] = useState<"farmer" | "trader">("farmer");
  
  // In a real app, we would fetch the shipment data based on the ID
  const shipment = {
    id: id || "SHP123456",
    orderRef: "ORD123456",
    date: new Date(2025, 3, 5),
    customer: { name: "Vikram Sharma", avatar: "", initials: "VS", phone: "+91 98765 43210" },
    seller: { name: "Rajesh Kumar", avatar: "", initials: "RK", phone: "+91 98765 12345" },
    products: [
      { name: "Organic Wheat", quantity: "20", price: "₹2,200/Quintal" }
    ],
    deliveryAddress: "123, Green Valley Farms, Sector 14, Gurugram, Haryana - 122001",
    expectedDelivery: "April 15, 2025",
    actualDelivery: null,
    status: "in-transit" as "pending" | "processing" | "in-transit" | "delivered" | "cancelled",
    trackingNumber: "TRK789654321",
    carrier: "AgriExpress Logistics",
    currentLocation: "Delhi Distribution Center",
    lastUpdated: "April 8, 2025, 10:30 AM",
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
  
  const handleMarkAsDelivered = () => {
    toast({
      title: "Shipment Delivered",
      description: "Shipment #" + shipment.id + " has been marked as delivered.",
    });
    
    // In a real app, we would make API call here
  };
  
  const getStatusColor = (status: string) => {
    switch(status) {
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "processing":
        return "bg-orange-50 text-orange-700 border-orange-200";
      case "in-transit":
        return "bg-blue-50 text-blue-700 border-blue-200";
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
      case "pending":
        return <Clock className="h-4 w-4 mr-1" />;
      case "processing":
        return <Package className="h-4 w-4 mr-1" />;
      case "in-transit":
        return <Truck className="h-4 w-4 mr-1" />;
      case "delivered":
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case "cancelled":
        return <AlertCircle className="h-4 w-4 mr-1" />;
      default:
        return <Clock className="h-4 w-4 mr-1" />;
    }
  };
  
  const shipmentsPath = userRole === "farmer" ? "/farmer-shipments" : "/trader-shipments";
  const userName = userRole === "farmer" ? "Rajesh Kumar" : "Vikram Sharma";
  const counterparty = userRole === "farmer" ? shipment.customer : shipment.seller;
  
  return (
    <DashboardLayout userRole={userRole}>
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate(shipmentsPath)} 
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Shipments
        </Button>
        
        <DashboardHeader 
          title="Shipment Details" 
          userName={userName} 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shipment Details Card */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl">Shipment #{shipment.id}</CardTitle>
                  <div className="text-sm text-muted-foreground mt-1">
                    <span>Order #{shipment.orderRef} • Shipped on {shipment.date.toLocaleDateString("en-IN", { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                  </div>
                </div>
                <Badge 
                  variant="outline"
                  className={getStatusColor(shipment.status)}
                >
                  <span className="flex items-center">
                    {getStatusIcon(shipment.status)}
                    {shipment.status === "in-transit" ? "In Transit" : shipment.status.charAt(0).toUpperCase() + shipment.status.slice(1)}
                  </span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-8">
              <Tabs defaultValue="tracking">
                <TabsList>
                  <TabsTrigger value="tracking">Tracking</TabsTrigger>
                  <TabsTrigger value="items">Items</TabsTrigger>
                  <TabsTrigger value="details">Details</TabsTrigger>
                </TabsList>
                
                <TabsContent value="tracking" className="mt-6">
                  <div className="space-y-6">
                    {/* Current Status */}
                    <div className="bg-muted/30 border rounded-md p-4">
                      <div className="flex items-start space-x-4">
                        <div className={`mt-0.5 h-8 w-8 rounded-full ${shipment.status === "in-transit" ? "bg-blue-100" : "bg-muted"} flex items-center justify-center`}>
                          <Truck className={`h-4 w-4 ${shipment.status === "in-transit" ? "text-blue-600" : "text-muted-foreground"}`} />
                        </div>
                        <div>
                          <div className="font-medium">Current Location</div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {shipment.currentLocation}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            Last updated: {shipment.lastUpdated}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Shipment Timeline */}
                    <div className="border rounded-md p-4">
                      <div className="text-sm font-medium mb-4">Shipment Timeline</div>
                      <div className="space-y-6">
                        <div className="flex items-start">
                          <div className={`mt-0.5 h-8 w-8 rounded-full ${["pending", "processing", "in-transit", "delivered"].includes(shipment.status) ? "bg-green-100" : "bg-muted"} flex items-center justify-center`}>
                            <CheckCircle className={`h-4 w-4 ${["pending", "processing", "in-transit", "delivered"].includes(shipment.status) ? "text-green-600" : "text-muted-foreground"}`} />
                          </div>
                          <div className="ml-3">
                            <div className="font-medium">Order Confirmed</div>
                            <div className="text-sm text-muted-foreground">
                              {shipment.date.toLocaleDateString("en-IN", { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className={`mt-0.5 h-8 w-8 rounded-full ${["processing", "in-transit", "delivered"].includes(shipment.status) ? "bg-green-100" : "bg-muted"} flex items-center justify-center`}>
                            <CheckCircle className={`h-4 w-4 ${["processing", "in-transit", "delivered"].includes(shipment.status) ? "text-green-600" : "text-muted-foreground"}`} />
                          </div>
                          <div className="ml-3">
                            <div className="font-medium">Packaging Complete</div>
                            <div className="text-sm text-muted-foreground">
                              April 6, 2025, 9:00 AM
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className={`mt-0.5 h-8 w-8 rounded-full ${["in-transit", "delivered"].includes(shipment.status) ? "bg-green-100" : "bg-muted"} flex items-center justify-center`}>
                            <CheckCircle className={`h-4 w-4 ${["in-transit", "delivered"].includes(shipment.status) ? "text-green-600" : "text-muted-foreground"}`} />
                          </div>
                          <div className="ml-3">
                            <div className="font-medium">Shipped</div>
                            <div className="text-sm text-muted-foreground">
                              April 7, 2025, 11:30 AM
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className={`mt-0.5 h-8 w-8 rounded-full ${shipment.status === "in-transit" ? "bg-blue-100" : shipment.status === "delivered" ? "bg-green-100" : "bg-muted"} flex items-center justify-center`}>
                            {shipment.status === "in-transit" ? (
                              <Truck className="h-4 w-4 text-blue-600" />
                            ) : shipment.status === "delivered" ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Clock className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="font-medium">In Transit</div>
                            <div className="text-sm text-muted-foreground">
                              April 8, 2025, 10:30 AM
                            </div>
                            {shipment.status === "in-transit" && (
                              <div className="text-sm text-blue-600 mt-1">
                                Current Status: At {shipment.currentLocation}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-start">
                          <div className={`mt-0.5 h-8 w-8 rounded-full ${shipment.status === "delivered" ? "bg-green-100" : "bg-muted"} flex items-center justify-center`}>
                            {shipment.status === "delivered" ? (
                              <CheckCircle className="h-4 w-4 text-green-600" />
                            ) : (
                              <Clock className="h-4 w-4 text-muted-foreground" />
                            )}
                          </div>
                          <div className="ml-3">
                            <div className="font-medium">Delivered</div>
                            <div className="text-sm text-muted-foreground">
                              {shipment.status === "delivered" ? 
                                (shipment.actualDelivery || "April 15, 2025") : 
                                `Expected by ${shipment.expectedDelivery}`}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="items" className="mt-6">
                  <div className="space-y-6">
                    {/* Items List */}
                    <div className="border rounded-md">
                      <div className="bg-muted p-4 rounded-t-md">
                        <div className="grid grid-cols-12 text-sm font-medium">
                          <div className="col-span-6">Product</div>
                          <div className="col-span-3 text-center">Quantity</div>
                          <div className="col-span-3 text-right">Unit Price</div>
                        </div>
                      </div>
                      <div className="p-4 space-y-4">
                        {shipment.products.map((product, index) => (
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
                            <div className="col-span-3 text-center">{product.quantity}</div>
                            <div className="col-span-3 text-right">{product.price}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Order Reference */}
                    <div className="border rounded-md p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="text-sm font-medium">Order Reference</div>
                          <div className="text-sm text-muted-foreground mt-1">#{shipment.orderRef}</div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => {
                          const path = userRole === "farmer" ? "/farmer-orders/" : "/trader-orders/";
                          navigate(path + shipment.orderRef);
                        }}>
                          View Order
                        </Button>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="details" className="mt-6">
                  <div className="space-y-6">
                    {/* Delivery Information */}
                    <div className="border rounded-md p-4">
                      <div className="text-sm font-medium mb-3">Delivery Information</div>
                      <div className="space-y-4">
                        <div>
                          <div className="text-sm text-muted-foreground">Delivery Address</div>
                          <div className="font-medium mt-1">{shipment.deliveryAddress}</div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Expected Delivery</div>
                            <div className="font-medium mt-1">{shipment.expectedDelivery}</div>
                          </div>
                          {shipment.actualDelivery && (
                            <div>
                              <div className="text-sm text-muted-foreground">Actual Delivery</div>
                              <div className="font-medium mt-1">{shipment.actualDelivery}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Carrier Information */}
                    <div className="border rounded-md p-4">
                      <div className="text-sm font-medium mb-3">Carrier Information</div>
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground">Carrier</div>
                            <div className="font-medium mt-1">{shipment.carrier}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Tracking Number</div>
                            <div className="font-medium mt-1">{shipment.trackingNumber}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Notes */}
                    {shipment.notes && (
                      <div className="border rounded-md p-4">
                        <div className="text-sm font-medium mb-2">Shipment Notes</div>
                        <div className="text-sm text-muted-foreground">
                          {shipment.notes}
                        </div>
                      </div>
                    )}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-6">
              {userRole === "trader" && shipment.status === "in-transit" && (
                <Button onClick={handleMarkAsDelivered}>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Confirm Delivery
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
                <div className="flex items-center">
                  <Phone className="h-4 w-4 text-muted-foreground mr-2" />
                  <span className="text-sm">{counterparty.phone}</span>
                </div>
                
                <Button variant="outline" className="w-full">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contact {userRole === "farmer" ? "Customer" : "Seller"}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Delivery Address Card */}
          <Card>
            <CardHeader>
              <CardTitle>Delivery Address</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-start space-x-3">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div className="text-sm">{shipment.deliveryAddress}</div>
              </div>
              
              <div className="mt-6 space-y-4">
                <Button variant="outline" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Download Shipping Label
                </Button>
                
                <Button variant="outline" className="w-full">
                  <Truck className="mr-2 h-4 w-4" />
                  Track on Carrier Website
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ShipmentDetail;
