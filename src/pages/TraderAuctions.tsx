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
import { Search, Filter, Gavel, Clock, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";

const TraderAuctions = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [locationFilter, setLocationFilter] = useState("All");
  const [isLoading, setIsLoading] = useState(true);
  const [auctions, setAuctions] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  useEffect(() => {
    const fetchAuctions = async () => {
      try {
        // Fetch active auctions with related data
        const { data: auctionProducts, error } = await supabase
          .from('products')
          .select(`
            id,
            name,
            category,
            quantity,
            unit,
            price,
            location,
            status,
            farmer_id,
            profiles (
              name
            ),
            created_at
          `)
          .eq('status', 'in_auction')
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Get unique categories and locations
        const uniqueCategories = [...new Set(auctionProducts?.map(p => p.category) || [])];
        const uniqueLocations = [...new Set(auctionProducts?.map(p => p.location) || [])];

        setCategories(uniqueCategories);
        setLocations(uniqueLocations);
        setAuctions(auctionProducts || []);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching auctions:', error);
        setIsLoading(false);
      }
    };

    fetchAuctions();
  }, []);

  const filteredAuctions = auctions.filter(auction => {
    const matchesSearch = 
      auction.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      auction.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      auction.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      auction.profiles?.name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory = categoryFilter === "All" || auction.category === categoryFilter;
    const matchesLocation = locationFilter === "All" || auction.location === locationFilter;

    return matchesSearch && matchesCategory && matchesLocation;
  });

  if (isLoading) {
    return (
      <DashboardLayout userRole="trader">
        <DashboardHeader title="Auctions" userName={profile?.name || ""} userRole="trader" />
        <div>Loading...</div>
      </DashboardLayout>
    );
  }

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAuctions.map((auction) => (
              <Card key={auction.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{auction.name}</CardTitle>
                      <CardDescription>by {auction.profiles?.name}</CardDescription>
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
                      <span className="text-muted-foreground">Starting Price:</span>
                      <span className="font-medium">{formatCurrency(auction.price)}/{auction.unit}</span>
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
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default TraderAuctions;
