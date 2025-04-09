import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Truck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { DatePicker } from "@/components/ui/date-picker";
import { format } from "date-fns";

const shipmentSchema = z.object({
  orderId: z.string().min(1, "Order ID is required"),
  carrier: z.string().min(1, "Shipping carrier is required"),
  trackingNumber: z.string().min(1, "Tracking number is required"),
  destination: z.string().min(1, "Destination is required"),
  dispatchDate: z.date({
    required_error: "Dispatch date is required",
  }),
  estimatedDelivery: z.date({
    required_error: "Estimated delivery date is required",
  }),
  currentLocation: z.string().optional(),
  notes: z.string().optional(),
});

type ShipmentFormValues = z.infer<typeof shipmentSchema>;

const ShipmentForm = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  const form = useForm<ShipmentFormValues>({
    resolver: zodResolver(shipmentSchema),
    defaultValues: {
      orderId: orderId || "",
      carrier: "",
      trackingNumber: "",
      destination: "",
      currentLocation: "",
      notes: "",
    },
  });

  const watchOrderId = form.watch("orderId");

  useEffect(() => {
    const fetchOrders = async () => {
      if (!profile?.id) return;
      
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('orders')
          .select(`
            id,
            status,
            total_amount,
            created_at,
            product_id,
            quantity,
            trader_id,
            profiles!orders_trader_id_fkey(name)
          `)
          .eq('farmer_id', profile.id)
          .eq('status', 'completed')
          .not('id', 'in', '(select order_id from shipments)')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setOrders(data || []);
        
        if (orderId) {
          form.setValue("orderId", orderId);
          fetchOrderDetails(orderId);
        }
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast({
          title: "Error",
          description: "Failed to fetch orders. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrders();
  }, [profile?.id, orderId, toast, form]);
  
  useEffect(() => {
    if (watchOrderId) {
      fetchOrderDetails(watchOrderId);
    } else {
      setSelectedOrder(null);
    }
  }, [watchOrderId]);
  
  const fetchOrderDetails = async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          profiles!orders_trader_id_fkey(
            name,
            address,
            city,
            state,
            pincode
          )
        `)
        .eq('id', id)
        .single();
        
      if (error) throw error;
      
      setSelectedOrder(data);
      
      if (data.profiles) {
        const trader = data.profiles;
        const address = [
          trader.address,
          trader.city,
          trader.state,
          trader.pincode
        ].filter(Boolean).join(", ");
        
        if (address) {
          form.setValue("destination", address);
        }
      }
      
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };
  
  const onSubmit = async (data) => {
    if (!profile?.id || !selectedOrder) {
      toast({
        title: "Error",
        description: "Missing required information. Please select an order.",
        variant: "destructive",
      });
      return;
    }
    
    setSubmitting(true);
    
    try {
      const shipmentData = {
        order_id: data.orderId,
        farmer_id: profile.id,
        trader_id: selectedOrder.trader_id,
        carrier: data.carrier,
        tracking_number: data.trackingNumber,
        destination: data.destination,
        current_location: data.currentLocation || "Processing Facility",
        dispatch_date: data.dispatchDate.toISOString(),
        estimated_delivery: data.estimatedDelivery.toISOString(),
        notes: data.notes,
        status: "processing"
      };
      
      const { data: shipment, error } = await supabase
        .from('shipments')
        .insert(shipmentData)
        .select()
        .single();
        
      if (error) throw error;
      
      const { error: orderError } = await supabase
        .from('orders')
        .update({ status: 'shipped' })
        .eq('id', data.orderId);
        
      if (orderError) throw orderError;
      
      await supabase.from('notifications').insert({
        user_id: selectedOrder.trader_id,
        title: "New Shipment Created",
        message: `Your order has been shipped. Tracking number: ${data.trackingNumber}`,
        type: "shipment"
      });
      
      toast({
        title: "Success",
        description: "Shipment created successfully!",
      });
      
      navigate('/farmer-shipments');
      
    } catch (error) {
      console.error('Error creating shipment:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create shipment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <DashboardLayout userRole="farmer">
      <DashboardHeader 
        title="Create Shipment" 
        userName={profile?.name || "Farmer"} 
        userRole="farmer"
      />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Create New Shipment
          </CardTitle>
          <CardDescription>
            Fill in the shipment details to create a new shipment for your order
          </CardDescription>
        </CardHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <FormField
                control={form.control}
                name="orderId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order</FormLabel>
                    <Select 
                      disabled={loading || !!orderId} 
                      onValueChange={field.onChange} 
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select an order" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {orders.map((order) => (
                          <SelectItem key={order.id} value={order.id}>
                            Order #{order.id.slice(0, 8)} - {order.profiles?.name} (₹{order.total_amount})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Select the order you want to create a shipment for
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {selectedOrder && (
                <div className="bg-muted p-4 rounded-md">
                  <h3 className="font-medium mb-2">Order Summary</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p><span className="text-muted-foreground">Order ID:</span> {selectedOrder.id}</p>
                      <p><span className="text-muted-foreground">Trader:</span> {selectedOrder.profiles?.name}</p>
                      <p><span className="text-muted-foreground">Amount:</span> ₹{selectedOrder.total_amount}</p>
                    </div>
                    <div>
                      <p><span className="text-muted-foreground">Quantity:</span> {selectedOrder.quantity}</p>
                      <p><span className="text-muted-foreground">Status:</span> {selectedOrder.status}</p>
                      <p><span className="text-muted-foreground">Date:</span> {format(new Date(selectedOrder.created_at), 'PPP')}</p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="carrier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Shipping Carrier</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter carrier name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="trackingNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tracking Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter tracking number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="dispatchDate"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Dispatch Date</FormLabel>
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                        disabled={(date) => date < new Date()}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="estimatedDelivery"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Estimated Delivery</FormLabel>
                      <DatePicker
                        date={field.value}
                        setDate={field.onChange}
                        disabled={(date) => {
                          const dispatchDate = form.getValues("dispatchDate");
                          return dispatchDate && date < dispatchDate;
                        }}
                      />
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="destination"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Destination</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter destination address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="currentLocation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current Location</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter current location (optional)" {...field} />
                    </FormControl>
                    <FormDescription>
                      Where is the shipment currently located? (e.g., Warehouse, Processing Facility)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Add any additional information about the shipment (optional)" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            
            <CardFooter className="flex justify-between">
              <Button 
                type="button"
                variant="outline"
                onClick={() => navigate('/farmer-shipments')}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={submitting || !selectedOrder}
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Shipment'
                )}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </DashboardLayout>
  );
};

export default ShipmentForm;
