import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardSidebar from '@/components/DashboardSidebar';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';

interface Bid {
  id: string;
  product_id: string;
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
  product: {
    name: string;
    image_url: string;
    farmer_id: string;
  };
}

export const FarmerBids = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchBids();

    // Set up real-time subscription for bid updates
    const channel = supabase
      .channel('bids-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'bids' }, 
        () => { fetchBids(); }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchBids = async () => {
    try {
      const { data, error } = await supabase
        .from('bids')
        .select(`
          *,
          product:products(
            name,
            image_url,
            farmer_id
          )
        `)
        .eq('product.farmer_id', user?.id)
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
      setLoading(false);
    }
  };

  const handleAcceptBid = async (bidId: string) => {
    try {
      // Start a transaction
      const { error: updateError } = await supabase
        .from('bids')
        .update({ 
          status: 'accepted',
          is_highest_bid: false 
        })
        .eq('id', bidId);

      if (updateError) throw updateError;

      // Get the bid details
      const bid = bids.find(b => b.id === bidId);
      if (!bid) throw new Error('Bid not found');

      // Update all other bids for this product to rejected
      await supabase
        .from('bids')
        .update({ 
          status: 'rejected',
          is_highest_bid: false 
        })
        .eq('product_id', bid.product_id)
        .neq('id', bidId);

      // Create an order from the accepted bid
      const { error: orderError } = await supabase
        .from('orders')
        .insert([{
          product_id: bid.product_id,
          trader_id: bid.bidder_id,
          farmer_id: user?.id,
          quantity: bid.quantity,
          price: bid.amount,
          total_amount: bid.amount * bid.quantity,
          status: 'pending',
          payment_status: 'pending'
        }]);

      if (orderError) throw orderError;

      // Update product status
      const { error: productError } = await supabase
        .from('products')
        .update({ status: 'sold' })
        .eq('id', bid.product_id);

      if (productError) throw productError;

      // Update auction status
      const { error: auctionError } = await supabase
        .from('auctions')
        .update({ status: 'completed' })
        .eq('product_id', bid.product_id);

      if (auctionError) throw auctionError;

      // Create notification for the trader
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([{
          user_id: bid.bidder_id,
          title: 'Bid Accepted',
          message: `Your bid of ${formatCurrency(bid.amount)} for ${bid.product.name} has been accepted`,
          type: 'bid',
          metadata: {
            bid_id: bidId,
            product_id: bid.product_id,
            order_id: bidId // Using bidId as orderId for now
          }
        }]);

      if (notificationError) throw notificationError;

      toast({
        title: "Bid Accepted",
        description: "The bid has been accepted and an order has been created.",
      });

      fetchBids();
    } catch (error) {
      console.error('Error accepting bid:', error);
      toast({
        title: "Error",
        description: "Failed to accept bid. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRejectBid = async (bidId: string) => {
    try {
      const bid = bids.find(b => b.id === bidId);
      if (!bid) throw new Error('Bid not found');

      const { error } = await supabase
        .from('bids')
        .update({ 
          status: 'rejected',
          is_highest_bid: false 
        })
        .eq('id', bidId);

      if (error) throw error;

      // If this was the highest bid, find the next highest bid and mark it as highest
      if (bid.is_highest_bid) {
        const { data: nextHighestBid } = await supabase
          .from('bids')
          .select('*')
          .eq('product_id', bid.product_id)
          .eq('status', 'pending')
          .order('amount', { ascending: false })
          .limit(1)
          .single();

        if (nextHighestBid) {
          await supabase
            .from('bids')
            .update({ is_highest_bid: true })
            .eq('id', nextHighestBid.id);
        }
      }

      // Create a notification for the trader
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([{
          user_id: bid.bidder_id,
          title: 'Bid Rejected',
          message: `Your bid of ${formatCurrency(bid.amount)} for ${bid.product.name} has been rejected`,
          type: 'bid',
          metadata: {
            bid_id: bidId,
            product_id: bid.product_id
          }
        }]);

      if (notificationError) throw notificationError;

      toast({
        title: "Bid Rejected",
        description: "The bid has been rejected.",
      });

      fetchBids();
    } catch (error) {
      console.error('Error rejecting bid:', error);
      toast({
        title: "Error",
        description: "Failed to reject bid. Please try again.",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case 'accepted':
        return <Badge variant="outline" className="bg-green-100 text-green-800">Accepted</Badge>;
      case 'rejected':
        return <Badge variant="outline" className="bg-red-100 text-red-800">Rejected</Badge>;
      case 'outbid':
        return <Badge variant="outline" className="bg-gray-100 text-gray-800">Outbid</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar userRole="farmer" />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">Bids on My Products</h1>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {bids.map((bid) => (
              <Card key={bid.id}>
                <CardHeader>
                  <CardTitle>{bid.product.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium">Bidder: {bid.bidder_name}</p>
                      <p className="font-medium">Amount: {formatCurrency(bid.amount)}</p>
                      <p className="font-medium">Quantity: {bid.quantity}</p>
                      <p>Status: {getStatusBadge(bid.status)}</p>
                      {bid.previous_bid_amount && (
                        <p className="text-sm text-gray-500">
                          Previous Bid: {formatCurrency(bid.previous_bid_amount)}
                        </p>
                      )}
                    </div>
                    <div>
                      <p>Message: {bid.message || 'No message'}</p>
                      <p>Bid Time: {formatDate(bid.created_at)}</p>
                      <p>Expires: {formatDate(bid.expires_at)}</p>
                    </div>
                    {bid.status === 'pending' && (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={() => handleAcceptBid(bid.id)}
                        >
                          Accept
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={() => handleRejectBid(bid.id)}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}; 