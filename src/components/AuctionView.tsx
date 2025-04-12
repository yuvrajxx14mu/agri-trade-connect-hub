import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import BidManagement from './BidManagement';
import { formatCurrency } from "../lib/utils";

interface Auction {
  id: string;
  product_name: string;
  description: string;
  base_price: number;
  quantity: number;
  unit: string;
  end_time: string;
  status: 'active' | 'ended' | 'cancelled';
  farmer_id: string;
  farmer_name: string;
  created_at: string;
  image_url?: string;
}

interface Bid {
  id: string;
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
}

const AuctionView = () => {
  const { auctionId } = useParams();
  const navigate = useNavigate();
  const [auction, setAuction] = useState<Auction | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAuctionDetails = async () => {
      try {
        // Replace with your actual API endpoint
        const response = await fetch(`/api/auctions/${auctionId}`);
        if (!response.ok) throw new Error('Failed to fetch auction details');
        const data = await response.json();
        setAuction(data.auction);
        setBids(data.bids);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAuctionDetails();
  }, [auctionId]);

  const handleAcceptBid = async (bid: Bid) => {
    try {
      const response = await fetch(`/api/auctions/${auctionId}/bids/${bid.id}/accept`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to accept bid');
      
      // Update local state
      setBids(prevBids =>
        prevBids.map(b =>
          b.id === bid.id
            ? { ...b, status: 'accepted' }
            : { ...b, status: 'rejected' }
        )
      );

      // Update auction status
      setAuction(prev => prev ? { ...prev, status: 'ended' } : null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to accept bid');
    }
  };

  const handleRejectBid = async (bid: Bid) => {
    try {
      const response = await fetch(`/api/auctions/${auctionId}/bids/${bid.id}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) throw new Error('Failed to reject bid');
      
      // Update local state
      setBids(prevBids =>
        prevBids.map(b =>
          b.id === bid.id
            ? { ...b, status: 'rejected' }
            : b
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reject bid');
    }
  };

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="text-red-500 text-center">{error}</div>;
  if (!auction) return <div className="text-center">Auction not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <Button
        variant="outline"
        className="mb-6"
        onClick={() => navigate(-1)}
      >
        ← Back
      </Button>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl mb-2">{auction.product_name}</CardTitle>
              <CardDescription>{auction.description}</CardDescription>
            </div>
            <Badge variant={auction.status === 'active' ? 'default' : 'secondary'}>
              {auction.status.charAt(0).toUpperCase() + auction.status.slice(1)}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div>
              <p className="text-sm text-muted-foreground">Base Price</p>
              <p className="font-medium">{formatCurrency(auction.base_price)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Quantity</p>
              <p className="font-medium">{auction.quantity} {auction.unit}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">End Time</p>
              <p className="font-medium">{new Date(auction.end_time).toLocaleString()}</p>
            </div>
          </div>

          {auction.image_url && (
            <div className="mb-6">
              <img
                src={auction.image_url}
                alt={auction.product_name}
                className="rounded-lg max-h-96 w-full object-cover"
              />
            </div>
          )}

          <div className="mt-8">
            <h3 className="text-lg font-semibold mb-4">Bids</h3>
            <BidManagement
              bids={bids}
              onAcceptBid={handleAcceptBid}
              onRejectBid={handleRejectBid}
              disabled={auction.status !== 'active'}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AuctionView; 