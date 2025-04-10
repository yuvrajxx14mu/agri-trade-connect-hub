import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Gavel, Calendar, MapPin, Package, Tag, Clock, ArrowLeft, ArrowBigUp, User, UserCheck } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { formatCurrency } from "@/lib/utils";
import BidHistory from "@/components/BidHistory";

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
  status: 'pending' | 'accepted' | 'rejected';
  created_at: string;
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
  product: Product;
}

interface Auction extends DatabaseAuction {
  farmer_profile: Profile;
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
          .select('id, bidder_id, amount, created_at')
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
          product: auctionData.product
        };
        
        setAuction(transformedAuction);
      }
    } catch (err: any) {
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

  const handlePlaceBid = async () => {
    if (!auction || !bidAmount || !profile) {
      toast({
        title: "Error",
        description: "Please enter a valid bid amount and ensure you're logged in",
        variant: "destructive"
      });
      return;
    }
    
    const bidValue = parseFloat(bidAmount);
    
    if (bidValue <= auction.current_price) {
      toast({
        title: "Invalid Bid",
        description: `Please enter an amount higher than the current bid (₹${auction.current_price})`,
        variant: "destructive"
      });
      return;
    }
    
    if (auction.min_increment && bidValue < auction.current_price + auction.min_increment) {
      toast({
        title: "Invalid Bid",
        description: `Your bid must be at least ₹${auction.min_increment} more than the current price`,
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('bids')
        .insert({
          product_id: auction.product_id,
          bidder_id: profile.id,
          bidder_name: profile.name || '',
          amount: bidValue,
          status: 'active'
        });

      if (error) throw error;

      // Update auction current price
      const { error: updateError } = await supabase
        .from('auctions')
        .update({ current_price: bidValue })
        .eq('id', auction.id);

      if (updateError) throw updateError;

      // Refresh auction data with separate queries like we do in the initial load
      const { data: refreshedAuction, error: refreshError } = await supabase
        .from('auctions')
        .select('*')
        .eq('id', id)
        .single();

      if (refreshError) throw refreshError;

      // Get updated farmer profile
      let farmerProfile: Profile;
      const { data: farmerData, error: farmerError } = await supabase
        .from('profiles')
        .select('id, name, phone, address, city, state, role')
        .eq('id', refreshedAuction.farmer_id)
        .single();

      if (farmerError) {
        console.error('Error fetching farmer profile:', farmerError);
        // Create default profile if error
        farmerProfile = {
          id: refreshedAuction.farmer_id,
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

      // Get updated bids
      const { data: refreshedBids, error: bidsError } = await supabase
        .from('bids')
        .select('id, bidder_id, amount, created_at')
        .eq('product_id', refreshedAuction.product_id)
        .order('amount', { ascending: false });

      // Update the state with properly typed data
      setAuction({
        ...refreshedAuction,
        farmer_profile: farmerProfile,
        bids: (refreshedBids || []) as Bid[]
      });
      
      // Create notification for farmer
      await supabase
        .from('notifications')
        .insert({
          user_id: auction.farmer_id,
          title: "New Bid Received",
          message: `A new bid of ₹${bidValue} has been placed on your auction`,
          type: "bid"
        });
      
      toast({
        title: "Bid Placed Successfully!",
        description: `You've placed a bid of ₹${bidValue.toLocaleString()}`
      });
      setBidAmount("");
    } catch (err) {
      console.error('Error placing bid:', err);
      toast({
        title: "Error",
        description: "Failed to place bid. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleBid = async () => {
    if (!auction || !profile?.id || isBidding) return;

    const bidValue = parseFloat(bidAmount);
    if (isNaN(bidValue)) {
      toast({
        title: "Invalid Bid",
        description: "Please enter a valid bid amount.",
        variant: "destructive"
      });
      return;
    }

    if (bidValue <= auction.current_price) {
      toast({
        title: "Invalid Bid",
        description: "Bid must be higher than the current price.",
        variant: "destructive"
      });
      return;
    }

    if (bidValue < auction.current_price + auction.min_increment) {
      toast({
        title: "Invalid Bid",
        description: `Minimum bid increment is ${formatCurrency(auction.min_increment)}.`,
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
          product_id: auction.product_id,
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
        .eq('id', auction.id);

      if (updateError) throw updateError;

      toast({
        title: "Bid Placed",
        description: "Your bid has been successfully placed.",
      });

      setBidAmount("");
      fetchAuction();
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
    if (!auction || isProcessingBid) return;

    setIsProcessingBid(true);
    try {
      // Update bid status
      const { error: bidError } = await supabase
        .from('bids')
        .update({ status: action })
        .eq('id', bid.id);

      if (bidError) throw bidError;

      // If accepting the bid, update auction status and create order
      if (action === 'accept') {
        // Update auction status
        const { error: auctionError } = await supabase
          .from('auctions')
          .update({ status: 'completed' })
          .eq('id', auction.id);

        if (auctionError) throw auctionError;

        // Create order
        const { error: orderError } = await supabase
          .from('orders')
          .insert({
            product_id: auction.product_id,
            trader_id: bid.bidder_id,
            farmer_id: auction.farmer_id,
            quantity: auction.quantity,
            price: bid.amount,
            total_amount: bid.amount * auction.quantity,
            status: 'pending',
            payment_status: 'pending'
          });

        if (orderError) throw orderError;

        // Update product status
        const { error: productError } = await supabase
          .from('products')
          .update({ status: 'sold' })
          .eq('id', auction.product_id);

        if (productError) throw productError;
      }

      toast({
        title: action === 'accept' ? "Bid Accepted" : "Bid Rejected",
        description: action === 'accept' 
          ? "The bid has been accepted and an order has been created." 
          : "The bid has been rejected.",
      });

      setSelectedBid(null);
      fetchAuction();
    } catch (error) {
      console.error('Error processing bid:', error);
      toast({
        title: "Error",
        description: `Failed to ${action} bid. Please try again.`,
        variant: "destructive"
      });
    } finally {
      setIsProcessingBid(false);
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
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">{auction.product.name}</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Auction Details</CardTitle>
                <CardDescription>Current auction information and status</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Category</p>
                    <p className="font-medium">{auction.product.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">{auction.product.location}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Quantity</p>
                    <p className="font-medium">{auction.quantity} {auction.product.unit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Starting Price</p>
                    <p className="font-medium">{formatCurrency(auction.start_price)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Current Price</p>
                    <p className="font-semibold text-lg">{formatCurrency(auction.current_price)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Time Left</p>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <p className="font-medium">{timeLeft}</p>
                    </div>
                  </div>
                </div>

                {auction.product.description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Description</p>
                    <p>{auction.product.description}</p>
                  </div>
                )}

                {isTrader && isActive && (
                  <div className="space-y-4">
                    <div className="flex items-end gap-4">
                      <div className="flex-1">
                        <label htmlFor="bidAmount" className="text-sm font-medium">
                          Your Bid
                        </label>
                        <Input
                          id="bidAmount"
                          type="number"
                          step="0.01"
                          value={bidAmount}
                          onChange={(e) => setBidAmount(e.target.value)}
                          placeholder={`Minimum bid: ${formatCurrency(auction.current_price + auction.min_increment)}`}
                        />
                      </div>
                      <Button
                        onClick={handleBid}
                        disabled={isBidding}
                      >
                        {isBidding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Place Bid
                      </Button>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Minimum increment: {formatCurrency(auction.min_increment)}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            <BidHistory 
              productId={auction.product_id} 
              onBidUpdate={fetchAuction}
            />
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Seller Information</CardTitle>
                <CardDescription>Contact details for the seller</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Name</p>
                    <p className="font-medium">{auction.farmer_profile.name}</p>
                  </div>
                  {auction.farmer_profile.phone && (
                    <div>
                      <p className="text-sm text-muted-foreground">Phone</p>
                      <p className="font-medium">{auction.farmer_profile.phone}</p>
                    </div>
                  )}
                  {auction.farmer_profile.address && (
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">
                        {auction.farmer_profile.address}
                        {auction.farmer_profile.city && `, ${auction.farmer_profile.city}`}
                        {auction.farmer_profile.state && `, ${auction.farmer_profile.state}`}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {isFarmer && isActive && (
              <Card>
                <CardHeader>
                  <CardTitle>Auction Management</CardTitle>
                  <CardDescription>Manage bids and auction status</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={async () => {
                        try {
                          const { error } = await supabase
                            .from('auctions')
                            .update({ status: 'cancelled' })
                            .eq('id', auction.id);

                          if (error) throw error;

                          toast({
                            title: "Auction Cancelled",
                            description: "The auction has been cancelled successfully.",
                          });

                          fetchAuction();
                        } catch (error) {
                          console.error('Error cancelling auction:', error);
                          toast({
                            title: "Error",
                            description: "Failed to cancel auction. Please try again.",
                            variant: "destructive"
                          });
                        }
                      }}
                    >
                      Cancel Auction
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      <Dialog open={!!selectedBid} onOpenChange={() => setSelectedBid(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Bid Action</DialogTitle>
            <DialogDescription>
              Process this bid from {selectedBid?.bidder_name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="flex justify-between">
                <span>Bidder:</span>
                <span className="font-medium">{selectedBid?.bidder_name}</span>
              </div>
              <div className="flex justify-between">
                <span>Amount:</span>
                <span className="font-medium">{selectedBid && formatCurrency(selectedBid.amount)}</span>
              </div>
            </div>
          </div>
          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setSelectedBid(null)}
              disabled={isProcessingBid}
            >
              Cancel
            </Button>
            <Button
              variant="default"
              onClick={() => selectedBid && handleBidAction(selectedBid, 'accept')}
              disabled={isProcessingBid}
            >
              {isProcessingBid && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Accept Bid
            </Button>
            <Button
              variant="destructive"
              onClick={() => selectedBid && handleBidAction(selectedBid, 'reject')}
              disabled={isProcessingBid}
            >
              {isProcessingBid && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Reject Bid
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default AuctionPage;
