import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ArrowLeft, ShoppingCart } from "lucide-react";

const TraderOrderCreate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();
          
        if (error) throw error;
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch product details. Please try again.",
        });
      }
    };
    
    if (id) fetchProduct();
  }, [id]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!product || !quantity || Number(quantity) <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid Input",
        description: "Please enter a valid quantity.",
      });
      return;
    }
    
    if (Number(quantity) > product.quantity) {
      toast({
        variant: "destructive",
        title: "Invalid Quantity",
        description: "Quantity cannot exceed available stock.",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      const totalAmount = Number(quantity) * product.price;
      
      const { data, error } = await supabase
        .from("orders")
        .insert({
          product_id: id,
          trader_id: user?.id,
          farmer_id: product.farmer_id,
          quantity: Number(quantity),
          price: product.price,
          total_amount: totalAmount,
          notes,
          status: "pending",
          payment_status: "pending"
        })
        .select()
        .single();
        
      if (error) throw error;
      
      // Update product quantity
      const newQuantity = product.quantity - Number(quantity);
      const { error: updateError } = await supabase
        .from("products")
        .update({ quantity: newQuantity })
        .eq("id", id);
        
      if (updateError) throw updateError;
      
      // Create notification for farmer
      await supabase
        .from("notifications")
        .insert({
          user_id: product.farmer_id,
          title: "New Order Received",
          message: `You have received a new order for ${quantity} units of ${product.name}`,
          type: "order",
          related_id: data.id
        });
      
      toast({
        title: "Success",
        description: "Order placed successfully!",
      });
      
      navigate("/trader-orders");
    } catch (error) {
      console.error("Error creating order:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to create order. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!product) {
    return (
      <DashboardLayout userRole="trader">
        <div className="flex items-center justify-center h-full">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }
  
  return (
    <DashboardLayout userRole="trader">
      <DashboardHeader title="Create Order" userName={profile?.name || ""} />
      
      <div className="mb-4">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="flex items-center text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Place Order for {product.name}</CardTitle>
          <CardDescription>Review the details and place your order</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Product Name</Label>
                <Input value={product.name} disabled />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Input value={product.category} disabled />
              </div>
              <div className="space-y-2">
                <Label>Available Quantity</Label>
                <Input value={`${product.quantity} ${product.unit}`} disabled />
              </div>
              <div className="space-y-2">
                <Label>Price per {product.unit}</Label>
                <Input value={`₹${product.price}`} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Order Quantity (in {product.unit})</Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={product.quantity}
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Total Amount</Label>
                <Input
                  value={quantity ? `₹${Number(quantity) * product.price}` : "₹0"}
                  disabled
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Additional Notes</Label>
              <Textarea
                id="notes"
                placeholder="Add any special instructions or notes for the farmer..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
            
            <Button
              type="submit"
              className="w-full bg-agri-trader"
              disabled={isLoading}
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <ShoppingCart className="h-4 w-4 mr-2" />
              )}
              Place Order
            </Button>
          </form>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default TraderOrderCreate; 