import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Package, 
  Search,
  Eye,
  ShoppingCart,
  Loader2,
  Filter
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";

interface Product {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price: number;
  quantity: number;
  unit: string;
  location: string | null;
  image_url: string | null;
  farmer_id: string;
  created_at: string;
  status: string;
  profiles?: {
    id: string;
    name: string;
    avatar_url: string | null;
  } | null;
}

const MarketProducts = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // First, let's just get the products
        const { data: productsData, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false });

        if (productsError) throw productsError;

        // Then, get the farmer profiles for these products
        const farmerIds = [...new Set(productsData?.map(p => p.farmer_id) || [])];
        const { data: farmersData, error: farmersError } = await supabase
          .from('profiles')
          .select('id, name')  // Removed avatar_url as it might not exist
          .in('id', farmerIds);

        if (farmersError) throw farmersError;

        // Create a map of farmer data with proper typing
        const farmersMap = (farmersData || []).reduce<{ [key: string]: { id: string; name: string; avatar_url: string | null } }>((acc, farmer) => {
          if (farmer && typeof farmer === 'object' && 'id' in farmer) {
            acc[farmer.id] = {
              id: farmer.id,
              name: farmer.name || 'Unknown Farmer',
              avatar_url: null // Since we're not fetching it
            };
          }
          return acc;
        }, {});
        
        // Transform the data to match the Product interface
        const transformedData = (productsData || []).map((item: any): Product => ({
          id: item.id,
          name: item.name,
          description: item.description,
          category: item.category,
          price: typeof item.price === 'string' ? parseFloat(item.price) : item.price,
          quantity: typeof item.quantity === 'string' ? parseFloat(item.quantity) : item.quantity,
          unit: item.unit,
          location: item.location,
          image_url: item.image_url,
          farmer_id: item.farmer_id,
          created_at: item.created_at,
          status: item.status,
          profiles: farmersMap[item.farmer_id] || null
        }));

        setProducts(transformedData);
        setFilteredProducts(transformedData);
      } catch (error) {
        console.error('Error fetching products:', error);
        toast({
          title: "Error",
          description: "Failed to load products",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();

    // Set up real-time subscription for product updates
    const channel = supabase
      .channel('market-products')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'products', filter: "status=eq.active" }, 
        () => { fetchProducts(); }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [toast]);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredProducts(products);
    } else {
      const filtered = products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.profiles?.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    }
  }, [searchQuery, products]);

  if (loading) {
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
        <DashboardHeader 
          title="Market Products" 
          userName={profile?.name || "Trader"} 
          userRole="trader"
        />
        <div className="flex flex-col sm:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="overflow-hidden">
            <div className="aspect-square relative bg-muted">
              {product.image_url ? (
                <img
                  src={product.image_url}
                  alt={product.name}
                  className="object-cover w-full h-full"
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full bg-muted">
                  <Package className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
            </div>
            <CardContent className="p-4">
              <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-semibold truncate">{product.name}</h3>
                    <p className="text-sm text-muted-foreground truncate">
                      by {product.profiles?.name}
                    </p>
                  </div>
                  <Badge variant="secondary">{product.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {product.description}
                </p>
                <div className="flex items-center justify-between mt-2">
                  <div className="font-semibold">{formatCurrency(product.price)}</div>
                  <div className="text-sm text-muted-foreground">
                    {product.quantity} {product.unit}
                  </div>
                </div>
                <div className="flex gap-2 mt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/trader-market/${product.id}`)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button
                    variant="purchase"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/trader-order-create/${product.id}`)}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Buy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {filteredProducts.length === 0 && (
          <div className="col-span-full">
            <Card className="p-8">
              <div className="flex flex-col items-center gap-2 text-center">
                <Package className="h-8 w-8 text-muted-foreground" />
                <p className="font-medium">
                  {searchQuery ? "No products match your search" : "No products available"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {searchQuery 
                    ? "Try adjusting your search terms"
                    : "Check back later for new products"
                  }
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default MarketProducts; 