import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ArrowLeft, Package, Tag, MapPin } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

const TraderOrderCreate = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user, profile } = useAuth();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(false);
  const [product, setProduct] = useState<any>(null);
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        // First fetch the product
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("*")
          .eq("id", id)
          .single();
          
        if (productError) throw productError;
        
        if (!productData) {
          toast({
            title: "Error",
            description: "Product not found",
            variant: "destructive"
          });
          navigate("/trader-market");
          return;
        }

        // Then fetch the farmer's profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id, name, phone, address, city, state, pincode")
          .eq("id", productData.farmer_id)
          .single();

        if (profileError) throw profileError;

        // Combine the data
        const combinedData = {
          ...productData,
          profiles: profileData
        };

        setProduct(combinedData);
      } catch (error) {
        console.error("Error fetching product:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to fetch product details. Please try again.",
        });
        navigate("/trader-market");
      }
    };
    
    if (id) fetchProduct();
  }, [id, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !user || !profile) return;

    setIsLoading(true);
    try {
      // Validate quantity
      const quantityNum = parseFloat(quantity);
      if (isNaN(quantityNum) || quantityNum <= 0) {
        throw new Error("Please enter a valid quantity");
      }

      if (quantityNum > product.quantity) {
        throw new Error(`Quantity cannot exceed available stock (${product.quantity} ${product.unit})`);
      }

      if (!shippingAddress.trim()) {
        throw new Error("Please enter a shipping address");
      }

      const totalAmount = quantityNum * product.price;

      // Check if product is still available
      const { data: currentProduct, error: productError } = await supabase
        .from("products")
        .select("quantity, status")
        .eq("id", product.id)
        .single();

      if (productError) throw productError;

      if (!currentProduct) {
        throw new Error("Product no longer available");
      }

      if (currentProduct.status !== "active") {
        throw new Error("Product is no longer available for purchase");
      }

      if (currentProduct.quantity < quantityNum) {
        throw new Error(`Only ${currentProduct.quantity} ${product.unit} available`);
      }

      // Create order
      const orderData = {
        product_id: product.id,
        trader_id: profile.id,
        farmer_id: product.farmer_id,
        quantity: quantityNum,
        price: product.price,
        total_amount: totalAmount,
        status: "pending",
        payment_status: "pending",
        notes: notes || null,
        shipping_address: shippingAddress.trim(),
        delivery_date: null,
        payment_date: null
      };

      const { data: order, error } = await supabase
        .from("orders")
        .insert(orderData)
        .select()
        .single();

      if (error) throw error;

      // Create notification for farmer
      await supabase
        .from("notifications")
        .insert({
          user_id: product.farmer_id,
          title: "New Order Received",
          message: `You have received a new order for ${product.name}`,
          type: "order_created",
          read: false
        });

      // Update product quantity
      const newQuantity = product.quantity - quantityNum;
      await supabase
        .from("products")
        .update({ quantity: newQuantity })
        .eq("id", product.id);

      toast({
        title: "Order Created",
        description: "Your order has been created successfully.",
      });

      navigate(`/trader-orders/${order.id}`);
    } catch (error: any) {
      console.error("Error creating order:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to create order. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!product) {
    return (
      <DashboardLayout userRole="trader">
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="trader">
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate(`/trader-market`)} 
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Market
        </Button>
        
        <DashboardHeader 
          title="Create Order" 
          userName={profile?.name || "User"} 
          userRole="trader"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Order Details</CardTitle>
              <CardDescription>
                Review the product details and enter your order information
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Quantity *</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="0.01"
                      step="0.01"
                      value={quantity}
                      onChange={(e) => setQuantity(e.target.value)}
                      placeholder={`Enter quantity in ${product.unit}`}
                      required
                    />
                    <p className="text-sm text-muted-foreground">
                      Available: {product.quantity} {product.unit}
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Price Per {product.unit}</Label>
                    <div className="text-2xl font-bold">
                      {formatCurrency(product.price)}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="shippingAddress">Shipping Address *</Label>
                  <Textarea
                    id="shippingAddress"
                    value={shippingAddress}
                    onChange={(e) => setShippingAddress(e.target.value)}
                    placeholder="Enter your shipping address"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Additional Notes</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add any additional notes or requirements"
                  />
                </div>

                <div className="rounded-md bg-muted p-4">
                  <div className="flex justify-between items-center">
                    <div className="text-sm font-medium">Total Amount</div>
                    <div className="text-2xl font-bold">
                      {quantity ? formatCurrency(parseFloat(quantity) * product.price) : formatCurrency(0)}
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Order...
                    </>
                  ) : (
                    "Create Order"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-muted-foreground">{product.category}</div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <Tag className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Price</div>
                  <div className="text-sm text-muted-foreground">
                    {formatCurrency(product.price)}/{product.unit}
                  </div>
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <MapPin className="h-5 w-5 text-muted-foreground" />
                <div>
                  <div className="text-sm font-medium">Location</div>
                  <div className="text-sm text-muted-foreground">{product.location}</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Seller Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4">
                <div>
                  <div className="font-medium">{product.profiles?.name}</div>
                  <div className="text-sm text-muted-foreground">{product.location}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TraderOrderCreate; 