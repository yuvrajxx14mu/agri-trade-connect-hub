import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

const auctionData = {
  id: "A1",
  product: "Organic Wheat",
  description: "High-quality organic wheat grown without pesticides. Ideal for premium flour and baking products.",
  farmer: {
    name: "Rajesh Kumar",
    location: "Amritsar, Punjab",
    rating: 4.8,
    verified: true
  },
  startingPrice: 2200,
  currentBid: 2450,
  quantity: "20 Quintals",
  startTime: "Apr 5, 2025 10:00 AM",
  endTime: "Apr 8, 2025 06:00 PM",
  timeLeft: "2 days, 4 hours",
  progress: 65,
  images: [],
  bids: [
    { bidder: "Vikram Sharma", amount: 2450, time: "2 hours ago" },
    { bidder: "Sunil Mehta", amount: 2400, time: "4 hours ago" },
    { bidder: "Amit Patel", amount: 2350, time: "5 hours ago" },
    { bidder: "Priya Singh", amount: 2300, time: "8 hours ago" },
    { bidder: "Karan Joshi", amount: 2250, time: "10 hours ago" },
  ],
  specifications: [
    { label: "Type", value: "Organic" },
    { label: "Variety", value: "HD-2967" },
    { label: "Moisture", value: "12%" },
    { label: "Protein Content", value: "11.5%" },
    { label: "Harvest Season", value: "Rabi 2024" },
  ]
};

const AuctionPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [bidAmount, setBidAmount] = useState("");
  const [userRole, setUserRole] = useState<"farmer" | "trader">("trader");
  const { toast } = useToast();

  useEffect(() => {
    const path = window.location.pathname;
    if (path.includes("farmer")) {
      setUserRole("farmer");
    } else {
      setUserRole("trader");
    }
  }, []);

  const handlePlaceBid = () => {
    if (!bidAmount || parseFloat(bidAmount) <= auctionData.currentBid) {
      toast({
        title: "Invalid Bid",
        description: "Please enter an amount higher than the current bid",
        variant: "destructive"
      });
      return;
    }
    
    toast({
      title: "Bid Placed Successfully!",
      description: `You've placed a bid of ₹${bidAmount}/Quintal for ${auctionData.product}`,
    });
    
    setBidAmount("");
  };

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
                  <CardTitle className="text-2xl">{auctionData.product}</CardTitle>
                  <CardDescription className="mt-2">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        <Calendar className="mr-1 h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">Started: {auctionData.startTime}</span>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="mr-1 h-4 w-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{auctionData.farmer.location}</span>
                      </div>
                    </div>
                  </CardDescription>
                </div>
                <Badge 
                  className="bg-blue-50 text-blue-700 border-blue-200 flex items-center"
                  variant="outline"
                >
                  <Gavel className="mr-1 h-4 w-4" />
                  Active Auction
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
                  <span className="text-sm font-medium">{auctionData.timeLeft}</span>
                </div>
                <Progress value={auctionData.progress} className="h-2" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium mb-2">Product Description</h3>
                  <p className="text-sm text-muted-foreground">{auctionData.description}</p>
                </div>
                
                <div>
                  <h3 className="font-medium mb-2">Specifications</h3>
                  <div className="space-y-2">
                    {auctionData.specifications.map((spec, index) => (
                      <div key={index} className="flex justify-between">
                        <span className="text-sm text-muted-foreground">{spec.label}</span>
                        <span className="text-sm font-medium">{spec.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-md">
                <div className="flex items-center space-x-4 mb-2">
                  <Package className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Available Quantity</p>
                    <p className="text-sm text-muted-foreground">{auctionData.quantity}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Tag className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Starting Price</p>
                    <p className="text-sm text-muted-foreground">₹{auctionData.startingPrice}/Quintal</p>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-3">About the Seller</h3>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback>RK</AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center">
                      <p className="font-medium">{auctionData.farmer.name}</p>
                      {auctionData.farmer.verified && (
                        <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                          <UserCheck className="mr-1 h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{auctionData.farmer.location}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Auction Summary</CardTitle>
              <CardDescription>Current status and bidding information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Current Highest Bid</span>
                  <span className="text-lg font-bold">₹{auctionData.currentBid}/Quintal</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Total Value (Estimated)</span>
                  <span className="font-medium">₹{auctionData.currentBid * 20}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Auction Ends</span>
                  <span className="font-medium">{auctionData.endTime}</span>
                </div>
              </div>
              
              {userRole === "trader" && (
                <>
                  <Separator />
                  <div>
                    <Label htmlFor="bid-amount">Place Your Bid (₹/Quintal)</Label>
                    <div className="flex mt-1.5 mb-1">
                      <Input
                        id="bid-amount"
                        type="number"
                        placeholder="Enter amount"
                        value={bidAmount}
                        onChange={(e) => setBidAmount(e.target.value)}
                        className="rounded-r-none"
                      />
                      <Button 
                        className="rounded-l-none bg-agri-trader"
                        onClick={handlePlaceBid}
                      >
                        <ArrowBigUp className="mr-2 h-4 w-4" />
                        Place Bid
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Minimum bid: ₹{auctionData.currentBid + 10}/Quintal
                    </p>
                  </div>
                </>
              )}
              
              {userRole === "farmer" && (
                <Button className="w-full" onClick={() => navigate("/farmer-auctions/edit/" + id)}>
                  Edit Auction
                </Button>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Bid History</CardTitle>
              <CardDescription>Recent bids on this product</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {auctionData.bids.map((bid, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarFallback>
                          {bid.bidder.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{bid.bidder}</p>
                        <p className="text-xs text-muted-foreground">{bid.time}</p>
                      </div>
                    </div>
                    <p className="font-medium">₹{bid.amount}</p>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" onClick={() => {}}>
                View All Bids
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AuctionPage;
