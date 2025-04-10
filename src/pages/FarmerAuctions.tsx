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
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [refreshInterval, setRefreshInterval] = useState<number | null>(null);

  const fetchAuctions = async () => {
    if (!profile?.id) return;

    try {
      const { data: auctionsData, error: auctionsError } = await supabase
        .from('auctions')
        .select('*')
        .eq('farmer_id', profile.id);

      if (auctionsError) throw auctionsError;

      const productIds = auctionsData?.map(a => a.product_id) || [];
      
      if (productIds.length === 0) {
        setAuctions([]);
        setIsLoading(false);
        return;
      }
      
      const { data: productsData, error: productsError } = await supabase
        .from('products')
        .select('*')
        .in('id', productIds);

      if (productsError) throw productsError;

      const bidCountPromises = auctionsData?.map(async (auction) => {
        const { count, error: countError } = await supabase
          .from('bids')
          .select('id', { count: 'exact' })
          .eq('product_id', auction.product_id);
          
        return { auctionId: auction.id, count: count || 0 };
      }) || [];
      
      const bidCounts = await Promise.all(bidCountPromises);
      const bidCountMap = Object.fromEntries(
        bidCounts.map(item => [item.auctionId, item.count])
      );

      const transformedAuctions = (auctionsData || []).map(auction => {
        const product = productsData?.find(p => p.id === auction.product_id);
        return {
          id: auction.id,
          product: {
            name: product?.name || 'Unknown Product',
            quantity: product?.quantity || 0,
            unit: product?.unit || '',
            price: product?.price || 0
          },
          currentBid: auction.current_price || auction.start_price,
          bidCount: bidCountMap[auction.id] || 0,
          endsIn: getTimeRemaining(new Date(auction.end_time)),
          status: auction.status
        };
      });

      setAuctions(transformedAuctions);
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
    
    const interval = window.setInterval(() => {
      fetchAuctions();
    }, 60000);
    
    setRefreshInterval(interval);
    
    const channel = supabase
      .channel('auction-changes')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'bids' }, 
        () => {
          fetchAuctions();
        }
      )
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'auctions' }, 
        () => {
          fetchAuctions();
        }
      )
      .subscribe();
      
    return () => {
      if (refreshInterval) {
        clearInterval(refreshInterval);
      }
      supabase.removeChannel(channel);
    };
  }, [profile?.id]);

  const getTimeRemaining = (endDate: Date) => {
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();

    if (diff <= 0) return 'Ended';

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));

    if (days > 0) return `${days} days`;
    return `${hours} hours`;
  };
  
  const handleCancelAuction = async (auctionId: string) => {
    try {
      if (!window.confirm("Are you sure you want to cancel this auction?")) {
        return;
      }
      
      const { error } = await supabase
        .from('auctions')
        .update({ status: 'cancelled' })
        .eq('id', auctionId)
        .eq('farmer_id', profile?.id);
        
      if (error) throw error;
      
      fetchAuctions();
      
      toast({
        title: "Auction Cancelled",
        description: "The auction has been cancelled successfully"
      });
    } catch (error) {
      console.error('Error cancelling auction:', error);
      toast({
        title: "Error",
        description: "Failed to cancel auction. Please try again.",
        variant: "destructive"
      });
    }
  };

  const columns: ColumnDef<Auction>[] = [
    {
      id: "product.name",
      accessorKey: "product.name",
      header: "Product",
      cell: ({ row }) => <div className="font-medium">{row.original.product.name}</div>
    },
    {
      id: "product.quantity",
      accessorKey: "product.quantity",
      header: "Quantity",
      cell: ({ row }) => (
        <div>
          {row.original.product.quantity} {row.original.product.unit}
        </div>
      ),
    },
    {
      accessorKey: "product.price",
      header: "Starting Price",
      cell: ({ row }) => formatCurrency(row.original.product.price),
    },
    {
      accessorKey: "currentBid",
      header: "Current Bid",
      cell: ({ row }) => formatCurrency(row.original.currentBid),
    },
    {
      accessorKey: "bidCount",
      header: "Bids",
      cell: ({ row }) => row.original.bidCount,
    },
    {
      accessorKey: "endsIn",
      header: "Time Left",
      cell: ({ row }) => row.original.endsIn,
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <Badge 
          variant="outline" 
          className={
            row.original.status === "completed"
              ? "bg-green-50 text-green-700 border-green-200"
              : row.original.status === "cancelled"
              ? "bg-red-50 text-red-700 border-red-200"
              : "bg-blue-50 text-blue-700 border-blue-200"
          }
        >
          {row.original.status}
        </Badge>
      ),
    },
    {
      id: "actions",
      header: "Actions",
      cell: ({ row }) => (
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/farmer-auctions/${row.original.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
          {row.original.status === "active" && (
            <Button
              variant="ghost"
              size="icon"
              className="text-red-600"
              onClick={() => handleCancelAuction(row.original.id)}
            >
              <Ban className="h-4 w-4" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <DashboardLayout userRole="farmer">
      <DashboardHeader title="My Auctions" userName={profile?.name || ""} userRole="farmer" />
      
      <div className="mb-6">
        <Card>
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Auctions</CardTitle>
                <CardDescription>Manage your ongoing product auctions</CardDescription>
              </div>
              <Button onClick={() => navigate("/farmer-products")}>
                <Plus className="mr-2 h-4 w-4" />
                New Auction
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={auctions}
                searchKey="product.name"
                searchPlaceholder="Search auctions..."
                pageCount={1}
                filterOptions={{
                  key: "status",
                  label: "Filter Status",
                  options: [
                    { label: "Active", value: "active" },
                    { label: "Completed", value: "completed" },
                    { label: "Cancelled", value: "cancelled" }
                  ]
                }}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default FarmerAuctions;
