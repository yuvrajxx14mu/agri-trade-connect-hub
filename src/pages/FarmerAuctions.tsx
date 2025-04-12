import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import DashboardHeader from "@/components/dashboard/DashboardHeader";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Gavel, Plus, Search, ArrowUpRight, Calendar, Eye, Ban } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/context/AuthContext";
import { formatCurrency } from "@/lib/utils";
import { ColumnDef } from "@tanstack/react-table";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

interface DatabaseAuction {
  id: string;
  product_id: string;
  farmer_id: string;
  start_price: number;
  current_price: number;
  min_increment: number;
  quantity: number;
  end_time: string;
  status: string;
  created_at: string;
  products: {
    id: string;
    name: string;
    category: string;
    description: string | null;
    quantity: number;
    unit: string;
    price: number;
    location: string;
    image_url: string | null;
    farmer_id: string;
  } | null;
  profiles: {
    id: string;
    name: string;
    role: string;
  } | null;
  bids: Array<{
    id: string;
    amount: number;
    bidder_id: string;
    created_at: string;
  }> | null;
}

const FarmerAuctions = () => {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [auctions, setAuctions] = useState<DatabaseAuction[]>([]);

  const fetchAuctions = async () => {
    if (!profile?.id) return;

    try {
      const { data: auctionsData, error: auctionsError } = await supabase
        .from('auctions')
        .select(`
          id,
          product_id,
          farmer_id,
          start_price,
          current_price,
          min_increment,
          quantity,
          end_time,
          status,
          created_at,
          products:product_id (
            id,
            name,
            category,
            description,
            quantity,
            unit,
            price,
            location,
            image_url,
            farmer_id
          ),
          bids (
            id,
            amount,
            bidder_id,
            created_at
          )
        `)
        .eq('farmer_id', profile.id)
        .order('created_at', { ascending: false });

      if (auctionsError) throw auctionsError;

      // Get farmer profiles in a separate query
      const farmerIds = [...new Set(auctionsData?.map(a => a.farmer_id) || [])];
      const { data: farmerProfiles, error: farmerError } = await supabase
        .from('profiles')
        .select('id, name, role')
        .in('id', farmerIds);

      if (farmerError) throw farmerError;

      // Create a map of farmer profiles
      const farmerMap = Object.fromEntries(
        (farmerProfiles || []).map(p => [p.id, p])
      );

      // Add farmer names to the auctions data
      const auctionsWithFarmers = auctionsData?.map(auction => ({
        ...auction,
        products: auction.products || { name: "Unknown Product" },
        farmer_name: farmerMap[auction.farmer_id]?.name || 'Unknown Farmer'
      }));

      setAuctions(auctionsWithFarmers as unknown as DatabaseAuction[]);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching auctions:', error);
      toast({
        title: "Error",
        description: "Failed to load auctions. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, [profile?.id]);

  const columns: ColumnDef<DatabaseAuction>[] = [
    {
      accessorKey: "products.name",
      header: "Product",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          {row.original.products?.name || "Unknown Product"}
        </div>
      ),
    },
    {
      accessorKey: "current_price",
      header: "Current Price",
      cell: ({ row }) => formatCurrency(row.original.current_price),
    },
    {
      accessorKey: "bids",
      header: "Bids",
      cell: ({ row }) => row.original.bids?.length || 0,
    },
    {
      accessorKey: "end_time",
      header: "Ends In",
      cell: ({ row }) => formatDistanceToNow(new Date(row.original.end_time), { addSuffix: true }),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.status === 'active' ? 'default' : 'secondary'}>
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/farmer-auctions/${row.original.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {row.original.status === 'active' && (
            <Button
              variant="ghost"
              size="icon"
              onClick={() => handleEndAuction(row.original.id)}
            >
              <Ban className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const handleEndAuction = async (auctionId: string) => {
    try {
      const { error } = await supabase
        .from('auctions')
        .update({ status: 'ended' })
        .eq('id', auctionId);

      if (error) throw error;

      toast({
        title: "Auction Ended",
        description: "The auction has been successfully ended.",
      });

      fetchAuctions();
    } catch (error) {
      console.error('Error ending auction:', error);
      toast({
        title: "Error",
        description: "Failed to end auction. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <DashboardLayout userRole="farmer">
      <DashboardHeader title="My Auctions" userName={profile?.name || ""} userRole="farmer" />
      
      <div className="w-full p-6 space-y-6">
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200">
          <CardHeader className="pb-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center space-y-4 sm:space-y-0">
              <div>
                <CardTitle className="text-2xl font-bold">Active Auctions</CardTitle>
                <CardDescription className="text-base">Manage your ongoing and completed auctions</CardDescription>
              </div>
              <Button 
                onClick={() => navigate("/farmer-auctions/create")}
                size="lg"
                className="bg-green-600 hover:bg-green-700 text-white shadow-sm"
              >
                <Plus className="mr-2 h-5 w-5" />
                Create New Auction
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border bg-white overflow-hidden">
              {isLoading ? (
                <div className="flex justify-center p-4">
                  <Gavel className="h-8 w-8 animate-spin" />
                </div>
              ) : (
                <DataTable columns={columns} data={auctions} />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FarmerAuctions;
