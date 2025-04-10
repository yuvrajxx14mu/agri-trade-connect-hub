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
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);
  const [selectedAuction, setSelectedAuction] = useState<AuctionProduct | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [isBidding, setIsBidding] = useState(false);

  const fetchAuctions = async () => {
    try {
      setIsLoading(true);
      console.log("Fetching auctions...");
      
      // First get all active products with their auctions
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select(`
          id,
          name,
          category,
          quantity,
          unit,
          price,
          location,
          farmer_id,
          farmer_name,
          created_at,
          image_url,
          auction_id,
          auctions!inner (
            id,
            current_price,
            min_increment,
            end_time,
            status
          )
        `)
        .eq('auctions.status', 'active')
        .order('created_at', { ascending: false });

      if (productsError) {
        console.error('Error fetching auctions:', productsError);
        throw productsError;
      }

      if (!productsData || productsData.length === 0) {
        console.log("No auctions found in the database");
        setAuctions([]);
        setIsLoading(false);
        return;
      }

      // Transform the data
      const auctionProducts: AuctionProduct[] = productsData.map(product => ({
        id: product.id,
        name: product.name,
        category: product.category,
        quantity: product.quantity,
        unit: product.unit,
        price: product.price,
        location: product.location,
        farmer_id: product.farmer_id,
        farmer_name: product.farmer_name,
        created_at: product.created_at,
        image_url: product.image_url || undefined,
        auction: {
          id: product.auctions.id,
          current_price: product.auctions.current_price,
          min_increment: product.auctions.min_increment,
          end_time: product.auctions.end_time,
          status: product.auctions.status
        }
      }));

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
          console.log("Auction update detected");
          fetchAuctions();
        }
      )
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'bids' }, 
        () => {
          console.log("New bid detected");
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

  const handleBid = async () => {
    if (!selectedAuction || !profile?.id || isBidding) return;

    const bidValue = parseFloat(bidAmount);
    if (isNaN(bidValue)) {
      toast({
        title: "Invalid Bid",
        description: "Please enter a valid bid amount.",
        variant: "destructive"
      });
      return;
    }

    if (bidValue <= selectedAuction.auction.current_price) {
      toast({
        title: "Invalid Bid",
        description: "Bid must be higher than the current price.",
        variant: "destructive"
      });
      return;
    }

    if (bidValue < selectedAuction.auction.current_price + selectedAuction.auction.min_increment) {
      toast({
        title: "Invalid Bid",
        description: `Minimum bid increment is ${formatCurrency(selectedAuction.auction.min_increment)}.`,
        variant: "destructive"
      });
      return;
    }

    setIsBidding(true);
    try {
      // Insert the bid
      const { error: bidError } = await supabase
        .from('bids')
        .insert({
          product_id: selectedAuction.id,
          bidder_id: profile.id,
          bidder_name: profile.name || '',
          amount: bidValue,
          status: 'pending'
        });

      if (bidError) throw bidError;

      // Update auction current price
      const { error: updateError } = await supabase
        .from('auctions')
        .update({ current_price: bidValue })
        .eq('id', selectedAuction.auction.id);

      if (updateError) throw updateError;

      toast({
        title: "Bid Placed",
        description: "Your bid has been successfully placed.",
      });

      setSelectedAuction(null);
      setBidAmount("");
      fetchAuctions();
    } catch (error) {
      console.error('Error placing bid:', error);
      toast({
        title: "Error",
        description: "Failed to place bid. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsBidding(false);
    }
  };

  return (
    <DashboardLayout userRole="trader">
      <DashboardHeader title="Auctions" userName={profile?.name || ""} userRole="trader" />
      
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
              <div>
                <CardTitle>Active Auctions</CardTitle>
                <CardDescription>Browse and participate in agricultural product auctions</CardDescription>
              </div>
              <div className="flex gap-4">
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
              <div className="flex justify-center items-center h-64">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : filteredAuctions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No active auctions found</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredAuctions.map((auction) => (
                  <Card key={auction.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex justify-between items-start gap-4">
                        <div>
                          <CardTitle className="text-lg">{auction.name}</CardTitle>
                          <CardDescription>{auction.farmer_name}</CardDescription>
                        </div>
                        <Badge variant="secondary">
                          {auction.category}
                        </Badge>
                      </div>
                    </CardHeader>
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
                          <span className="text-sm text-muted-foreground">Time Left:</span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {calculateTimeLeft(auction.auction.end_time)}
                          </span>
                        </div>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              className="w-full" 
                              onClick={() => {
                                setSelectedAuction(auction);
                                setBidAmount((auction.auction.current_price + auction.auction.min_increment).toString());
                              }}
                            >
                              <Gavel className="mr-2 h-4 w-4" />
                              Place Bid
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Place a Bid</DialogTitle>
                              <DialogDescription>
                                Enter your bid amount for {auction.name}
                              </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Current Price:</span>
                                  <span>{formatCurrency(auction.auction.current_price)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Minimum Increment:</span>
                                  <span>{formatCurrency(auction.auction.min_increment)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                  <span>Minimum Bid:</span>
                                  <span>{formatCurrency(auction.auction.current_price + auction.auction.min_increment)}</span>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <label htmlFor="bidAmount" className="text-sm font-medium">
                                  Your Bid
                                </label>
                                <Input
                                  id="bidAmount"
                                  type="number"
                                  step="0.01"
                                  value={bidAmount}
                                  onChange={(e) => setBidAmount(e.target.value)}
                                  placeholder="Enter bid amount"
                                />
                              </div>
                            </div>
                            <DialogFooter>
                              <Button
                                onClick={handleBid}
                                disabled={isBidding}
                              >
                                {isBidding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Confirm Bid
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default TraderAuctions;
