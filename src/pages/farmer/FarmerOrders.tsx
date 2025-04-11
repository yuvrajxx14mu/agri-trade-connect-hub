import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import DashboardSidebar from '@/components/DashboardSidebar';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface Order {
  id: string;
  product_id: string;
  trader_id: string;
  farmer_id: string;
  quantity: number;
  price: number;
  total_amount: number;
  status: string;
  payment_status: string;
  created_at: string;
  product: {
    name: string;
    image_url: string;
  };
  trader: {
    name: string;
  };
}

export const FarmerOrders = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          product:products(
            name,
            image_url
          ),
          trader:profiles(
            name
          )
        `)
        .eq('farmer_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;

      // Create a notification for the trader
      const order = orders.find(o => o.id === orderId);
      if (order) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert([{
            user_id: order.trader_id,
            title: 'Order Status Updated',
            message: `Order #${orderId} status has been updated to ${newStatus}`,
            type: 'order',
            metadata: {
              order_id: orderId
            }
          }]);

        if (notificationError) throw notificationError;
      }

      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar userRole="farmer" />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">My Orders</h1>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {orders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <CardTitle>{order.product.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium">Trader: {order.trader.name}</p>
                      <p className="font-medium">Quantity: {order.quantity}</p>
                      <p className="font-medium">Total Amount: ${order.total_amount}</p>
                    </div>
                    <div>
                      <p>Status: {order.status}</p>
                      <p>Payment Status: {order.payment_status}</p>
                      <p>Date: {formatDate(order.created_at)}</p>
                    </div>
                    <div className="flex gap-2">
                      {order.status === 'pending' && (
                        <Button
                          onClick={() => handleUpdateStatus(order.id, 'processing')}
                        >
                          Start Processing
                        </Button>
                      )}
                      {order.status === 'processing' && (
                        <Button
                          onClick={() => handleUpdateStatus(order.id, 'shipped')}
                        >
                          Mark as Shipped
                        </Button>
                      )}
                      {order.status === 'shipped' && (
                        <Button
                          onClick={() => handleUpdateStatus(order.id, 'delivered')}
                        >
                          Mark as Delivered
                        </Button>
                      )}
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