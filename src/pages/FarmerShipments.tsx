import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Truck, PlusCircle, Loader2 } from "lucide-react";
import ShipmentCard from "@/components/ShipmentCard";
import { useToast } from "@/components/ui/use-toast";
import { Database } from '../integrations/supabase/types';

type ShipmentStatus = 
  | "processing" 
  | "packed" 
  | "shipped" 
  | "in_transit" 
  | "out_for_delivery" 
  | "delivered" 
  | "cancelled";

type Shipment = Database['public']['Tables']['shipments']['Row'];

const FarmerShipments = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeTab, setActiveTab] = useState("active");
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const fetchShipments = async () => {
      if (!profile?.id) return;

      try {
        const { data, error } = await supabase
          .from('shipments')
          .select(`
            *,
            orders (
              id,
              total_amount,
              status
            ),
            profiles!shipments_trader_id_fkey (
              name,
              phone
            )
          `)
          .eq('farmer_id', profile.id)
          .order('created_at', { ascending: false });

        if (error) throw error;
        setShipments(data || []);
      } catch (error) {
        console.error('Error fetching shipments:', error);
        toast({
          title: "Error",
          description: "Failed to fetch shipments. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchShipments();

    const subscription = supabase
      .channel('shipments_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shipments',
          filter: `farmer_id=eq.${profile.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setShipments((prev) => [...prev, payload.new as Shipment]);
          } else if (payload.eventType === 'UPDATE') {
            setShipments((prev) =>
              prev.map((shipment) =>
                shipment.id === payload.new.id ? (payload.new as Shipment) : shipment
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setShipments((prev) =>
              prev.filter((shipment) => shipment.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [profile?.id, toast]);
  
  const getFilteredShipments = () => {
    return shipments.filter(shipment => {
      // Filter by search term
      const matchesSearch = 
        shipment.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.order_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        shipment.tracking_number.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filter by status
      const matchesStatus = statusFilter === "all" || shipment.status === statusFilter;
      
      // Filter by tab
      const matchesTab = 
        (activeTab === "active" && ["processing", "packed", "shipped", "in_transit", "out_for_delivery"].includes(shipment.status)) ||
        (activeTab === "completed" && ["delivered", "cancelled"].includes(shipment.status));
      
      return matchesSearch && matchesStatus && matchesTab;
    });
  };
  
  const transformShipmentForCard = (shipment: Shipment) => {
    return {
      id: shipment.id,
      orderId: shipment.order_id,
      trackingNumber: shipment.tracking_number,
      items: [], // We'll need to fetch order details to get the items
      status: shipment.status as ShipmentStatus,
      dispatchDate: shipment.dispatched_at ? new Date(shipment.dispatched_at) : null,
      estimatedDelivery: shipment.estimated_delivery ? new Date(shipment.estimated_delivery) : null,
      currentLocation: shipment.current_location,
      destination: "Trader's Warehouse", // This should come from the order details
      progress: getShipmentProgress(shipment.status),
      onClick: () => handleShipmentClick(shipment.id)
    };
  };

  const getShipmentProgress = (status: string): number => {
    switch (status) {
      case "processing": return 0;
      case "packed": return 20;
      case "shipped": return 40;
      case "in_transit": return 60;
      case "out_for_delivery": return 80;
      case "delivered": return 100;
      case "cancelled": return 0;
      default: return 0;
    }
  };

  const filteredShipments = getFilteredShipments();
  
  const handleShipmentClick = (shipmentId: string) => {
    // Handle shipment click - navigate to details page
    console.log('Shipment clicked:', shipmentId);
  };
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <DashboardLayout userRole="farmer">
      <DashboardHeader 
        title="My Shipments" 
        userName={profile?.name || "Farmer"} 
        userRole="farmer"
      />
      <div className="space-y-6">
        <Card>
          <CardHeader className="flex flex-col sm:flex-row justify-between sm:items-center">
            <div>
              <CardTitle>Shipment List</CardTitle>
              <CardDescription>Manage and track your shipments</CardDescription>
            </div>
            <Button onClick={() => navigate('/farmer-shipments/new')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              New Shipment
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search shipments..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[180px]">
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
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList>
                  <TabsTrigger value="active">Active Shipments</TabsTrigger>
                  <TabsTrigger value="completed">Completed Shipments</TabsTrigger>
                </TabsList>
                <TabsContent value="active" className="space-y-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    getFilteredShipments().map(shipment => (
                      <ShipmentCard
                        key={shipment.id}
                        {...transformShipmentForCard(shipment)}
                      />
                    ))
                  )}
                </TabsContent>
                <TabsContent value="completed" className="space-y-4">
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    getFilteredShipments().map(shipment => (
                      <ShipmentCard
                        key={shipment.id}
                        {...transformShipmentForCard(shipment)}
                      />
                    ))
                  )}
                </TabsContent>
              </Tabs>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FarmerShipments;
