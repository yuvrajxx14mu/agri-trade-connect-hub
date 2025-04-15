import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Gavel, Clock, Calendar, Loader2, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import BidDialog from "@/components/BidDialog";

interface DatabaseAuction {
  id: string;
  product_id: string;
  farmer_id: string;
  start_price: number;
  current_price: number;
  min_increment: number;
  quantity: number;
  end_time: string;
  status: string;
  created_at: string;
  products: {
    id: string;
    name: string;
    category: string;
    description: string | null;
    quantity: number;
    unit: string;
    price: number;
    location: string;
    image_url: string | null;
    farmer_id: string;
  };
  profiles: {
    id: string;
    name: string;
    role: string;
  };
  bids: Array<{
    id: string;
    amount: number;
    bidder_id: string;
    created_at: string;
  }>;
}

interface AuctionProduct {
  id: string;
  name: string;
  category: string;
  description: string;
  quantity: number;
  unit: string;
  location: string;
  image_url: string | null;
  farmer: {
    id?: string;
    name: string;
    role?: string;
  };
  auction: {
    id: string;
    start_price: number;
    current_price: number;
    min_increment: number;
    end_time: string;
    status: string;
    bids: Array<{
      id: string;
      amount: number;
      bidder_id: string;
      created_at: string;
    }>;
  };
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
  const [refreshInterval, setRefreshInterval] = useState<NodeJS.Timeout | null>(null);
  const [selectedAuction, setSelectedAuction] = useState<AuctionProduct | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [isBidding, setIsBidding] = useState(false);

  const fetchAuctions = async () => {
    try {
      setIsLoading(true);
      
      const { data: auctionsData, error: auctionsError } = await supabase
        .from('auctions')
        .select(`
          id,
          product_id,
          farmer_id,
          start_price,
          current_price,
          min_increment,
          quantity,
          end_time,
          status,
          created_at,
          products!product_id(
            id,
            name,
            category,
            description,
            quantity,
            unit,
            price,
            location,
            image_url,
            farmer_id
          ),
          bids(
            id,
            amount,
            bidder_id,
            created_at
          )
        `)
        .eq('status', 'active')
        .order('end_time', { ascending: true });

      if (auctionsError) {
        toast({
          title: "Error",
          description: "Unable to load auctions. Please try again later.",
          variant: "destructive"
        });
        return;
      }

      if (!auctionsData || !Array.isArray(auctionsData)) {
        setAuctions([]);
        setCategories([]);
        setLocations([]);
        return;
      }

      // Fetch farmer profiles separately
      const farmerIds = [...new Set(auctionsData.map(auction => auction.farmer_id))];
      const { data: farmerProfiles, error: farmerError } = await supabase
        .from('profiles')
        .select('id, name, role')
        .in('id', farmerIds);

      if (farmerError) {
        toast({
          title: "Warning",
          description: "Some farmer information may be unavailable.",
          variant: "default"
        });
      }

      // Create a map of farmer profiles
      const farmerProfilesMap = (farmerProfiles || []).reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {});

      // Transform the data to include product and farmer information
      const transformedAuctions: AuctionProduct[] = auctionsData
        .filter(auction => {
          if (!auction.products) {
            console.warn('Missing product data for auction:', auction.id);
            return false;
          }
          return true;
        })
        .map(auction => {
          const product = auction.products as NonNullable<DatabaseAuction['products']>;
          const farmerProfile = farmerProfilesMap[auction.farmer_id] || {
            id: auction.farmer_id,
            name: 'Unknown Farmer',
            role: 'farmer'
          };
          
          return {
            id: product.id,
            name: product.name,
            category: product.category,
            description: product.description || '',
            quantity: auction.quantity,
            unit: product.unit,
            location: product.location,
            image_url: product.image_url,
            farmer: {
              id: farmerProfile.id,
              name: farmerProfile.name,
              role: farmerProfile.role
            },
            auction: {
              id: auction.id,
              start_price: auction.start_price,
              current_price: auction.current_price,
              min_increment: auction.min_increment,
              end_time: auction.end_time,
              status: auction.status,
              bids: Array.isArray(auction.bids) ? auction.bids : []
            }
          };
        });

      // Extract unique categories and locations for filters
      const uniqueCategories = [...new Set(transformedAuctions.map(a => a.category))].filter(Boolean);
      const uniqueLocations = [...new Set(transformedAuctions.map(a => a.location))].filter(Boolean);
      
      setAuctions(transformedAuctions);
      setCategories(uniqueCategories);
      setLocations(uniqueLocations);
    } catch (error) {
      console.error('Error in fetchAuctions:', error);
      toast({
        title: "Error",
        description: "Unable to load auctions. Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
    
    // Set up a refresh interval
    const interval = setInterval(() => {
      fetchAuctions();
    }, 30000); // Refresh every 30 seconds
    
    setRefreshInterval(interval);
    
    // Set up real-time subscription for auctions
    const channel = supabase
      .channel('auction-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'auctions' }, 
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
      auction.farmer.name.toLowerCase().includes(searchTerm.toLowerCase());

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
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return "Ending soon";
    }
  };

  const placeBid = async (auctionId: string, amount: number) => {
    if (!profile) {
      toast({
        title: "Error",
        description: "Please log in to place a bid.",
        variant: "destructive"
      });
      return;
    }

    try {
      const auction = auctions.find(a => a.auction.id === auctionId);
      if (!auction) {
        toast({
          title: "Error",
          description: "Auction not found. Please refresh the page and try again.",
          variant: "destructive"
        });
        return;
      }

      // Ensure all UUIDs are correctly set
      if (!profile.id || !auction.auction.id || !auction.id) {
        toast({
          title: "Error",
          description: "Unable to place bid. Please try again later.",
          variant: "destructive"
        });
        return;
      }

      const { error: bidError } = await supabase
        .from('bids')
        .insert({
          product_id: auction.id,
          auction_id: auction.auction.id,
          bidder_id: profile.id,
          bidder_name: profile.name,
          amount: amount,
          created_at: new Date().toISOString()
        });

      if (bidError) {
        throw bidError;
      }

      // Update the auction's current price
      const { error: updateError } = await supabase
        .from('auctions')
        .update({ current_price: amount })
        .eq('id', auction.auction.id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: "Success",
        description: "Your bid has been placed successfully!",
      });

      // Refresh auctions to show updated price
      fetchAuctions();
    } catch (error) {
      console.error('Error in placeBid:', error);
      toast({
        title: "Error",
        description: "Unable to place bid. Please try again later.",
        variant: "destructive"
      });
    }
  };

  return (
    <DashboardLayout userRole="trader">
      <DashboardHeader title="Auctions" userName={profile?.name || ""} userRole="trader" />
      
      <div className="w-full p-6 space-y-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center space-y-4 sm:space-y-0">
              <div>
                <CardTitle className="text-2xl font-bold">Active Auctions</CardTitle>
                <CardDescription className="text-base">Browse and bid on agricultural products</CardDescription>
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
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mb-4"></div>
                  <p className="text-muted-foreground">Loading auctions...</p>
                </div>
              ) : filteredAuctions.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                  {filteredAuctions.map((auction) => (
                    <Card key={`${auction.id}-${auction.auction.id}`} className="flex flex-col border shadow-md hover:shadow-lg transition-all duration-200">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle className="text-lg font-semibold">{auction.name}</CardTitle>
                            <CardDescription className="text-sm">{auction.category}</CardDescription>
                          </div>
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            {auction.location}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-2">
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Quantity</p>
                              <p className="font-medium">{auction.quantity} {auction.unit}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Current Bid</p>
                              <p className="font-semibold text-lg text-green-600">{formatCurrency(auction.auction.current_price)}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <p className="text-sm text-muted-foreground">Total Bids</p>
                              <p className="font-medium">{auction.auction.bids.length}</p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground">Time Left</p>
                              <div className="flex items-center gap-1 font-medium">
                                <Clock className="h-4 w-4 text-orange-500" />
                                {calculateTimeLeft(auction.auction.end_time)}
                              </div>
                            </div>
                          </div>
                          <div className="flex gap-2 pt-4">
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => navigate(`/trader-auctions/${auction.auction.id}`)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Button>
                            <BidDialog
                              auction={auction.auction}
                              onBid={(amount) => placeBid(auction.auction.id, amount)}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-64">
                  <div className="h-12 w-12 rounded-lg bg-muted flex items-center justify-center mb-4">
                    <Gavel className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium text-muted-foreground mb-2">No auctions found</p>
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

export default TraderAuctions;
