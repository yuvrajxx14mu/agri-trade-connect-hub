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

interface Bid {
  id: string;
  bidder_id: string;
  amount: number;
  created_at: string;
}

interface Profile {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  role: string;
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
  bids: Bid[];
}

const AuctionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [userRole, setUserRole] = useState<"farmer" | "trader">("trader");
  const { toast } = useToast();

  useEffect(() => {
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
          const { data: farmerData, error: farmerError } = await supabase
            .from('profiles')
            .select('id, name, phone, address, city, state, role')
            .eq('id', auctionData.farmer_id)
            .single();

          if (farmerError) {
            console.error('Error fetching farmer profile:', farmerError);
            // Create a minimal default profile
            farmerData = {
              id: auctionData.farmer_id,
              name: "Unknown Farmer",
              phone: null,
              address: null,
              city: "Unknown",
              state: "Unknown",
              role: "farmer"
            };
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
            farmer_profile: farmerData as Profile,
            bids: (bidsData || []) as Bid[]
          };
          
          setAuction(transformedAuction);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAuction();
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
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    return `${days} days, ${hours} hours`;
  };

  const calculateProgress = (startTime: string, endTime: string) => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    const now = new Date();
    const total = end.getTime() - start.getTime();
    const elapsed = now.getTime() - start.getTime();
    return Math.round((elapsed / total) * 100);
  };

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 24) {
      return `${hours} hours ago`;
    }
    return `${Math.floor(hours / 24)} days ago`;
  };

  const handlePlaceBid = async () => {
    if (!auction || !bidAmount || parseFloat(bidAmount) <= auction.current_price) {
      toast({
        title: "Invalid Bid",
        description: "Please enter an amount higher than the current bid",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('bids')
        .insert({
          product_id: auction.product_id,
          bidder_id: profile?.id,
          bidder_name: profile?.name || '',
          amount: parseFloat(bidAmount)
        });

      if (error) throw error;

      // Update auction current price
      const { error: updateError } = await supabase
        .from('auctions')
        .update({ current_price: parseFloat(bidAmount) })
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
      const { data: farmerData, error: farmerError } = await supabase
        .from('profiles')
        .select('id, name, phone, address, city, state, role')
        .eq('id', refreshedAuction.farmer_id)
        .single();

      // Get updated bids
      const { data: refreshedBids, error: bidsError } = await supabase
        .from('bids')
        .select('id, bidder_id, amount, created_at')
        .eq('product_id', refreshedAuction.product_id)
        .order('amount', { ascending: false });

      // Update the state with properly typed data
      setAuction({
        ...refreshedAuction,
        farmer_profile: farmerData as Profile,
        bids: (refreshedBids || []) as Bid[]
      });
      
      toast({
        title: "Bid Placed Successfully!",
        description: `You've placed a bid of ₹${parseFloat(bidAmount).toLocaleString()}`
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

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!auction) return <div>Auction not found</div>;

  return (
    <DashboardLayout userRole={userRole}>
      <div className="mb-6">
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)} 
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back
        </Button>
        
        <DashboardHeader 
          title={userRole === "farmer" ? "Manage Auction" : "Auction Details"} 
          userName={userRole === "farmer" ? "Rajesh Kumar" : "Vikram Sharma"} 
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl">Auction #{auction.id.slice(0, 8)}</CardTitle>
                  <CardDescription className="mt-2">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Started: {new Date(auction.start_time).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="mr-1 h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{auction.farmer_profile.city}, {auction.farmer_profile.state}</span>
                      </div>
                    </div>
                  </CardDescription>
                </div>
                <Badge 
                  className="bg-blue-50 text-blue-700 border-blue-200 flex items-center"
                  variant="outline"
                >
                  <Gavel className="mr-1 h-4 w-4" />
                  {auction.status === 'active' ? 'Active Auction' : 'Ended'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="rounded-md bg-muted/50 p-4">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Time Remaining</span>
                  </div>
                  <span className="text-sm font-medium">{calculateTimeLeft(auction.end_time)}</span>
                </div>
                <Progress value={calculateProgress(auction.start_time, auction.end_time)} className="h-2" />
              </div>
              
              <div className="bg-muted/50 p-4 rounded-md">
                <div className="flex items-center space-x-4">
                  <Tag className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Starting Price</p>
                    <p className="text-sm text-muted-foreground">₹{auction.start_price}/Quintal</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 mt-2">
                  <ArrowBigUp className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Current Price</p>
                    <p className="text-sm text-muted-foreground">₹{auction.current_price}/Quintal</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 mt-2">
                  <Tag className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Minimum Increment</p>
                    <p className="text-sm text-muted-foreground">₹{auction.min_increment}/Quintal</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">About the Seller</h3>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>{auction.farmer_profile.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center">
                      <p className="font-medium">{auction.farmer_profile.name}</p>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{auction.farmer_profile.city}, {auction.farmer_profile.state}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Place a Bid</CardTitle>
              <CardDescription>Enter your bid amount in ₹/Quintal</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="bid">Bid Amount</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">₹</span>
                    <Input
                      id="bid"
                      type="number"
                      placeholder="Enter amount"
                      className="pl-8"
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Current Bid</Label>
                  <p className="text-2xl font-bold">₹{auction.current_price}/Quintal</p>
                </div>
                
                <div className="space-y-2">
                  <Label>Minimum Increment</Label>
                  <p className="text-sm text-muted-foreground">₹{auction.min_increment}/Quintal</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={handlePlaceBid}
                disabled={userRole === "farmer"}
              >
                Place Bid
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Recent Bids</CardTitle>
              <CardDescription>Latest bids on this auction</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auction.bids.map((bid) => (
                  <div key={bid.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Bidder #{bid.bidder_id.slice(0, 8)}</span>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">₹{bid.amount}/Quintal</p>
                      <p className="text-xs text-muted-foreground">{formatTimeAgo(bid.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AuctionPage;
