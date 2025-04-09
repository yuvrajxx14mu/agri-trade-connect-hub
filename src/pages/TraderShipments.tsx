import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Truck, Package } from "lucide-react";
import ShipmentCard from "@/components/ShipmentCard";

const TraderShipments = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("active");
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchShipments = async () => {
      try {
        const { data, error } = await supabase
          .from('shipments')
          .select(`
            *,
            order:orders(*),
            items:shipment_items(*)
          `)
          .eq('trader_id', profile?.id)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Transform the data to match the expected format
        const transformedShipments = data.map(shipment => ({
          id: shipment.id,
          orderId: shipment.order.id,
          trackingNumber: shipment.tracking_number,
          items: shipment.items.map(item => ({
            name: item.product_name,
            quantity: item.quantity
          })),
          status: shipment.status,
          dispatchDate: new Date(shipment.dispatch_date),
          estimatedDelivery: new Date(shipment.estimated_delivery),
          currentLocation: shipment.current_location,
          destination: shipment.destination,
          progress: shipment.progress
        }));

        setShipments(transformedShipments);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (profile?.id) {
      fetchShipments();
    }
  }, [profile?.id]);
  
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
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <DashboardLayout userRole="trader">
      <DashboardHeader title="My Shipments" userName={profile?.name || "User"} userRole="trader" />
      
      <Card>
        <CardHeader>
          <CardTitle>Shipment Tracking</CardTitle>
          <CardDescription>Track the status of your purchases</CardDescription>
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
                    onClick={() => navigate(`/trader-shipments/${shipment.id}`)}
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
                <Button onClick={() => navigate("/trader-orders")}>
                  View Orders
                </Button>
              </div>
            )}
          </Tabs>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default TraderShipments;
