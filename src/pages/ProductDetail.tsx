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
  Loader2,
  Phone
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";

interface Profile {
  id: string;
  name: string;
  role: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
}

interface Product {
  id: string;
  name: string;
  description?: string | null;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  location: string;
  status: string;
  quality: string;
  created_at: string;
  updated_at: string;
  farmer_id: string;
  image_url?: string | null;
  additional_images?: string[] | null;
  auction_id?: string | null;
  category_id?: string | null;
  formattedPrice?: string;
  farmer?: Profile;
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  const [userRole, setUserRole] = useState<"farmer" | "trader">("farmer");
  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);
  
  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      
      try {
        // First fetch the product details
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();
          
        if (productError) {
          console.error('Error fetching product:', productError);
          throw productError;
        }
        
        if (!productData) {
          toast({
            title: "Error",
            description: "Product not found",
            variant: "destructive"
          });
          navigate(userRole === "farmer" ? "/farmer-products" : "/trader-market");
          return;
        }

        // Fetch farmer profile
        const { data: farmerData, error: farmerError } = await supabase
          .from('profiles')
          .select('id, name, role, phone, address, city, state')
          .eq('id', productData.farmer_id)
          .single();

        if (farmerError) {
          console.error('Error fetching farmer:', farmerError);
        }

        const formattedProduct: Product = {
          ...productData,
          farmer: farmerData || {
            id: productData.farmer_id,
            name: 'Unknown Farmer',
            role: 'farmer'
          },
          formattedPrice: productData.price && !isNaN(productData.price) 
            ? formatCurrency(productData.price)
            : 'Price not set'
        };

        setProduct(formattedProduct);
      } catch (error: any) {
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

  const handleDelete = async () => {
    if (!id || !profile?.id) return;

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

  const handleOrderCreate = () => {
    if (userRole === "trader") {
      navigate(`/trader-order-create/${id}`);
    }
  };

  const handleAuctionCreate = () => {
    if (userRole === "farmer") {
      navigate(`/farmer-auctions/create?product=${id}`);
    } else {
      navigate(`/trader-auctions/${id}`);
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
        <Button onClick={handleAuctionCreate}>
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
        <Button className="bg-agri-trader" onClick={handleOrderCreate}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Purchase Now
        </Button>
      ) : product.status === "in_auction" && (
        <Button className="bg-agri-trader" onClick={handleAuctionCreate}>
          <Gavel className="mr-2 h-4 w-4" />
          View Auction
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
                    <div className="text-2xl font-bold">{product.formattedPrice}</div>
                  </div>
                </div>
              </div>
              
              <Tabs defaultValue="details">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="details">Details</TabsTrigger>
                  <TabsTrigger value="specifications">Specifications</TabsTrigger>
                </TabsList>
                <TabsContent value="details" className="space-y-4 mt-4">
                  <div>
                    <h3 className="font-medium mb-2">Product Description</h3>
                    <p className="text-sm text-muted-foreground">{product.description || "No description available"}</p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div className="bg-muted/50 p-4 rounded-md">
                      <div className="flex items-center space-x-4">
                        <CalendarDays className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Listed Date</p>
                          <p className="text-sm text-muted-foreground">{new Date(product.created_at).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-md">
                      <div className="flex items-center space-x-4">
                        <ClipboardList className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Last Updated</p>
                          <p className="text-sm text-muted-foreground">{new Date(product.updated_at).toLocaleDateString()}</p>
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
                        <span className="text-sm text-muted-foreground">Quality</span>
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
              </Tabs>
            </CardContent>
            <CardFooter>
              {userRole === "farmer" ? renderFarmerActions() : renderTraderActions()}
            </CardFooter>
          </Card>
        </div>
        
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Farmer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${product.farmer?.name}`} />
                  <AvatarFallback>{product.farmer?.name?.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{product.farmer?.name}</p>
                  <p className="text-sm text-muted-foreground">Verified Farmer</p>
                </div>
              </div>
              
              {product.farmer?.phone && (
                <div className="flex items-start space-x-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">Phone</div>
                    <div className="text-sm text-muted-foreground">{product.farmer.phone}</div>
                  </div>
                </div>
              )}
              
              {product.farmer?.address && (
                <div className="flex items-start space-x-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <div className="text-sm font-medium">Address</div>
                    <div className="text-sm text-muted-foreground">
                      {[
                        product.farmer.address,
                        product.farmer.city,
                        product.farmer.state
                      ].filter(Boolean).join(", ")}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
          
          {product.image_url && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Product Images</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="aspect-square rounded-md overflow-hidden">
                  <img 
                    src={product.image_url} 
                    alt={product.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {product.additional_images && product.additional_images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {product.additional_images.map((image, index) => (
                      <div key={index} className="aspect-square rounded-md overflow-hidden">
                        <img 
                          src={image} 
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProductDetail;
