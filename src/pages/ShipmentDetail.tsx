
import { useParams, useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { format, addDays } from "date-fns";
import { 
  ChevronLeft, 
  Truck, 
  Package, 
  MapPin, 
  Calendar, 
  ArrowRight, 
  Clock, 
  CheckCircle,
  UserCircle,
  Phone,
  Mail,
  FileText
} from "lucide-react";

// Dummy shipment data - this would normally come from API
const shipmentData = {
  id: "S123456",
  orderId: "ORD123456",
  trackingNumber: "TRK123456789",
  items: [
    { id: "P1", name: "Organic Wheat", quantity: 20, unit: "Quintal" }
  ],
  status: "in_transit" as const,
  dispatchDate: new Date(2025, 3, 5),
  estimatedDelivery: new Date(2025, 3, 10),
  currentLocation: "Delhi",
  destination: "Mumbai, Maharashtra",
  progress: 55,
  carrier: "ExpressLogistics",
  carrierPhone: "+91 98765 98765",
  carrierEmail: "support@expresslogistics.com",
  shipmentType: "Standard Ground",
  packageWeight: "2000 kg",
  packageDimensions: "Bulk Shipment",
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
  }
};

const shipmentUpdates = [
  { 
    date: new Date(2025, 3, 5, 9, 0), 
    status: "Order Processed", 
    location: "Amritsar, Punjab", 
    description: "Shipment has been processed and is ready for pickup" 
  },
  { 
    date: new Date(2025, 3, 5, 14, 30), 
    status: "Picked Up", 
    location: "Amritsar, Punjab", 
    description: "Shipment has been picked up by carrier" 
  },
  { 
    date: new Date(2025, 3, 6, 10, 15), 
    status: "In Transit", 
    location: "Jalandhar, Punjab", 
    description: "Shipment is in transit to the next facility" 
  },
  { 
    date: new Date(2025, 3, 7, 8, 45), 
    status: "In Transit", 
    location: "Delhi", 
    description: "Shipment has arrived at regional hub" 
  },
  { 
    date: new Date(2025, 3, 8, 9, 30), 
    status: "In Transit", 
    location: "Jaipur, Rajasthan", 
    description: "Shipment is in transit to destination city", 
    future: true
  },
  { 
    date: new Date(2025, 3, 9, 11, 0), 
    status: "Out for Delivery", 
    location: "Mumbai, Maharashtra", 
    description: "Shipment is out for delivery", 
    future: true
  },
  { 
    date: new Date(2025, 3, 10, 14, 0), 
    status: "Delivered", 
    location: "Mumbai, Maharashtra", 
    description: "Shipment has been delivered", 
    future: true
  }
];

const ShipmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  // Determine if we're in the farmer or trader section based on URL
  const isFarmer = window.location.pathname.includes("farmer");
  const userRole = isFarmer ? "farmer" : "trader";
  
  const getStatusColor = (status) => {
    switch (status) {
      case "processing": return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "packed": return "bg-blue-50 text-blue-700 border-blue-200";
      case "shipped": return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "in_transit": return "bg-purple-50 text-purple-700 border-purple-200";
      case "out_for_delivery": return "bg-orange-50 text-orange-700 border-orange-200";
      case "delivered": return "bg-green-50 text-green-700 border-green-200";
      case "cancelled": return "bg-red-50 text-red-700 border-red-200";
      default: return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };
  
  const getStatusText = (status) => {
    switch (status) {
      case "processing": return "Processing";
      case "packed": return "Packed";
      case "shipped": return "Shipped";
      case "in_transit": return "In Transit";
      case "out_for_delivery": return "Out for Delivery";
      case "delivered": return "Delivered";
      case "cancelled": return "Cancelled";
      default: return status;
    }
  };
  
  return (
    <DashboardLayout userRole={userRole}>
      <DashboardHeader title={`Shipment #${id}`} userName={isFarmer ? "Rajesh Kumar" : "Vikram Sharma"} />
      
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate(isFarmer ? "/farmer-shipments" : "/trader-shipments")}
        >
          <ChevronLeft className="mr-2 h-4 w-4" />
          Back to Shipments
        </Button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-col sm:flex-row items-start justify-between">
            <div>
              <CardTitle className="text-2xl">Tracking #{shipmentData.trackingNumber}</CardTitle>
              <CardDescription>
                Order #{shipmentData.orderId} • Dispatched on {format(shipmentData.dispatchDate, "MMM dd, yyyy")}
              </CardDescription>
            </div>
            <Badge variant="outline" className={getStatusColor(shipmentData.status)}>
              {getStatusText(shipmentData.status)}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-6">
            <Card>
              <CardContent className="p-4">
                <div className="mb-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm text-muted-foreground">Shipping Progress</span>
                    <span className="text-sm font-medium">{shipmentData.progress}%</span>
                  </div>
                  <Progress value={shipmentData.progress} className="h-2" />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">From</p>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-1 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span>{isFarmer ? "Your Location" : shipmentData.seller.address}</span>
                    </div>
                  </div>
                  <div className="flex justify-center items-center text-muted-foreground">
                    <ArrowRight className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">To</p>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 mr-1 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <span>{shipmentData.destination}</span>
                    </div>
                  </div>
                </div>
                
                <Separator className="my-4" />
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <Package className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Current Location</p>
                      <p className="font-medium">{shipmentData.currentLocation}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Estimated Delivery</p>
                      <p className="font-medium">{format(shipmentData.estimatedDelivery, "MMM dd, yyyy")}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Truck className="h-4 w-4 mr-2 text-muted-foreground" />
                    <div>
                      <p className="text-sm text-muted-foreground">Carrier</p>
                      <p className="font-medium">{shipmentData.carrier}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Tracking History</h3>
              <Card>
                <CardContent className="p-6">
                  <div className="relative">
                    {shipmentUpdates.map((update, index) => (
                      <div key={index} className="mb-8 last:mb-0">
                        <div className="flex">
                          <div className="flex flex-col items-center mr-4">
                            <div className={`rounded-full w-8 h-8 flex items-center justify-center border-2 ${update.future ? 'border-muted text-muted-foreground' : 'border-primary bg-primary text-primary-foreground'}`}>
                              {update.future ? index + 1 : <CheckCircle className="h-4 w-4" />}
                            </div>
                            {index < shipmentUpdates.length - 1 && (
                              <div className={`h-full w-0.5 ${update.future ? 'bg-muted' : 'bg-primary'}`} />
                            )}
                          </div>
                          <div className="pb-8">
                            <div className="flex items-center">
                              <span className={`font-medium ${update.future ? 'text-muted-foreground' : ''}`}>{update.status}</span>
                              {!update.future && (
                                <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                                  Completed
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{update.description}</p>
                            <div className="flex flex-col xs:flex-row xs:items-center gap-1 xs:gap-4 text-xs text-muted-foreground mt-1">
                              <div className="flex items-center">
                                <Clock className="inline h-3 w-3 mr-1" />
                                <span>
                                  {format(update.date, "MMM dd, yyyy")} at {format(update.date, "hh:mm a")}
                                </span>
                              </div>
                              <div className="flex items-center">
                                <MapPin className="inline h-3 w-3 mr-1" />
                                <span>{update.location}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Shipment Contents</h3>
              <Card>
                <CardContent className="p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b">
                          <th className="py-3 px-4 text-left">Item</th>
                          <th className="py-3 px-4 text-center">Quantity</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shipmentData.items.map((item) => (
                          <tr key={item.id} className="border-b">
                            <td className="py-3 px-4">
                              <div className="flex items-center">
                                <Package className="h-5 w-5 mr-2 text-muted-foreground" />
                                <span>{item.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-center">{item.quantity} {item.unit}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Shipping Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Type</span>
                <span>{shipmentData.shipmentType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Weight</span>
                <span>{shipmentData.packageWeight}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Dimensions</span>
                <span>{shipmentData.packageDimensions}</span>
              </div>
              <Separator />
              <div className="flex flex-col">
                <span className="text-muted-foreground mb-2">Carrier Information</span>
                <span className="font-medium">{shipmentData.carrier}</span>
                <div className="flex items-center text-sm mt-1">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{shipmentData.carrierPhone}</span>
                </div>
                <div className="flex items-center text-sm mt-1">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span>{shipmentData.carrierEmail}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>{isFarmer ? "Recipient" : "Sender"} Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center mb-4">
                <Avatar className="h-10 w-10 mr-4">
                  <AvatarImage src={isFarmer ? shipmentData.customer.avatar : shipmentData.seller.avatar} />
                  <AvatarFallback>{isFarmer ? shipmentData.customer.initials : shipmentData.seller.initials}</AvatarFallback>
                </Avatar>
                <div>
                  <h4 className="font-medium">{isFarmer ? shipmentData.customer.name : shipmentData.seller.name}</h4>
                  <p className="text-sm text-muted-foreground">{isFarmer ? "Trader" : "Farmer"}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{isFarmer ? shipmentData.customer.phone : shipmentData.seller.phone}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                  <span className="text-sm">{isFarmer ? shipmentData.customer.email : shipmentData.seller.email}</span>
                </div>
                <div className="flex items-start">
                  <MapPin className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0 mt-1" />
                  <span className="text-sm">{isFarmer ? shipmentData.customer.address : shipmentData.seller.address}</span>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" className="w-full">
                  <UserCircle className="mr-2 h-4 w-4" />
                  Contact {isFarmer ? "Recipient" : "Sender"}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button className="w-full" variant="default">
                  <Truck className="mr-2 h-4 w-4" />
                  {isFarmer ? "Update Tracking" : "Track on Carrier Site"}
                </Button>
                <Button className="w-full" variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Download Shipping Label
                </Button>
                <Button className="w-full" variant="outline">
                  <UserCircle className="mr-2 h-4 w-4" />
                  Contact Carrier
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
