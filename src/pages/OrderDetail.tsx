import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

import {
  Package,
  Truck,
  Clock,
  CheckCircle,
  FileClock,
  Calendar,
  CalendarCheck,
  FileText,
  ArrowLeft,
  XCircle,
  ShoppingBag,
  MessageCircle,
  ExternalLink,
  Download,
  AlertCircle
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";

type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled" | "completed";
type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

interface OrderType {
  id: string;
  created_at: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  farmer_id: string;
  trader_id: string;
  product_id: string;
  quantity: number;
  price: number;
  total_amount: number;
  payment_date: string | null;
  delivery_date: string | null;
  notes: string | null;
}

interface ProductType {
  name: string;
  category: string;
  unit: string;
  location: string;
  image_url: string | null;
}

interface ProfileType {
  name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
}

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  
  const [order, setOrder] = useState<OrderType | null>(null);
  const [product, setProduct] = useState<ProductType | null>(null);
  const [counterpartyProfile, setCounterpartyProfile] = useState<ProfileType | null>(null);
  const [newStatus, setNewStatus] = useState<OrderStatus | "">("");
  const [newNote, setNewNote] = useState("");
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  
  const userRole = profile?.role || "farmer";
  
  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!id || !profile?.id) return;
      
      try {
        // Fetch order
        const { data: orderData, error: orderError } = await supabase
          .from('orders')
          .select('*')
          .eq('id', id)
          .single();
          
        if (orderError) throw orderError;
        
        // Check if user is authorized to view this order
        if (userRole === 'farmer' && orderData.farmer_id !== profile.id) {
          navigate(`/${userRole}-orders`);
          return;
        }
        
        if (userRole === 'trader' && orderData.trader_id !== profile.id) {
          navigate(`/${userRole}-orders`);
          return;
        }
        
        setOrder(orderData as OrderType);
        // Use type assertion to ensure proper typing
        setNewStatus(orderData.status as OrderStatus);
        
        // Fetch product
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('name, category, unit, location, image_url')
          .eq('id', orderData.product_id)
          .single();
          
        if (productError) throw productError;
        setProduct(productData as ProductType);
        
        // Fetch counterparty profile
        const counterpartyId = userRole === 'farmer' ? orderData.trader_id : orderData.farmer_id;
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('name, phone, address, city, state')
          .eq('id', counterpartyId)
          .single();
          
        if (profileError) throw profileError;
        setCounterpartyProfile(profileData as ProfileType);
        
      } catch (error) {
        console.error('Error fetching order details:', error);
        toast({
          title: "Error",
          description: "Could not load order details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchOrderDetails();
  }, [id, profile?.id, userRole, navigate, toast]);
  
  const handleStatusUpdate = async () => {
    if (!order || !newStatus) return;
    
    setUpdating(true);
    
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', order.id);
        
      if (error) throw error;
      
      // Create notification for counterparty
      // Since notifications table was just created, we need to handle it properly
      const counterpartyId = userRole === 'farmer' ? order.trader_id : order.farmer_id;
      
      try {
        // Insert into notifications table
        await supabase
          .from('notifications')
          .insert({
            user_id: counterpartyId,
            title: "Order Status Updated",
            message: `Order #${order.id.slice(0, 8)} has been updated to ${newStatus}`,
            type: "order",
            related_id: order.id
          });
      } catch (notifError) {
        console.error("Error creating notification:", notifError);
        // Continue with order update even if notification fails
      }
      
      // Update local state
      setOrder({
        ...order,
        status: newStatus as OrderStatus
      });
      
      toast({
        title: "Status Updated",
        description: `Order status has been updated to ${newStatus}`
      });
      
    } catch (error) {
      console.error('Error updating order status:', error);
      toast({
        title: "Update Failed",
        description: "Failed to update order status",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };
  
  const handleAddNote = async () => {
    if (!order || !newNote.trim()) return;
    
    setUpdating(true);
    
    try {
      // Update the order with the new note
      const { error } = await supabase
        .from('orders')
        .update({ notes: newNote })
        .eq('id', order.id);
        
      if (error) throw error;
      
      // Update local state
      setOrder({
        ...order,
        notes: newNote
      });
      
      // Reset the input
      setNewNote("");
      
      toast({
        title: "Note Added",
        description: "Your note has been added to the order"
      });
      
    } catch (error) {
      console.error('Error adding note:', error);
      toast({
        title: "Failed to Add Note",
        description: "There was an error adding your note",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };
  
  const getStatusBadge = (status: OrderStatus) => {
    const statusColors = {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      confirmed: "bg-blue-50 text-blue-700 border-blue-200",
      processing: "bg-blue-50 text-blue-700 border-blue-200",
      shipped: "bg-purple-50 text-purple-700 border-purple-200",
      delivered: "bg-green-50 text-green-700 border-green-200",
      completed: "bg-green-50 text-green-700 border-green-200",
      cancelled: "bg-red-50 text-red-700 border-red-200"
    };
    
    const statusIcons = {
      pending: <Clock className="h-4 w-4 mr-1" />,
      confirmed: <CheckCircle className="h-4 w-4 mr-1" />,
      processing: <FileClock className="h-4 w-4 mr-1" />,
      shipped: <Truck className="h-4 w-4 mr-1" />,
      delivered: <CheckCircle className="h-4 w-4 mr-1" />,
      completed: <CheckCircle className="h-4 w-4 mr-1" />,
      cancelled: <XCircle className="h-4 w-4 mr-1" />
    };
    
    return (
      <Badge variant="outline" className={statusColors[status]}>
        <span className="flex items-center">
          {statusIcons[status]}
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </Badge>
    );
  };
  
  const getPaymentStatusBadge = (status: PaymentStatus) => {
    const statusColors = {
      pending: "bg-yellow-50 text-yellow-700 border-yellow-200",
      paid: "bg-green-50 text-green-700 border-green-200",
      failed: "bg-red-50 text-red-700 border-red-200",
      refunded: "bg-purple-50 text-purple-700 border-purple-200"
    };
    
    return (
      <Badge variant="outline" className={statusColors[status]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };
  
  const getAvailableStatuses = (): OrderStatus[] => {
    if (!order) return [];
    
    if (userRole === "farmer") {
      switch (order.status) {
        case "pending":
          return ["confirmed", "cancelled"];
        case "confirmed":
          return ["shipped", "cancelled"];
        case "shipped":
          return ["delivered"];
        default:
          return [];
      }
    } else { // trader
      switch (order.status) {
        case "pending":
          return ["cancelled"];
        case "delivered":
          return ["completed"];
        default:
          return [];
      }
    }
  };
  
  const getStatusSelectItems = () => {
    const statuses = getAvailableStatuses();
    
    return statuses.map((status) => (
      <SelectItem key={status} value={status}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </SelectItem>
    ));
  };
  
  const canUpdateStatus = (): boolean => {
    return getAvailableStatuses().length > 0;
  };
  
  if (loading) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="flex justify-center items-center h-[80vh]">
          <p>Loading order details...</p>
        </div>
      </DashboardLayout>
    );
  }
  
  if (!order || !product || !counterpartyProfile) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="flex justify-center items-center h-[80vh]">
          <p>Order not found</p>
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout userRole={userRole}>
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate(`/${userRole}-orders`)} 
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Orders
        </Button>
        
        <DashboardHeader 
          title="Order Details" 
          userName={profile?.name || "User"} 
          userRole={userRole}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-xl">Order #{order.id.slice(0, 8)}</CardTitle>
                  <CardDescription className="mt-1">
                    Placed on {new Date(order.created_at).toLocaleDateString("en-US", { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </CardDescription>
                </div>
                <div className="flex flex-col gap-2">
                  {getStatusBadge(order.status)}
                  {getPaymentStatusBadge(order.payment_status)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="border rounded-md">
                <div className="bg-muted p-4 rounded-t-md">
                  <h3 className="font-medium">Order Items</h3>
                </div>
                <div className="p-4">
                  <div className="flex items-center">
                    <div className="h-16 w-16 bg-muted rounded-md flex items-center justify-center mr-4">
                      {product.image_url ? (
                        <img src={product.image_url} alt={product.name} className="h-full w-full object-cover rounded-md" />
                      ) : (
                        <Package className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium">{product.name}</h4>
                      <div className="text-sm text-muted-foreground">
                        <span>{product.category}</span>
                        <span className="mx-2">•</span>
                        <span>{product.location}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(order.price)} / {product.unit}</div>
                      <div className="text-sm text-muted-foreground">Quantity: {order.quantity} {product.unit}</div>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Total</span>
                    <span className="font-bold text-lg">{formatCurrency(order.total_amount)}</span>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="border rounded-md">
                  <div className="bg-muted p-4 rounded-t-md">
                    <h3 className="font-medium">Payment Information</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <span>{getPaymentStatusBadge(order.payment_status)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Method</span>
                      <span>Bank Transfer</span>
                    </div>
                    {order.payment_date && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Date</span>
                        <span>{new Date(order.payment_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="border rounded-md">
                  <div className="bg-muted p-4 rounded-t-md">
                    <h3 className="font-medium">Shipping Information</h3>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <span>{getStatusBadge(order.status)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Destination</span>
                      <span>{counterpartyProfile.city || "Not specified"}</span>
                    </div>
                    {order.delivery_date && (
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Delivery Date</span>
                        <span>{new Date(order.delivery_date).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {order.notes && (
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-2">Order Notes</h3>
                  <p className="text-sm">{order.notes}</p>
                </div>
              )}
              
              {canUpdateStatus() && (
                <div className="border rounded-md p-4">
                  <h3 className="font-medium mb-4">Update Order Status</h3>
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <Select 
                        value={newStatus} 
                        onValueChange={(value) => setNewStatus(value as OrderStatus)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select new status" />
                        </SelectTrigger>
                        <SelectContent>
                          {getStatusSelectItems()}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button onClick={handleStatusUpdate} disabled={updating || newStatus === order.status}>
                      {updating ? "Updating..." : "Update Status"}
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="border rounded-md p-4">
                <h3 className="font-medium mb-4">Add a Note</h3>
                <div className="space-y-4">
                  <Textarea 
                    placeholder="Add a note to this order..." 
                    value={newNote}
                    onChange={(e) => setNewNote(e.target.value)}
                  />
                  <Button onClick={handleAddNote} disabled={updating || !newNote.trim()}>
                    Add Note
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex flex-wrap justify-between gap-4 border-t pt-6">
              <Button variant="outline" onClick={() => navigate(`/${userRole}-orders`)}>
                Back to Orders
              </Button>
              
              <div className="flex gap-2">
                {order.status === "confirmed" && userRole === "farmer" && (
                  <Button>
                    <Truck className="mr-2 h-4 w-4" />
                    Create Shipment
                  </Button>
                )}
                <Button variant="outline">
                  <FileText className="mr-2 h-4 w-4" />
                  Download Invoice
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{userRole === "farmer" ? "Customer" : "Seller"} Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="" />
                  <AvatarFallback>
                    {counterpartyProfile.name.split(' ').map(name => name[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{counterpartyProfile.name}</div>
                  <div className="text-sm text-muted-foreground">
                    {userRole === "farmer" ? "Trader" : "Farmer"}
                  </div>
                </div>
              </div>
              
              {counterpartyProfile.phone && (
                <div className="flex items-center text-sm">
                  <span className="text-muted-foreground mr-2">Phone:</span>
                  <span>{counterpartyProfile.phone}</span>
                </div>
              )}
              
              {counterpartyProfile.address && (
                <div className="flex items-center text-sm">
                  <span className="text-muted-foreground mr-2">Address:</span>
                  <span>
                    {counterpartyProfile.address}
                    {counterpartyProfile.city && `, ${counterpartyProfile.city}`}
                    {counterpartyProfile.state && `, ${counterpartyProfile.state}`}
                  </span>
                </div>
              )}
              
              <Separator />
              
              <div className="space-y-2">
                <Button variant="outline" className="w-full">
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Contact {userRole === "farmer" ? "Customer" : "Seller"}
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="mt-0.5 bg-green-100 p-2 rounded-full">
                    <Calendar className="h-4 w-4 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium">Order Placed</div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(order.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
                
                {order.status !== "pending" && order.status !== "cancelled" && (
                  <div className="flex items-start">
                    <div className="mt-0.5 bg-blue-100 p-2 rounded-full">
                      <CheckCircle className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium">Order Confirmed</div>
                      <div className="text-xs text-muted-foreground">
                        After order placement
                      </div>
                    </div>
                  </div>
                )}
                
                {(order.status === "shipped" || order.status === "delivered" || order.status === "completed") && (
                  <div className="flex items-start">
                    <div className="mt-0.5 bg-purple-100 p-2 rounded-full">
                      <Truck className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium">Order Shipped</div>
                      <div className="text-xs text-muted-foreground">
                        After confirmation
                      </div>
                    </div>
                  </div>
                )}
                
                {(order.status === "delivered" || order.status === "completed") && (
                  <div className="flex items-start">
                    <div className="mt-0.5 bg-green-100 p-2 rounded-full">
                      <CalendarCheck className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium">Order Delivered</div>
                      <div className="text-xs text-muted-foreground">
                        {order.delivery_date 
                          ? new Date(order.delivery_date).toLocaleDateString()
                          : "Date not recorded"}
                      </div>
                    </div>
                  </div>
                )}
                
                {order.status === "cancelled" && (
                  <div className="flex items-start">
                    <div className="mt-0.5 bg-red-100 p-2 rounded-full">
                      <XCircle className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium">Order Cancelled</div>
                      <div className="text-xs text-muted-foreground">
                        After order placement
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Need Help?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full">
                <AlertCircle className="mr-2 h-4 w-4" />
                Report an Issue
              </Button>
              <Button variant="outline" className="w-full">
                <ExternalLink className="mr-2 h-4 w-4" />
                View Support Center
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default OrderDetail;
