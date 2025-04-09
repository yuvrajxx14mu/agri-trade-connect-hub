
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
import { Search, Gavel, ArrowUpRight, Package, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const TraderBids = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [bids, setBids] = useState<any[]>([]);

  useEffect(() => {
    fetchBids();

    // Set up real-time subscription for bid updates
    const channel = supabase
      .channel('bids-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'bids', filter: `bidder_id=eq.${profile?.id}` }, 
        () => { fetchBids(); }
      )
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'bids', filter: `bidder_id=eq.${profile?.id}` }, 
        () => { fetchBids(); }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const fetchBids = async () => {
    if (!profile?.id) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('bids')
        .select(`
          id,
          amount,
          created_at,
          status,
          product_id,
          products (
            id,
            name,
            quantity,
            unit,
            farmer_id,
            profiles (
              id,
              name
            )
          )
        `)
        .eq('bidder_id', profile.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setBids(data || []);
    } catch (error) {
      console.error('Error fetching bids:', error);
      toast({
        title: "Error",
        description: "Failed to load bids. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBids = bids.filter(bid => {
    const matchesSearch = 
      (bid.id && bid.id.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (bid.products?.name && bid.products.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (bid.products?.profiles?.name && bid.products.profiles.name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = 
      filterStatus === "all" ||
      (filterStatus === "active" && bid.status === "active") ||
      (filterStatus === "won" && bid.status === "won") ||
      (filterStatus === "lost" && bid.status === "lost");

    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Active</Badge>;
      case "won":
        return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Won</Badge>;
      case "lost":
        return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">Lost</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <DashboardLayout userRole="trader">
      <DashboardHeader title="My Bids" userName={profile?.name || ""} userRole="trader" />
      
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center">
            <div>
              <CardTitle>My Bids</CardTitle>
              <CardDescription>Track and manage your auction bids</CardDescription>
            </div>
            <div className="flex gap-4 mt-4 md:mt-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search bids..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Bids</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="won">Won</SelectItem>
                  <SelectItem value="lost">Lost</SelectItem>
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
          ) : filteredBids.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Farmer</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Bid Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Bid Time</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredBids.map((bid) => (
                  <TableRow key={bid.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Package className="h-4 w-4 text-muted-foreground" />
                        <span>{bid.products?.name || "Unknown Product"}</span>
                      </div>
                    </TableCell>
                    <TableCell>{bid.products?.profiles?.name || "Unknown Farmer"}</TableCell>
                    <TableCell>{`${bid.products?.quantity || 0} ${bid.products?.unit || ""}`}</TableCell>
                    <TableCell className="font-medium">
                      {formatCurrency(bid.amount)}/{bid.products?.unit || "unit"}
                    </TableCell>
                    <TableCell>{getStatusBadge(bid.status)}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span>{new Date(bid.created_at).toLocaleDateString()}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => navigate(`/trader-auctions/${bid.product_id}`)}
                      >
                        View Auction
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
                <Gavel className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">No bids found</h3>
              <p className="text-muted-foreground mb-6">
                You haven't placed any bids yet or none match your current filters.
              </p>
              <Button onClick={() => navigate("/trader-auctions")}>
                Browse Auctions
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default TraderBids;
