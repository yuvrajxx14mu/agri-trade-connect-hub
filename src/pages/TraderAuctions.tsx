
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter, Gavel, Clock, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const auctions = [
  {
    id: "A1",
    product: "Organic Wheat",
    farmer: "Rajesh Kumar",
    location: "Amritsar, Punjab",
    quantity: "20 Quintals",
    startingPrice: "₹2,200/Quintal",
    currentBid: "₹2,450/Quintal",
    bidCount: 5,
    endsIn: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    status: "active"
  },
  {
    id: "A2",
    product: "Premium Rice",
    farmer: "Anand Singh",
    location: "Karnal, Haryana",
    quantity: "15 Quintals",
    startingPrice: "₹3,500/Quintal",
    currentBid: "₹3,650/Quintal",
    bidCount: 3,
    endsIn: new Date(Date.now() + 6 * 60 * 60 * 1000), // 6 hours from now
    status: "active"
  },
  {
    id: "A3",
    product: "Yellow Lentils",
    farmer: "Suresh Verma",
    location: "Indore, Madhya Pradesh",
    quantity: "10 Quintals",
    startingPrice: "₹9,000/Quintal",
    currentBid: "₹9,200/Quintal",
    bidCount: 2,
    endsIn: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
    status: "active"
  },
  {
    id: "A4",
    product: "Red Chillies",
    farmer: "Meena Patel",
    location: "Guntur, Andhra Pradesh",
    quantity: "5 Quintals",
    startingPrice: "₹12,000/Quintal",
    currentBid: "₹12,000/Quintal",
    bidCount: 0,
    endsIn: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
    status: "active"
  },
  {
    id: "A5",
    product: "Basmati Rice",
    farmer: "Harpreet Singh",
    location: "Dehradun, Uttarakhand",
    quantity: "12 Quintals",
    startingPrice: "₹6,500/Quintal",
    currentBid: "₹7,200/Quintal",
    bidCount: 8,
    endsIn: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    status: "completed",
    winner: "You"
  },
  {
    id: "A6",
    product: "Fresh Potatoes",
    farmer: "Ramesh Yadav",
    location: "Agra, Uttar Pradesh",
    quantity: "25 Quintals",
    startingPrice: "₹1,800/Quintal",
    currentBid: "₹2,100/Quintal",
    bidCount: 6,
    endsIn: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    status: "completed",
    winner: "Pradeep Sharma"
  },
];

const categories = ["All", "Cereals", "Pulses", "Vegetables", "Fruits", "Spices"];
const locations = ["All", "Punjab", "Haryana", "Madhya Pradesh", "Andhra Pradesh", "Uttarakhand", "Uttar Pradesh"];

const TraderAuctions = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("active");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  
  const filteredAuctions = auctions.filter(auction => {
    const matchesSearch = 
      auction.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
      auction.farmer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      auction.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesTab = activeTab === "active" ? auction.status === "active" : auction.status === "completed";
    
    const matchesCategory = categoryFilter === "All" || 
      (categoryFilter === "Cereals" && (auction.product.includes("Wheat") || auction.product.includes("Rice"))) ||
      (categoryFilter === "Pulses" && auction.product.includes("Lentils")) ||
      (categoryFilter === "Vegetables" && auction.product.includes("Potatoes")) ||
      (categoryFilter === "Spices" && auction.product.includes("Chillies"));
    
    const matchesLocation = locationFilter === "All" || auction.location.includes(locationFilter);
    
    return matchesSearch && matchesTab && matchesCategory && matchesLocation;
  });
  
  const getTimeLeft = (endDate) => {
    if (endDate < new Date()) return "Ended";
    return formatDistanceToNow(endDate, { addSuffix: true });
  };
  
  return (
    <DashboardLayout userRole="trader">
      <DashboardHeader title="Auctions" userName="Vikram Sharma" />
      
      <Card>
        <CardHeader>
          <CardTitle>Agricultural Auctions</CardTitle>
          <CardDescription>Browse and bid on agricultural products</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-6 space-y-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-5 w-5 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search for products, farmers, or locations..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-2 w-full">
                  <TabsTrigger value="active">Active Auctions</TabsTrigger>
                  <TabsTrigger value="completed">Completed</TabsTrigger>
                </TabsList>
              </Tabs>
              
              <div className="flex gap-2">
                <Button variant="outline" size="icon" className="flex-shrink-0">
                  <Filter className="h-4 w-4" />
                </Button>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={locationFilter} onValueChange={setLocationFilter}>
                  <SelectTrigger className="w-[130px]">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {filteredAuctions.length > 0 ? (
            <div className="space-y-4">
              {filteredAuctions.map((auction) => (
                <Card key={auction.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-4">
                      <div className="bg-agri-trader/10 p-4 md:p-6 flex flex-col justify-center">
                        <h3 className="font-semibold text-lg">{auction.product}</h3>
                        <p className="text-sm text-muted-foreground">by {auction.farmer}</p>
                        <p className="text-sm mt-1">{auction.location}</p>
                        <p className="text-sm mt-2">Quantity: {auction.quantity}</p>
                      </div>
                      <div className="p-4 md:p-6 col-span-2 flex flex-col justify-center">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Starting Price</p>
                            <p className="font-medium">{auction.startingPrice}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Current Bid</p>
                            <p className="font-bold text-lg text-agri-trader">{auction.currentBid}</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Bids</p>
                            <p className="font-medium">{auction.bidCount}</p>
                          </div>
                        </div>
                        
                        {auction.status === "active" ? (
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span className="text-sm">
                              Ends {getTimeLeft(auction.endsIn)}
                            </span>
                          </div>
                        ) : (
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span className="text-sm">
                              Ended {formatDistanceToNow(auction.endsIn, { addSuffix: true })}
                            </span>
                            {auction.winner && (
                              <Badge className="ml-2" variant="outline">
                                Winner: {auction.winner}
                              </Badge>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="p-4 md:p-6 flex flex-col justify-center items-center border-t md:border-t-0 md:border-l">
                        <Badge 
                          variant="outline" 
                          className={
                            auction.status === "completed" 
                              ? "bg-green-50 text-green-700 border-green-200 mb-4 w-full justify-center" 
                              : "bg-blue-50 text-blue-700 border-blue-200 mb-4 w-full justify-center"
                          }
                        >
                          {auction.status === "active" ? "Active" : "Completed"}
                        </Badge>
                        
                        {auction.status === "active" && (
                          <Button 
                            className="w-full bg-agri-trader"
                            onClick={() => navigate(`/trader-auctions/${auction.id}`)}
                          >
                            <Gavel className="mr-2 h-4 w-4" />
                            Place Bid
                          </Button>
                        )}
                        
                        {auction.status === "completed" && (
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => navigate(`/trader-auctions/${auction.id}`)}
                          >
                            View Details
                          </Button>
                        )}
                      </div>
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
                Try adjusting your search or filter criteria
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  Clear Search
                </Button>
                <Button variant="outline" onClick={() => setCategoryFilter("All")}>
                  Reset Categories
                </Button>
                <Button variant="outline" onClick={() => setLocationFilter("All")}>
                  Reset Location
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default TraderAuctions;
