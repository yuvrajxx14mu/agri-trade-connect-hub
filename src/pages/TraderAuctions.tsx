
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Gavel, Clock, Calendar, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface AuctionProduct {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  location: string;
  farmer_id: string;
  farmer_name: string;
  created_at: string;
  auction: {
    id: string;
    current_price: number;
    end_time: string;
    status: string;
  } | null;
}

const TraderAuctions = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [auctions, setAuctions] = useState<AuctionProduct[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);

  const fetchAuctions = async () => {
    try {
      setIsLoading(true);
      // First, fetch active auctions
      const { data: auctionsData, error: auctionsError } = await supabase
        .from('auctions')
        .select('id, product_id, current_price, end_time, status')
        .eq('status', 'active');
        
      if (auctionsError) throw auctionsError;
      
      if (!auctionsData || auctionsData.length === 0) {
        setAuctions([]);
        setIsLoading(false);
        return;
      }
      
      // Get product IDs from auctions
      const productIds = auctionsData.map(a => a.product_id);
      
      // Fetch the products for those auctions
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('id, name, category, quantity, unit, price, location, farmer_id, farmer_name, created_at')
        .in('id', productIds);
        
      if (productsError) throw productsError;
      
      // Build the combined auction products data
      const auctionProducts: AuctionProduct[] = (productsData || []).map(product => {
        const auction = auctionsData.find(a => a.product_id === product.id);
        return {
          ...product,
          auction: auction ? {
            id: auction.id,
            current_price: auction.current_price,
            end_time: auction.end_time,
            status: auction.status
          } : null
        };
      });
      
      // Get unique categories and locations
      const uniqueCategories = [...new Set(auctionProducts.map(p => p.category))];
      const uniqueLocations = [...new Set(auctionProducts.map(p => p.location))];

      setCategories(uniqueCategories);
      setLocations(uniqueLocations);
      setAuctions(auctionProducts);
    } catch (error) {
      console.error('Error fetching auctions:', error);
      toast({
        title: "Error",
        description: "Failed to load auctions. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
    
    // Set up a refresh interval
    const interval = window.setInterval(() => {
      fetchAuctions();
    }, 30000); // Refresh every 30 seconds
    
    setRefreshInterval(interval);
    
    // Set up real-time subscription for auctions and bids
    const channel = supabase
      .channel('auction-updates')
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'auctions' }, 
        () => {
          fetchAuctions();
        }
      )
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'bids' }, 
        () => {
          fetchAuctions();
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

  const filteredAuctions = auctions.filter(auction => {
    const matchesSearch = 
      auction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      auction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      auction.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      auction.farmer_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === "All" || auction.category === categoryFilter;
    const matchesLocation = locationFilter === "All" || auction.location === locationFilter;

    return matchesSearch && matchesCategory && matchesLocation;
  });

  const calculateTimeLeft = (endTime: string) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return "Ended";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days}d ${hours}h`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`;
    } else {
      return `${minutes}m`;
    }
  };

  return (
    <DashboardLayout userRole="trader">
      <DashboardHeader title="Auctions" userName={profile?.name || ""} userRole="trader" />
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center">
            <div>
              <CardTitle>Active Auctions</CardTitle>
              <CardDescription>Browse and participate in agricultural product auctions</CardDescription>
            </div>
            <div className="flex gap-4 mt-4 md:mt-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search auctions..."
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
          {isLoading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : filteredAuctions.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredAuctions.map((auction) => (
                <Card key={auction.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{auction.name}</CardTitle>
                        <CardDescription>by {auction.farmer_name}</CardDescription>
                      </div>
                      <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                        Active
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Location:</span>
                        <span>{auction.location}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Quantity:</span>
                        <span>{`${auction.quantity} ${auction.unit}`}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Current Bid:</span>
                        <span className="font-medium">{formatCurrency(auction.auction?.current_price || auction.price)}/{auction.unit}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Time Left:</span>
                        <span className="font-medium">{auction.auction ? calculateTimeLeft(auction.auction.end_time) : "N/A"}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Posted:</span>
                        <span>{formatDistanceToNow(new Date(auction.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </CardContent>
                  <div className="p-4 pt-0">
                    <Button 
                      className="w-full bg-agri-trader"
                      onClick={() => navigate(`/trader-auctions/${auction.id}`)}
                    >
                      <Gavel className="mr-2 h-4 w-4" />
                      Place Bid
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Gavel className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No active auctions found</h3>
              <p className="text-muted-foreground mb-6">
                Check back later for new auctions or adjust your filters
              </p>
              <Button onClick={() => navigate("/trader-market")}>
                Browse Market
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default TraderAuctions;
