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
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  price: number;
  location: string;
  status: string;
  farmer_id: string;
  farmer_name: string;
  created_at: string;
  image_url: string | null;
}

const TraderMarket = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);
  
  const fetchProducts = async () => {
    try {
      const { data: marketProducts, error: productsError } = await supabase
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
          farmer_name,
          created_at,
          image_url
        `)
        .eq('status', 'active');

      if (productsError) throw productsError;

      // Get unique categories and locations
      const uniqueCategories = [...new Set(marketProducts?.map(p => p.category) || [])];
      const uniqueLocations = [...new Set(marketProducts?.map(p => p.location) || [])];

      setCategories(uniqueCategories);
      setLocations(uniqueLocations);
      setProducts(marketProducts || []);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load market products",
        variant: "destructive"
      });
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchProducts();
    
    // Set up a refresh interval
    const interval = window.setInterval(() => {
      fetchProducts();
    }, 60000); // Refresh every minute
    
    setRefreshInterval(interval);
    
    // Set up real-time subscription for products
    const channel = supabase
      .channel('market-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products' }, 
        () => {
          fetchProducts();
        }
      )
      .subscribe();
    
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      supabase.removeChannel(channel);
    };
  }, []);
  
  const filteredProducts = products.filter(product => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.farmer_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === "All" || product.category === categoryFilter;
    const matchesLocation = locationFilter === "All" || product.location === locationFilter;
    
    return matchesSearch && matchesCategory && matchesLocation;
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
      
      <div className="w-full p-6 space-y-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center space-y-4 sm:space-y-0">
              <div>
                <CardTitle className="text-2xl font-bold">Agricultural Market</CardTitle>
                <CardDescription className="text-base">Browse and purchase agricultural products</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row justify-between mb-8 gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search by product name, category, or location..."
                  className="pl-9 h-12 text-base bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-4">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[180px] h-12 text-base bg-white">
                    <SelectValue placeholder="Category" />
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
                  <SelectTrigger className="w-[180px] h-12 text-base bg-white">
                    <SelectValue placeholder="Location" />
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
            
            <div className="rounded-lg border bg-white overflow-hidden">
              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                  {filteredProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      id={product.id}
                      name={product.name}
                      category={product.category}
                      quantity={`${product.quantity} ${product.unit}`}
                      price={formatCurrency(product.price)}
                      location={product.location}
                      status="Listed"
                      image={product.image_url || undefined}
                      userRole="trader"
                    />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center mb-4">
                    <Package className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium text-muted-foreground mb-2">No products found</p>
                  <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TraderMarket;
