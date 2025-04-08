
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Truck, PlusCircle } from "lucide-react";
import ShipmentCard from "@/components/ShipmentCard";

const shipments = [
  {
    id: "S123456",
    orderId: "O123456",
    trackingNumber: "TRK123456789",
    items: [
      { name: "Organic Wheat", quantity: 20 },
      { name: "Premium Rice", quantity: 15 }
    ],
    status: "shipped" as const,
    dispatchDate: new Date(2025, 3, 6),
    estimatedDelivery: new Date(2025, 3, 10),
    currentLocation: "Delhi",
    destination: "Mumbai",
    progress: 35
  },
  {
    id: "S123457",
    orderId: "O123457",
    trackingNumber: "TRK123456790",
    items: [
      { name: "Yellow Lentils", quantity: 10 }
    ],
    status: "in_transit" as const,
    dispatchDate: new Date(2025, 3, 5),
    estimatedDelivery: new Date(2025, 3, 9),
    currentLocation: "Indore",
    destination: "Bangalore",
    progress: 65
  },
  {
    id: "S123458",
    orderId: "O123458",
    trackingNumber: "TRK123456791",
    items: [
      { name: "Basmati Rice", quantity: 12 }
    ],
    status: "out_for_delivery" as const,
    dispatchDate: new Date(2025, 3, 4),
    estimatedDelivery: new Date(2025, 3, 8),
    currentLocation: "Chennai",
    destination: "Chennai",
    progress: 90
  },
  {
    id: "S123459",
    orderId: "O123459",
    trackingNumber: "TRK123456792",
    items: [
      { name: "Red Chillies", quantity: 5 }
    ],
    status: "delivered" as const,
    dispatchDate: new Date(2025, 3, 1),
    estimatedDelivery: new Date(2025, 3, 5),
    currentLocation: "Hyderabad",
    destination: "Hyderabad",
    progress: 100
  },
  {
    id: "S123460",
    orderId: "O123460",
    trackingNumber: "TRK123456793",
    items: [
      { name: "Fresh Potatoes", quantity: 25 }
    ],
    status: "processing" as const,
    dispatchDate: null,
    estimatedDelivery: new Date(2025, 3, 12),
    currentLocation: "Agra",
    destination: "Delhi",
    progress: 10
  }
];

const FarmerShipments = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("active");
  
  const getFilteredShipments = () => {
    return shipments.filter(shipment => {
      // Filter by search term
      const matchesSearch = 
        shipment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.trackingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.items.some(item => item.name.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filter by status
      const matchesStatus = statusFilter === "all" || shipment.status === statusFilter;
      
      // Filter by tab
      const matchesTab = 
        (activeTab === "active" && ["processing", "packed", "shipped", "in_transit", "out_for_delivery"].includes(shipment.status)) ||
        (activeTab === "completed" && ["delivered", "cancelled"].includes(shipment.status));
      
      return matchesSearch && matchesStatus && matchesTab;
    });
  };
  
  const filteredShipments = getFilteredShipments();
  
  return (
    <DashboardLayout userRole="farmer">
      <DashboardHeader title="Shipments" userName="Rajesh Kumar" />
      
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center">
          <div>
            <CardTitle>Shipment Management</CardTitle>
            <CardDescription>Track and manage your shipments</CardDescription>
          </div>
          <Button 
            onClick={() => navigate("/farmer-shipments/create")}
            className="mt-4 sm:mt-0"
          >
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Shipment
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="active">Active Shipments</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
            
            <div className="flex flex-col md:flex-row justify-between mb-6 gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by ID, order, or product..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex-shrink-0 w-full md:w-60">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Filter by status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="processing">Processing</SelectItem>
                    <SelectItem value="packed">Packed</SelectItem>
                    <SelectItem value="shipped">Shipped</SelectItem>
                    <SelectItem value="in_transit">In Transit</SelectItem>
                    <SelectItem value="out_for_delivery">Out for Delivery</SelectItem>
                    <SelectItem value="delivered">Delivered</SelectItem>
                    <SelectItem value="cancelled">Cancelled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {filteredShipments.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredShipments.map((shipment) => (
                  <ShipmentCard
                    key={shipment.id}
                    id={shipment.id}
                    orderId={shipment.orderId}
                    trackingNumber={shipment.trackingNumber}
                    items={shipment.items}
                    status={shipment.status}
                    dispatchDate={shipment.dispatchDate}
                    estimatedDelivery={shipment.estimatedDelivery}
                    currentLocation={shipment.currentLocation}
                    destination={shipment.destination}
                    progress={shipment.progress}
                    onClick={() => navigate(`/farmer-shipments/${shipment.id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                  <Truck className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No shipments found</h3>
                <p className="text-muted-foreground mb-6">
                  {activeTab === "active" 
                    ? "You don't have any active shipments at the moment." 
                    : "You don't have any completed shipments yet."}
                </p>
                <Button onClick={() => navigate("/farmer-shipments/create")}>
                  Create New Shipment
                </Button>
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default FarmerShipments;
