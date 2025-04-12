import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardSidebar from '@/components/DashboardSidebar';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Auction {
  id: string;
  product_id: string;
  start_price: number;
  current_price: number;
  reserve_price: number;
  min_increment: number;
  quantity: number;
  start_time: string;
  end_time: string;
  status: string;
  product: {
    name: string;
    image_url: string;
  };
}

export const FarmerAuctions = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      const { data, error } = await supabase
        .from('auctions')
        .select(`
          *,
          product:products(name, image_url)
        `)
        .eq('farmer_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAuctions(data || []);
    } catch (error) {
      console.error('Error fetching auctions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAuction = async (auctionId: string) => {
    try {
      const { error } = await supabase
        .from('auctions')
        .delete()
        .eq('id', auctionId);

      if (error) throw error;
      fetchAuctions();
    } catch (error) {
      console.error('Error deleting auction:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar userRole="farmer" />
      <main className="flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">My Auctions</h1>
          <Button onClick={() => navigate('/farmer/auctions/new')}>
            Create New Auction
          </Button>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auctions.map((auction) => (
              <Card key={auction.id}>
                <CardHeader>
                  <CardTitle>{auction.product.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium">Start Price: ${auction.start_price}</p>
                      <p className="font-medium">Current Price: ${auction.current_price}</p>
                      <p className="font-medium">Reserve Price: ${auction.reserve_price}</p>
                    </div>
                    <div>
                      <p>Quantity: {auction.quantity}</p>
                      <p>Min Increment: ${auction.min_increment}</p>
                    </div>
                    <div>
                      <p>Start Time: {formatDate(auction.start_time)}</p>
                      <p>End Time: {formatDate(auction.end_time)}</p>
                    </div>
                    <div>
                      <p>Status: {auction.status}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => navigate(`/farmer/auctions/${auction.id}/edit`)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => handleDeleteAuction(auction.id)}
                      >
                        Delete
                      </Button>
                    </div>
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