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
  product: Product;
}

interface Auction extends DatabaseAuction {
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
      // First fetch the auction details with product data
      const { data: auctionData, error: auctionError } = await supabase
        .from('auctions')
        .select(`
          *,
          product:products (
            id,
            name,
            category,
            description,
            quantity,
            unit,
            price,
            location,
            image_url
          )
        `)
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
          product: auctionData.product
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

      // Create notification for farmer
      await supabase
        .from('notifications')
        .insert({
          user_id: auction.farmer_id,
          title: "New Bid Received",
          message: `A new bid of ${formatCurrency(bidValue)} has been placed on your auction`,
          type: "bid",
          metadata: {
            auction_id: auction.id,
            bid_amount: bidValue
          }
        });

      // Create notification for outbid trader if exists
      if (highestBid && highestBid.bidder_id !== profile.id) {
        await supabase
          .from('notifications')
          .insert({
            user_id: highestBid.bidder_id,
            title: "You've Been Outbid",
            message: `Your bid of ${formatCurrency(highestBid.amount)} has been outbid by ${formatCurrency(bidValue)}`,
            type: "bid",
            metadata: {
              auction_id: auction.id,
              bid_amount: bidValue
            }
          });
      }

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
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle>{auction.product.name}</CardTitle>
                  <CardDescription>
                    Listed by {auction.farmer_profile.name}
                  </CardDescription>
                </div>
                <Badge variant="secondary">
                  {auction.product.category}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Quantity</Label>
                    <p className="text-lg">{auction.quantity} {auction.product.unit}</p>
                  </div>
                  <div>
                    <Label>Location</Label>
                    <p className="text-lg">{auction.product.location}</p>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Starting Price</span>
                    <span>{formatCurrency(auction.start_price)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Current Price</span>
                    <span className="text-xl font-bold">{formatCurrency(auction.current_price)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Minimum Increment</span>
                    <span>{formatCurrency(auction.min_increment)}</span>
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Time Left</span>
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      {calculateTimeLeft(auction.end_time)}
                    </span>
                  </div>
                  <Progress value={calculateProgress(auction.start_time, auction.end_time)} />
                </div>
                
                {userRole === "trader" && (
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button className="w-full" disabled={isBidding}>
                        {isBidding ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Placing Bid...
                          </>
                        ) : (
                          <>
                            <Gavel className="mr-2 h-4 w-4" />
                            Place Bid
                          </>
                        )}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Place a Bid</DialogTitle>
                        <DialogDescription>
                          Enter your bid amount for {auction.product.name}
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span>Current Price:</span>
                            <span>{formatCurrency(auction.current_price)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Minimum Increment:</span>
                            <span>{formatCurrency(auction.min_increment)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span>Minimum Bid:</span>
                            <span>{formatCurrency(auction.current_price + auction.min_increment)}</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="bidAmount">Your Bid</Label>
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
                        <Button onClick={handleBid} disabled={isBidding}>
                          {isBidding ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
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
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Bid History</CardTitle>
            </CardHeader>
            <CardContent>
              <BidHistory bids={auction.bids || []} />
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default AuctionPage;
