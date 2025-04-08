
import { useState } from "react";
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
  MessageCircle
} from "lucide-react";

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<"farmer" | "trader">("farmer");
  
  // This would normally be fetched from an API
  const product = {
    id: id || "P1",
    name: "Organic Wheat",
    description: "High-quality organic wheat grown without pesticides. Perfect for making premium flour and baking products.",
    category: "Cereals",
    quantity: "20 Quintals",
    price: "₹2,200/Quintal",
    location: "Amritsar, Punjab",
    status: "Listed",
    harvestDate: "Mar 15, 2025",
    shelfLife: "12 months",
    owner: {
      name: "Rajesh Kumar",
      location: "Amritsar, Punjab",
      rating: 4.8,
      verified: true,
      image: ""
    },
    specifications: [
      { label: "Type", value: "Organic" },
      { label: "Variety", value: "HD-2967" },
      { label: "Moisture", value: "12%" },
      { label: "Protein Content", value: "11.5%" },
      { label: "Certification", value: "Organic India" },
      { label: "Cultivation Method", value: "Natural Farming" },
      { label: "Harvest Season", value: "Rabi 2024" },
    ],
    priceHistory: [
      { date: "Jan 2025", price: 2100 },
      { date: "Feb 2025", price: 2150 },
      { date: "Mar 2025", price: 2200 },
    ]
  };
  
  // Detect user role from URL 
  useState(() => {
    if (window.location.pathname.includes("farmer")) {
      setUserRole("farmer");
    } else {
      setUserRole("trader");
    }
  });
  
  const renderFarmerActions = () => (
    <div className="flex flex-col sm:flex-row gap-3">
      {product.status === "Listed" && (
        <Button onClick={() => navigate(`/farmer-products/${id}/auction`)}>
          <Gavel className="mr-2 h-4 w-4" />
          Create Auction
        </Button>
      )}
      <Button variant="outline" onClick={() => navigate(`/farmer-products/${id}/edit`)}>
        <Pencil className="mr-2 h-4 w-4" />
        Edit Product
      </Button>
      <Button variant="outline" className="text-destructive">
        <Trash className="mr-2 h-4 w-4" />
        Delete
      </Button>
    </div>
  );
  
  const renderTraderActions = () => (
    <div className="flex flex-col sm:flex-row gap-3">
      {product.status === "Listed" ? (
        <Button className="bg-agri-trader" onClick={() => navigate(`/trader-orders/create/${id}`)}>
          <ShoppingCart className="mr-2 h-4 w-4" />
          Purchase Now
        </Button>
      ) : product.status === "In Auction" && (
        <Button className="bg-agri-trader" onClick={() => navigate(`/trader-auctions/${id}`)}>
          <Gavel className="mr-2 h-4 w-4" />
          View Auction
        </Button>
      )}
      <Button variant="outline" onClick={() => {}}>
        <MessageCircle className="mr-2 h-4 w-4" />
        Contact Seller
      </Button>
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
          userName={userRole === "farmer" ? "Rajesh Kumar" : "Vikram Sharma"} 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">{product.name}</CardTitle>
                  <CardDescription className="mt-2">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Tag className="mr-1 h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{product.category}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="mr-1 h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{product.location}</span>
                      </div>
                    </div>
                  </CardDescription>
                </div>
                <Badge 
                  className={product.status === "Listed" 
                    ? "bg-yellow-50 text-yellow-700 border-yellow-200" 
                    : product.status === "In Auction" 
                    ? "bg-blue-50 text-blue-700 border-blue-200"
                    : "bg-green-50 text-green-700 border-green-200"}
                  variant="outline"
                >
                  {product.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-md bg-muted p-6">
                <div className="flex flex-col sm:flex-row justify-between">
                  <div>
                    <div className="text-sm font-medium mb-1">Quantity Available</div>
                    <div className="text-2xl font-bold">{product.quantity}</div>
                  </div>
                  <div className="mt-4 sm:mt-0">
                    <div className="text-sm font-medium mb-1">Price Per Quintal</div>
                    <div className="text-2xl font-bold">{product.price}</div>
                  </div>
                </div>
              </div>
              
              <Tabs defaultValue="details">
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
                          <p className="text-sm text-muted-foreground">{product.harvestDate}</p>
                        </div>
                      </div>
                    </div>
                    <div className="bg-muted/50 p-4 rounded-md">
                      <div className="flex items-center space-x-4">
                        <ClipboardList className="h-5 w-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">Shelf Life</p>
                          <p className="text-sm text-muted-foreground">{product.shelfLife}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="specifications" className="mt-4">
                  <div className="space-y-4">
                    <h3 className="font-medium">Product Specifications</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {product.specifications.map((spec, index) => (
                        <div key={index} className="flex justify-between border-b pb-2">
                          <span className="text-sm text-muted-foreground">{spec.label}</span>
                          <span className="text-sm font-medium">{spec.value}</span>
                        </div>
                      ))}
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
                      {product.priceHistory.map((item, index) => (
                        <div key={index} className="flex justify-between">
                          <span className="text-sm text-muted-foreground">{item.date}</span>
                          <span className="text-sm font-medium">₹{item.price}/Quintal</span>
                        </div>
                      ))}
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
                  <AvatarImage src={product.owner.image} alt={product.owner.name} />
                  <AvatarFallback>
                    {product.owner.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-medium">{product.owner.name}</div>
                  <div className="text-sm text-muted-foreground">{product.owner.location}</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Rating</span>
                  <span className="text-sm font-medium">{product.owner.rating}/5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Verification</span>
                  <span className="text-sm font-medium">
                    {product.owner.verified ? "Verified Seller" : "Unverified"}
                  </span>
                </div>
              </div>
              
              <Separator className="my-4" />
              
              <div className="space-y-3">
                <div className="text-sm font-medium">Contact Information</div>
                <Button variant="outline" className="w-full" onClick={() => {}}>
                  <MessageCircle className="mr-2 h-4 w-4" />
                  Message Seller
                </Button>
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
                  <p className="text-sm text-muted-foreground">
                    The seller provides shipping across Punjab, Haryana, and Delhi NCR.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <ClipboardList className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <div className="text-sm font-medium">Shipping Policy</div>
                  <p className="text-sm text-muted-foreground">
                    Shipping costs vary by location. Delivery typically takes 2-5 business days after order confirmation.
                  </p>
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
