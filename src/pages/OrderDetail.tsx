
import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { 
  ChevronLeft, 
  PackageCheck, 
  Truck, 
  ExternalLink, 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  FileText, 
  Printer,
  Download,
  UserCircle,
  Package,
  Phone,
  Mail
} from "lucide-react";

// Dummy order data - this would normally come from API
const orderData = {
  id: "ORD123456",
  date: new Date(2025, 3, 5),
  customer: { 
    name: "Vikram Sharma", 
    avatar: "", 
    initials: "VS",
    phone: "+91 98765 12345",
    email: "vikram.sharma@example.com",
    address: "Trade Tower, Bandra Kurla Complex, Mumbai, Maharashtra - 400051"
  },
  seller: {
    name: "Rajesh Kumar",
    avatar: "",
    initials: "RK",
    phone: "+91 98765 43210",
    email: "rajesh.kumar@example.com",
    address: "Farm Location, Village Nurpur, Amritsar, Punjab - 143001"
  },
  products: [
    { id: "P1", name: "Organic Wheat", quantity: 20, unit: "Quintal", price: 2200, total: 44000 }
  ],
  subtotal: 44000,
  taxes: 2200,
  shipping: 3500,
  total: 49700,
  paymentMethod: "Bank Transfer",
  paymentStatus: "paid",
  invoice: "INV-123456",
  status: "confirmed",
  trackingNumber: "TRK123456789",
  estimatedDelivery: new Date(2025, 3, 10),
  notes: "Please handle with care. Premium quality product."
};

const orderTimeline = [
  { date: new Date(2025, 3, 5, 10, 30), status: "Order Placed", description: "Order has been placed successfully" },
  { date: new Date(2025, 3, 5, 14, 45), status: "Payment Confirmed", description: "Payment has been received" },
  { date: new Date(2025, 3, 6, 9, 15), status: "Processing", description: "Order is being processed" },
  { date: new Date(2025, 3, 7), status: "Ready for Shipment", description: "Order is packed and ready for shipment", future: true },
  { date: new Date(2025, 3, 8), status: "Shipped", description: "Order has been shipped", future: true },
  { date: new Date(2025, 3, 10), status: "Delivered", description: "Order has been delivered", future: true }
];

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("details");
  
  // Determine if we're in the farmer or trader section based on URL
  const isFarmer = window.location.pathname.includes("farmer");
  const userRole = isFarmer ? "farmer" : "trader";
  
  const getStatusColor = (status) => {
    switch (status) {
      case "confirmed": return "bg-blue-50 text-blue-700 border-blue-200";
      case "processing": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "shipped": return "bg-purple-50 text-purple-700 border-purple-200";
      case "delivered": return "bg-green-50 text-green-700 border-green-200";
      case "cancelled": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };
  
  const getPaymentStatusColor = (status) => {
    switch (status) {
      case "paid": return "bg-green-50 text-green-700 border-green-200";
      case "pending": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "failed": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };
  
  return (
    <DashboardLayout userRole={userRole}>
      <DashboardHeader title={`Order #${id}`} userName={isFarmer ? "Rajesh Kumar" : "Vikram Sharma"} />
      
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate(isFarmer ? "/farmer-orders" : "/trader-orders")}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col sm:flex-row items-start justify-between">
            <div>
              <CardTitle className="text-2xl">Order #{orderData.id}</CardTitle>
              <CardDescription>
                Placed on {format(orderData.date, "MMM dd, yyyy")} at {format(orderData.date, "hh:mm a")}
              </CardDescription>
            </div>
            <div className="mt-2 sm:mt-0 flex gap-2">
              <Badge variant="outline" className={getStatusColor(orderData.status)}>
                {orderData.status.charAt(0).toUpperCase() + orderData.status.slice(1)}
              </Badge>
              <Badge variant="outline" className={getPaymentStatusColor(orderData.paymentStatus)}>
                {orderData.paymentStatus === "paid" ? "Paid" : orderData.paymentStatus.charAt(0).toUpperCase() + orderData.paymentStatus.slice(1)}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="w-full grid grid-cols-3 mb-6">
                <TabsTrigger value="details">Order Details</TabsTrigger>
                <TabsTrigger value="tracking">Tracking</TabsTrigger>
                <TabsTrigger value="invoice">Invoice</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details">
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-medium mb-4">Products</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="py-3 px-4 text-left">Product</th>
                            <th className="py-3 px-4 text-center">Quantity</th>
                            <th className="py-3 px-4 text-right">Unit Price</th>
                            <th className="py-3 px-4 text-right">Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {orderData.products.map((product) => (
                            <tr key={product.id} className="border-b">
                              <td className="py-3 px-4">
                                <div className="flex items-center">
                                  <Package className="h-5 w-5 mr-2 text-muted-foreground" />
                                  <span>{product.name}</span>
                                </div>
                              </td>
                              <td className="py-3 px-4 text-center">{product.quantity} {product.unit}</td>
                              <td className="py-3 px-4 text-right">₹{product.price.toLocaleString()}/{product.unit}</td>
                              <td className="py-3 px-4 text-right font-medium">₹{product.total.toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">{isFarmer ? "Customer" : "Seller"} Information</h3>
                      <Card>
                        <CardContent className="p-4">
                          <div className="flex items-center mb-4">
                            <Avatar className="h-10 w-10 mr-4">
                              <AvatarImage src={isFarmer ? orderData.customer.avatar : orderData.seller.avatar} />
                              <AvatarFallback>{isFarmer ? orderData.customer.initials : orderData.seller.initials}</AvatarFallback>
                            </Avatar>
                            <div>
                              <h4 className="font-medium">{isFarmer ? orderData.customer.name : orderData.seller.name}</h4>
                              <p className="text-sm text-muted-foreground">{isFarmer ? "Trader" : "Farmer"}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="text-sm">{isFarmer ? orderData.customer.phone : orderData.seller.phone}</span>
                            </div>
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                              <span className="text-sm">{isFarmer ? orderData.customer.email : orderData.seller.email}</span>
                            </div>
                            <div className="flex items-start">
                              <MapPin className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0 mt-1" />
                              <span className="text-sm">{isFarmer ? orderData.customer.address : orderData.seller.address}</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                    
                    <div>
                      <h3 className="text-lg font-medium mb-4">Order Summary</h3>
                      <Card>
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Subtotal:</span>
                              <span>₹{orderData.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Taxes:</span>
                              <span>₹{orderData.taxes.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Shipping:</span>
                              <span>₹{orderData.shipping.toLocaleString()}</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between font-medium">
                              <span>Total:</span>
                              <span>₹{orderData.total.toLocaleString()}</span>
                            </div>
                          </div>
                          <Separator className="my-4" />
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Payment Method:</span>
                              <span>{orderData.paymentMethod}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Invoice:</span>
                              <div className="flex items-center">
                                <span className="mr-2">{orderData.invoice}</span>
                                <Button variant="ghost" size="icon" className="h-5 w-5">
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                  
                  {orderData.notes && (
                    <div>
                      <h3 className="text-lg font-medium mb-4">Order Notes</h3>
                      <Card>
                        <CardContent className="p-4">
                          <p className="text-sm">{orderData.notes}</p>
                        </CardContent>
                      </Card>
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="tracking">
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    <Card className="flex-1">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          <Truck className="h-8 w-8 mr-4 text-muted-foreground" />
                          <div>
                            <h3 className="font-medium">Tracking Number</h3>
                            <p className="text-lg">{orderData.trackingNumber}</p>
                          </div>
                        </div>
                        <Button variant="outline" className="w-full">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Track on Shipping Partner
                        </Button>
                      </CardContent>
                    </Card>
                    
                    <Card className="flex-1">
                      <CardContent className="p-6">
                        <div className="flex items-center mb-4">
                          <Calendar className="h-8 w-8 mr-4 text-muted-foreground" />
                          <div>
                            <h3 className="font-medium">Estimated Delivery</h3>
                            <p className="text-lg">{format(orderData.estimatedDelivery, "MMM dd, yyyy")}</p>
                          </div>
                        </div>
                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0 mt-1" />
                          <span className="text-sm">{isFarmer ? orderData.customer.address : orderData.seller.address}</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-4">Shipment Timeline</h3>
                    <Card>
                      <CardContent className="p-6">
                        <div className="relative">
                          {orderTimeline.map((item, index) => (
                            <div key={index} className="mb-8 last:mb-0">
                              <div className="flex">
                                <div className="flex flex-col items-center mr-4">
                                  <div className={`rounded-full w-8 h-8 flex items-center justify-center border-2 ${item.future ? 'border-muted text-muted-foreground' : 'border-primary bg-primary text-primary-foreground'}`}>
                                    {index + 1}
                                  </div>
                                  {index < orderTimeline.length - 1 && (
                                    <div className={`h-full w-0.5 ${item.future ? 'bg-muted' : 'bg-primary'}`} />
                                  )}
                                </div>
                                <div className="pb-8">
                                  <div className="flex items-center">
                                    <span className={`font-medium ${item.future ? 'text-muted-foreground' : ''}`}>{item.status}</span>
                                    {!item.future && (
                                      <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                                        Completed
                                      </Badge>
                                    )}
                                  </div>
                                  <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                                  <p className="text-xs text-muted-foreground mt-1">
                                    <Clock className="inline h-3 w-3 mr-1" />
                                    {format(item.date, "MMM dd, yyyy")}
                                    {item.date.getHours() ? ` at ${format(item.date, "hh:mm a")}` : ''}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="invoice">
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-medium">Invoice #{orderData.invoice}</h3>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Printer className="mr-2 h-4 w-4" />
                        Print
                      </Button>
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                  
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row justify-between mb-8">
                        <div>
                          <h4 className="font-bold text-lg mb-1">AgriTradeConnect</h4>
                          <p className="text-sm text-muted-foreground mb-4">The agricultural trading platform</p>
                          <div className="text-sm space-y-1">
                            <p>Invoice #: {orderData.invoice}</p>
                            <p>Order #: {orderData.id}</p>
                            <p>Date: {format(orderData.date, "MMM dd, yyyy")}</p>
                          </div>
                        </div>
                        <div className="mt-4 md:mt-0 md:text-right">
                          <p className="font-medium">Bill To:</p>
                          <p>{isFarmer ? orderData.customer.name : orderData.seller.name}</p>
                          <p>{isFarmer ? orderData.customer.address : orderData.seller.address}</p>
                          <p>{isFarmer ? orderData.customer.email : orderData.seller.email}</p>
                          <p>{isFarmer ? orderData.customer.phone : orderData.seller.phone}</p>
                        </div>
                      </div>
                      
                      <div className="overflow-x-auto mb-6">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b">
                              <th className="py-3 px-4 text-left">Description</th>
                              <th className="py-3 px-4 text-center">Quantity</th>
                              <th className="py-3 px-4 text-right">Unit Price</th>
                              <th className="py-3 px-4 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {orderData.products.map((product) => (
                              <tr key={product.id} className="border-b">
                                <td className="py-3 px-4">{product.name}</td>
                                <td className="py-3 px-4 text-center">{product.quantity} {product.unit}</td>
                                <td className="py-3 px-4 text-right">₹{product.price.toLocaleString()}/{product.unit}</td>
                                <td className="py-3 px-4 text-right">₹{product.total.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      
                      <div className="flex justify-end">
                        <div className="w-full md:w-64">
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Subtotal:</span>
                              <span>₹{orderData.subtotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Taxes:</span>
                              <span>₹{orderData.taxes.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Shipping:</span>
                              <span>₹{orderData.shipping.toLocaleString()}</span>
                            </div>
                            <Separator className="my-2" />
                            <div className="flex justify-between font-bold">
                              <span>Total:</span>
                              <span>₹{orderData.total.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <Separator className="my-6" />
                      
                      <div className="space-y-2">
                        <h4 className="font-medium">Payment Information</h4>
                        <div className="flex flex-col md:flex-row md:justify-between text-sm">
                          <div>
                            <p><span className="text-muted-foreground">Method:</span> {orderData.paymentMethod}</p>
                            <p><span className="text-muted-foreground">Status:</span> {orderData.paymentStatus === "paid" ? "Paid" : "Pending"}</p>
                          </div>
                          <div className="mt-2 md:mt-0">
                            <p><span className="text-muted-foreground">Payment Date:</span> {format(orderData.date, "MMM dd, yyyy")}</p>
                            <p><span className="text-muted-foreground">Transaction ID:</span> TXN-{Math.floor(Math.random() * 1000000)}</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mt-8 text-center text-sm text-muted-foreground">
                        <p>Thank you for your business!</p>
                        <p>For any queries, please contact support@agritradeconnect.com</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orderData.status === "confirmed" && isFarmer && (
                  <Button className="w-full" variant="default">
                    <PackageCheck className="mr-2 h-4 w-4" />
                    Process Order
                  </Button>
                )}
                {orderData.status === "confirmed" && !isFarmer && (
                  <Button className="w-full" variant="outline">
                    <Ban className="mr-2 h-4 w-4" />
                    Cancel Order
                  </Button>
                )}
                <Button className="w-full" variant="outline">
                  <UserCircle className="mr-2 h-4 w-4" />
                  Contact {isFarmer ? "Customer" : "Seller"}
                </Button>
                <Button className="w-full" variant="outline">
                  <Truck className="mr-2 h-4 w-4" />
                  View Shipment
                </Button>
                <Button className="w-full" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Generate Report
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Payment Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Method</span>
                  <span>{orderData.paymentMethod}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="outline" className={getPaymentStatusColor(orderData.paymentStatus)}>
                    {orderData.paymentStatus === "paid" ? "Paid" : orderData.paymentStatus.charAt(0).toUpperCase() + orderData.paymentStatus.slice(1)}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Amount</span>
                  <span className="font-medium">₹{orderData.total.toLocaleString()}</span>
                </div>
                
                <Separator />
                
                <div className="pt-2">
                  <Button variant="outline" className="w-full">
                    <DollarSign className="mr-2 h-4 w-4" />
                    View Transaction
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrderDetail;
