import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Package, 
  Tag, 
  MapPin, 
  CalendarDays, 
  Truck, 
  BarChart3, 
  ArrowLeft, 
  Pencil, 
  Trash, 
  ClipboardList,
  Gavel,
  ShoppingCart,
  MessageCircle,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  const [userRole, setUserRole] = useState<"farmer" | "trader">("farmer");
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<any>(null);
  
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        // First fetch the product details with farmer profile information
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select(`
            *,
            farmer:farmer_id (
              id,
              name,
              avatar_url
            )
          `)
          .eq('id', id)
          .single();
          
        if (productError) throw productError;
        
        if (!productData) {
          toast({
            title: "Error",
            description: "Product not found",
            variant: "destructive"
          });
          navigate(userRole === "farmer" ? "/farmer-products" : "/trader-market");
          return;
        }

        setProduct(productData);
      } catch (error) {
        console.error('Error fetching product:', error);
        toast({
          title: "Error",
          description: "Failed to load product details",
          variant: "destructive"
        });
        navigate(userRole === "farmer" ? "/farmer-products" : "/trader-market");
      } finally {
        setLoading(false);
      }
    };
    
    fetchProduct();
  }, [id, userRole, navigate, toast]);
  
  // Detect user role from URL 
  useEffect(() => {
    if (window.location.pathname.includes("farmer")) {
      setUserRole("farmer");
    } else {
      setUserRole("trader");
    }
  }, []);

  // Check if current user is the product owner
  const isProductOwner = profile?.id === product?.farmer_id;
  
  // Add handleDelete function
  const handleDelete = async () => {
    if (!id || !profile?.id) return;

    // Confirm deletion
    if (!window.confirm("Are you sure you want to delete this product?")) {
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)
        .eq('farmer_id', profile.id);

      if (error) throw error;

      toast({
        title: "Product Deleted",
        description: "The product has been deleted successfully"
      });

      navigate('/farmer-products');
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Delete Failed",
        description: "Failed to delete the product",
        variant: "destructive"
      });
    }
  };
  
  if (loading) {
    return (
      <DashboardLayout userRole={userRole}>
        <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </DashboardLayout>
    );
  }
  
  if (!product) {
    return null;
  }
  
  const renderFarmerActions = () => (
    <div className="flex flex-col sm:flex-row gap-3">
      {product.status === "active" && (
        <Button onClick={() => navigate(`/farmer-auctions/create?product=${id}`)}>
          <Gavel className="mr-2 h-4 w-4" />
          Create Auction
        </Button>
      )}
      <Button variant="outline" onClick={() => navigate(`/farmer-products/${id}/edit`)}>
        <Pencil className="mr-2 h-4 w-4" />
        Edit
      </Button>
      <Button variant="outline" className="text-destructive" onClick={handleDelete}>
        <Trash className="mr-2 h-4 w-4" />
        Delete
      </Button>
    </div>
  );
  
  const renderTraderActions = () => (
    <div className="flex flex-col sm:flex-row gap-3">
      {product.status === "active" ? (
        <Button className="bg-agri-trader" onClick={() => navigate(`/trader-orders/create/${id}`)}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Purchase Now
        </Button>
      ) : product.status === "in_auction" && (
        <Button className="bg-agri-trader" onClick={() => navigate(`/trader-auctions/${id}`)}>
          <Gavel className="mr-2 h-4 w-4" />
          View Auction
        </Button>
      )}
      {!isProductOwner && (
        <Button variant="outline" onClick={() => {}}>
          <MessageCircle className="mr-2 h-4 w-4" />
          Contact Seller
        </Button>
      )}
    </div>
  );
  
  const basePath = userRole === "farmer" ? "/farmer-products" : "/trader-market";
  
  return (
    <DashboardLayout userRole={userRole}>
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate(basePath)} 
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <DashboardHeader 
          title="Product Details" 
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
                  <CardTitle className="text-2xl">{product.name}</CardTitle>
                  <div className="flex items-center space-x-4 mt-2">
                    <span className="flex items-center">
                      <Tag className="mr-1 h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{product.category}</span>
                    </span>
                    <span className="flex items-center">
                      <MapPin className="mr-1 h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{product.location}</span>
                    </span>
                  </div>
                </div>
                <Badge 
                  className={product.status === "active" 
                    ? "bg-yellow-50 text-yellow-700 border-yellow-200" 
                    : product.status === "in_auction" 
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-green-50 text-green-700 border-green-200"}
                  variant="outline"
                >
                  {product.status === "active" ? "Listed" : 
                   product.status === "in_auction" ? "In Auction" : 
                   product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-md bg-muted p-6">
                <div className="flex flex-col sm:flex-row justify-between">
                  <div>
                    <div className="text-sm font-medium mb-1">Quantity Available</div>
                    <div className="text-2xl font-bold">{product.quantity} {product.unit}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium mb-1">Price Per {product.unit}</div>
                    <div className="text-2xl font-bold">{formatCurrency(product.price)}</div>
                  </div>
                </div>
              </div>
              
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="specifications">Specifications</TabsTrigger>
                  <TabsTrigger value="price-history">Price History</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="space-y-4 mt-4">
                  <div>
                    <h3 className="font-medium mb-2">Product Description</h3>
                    <p className="text-sm text-muted-foreground">{product.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-muted/50 p-4 rounded-md">
                      <div className="flex items-center space-x-4">
                        <CalendarDays className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Harvest Date</p>
                          <p className="text-sm text-muted-foreground">{new Date(product.harvest_date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-md">
                      <div className="flex items-center space-x-4">
                        <ClipboardList className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Shelf Life</p>
                          <p className="text-sm text-muted-foreground">{product.shelf_life || "Not specified"}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="specifications" className="mt-4">
                  <div className="space-y-4">
                    <h3 className="font-medium">Product Specifications</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-sm text-muted-foreground">Type</span>
                        <span className="text-sm font-medium">{product.quality}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-sm text-muted-foreground">Category</span>
                        <span className="text-sm font-medium">{product.category}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-sm text-muted-foreground">Location</span>
                        <span className="text-sm font-medium">{product.location}</span>
                      </div>
                      <div className="flex justify-between border-b pb-2">
                        <span className="text-sm text-muted-foreground">Quantity</span>
                        <span className="text-sm font-medium">{product.quantity} {product.unit}</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="price-history" className="mt-4">
                  <div className="space-y-4">
                    <h3 className="font-medium">Price History</h3>
                    <div className="h-64 w-full bg-muted/50 rounded-md flex items-center justify-center">
                      <BarChart3 className="h-12 w-12 text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-muted-foreground">Current Price</span>
                        <span className="text-sm font-medium">{formatCurrency(product.price)}/{product.unit}</span>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
            <CardFooter>
              {userRole === "farmer" ? renderFarmerActions() : renderTraderActions()}
            </CardFooter>
          </Card>
        </div>
        
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Seller Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src={product.farmer?.avatar_url} />
                  <AvatarFallback>
                    {product.farmer?.name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{product.farmer?.name}</div>
                  <div className="text-sm text-muted-foreground">{product.location}</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="text-sm font-medium">Contact Information</div>
                {!isProductOwner && (
                  <Button variant="outline" className="w-full" onClick={() => {}}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Contact Seller
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Shipping Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start space-x-3">
                <Truck className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Shipping Available</div>
                  <div className="text-sm text-muted-foreground">
                    {product.shipping_availability || "Contact seller for shipping information."}
                  </div>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <ClipboardList className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Shipping Policy</div>
                  <div className="text-sm text-muted-foreground">
                    {product.shipping_policy || "Contact seller for shipping policy details."}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProductDetail;
