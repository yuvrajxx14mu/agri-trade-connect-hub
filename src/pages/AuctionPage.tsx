import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../integrations/supabase/client";
import { useAuth } from "../context/AuthContext";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Progress } from "../components/ui/progress";
import { Gavel, Calendar, MapPin, Package, Tag, Clock, ArrowLeft, ArrowBigUp, User, UserCheck } from "lucide-react";
import { Separator } from "../components/ui/separator";
import { Label } from "../components/ui/label";
import { useToast } from "../hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../components/ui/dialog";
import { Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { formatCurrency } from "../lib/utils";
import BidHistory from "../components/BidHistory";
import BidManagement from "../components/BidManagement";

interface Profile {
  id: string;
  name: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  role: string;
}

interface Bid {
  id: string;
  bidder_id: string;
  bidder_name: string;
  amount: number;
  quantity: number;
  status: 'pending' | 'accepted' | 'rejected' | 'outbid';
  is_highest_bid: boolean;
  previous_bid_amount: number | null;
  expires_at: string;
  auction_end_time: string;
  created_at: string;
  message?: string;
}

interface Product {
  name: string;
  category: string;
  description: string | null;
  quantity: number;
  unit: string;
  price: number;
  location: string;
  image_url: string | null;
}

interface DatabaseAuction {
  id: string;
  product_id: string;
  farmer_id: string;
  start_price: number;
  current_price: number;
  reserve_price: number | null;
  min_increment: number;
  quantity: number;
  start_time: string;
  end_time: string;
  description: string | null;
  auction_type: string;
  allow_auto_bids: boolean;
  visibility: string;
  shipping_options: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Auction {
  id: string;
  product_id: string;
  farmer_id: string;
  start_price: number;
  current_price: number;
  reserve_price: number | null;
  min_increment: number;
  quantity: number;
  start_time: string;
  end_time: string;
  description: string | null;
  auction_type: string;
  allow_auto_bids: boolean;
  visibility: string;
  shipping_options: string;
  status: string;
  created_at: string;
  updated_at: string;
  farmer_profile: Profile;
  bids?: Bid[];
  product: Product;
}

type BidAction = 'accept' | 'reject';

const AuctionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const [bidAmount, setBidAmount] = useState("");
  const [userRole, setUserRole] = useState<"farmer" | "trader">("trader");
  const [isBidding, setIsBidding] = useState(false);
  const [selectedBid, setSelectedBid] = useState<Bid | null>(null);
  const [isProcessingBid, setIsProcessingBid] = useState(false);

  // Function to fetch auction data
  const fetchAuction = async () => {
    try {
      // First fetch the auction details
      const { data: auctionData, error: auctionError } = await supabase
        .from('auctions')
        .select('*')
        .eq('id', id)
        .single();

      if (auctionError) throw auctionError;

      if (auctionData) {
        // Then fetch the product separately
        const { data: productData, error: productError } = await supabase
          .from('products')
          .select('id, name, category, description, quantity, unit, price, location, image_url')
          .eq('id', auctionData.product_id)
          .single();

        if (productError) {
          console.error('Error fetching product:', productError);
          throw productError;
        }

        // Then fetch the farmer profile separately
        let farmerProfile: Profile;
        const { data: farmerData, error: farmerError } = await supabase
          .from('profiles')
          .select('id, name, phone, address, city, state, role')
          .eq('id', auctionData.farmer_id)
          .single();

        if (farmerError) {
          console.error('Error fetching farmer profile:', farmerError);
          // Create a minimal default profile
          farmerProfile = {
            id: auctionData.farmer_id,
            name: "Unknown Farmer",
            phone: null,
            address: null,
            city: "Unknown",
            state: "Unknown",
            role: "farmer"
          };
        } else {
          farmerProfile = farmerData as Profile;
        }

        // Then fetch the bids separately
        const { data: bidsData, error: bidsError } = await supabase
          .from('bids')
          .select('id, bidder_id, bidder_name, amount, status, created_at')
          .eq('product_id', auctionData.product_id)
          .order('amount', { ascending: false });

        if (bidsError) {
          console.error('Error fetching bids:', bidsError);
        }

        // Create properly typed auction object
        const transformedAuction: Auction = {
          ...auctionData,
          farmer_profile: farmerProfile,
          bids: (bidsData || []) as Bid[],
          product: productData
        };
        
        setAuction(transformedAuction);
        setLoading(false);
      }
    } catch (err: any) {
      console.error('Error fetching auction:', err);
      setLoading(false);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    fetchAuction();
    
    // Set up a refresh interval for active auctions
    const interval = window.setInterval(() => {
      if (auction?.status === 'active') {
        fetchAuction();
      }
    }, 10000); // Refresh every 10 seconds
    
    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [id]);

  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes("farmer")) {
      setUserRole("farmer");
    } else {
      setUserRole("trader");
    }
  }, []);

  const calculateTimeLeft = (endTime: string) => {
    const end = new Date(endTime);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return "Auction ended";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (days > 0) {
      return `${days} days, ${hours} hours`;
    } else if (hours > 0) {
      return `${hours} hours, ${minutes} minutes`;
    } else {
      return `${minutes} minutes`;
    }
  };

  const calculateProgress = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();
    
    if (now < start) return 0;
    if (now > end) return 100;
    
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.round((elapsed / total) * 100);
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / (1000 * 60));
    if (minutes < 60) {
      return `${minutes} minutes ago`;
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) {
      return `${hours} hours ago`;
    }
    return `${Math.floor(hours / 24)} days ago`;
  };

  const handleBid = async () => {
    if (!auction || !profile || !bidAmount) return;

    const bidValue = parseFloat(bidAmount);
    if (isNaN(bidValue) || bidValue <= 0) {
      toast({
        title: "Invalid Bid",
        description: "Please enter a valid bid amount.",
        variant: "destructive"
      });
      return;
    }

    // Check if bid is higher than current price
    if (bidValue <= auction.current_price) {
      toast({
        title: "Invalid Bid",
        description: "Bid amount must be higher than current price.",
        variant: "destructive"
      });
      return;
    }

    // Check if auction has ended
    if (new Date() > new Date(auction.end_time)) {
      toast({
        title: "Auction Ended",
        description: "This auction has already ended.",
        variant: "destructive"
      });
      return;
    }

    setIsBidding(true);

    try {
      // Get current highest bid
      const { data: highestBid } = await supabase
        .from('bids')
        .select('*')
        .eq('product_id', auction.product_id)
        .eq('is_highest_bid', true)
        .single();

      // Update previous highest bid to outbid status if exists
      if (highestBid) {
        await supabase
          .from('bids')
          .update({ 
            status: 'outbid',
            is_highest_bid: false 
          })
          .eq('id', highestBid.id);
      }

      // Insert the new bid
      const { error: bidError } = await supabase
        .from('bids')
        .insert({
          product_id: auction.product_id,
          bidder_id: profile.id,
          bidder_name: profile.name || '',
          amount: bidValue,
          quantity: auction.quantity,
          status: 'pending',
          is_highest_bid: true,
          previous_bid_amount: highestBid?.amount || null,
          expires_at: auction.end_time,
          auction_end_time: auction.end_time
        });

      if (bidError) throw bidError;

      // Update auction current price
      const { error: updateError } = await supabase
        .from('auctions')
        .update({ current_price: bidValue })
        .eq('id', auction.id);

      if (updateError) throw updateError;

      toast({
        title: "Bid Placed",
        description: "Your bid has been successfully placed.",
      });

      setBidAmount("");
      await fetchAuction();
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

  const handleBidAction = async (bid: Bid, action: BidAction) => {
    setSelectedBid(bid);
    setIsProcessingBid(true);

    try {
      // Update the bid status
      const { error: bidError } = await supabase
        .from('bids')
        .update({
          status: action === 'accept' ? 'accepted' : 'rejected',
          updated_at: new Date().toISOString()
        })
        .eq('id', bid.id);

      if (bidError) throw bidError;

      if (action === 'accept') {
        // Update all other bids to rejected
        const { error: otherBidsError } = await supabase
          .from('bids')
          .update({
            status: 'rejected',
            updated_at: new Date().toISOString()
          })
          .eq('product_id', auction?.product_id)
          .neq('id', bid.id);

        if (otherBidsError) throw otherBidsError;

        // Update auction status to 'ended'
        const { error: auctionError } = await supabase
          .from('auctions')
          .update({
            status: 'ended',
            current_price: bid.amount,
            updated_at: new Date().toISOString()
          })
          .eq('id', id);

        if (auctionError) throw auctionError;

        // Create an order for the accepted bid
        const { error: orderError } = await supabase
          .from('orders')
          .insert({
            product_id: auction?.product_id,
            farmer_id: auction?.farmer_id,
            trader_id: bid.bidder_id,
            quantity: bid.quantity,
            price: bid.amount,
            status: 'pending',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (orderError) throw orderError;
      }

      // Refresh auction data
      await fetchAuction();

      toast({
        title: action === 'accept' ? "Bid Accepted" : "Bid Rejected",
        description: action === 'accept' 
          ? "The bid has been accepted and the auction has ended."
          : "The bid has been rejected.",
        variant: "default"
      });

    } catch (error: any) {
      console.error(`Error ${action}ing bid:`, error);
      toast({
        title: "Error",
        description: `Failed to ${action} bid: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setIsProcessingBid(false);
      setSelectedBid(null);
    }
  };

  if (loading) return (
    <DashboardLayout userRole={userRole}>
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mb-4"></div>
          <p>Loading auction details...</p>
        </div>
      </div>
    </DashboardLayout>
  );
  
  if (!auction) return (
    <DashboardLayout userRole={userRole}>
      <div className="flex items-center justify-center h-[80vh]">
        <div className="text-center">
          <p className="mb-4">Auction not found</p>
          <Button variant="outline" onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    </DashboardLayout>
  );

  const isTrader = profile?.role === "trader";
  const isFarmer = profile?.role === "farmer" && profile.id === auction.farmer_id;
  const isActive = auction.status === "active";
  const timeLeft = formatDistanceToNow(new Date(auction.end_time), { addSuffix: true });

  return (
    <DashboardLayout userRole={userRole}>
      <DashboardHeader 
        title="Auction Details" 
        userName={profile?.name || ""} 
        userRole={userRole}
      />
      
      {loading ? (
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : !auction ? (
        <div className="flex justify-center items-center h-[calc(100vh-200px)]">
          <p>Auction not found</p>
        </div>
      ) : (
        <div className="container mx-auto p-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Left Column - Main Auction Details */}
            <div className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-4">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-2xl font-bold">{auction.product.name}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Listed by {auction.farmer_profile.name}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary" className="text-base px-4 py-1">
                      {auction.product.category}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-8">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Quantity</Label>
                      <p className="text-xl font-medium flex items-center gap-2">
                        <Package className="h-5 w-5 text-muted-foreground" />
                        {auction.quantity} {auction.product.unit}
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-muted-foreground">Location</Label>
                      <p className="text-xl font-medium flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-muted-foreground" />
                        {auction.product.location}
                      </p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Starting Price</Label>
                        <p className="text-lg font-medium">{formatCurrency(auction.start_price)}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Current Price</Label>
                        <p className="text-2xl font-bold text-primary">{formatCurrency(auction.current_price)}</p>
                      </div>
                    </div>
                    <div>
                      <Label className="text-muted-foreground">Minimum Increment</Label>
                      <p className="text-lg font-medium">{formatCurrency(auction.min_increment)}</p>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <Label className="text-muted-foreground">Time Left</Label>
                      <span className="flex items-center gap-2 text-lg font-medium">
                        <Clock className="h-5 w-5 text-muted-foreground" />
                        {calculateTimeLeft(auction.end_time)}
                      </span>
                    </div>
                    <Progress value={calculateProgress(auction.start_time, auction.end_time)} className="h-2" />
                  </div>
                  
                  {userRole === "trader" && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button className="w-full h-12 text-lg" disabled={isBidding}>
                          {isBidding ? (
                            <>
                              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                              Placing Bid...
                            </>
                          ) : (
                            <>
                              <Gavel className="mr-2 h-5 w-5" />
                              Place Bid
                            </>
                          )}
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Place a Bid</DialogTitle>
                          <DialogDescription>
                            Enter your bid amount for {auction.product.name}
                          </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-6 py-4">
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <Label>Current Price</Label>
                                <p className="font-medium">{formatCurrency(auction.current_price)}</p>
                              </div>
                              <div>
                                <Label>Minimum Increment</Label>
                                <p className="font-medium">{formatCurrency(auction.min_increment)}</p>
                              </div>
                            </div>
                            <div>
                              <Label>Minimum Bid Required</Label>
                              <p className="font-medium text-lg">{formatCurrency(auction.current_price + auction.min_increment)}</p>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="bidAmount">Your Bid Amount</Label>
                            <Input
                              id="bidAmount"
                              type="number"
                              step="0.01"
                              value={bidAmount}
                              onChange={(e) => setBidAmount(e.target.value)}
                              placeholder="Enter bid amount"
                              className="text-lg"
                            />
                          </div>
                        </div>
                        <DialogFooter>
                          <Button onClick={handleBid} disabled={isBidding} className="w-full">
                            {isBidding ? (
                              <>
                                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                Placing Bid...
                              </>
                            ) : (
                              "Confirm Bid"
                            )}
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Bid History and Management */}
            <div className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl">Bid History</CardTitle>
                </CardHeader>
                <CardContent>
                  <BidHistory bids={auction.bids || []} />
                </CardContent>
              </Card>
              
              {isFarmer && (
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="text-xl">Manage Bids</CardTitle>
                    <CardDescription>
                      Review and manage bids for this auction
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    {auction.bids && auction.bids.length > 0 ? (
                      <BidManagement
                        bids={auction.bids}
                        onAcceptBid={(bid) => handleBidAction(bid, 'accept')}
                        onRejectBid={(bid) => handleBidAction(bid, 'reject')}
                        disabled={!isFarmer || auction.status !== 'active'}
                      />
                    ) : (
                      <div className="text-center py-8">
                        <p className="text-muted-foreground">No bids have been placed yet</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AuctionPage;
