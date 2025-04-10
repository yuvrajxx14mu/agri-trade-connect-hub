import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { supabase } from "@/integrations/supabase/client";

interface Bid {
  id: string;
  bidder_id: string;
  bidder_name: string;
  amount: number;
  status: string;
  created_at: string;
}

interface BidHistoryProps {
  productId: string;
  onBidUpdate?: () => void;
}

const BidHistory = ({ productId, onBidUpdate }: BidHistoryProps) => {
  const [bids, setBids] = useState<Bid[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchBids = async () => {
    try {
      const { data, error } = await supabase
        .from('bids')
        .select('*')
        .eq('product_id', productId)
        .order('amount', { ascending: false });

      if (error) throw error;

      setBids(data || []);
    } catch (error) {
      console.error('Error fetching bids:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBids();

    // Set up real-time subscription for new bids
    const channel = supabase
      .channel('bid-history')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'bids', filter: `product_id=eq.${productId}` }, 
        () => {
          fetchBids();
          if (onBidUpdate) onBidUpdate();
        }
      )
      .on('postgres_changes', 
        { event: 'UPDATE', schema: 'public', table: 'bids', filter: `product_id=eq.${productId}` }, 
        () => {
          fetchBids();
          if (onBidUpdate) onBidUpdate();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [productId, onBidUpdate]);

  const getBidStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'accepted':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'rejected':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'pending':
      default:
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bid History</CardTitle>
        <CardDescription>Recent bids for this auction</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-4">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
          </div>
        ) : bids.length === 0 ? (
          <div className="text-center py-4 text-muted-foreground">
            No bids placed yet
          </div>
        ) : (
          <div className="space-y-4">
            {bids.map((bid) => (
              <div
                key={bid.id}
                className="flex items-center justify-between p-4 rounded-lg border bg-card"
              >
                <div className="space-y-1">
                  <p className="font-medium">{bid.bidder_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDistanceToNow(new Date(bid.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <p className="font-semibold">{formatCurrency(bid.amount)}</p>
                  <Badge variant="outline" className={getBidStatusColor(bid.status)}>
                    {bid.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default BidHistory; 