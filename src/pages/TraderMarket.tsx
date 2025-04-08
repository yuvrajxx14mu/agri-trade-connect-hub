import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Gavel, ShoppingBag, Package, Loader2 } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { formatCurrency } from "@/lib/utils";

const TraderMarket = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Fetch active products with related data
        const { data: marketProducts, error } = await supabase
          .from('products')
          .select(`
            id,
            name,
            category,
            description,
            quantity,
            unit,
            price,
            location,
            status,
            farmer_id,
            profiles (
              name
            ),
            created_at,
            image_url
          `)
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Get unique categories and locations
        const uniqueCategories = [...new Set(marketProducts?.map(p => p.category) || [])];
        const uniqueLocations = [...new Set(marketProducts?.map(p => p.location) || [])];

        setCategories(uniqueCategories);
        setLocations(uniqueLocations);
        setProducts(marketProducts || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.profiles?.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === "all" || 
                       (activeTab === "direct" && !product.auction_id) ||
                       (activeTab === "auction" && product.auction_id);
    
    const matchesCategory = categoryFilter === "All" || product.category === categoryFilter;
    const matchesLocation = locationFilter === "All" || product.location === locationFilter;
    
    return matchesSearch && matchesTab && matchesCategory && matchesLocation;
  });

  if (loading) {
    return (
      <DashboardLayout userRole="trader">
        <DashboardHeader title="Market" userName={profile?.name || ""} userRole="trader" />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="trader">
      <DashboardHeader title="Market" userName={profile?.name || ""} userRole="trader" />
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center">
            <div>
              <CardTitle>Agricultural Market</CardTitle>
              <CardDescription>Browse and purchase agricultural products</CardDescription>
            </div>
            <div className="flex gap-4 mt-4 md:mt-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search products..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={locationFilter} onValueChange={setLocationFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="All">All Locations</SelectItem>
                  {locations.map((location) => (
                    <SelectItem key={location} value={location}>
                      {location}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All Products</TabsTrigger>
              <TabsTrigger value="direct">Direct Purchase</TabsTrigger>
              <TabsTrigger value="auction">Auctions</TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                category={product.category}
                quantity={`${product.quantity} ${product.unit}`}
                price={formatCurrency(product.price)}
                location={product.location}
                status={product.auction_id ? "In Auction" : "Listed"}
                image={product.image_url}
                userRole="trader"
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default TraderMarket;
