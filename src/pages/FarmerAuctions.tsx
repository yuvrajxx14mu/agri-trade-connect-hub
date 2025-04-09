import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gavel, Plus, Search, ArrowUpRight, Calendar, Eye, Ban } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/utils";

interface Auction {
  id: string;
  product: {
    name: string;
    quantity: number;
    unit: string;
    price: number;
  };
  currentBid: number;
  bidCount: number;
  endsIn: string;
  status: string;
}

const FarmerAuctions = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [auctions, setAuctions] = useState<Auction[]>([]);

  useEffect(() => {
    const fetchAuctions = async () => {
      if (!profile?.id) return;

      try {
        // First fetch the auctions
        const { data: auctions, error: auctionsError } = await supabase
          .from('auctions')
          .select('*')
          .eq('farmer_id', profile.id)
          .eq('status', 'active');

        if (auctionsError) throw auctionsError;

        // Then fetch the products for these auctions
        const productIds = auctions?.map(a => a.product_id) || [];
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('*')
          .in('id', productIds);

        if (productsError) throw productsError;

        // Combine the data
        const transformedAuctions = (auctions || []).map(auction => {
          const product = products?.find(p => p.id === auction.product_id);
          return {
            id: auction.id,
            product: {
              name: product?.name || '',
              quantity: product?.quantity || 0,
              unit: product?.unit || '',
              price: product?.price || 0
            },
            currentBid: auction.current_price || auction.start_price,
            bidCount: 0, // We'll need to fetch this separately if needed
            endsIn: getTimeRemaining(new Date(auction.end_time)),
            status: auction.status
          };
        });

        setAuctions(transformedAuctions);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching auctions:', error);
        setIsLoading(false);
      }
    };

    fetchAuctions();
  }, [profile?.id]);

  // Helper function to calculate time remaining
  const getTimeRemaining = (endDate: Date) => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} days`;
    return `${hours} hours`;
  };

  // Filter auctions based on search term and status
  const filteredAuctions = auctions.filter(auction => {
    const matchesSearch = auction.product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === "all" || auction.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  if (isLoading) {
    return (
      <DashboardLayout userRole="farmer">
        <DashboardHeader title="My Auctions" userName={profile?.name || ""} userRole="farmer" />
        <div>Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userRole="farmer">
      <DashboardHeader title="My Auctions" userName={profile?.name || ""} userRole="farmer" />
      
      <div className="mb-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Active Auctions</CardTitle>
                <CardDescription>Manage your ongoing product auctions</CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-full sm:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search auctions..."
                      className="pl-8"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <Select value={filterStatus} onValueChange={setFilterStatus}>
                    <SelectTrigger className="w-36">
                      <SelectValue placeholder="Filter Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => navigate("/farmer-products")}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Auction
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Starting Price</TableHead>
                  <TableHead>Current Bid</TableHead>
                  <TableHead>Bids</TableHead>
                  <TableHead>Time Left</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAuctions.map((auction) => (
                  <TableRow key={auction.id}>
                    <TableCell className="font-medium">{auction.product.name}</TableCell>
                    <TableCell>{auction.product.quantity} {auction.product.unit}</TableCell>
                    <TableCell>{formatCurrency(auction.product.price)}</TableCell>
                    <TableCell>{formatCurrency(auction.currentBid)}</TableCell>
                    <TableCell>{auction.bidCount}</TableCell>
                    <TableCell>{auction.endsIn}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={
                          auction.status === "completed"
                            ? "bg-green-50 text-green-700 border-green-200"
                            : auction.status === "cancelled"
                            ? "bg-red-50 text-red-700 border-red-200"
                            : "bg-blue-50 text-blue-700 border-blue-200"
                        }
                      >
                        {auction.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => navigate(`/farmer-auctions/${auction.id}`)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {auction.status === "active" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-red-600"
                            onClick={() => {/* Handle cancel auction */}}
                          >
                            <Ban className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredAuctions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No auctions found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FarmerAuctions;
