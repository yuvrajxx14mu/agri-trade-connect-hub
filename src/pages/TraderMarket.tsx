
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Gavel, ShoppingBag, Package } from "lucide-react";
import ProductCard from "@/components/ProductCard";

const products = [
  { id: "P1", name: "Organic Wheat", category: "Cereals", quantity: "20 Quintals", status: "Listed", price: "₹2,200/Quintal", location: "Amritsar" },
  { id: "P2", name: "Premium Rice", category: "Cereals", quantity: "15 Quintals", status: "In Auction", price: "₹3,500/Quintal", location: "Karnal" },
  { id: "P3", name: "Yellow Lentils", category: "Pulses", quantity: "10 Quintals", status: "Listed", price: "₹9,000/Quintal", location: "Indore" },
  { id: "P4", name: "Red Chillies", category: "Spices", quantity: "5 Quintals", status: "In Auction", price: "₹12,000/Quintal", location: "Guntur" },
  { id: "P5", name: "Fresh Potatoes", category: "Vegetables", quantity: "25 Quintals", status: "Listed", price: "₹1,800/Quintal", location: "Agra" },
  { id: "P6", name: "Basmati Rice", category: "Cereals", quantity: "12 Quintals", status: "Listed", price: "₹6,500/Quintal", location: "Dehradun" },
  { id: "P7", name: "Organic Tomatoes", category: "Vegetables", quantity: "8 Quintals", status: "In Auction", price: "₹4,200/Quintal", location: "Nashik" },
  { id: "P8", name: "Fresh Onions", category: "Vegetables", quantity: "30 Quintals", status: "Listed", price: "₹2,500/Quintal", location: "Lasalgaon" },
];

const categories = [
  "All",
  "Cereals",
  "Pulses",
  "Vegetables",
  "Fruits",
  "Spices",
  "Dairy",
  "Poultry",
];

const locations = [
  "All",
  "Amritsar",
  "Karnal",
  "Indore",
  "Guntur",
  "Agra",
  "Dehradun",
  "Nashik",
  "Lasalgaon",
];

const TraderMarket = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          product.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === "all" || 
                       (activeTab === "direct" && product.status === "Listed") ||
                       (activeTab === "auction" && product.status === "In Auction");
    
    const matchesCategory = categoryFilter === "All" || product.category === categoryFilter;
    const matchesLocation = locationFilter === "All" || product.location === locationFilter;
    
    return matchesSearch && matchesTab && matchesCategory && matchesLocation;
  });
  
  return (
    <DashboardLayout userRole="trader">
      <DashboardHeader title="Market" userName="Vikram Sharma" />
      
      <Card>
        <CardHeader>
          <CardTitle>Agricultural Products Marketplace</CardTitle>
          <CardDescription>Browse and purchase agricultural products directly or through auctions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for products, categories, or locations..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-3 w-full">
                  <TabsTrigger value="all">All Products</TabsTrigger>
                  <TabsTrigger value="direct">Direct Purchase</TabsTrigger>
                  <TabsTrigger value="auction">Auctions</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="flex-shrink-0">
                  <Filter className="h-4 w-4" />
                </Button>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  category={product.category}
                  quantity={product.quantity}
                  price={product.price}
                  location={product.location}
                  status={product.status}
                  userRole="trader"
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                {activeTab === "auction" ? (
                  <Gavel className="h-8 w-8 text-muted-foreground" />
                ) : activeTab === "direct" ? (
                  <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                ) : (
                  <Package className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <h3 className="text-lg font-medium mb-2">No products found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your search or filter criteria
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  Clear Search
                </Button>
                <Button variant="outline" onClick={() => setCategoryFilter("All")}>
                  Reset Categories
                </Button>
                <Button variant="outline" onClick={() => setLocationFilter("All")}>
                  Reset Location
                </Button>
              </div>
            </div>
          )}
          
          {activeTab === "auction" && filteredProducts.length > 0 && (
            <div className="mt-6 text-center">
              <Button 
                variant="default" 
                className="bg-agri-trader"
                onClick={() => navigate("/trader-auctions")}
              >
                <Gavel className="mr-2 h-4 w-4" />
                View All Auctions
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default TraderMarket;
