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
import { Search, Filter, Gavel, Clock, Calendar, Loader2 } from "lucide-react";
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
  } | null;
  profiles: {
    id: string;
    name: string;
    role: string;
  } | null;
  bids: Array<{
    id: string;
    amount: number;
    bidder_id: string;
    created_at: string;
  }> | null;
}

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
  image_url?: string;
  auction: {
    id: string;
    current_price: number;
    min_increment: number;
    end_time: string;
    status: string;
    bid_count: number;
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
          products:product_id (
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
          bids (
            id,
            amount,
            bidder_id,
            created_at
          )
        `)
        .eq('status', 'active')
        .order('end_time', { ascending: true });

      if (auctionsError) throw auctionsError;

      // Get farmer profiles in a separate query
      const farmerIds = [...new Set(auctionsData?.map(a => a.farmer_id) || [])];
      const { data: farmerProfiles, error: farmerError } = await supabase
        .from('profiles')
        .select('id, name, role')
        .in('id', farmerIds);

      if (farmerError) throw farmerError;

      // Create a map of farmer profiles
      const farmerMap = Object.fromEntries(
        (farmerProfiles || []).map(p => [p.id, p])
      );

      // Transform the data to match AuctionProduct interface
      const transformedAuctions = (auctionsData as unknown as DatabaseAuction[])?.map(auction => ({
        id: auction.products?.id || '',
        name: auction.products?.name || 'Unknown Product',
        category: auction.products?.category || 'Uncategorized',
        quantity: auction.quantity,
        unit: auction.products?.unit || '',
        price: auction.current_price,
        location: auction.products?.location || '',
        farmer_id: auction.farmer_id,
        farmer_name: farmerMap[auction.farmer_id]?.name || 'Unknown Farmer',
        created_at: auction.created_at,
        image_url: auction.products?.image_url,
        auction: {
          id: auction.id,
          current_price: auction.current_price,
          min_increment: auction.min_increment,
          end_time: auction.end_time,
          status: auction.status,
          bid_count: auction.bids?.length || 0
        }
      })) || [];

      // Get unique categories and locations
      const uniqueCategories = [...new Set(transformedAuctions.map(a => a.category))];
      const uniqueLocations = [...new Set(transformedAuctions.map(a => a.location))];

      setCategories(uniqueCategories);
      setLocations(uniqueLocations);
      setAuctions(transformedAuctions);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching auctions:', error);
      toast({
        title: "Error",
        description: "Failed to load auctions. Please try again.",
        variant: "destructive"
      });
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
          console.log('Auction change detected, refreshing...');
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
    } else if (minutes > 0) {
      return `${minutes}m`;
    } else {
      return "Ending soon";
    }
  };

  const placeBid = async (auctionId: string, amount: number) => {
    if (!profile) return;

    try {
      const auction = auctions.find(a => a.auction.id === auctionId);
      if (!auction) return;

      const { error: bidError } = await supabase
        .from('bids')
        .insert({
          product_id: auction.id,
          bidder_id: profile.id,
          bidder_name: profile.name,
          amount: amount,
          status: 'pending'
        });

      if (bidError) throw bidError;

      toast({
        title: "Bid Placed",
        description: "Your bid has been successfully placed.",
      });

      // Refresh auctions to show updated bid
      fetchAuctions();
    } catch (error) {
      console.error('Error placing bid:', error);
      toast({
        title: "Error",
        description: "Failed to place bid. Please try again.",
        variant: "destructive"
      });
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
              <CardDescription>Browse and bid on agricultural products</CardDescription>
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
                <Card key={auction.id} className="flex flex-col">
                  <CardContent className="flex-1">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Quantity:</span>
                        <span>{auction.quantity} {auction.unit}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Starting Price:</span>
                        <span>{formatCurrency(auction.price)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Current Bid:</span>
                        <span className="font-semibold text-lg">
                          {formatCurrency(auction.auction.current_price)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Total Bids:</span>
                        <span>{auction.auction.bid_count}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Time Left:</span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {calculateTimeLeft(auction.auction.end_time)}
                        </span>
                      </div>
                      <BidDialog
                        auction={auction.auction}
                        onBid={(amount) => placeBid(auction.auction.id, amount)}
                      />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Gavel className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No auctions found</h3>
              <p className="text-muted-foreground mb-6">
                Try adjusting your filters or search terms
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default TraderAuctions;
