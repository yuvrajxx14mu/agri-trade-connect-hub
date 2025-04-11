import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardSidebar from '@/components/DashboardSidebar';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';

interface Shipment {
  id: string;
  order_id: string;
  farmer_id: string;
  trader_id: string;
  tracking_number: string;
  status: string;
  dispatch_date: string;
  estimated_delivery: string;
  actual_delivery: string;
  current_location: string;
  destination: string;
  carrier: string;
  notes: string;
  created_at: string;
  order: {
    product: {
      name: string;
      image_url: string;
    };
    trader: {
      name: string;
    };
    quantity: number;
  };
}

export const FarmerShipments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newShipment, setNewShipment] = useState({
    order_id: '',
    tracking_number: '',
    carrier: '',
    destination: '',
  });
  const [availableOrders, setAvailableOrders] = useState<any[]>([]);

  useEffect(() => {
    fetchShipments();
    fetchAvailableOrders();
  }, []);

  const fetchShipments = async () => {
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select(`
          *,
          order:orders(
            product:products(name, image_url),
            trader:profiles(name),
            quantity
          )
        `)
        .eq('farmer_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setShipments(data || []);
    } catch (error) {
      console.error('Error fetching shipments:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAvailableOrders = async () => {
    try {
      // Fetch shipment order IDs
      const { data: shipmentData, error: shipmentError } = await supabase
        .from('shipments')
        .select('order_id');

      if (shipmentError) throw shipmentError;

      const shipmentOrderIds = shipmentData.map((shipment) => shipment.order_id);

      // Fetch available orders
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id,
          product:products(name),
          trader:profiles(name)
        `)
        .eq('farmer_id', user?.id)
        .eq('status', 'processing')
        .not('id', 'in', shipmentOrderIds);

      if (error) throw error;
      console.log('Fetched Orders:', data);
      setAvailableOrders(data || []);
    } catch (error) {
      console.error('Error fetching available orders:', error);
    }
  };

  const handleCreateShipment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const order = availableOrders.find(o => o.id === newShipment.order_id);
      if (!order) throw new Error('Order not found');

      const { error } = await supabase
        .from('shipments')
        .insert([{
          ...newShipment,
          farmer_id: user?.id,
          trader_id: order.trader.id,
          status: 'processing',
          dispatch_date: new Date().toISOString(),
        }]);

      if (error) throw error;

      // Create a notification for the trader
      const { error: notificationError } = await supabase
        .from('notifications')
        .insert([{
          user_id: order.trader.id,
          title: 'New Shipment Created',
          message: `A shipment has been created for your order of ${order.product.name}`,
          type: 'shipment',
          metadata: {
            order_id: newShipment.order_id
          }
        }]);

      if (notificationError) throw notificationError;

      setNewShipment({
        order_id: '',
        tracking_number: '',
        carrier: '',
        destination: '',
      });
      fetchShipments();
    } catch (error) {
      console.error('Error creating shipment:', error);
    }
  };

  const handleUpdateStatus = async (shipmentId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('shipments')
        .update({ 
          status: newStatus,
          ...(newStatus === 'delivered' ? { actual_delivery: new Date().toISOString() } : {})
        })
        .eq('id', shipmentId);

      if (error) throw error;

      // Create a notification for the trader
      const shipment = shipments.find(s => s.id === shipmentId);
      if (shipment) {
        const { error: notificationError } = await supabase
          .from('notifications')
          .insert([{
            user_id: shipment.trader_id,
            title: 'Shipment Status Updated',
            message: `Shipment status has been updated to ${newStatus}`,
            type: 'shipment',
            metadata: {
              shipment_id: shipmentId
            }
          }]);

        if (notificationError) throw notificationError;
      }

      fetchShipments();
    } catch (error) {
      console.error('Error updating shipment status:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar userRole="farmer" />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">My Shipments</h1>

        <form onSubmit={handleCreateShipment} className="mb-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="order_id">Order</Label>
              <Select
                value={newShipment.order_id}
                onValueChange={(value) => setNewShipment(prev => ({ ...prev, order_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select order" />
                </SelectTrigger>
                <SelectContent>
                  {availableOrders.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.product.name} - {order.trader.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="tracking_number">Tracking Number</Label>
              <Input
                id="tracking_number"
                value={newShipment.tracking_number}
                onChange={(e) => setNewShipment(prev => ({ ...prev, tracking_number: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="carrier">Carrier</Label>
              <Input
                id="carrier"
                value={newShipment.carrier}
                onChange={(e) => setNewShipment(prev => ({ ...prev, carrier: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="destination">Destination</Label>
              <Input
                id="destination"
                value={newShipment.destination}
                onChange={(e) => setNewShipment(prev => ({ ...prev, destination: e.target.value }))}
                required
              />
            </div>
          </div>
          <Button type="submit">Create Shipment</Button>
        </form>

        {loading ? (
          <div>Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {shipments.map((shipment) => (
              <Card key={shipment.id}>
                <CardHeader>
                  <CardTitle>{shipment.order.product.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="font-medium">Trader: {shipment.order.trader.name}</p>
                      <p className="font-medium">Quantity: {shipment.order.quantity}</p>
                    </div>
                    <div>
                      <p>Tracking Number: {shipment.tracking_number}</p>
                      <p>Carrier: {shipment.carrier}</p>
                      <p>Destination: {shipment.destination}</p>
                      <p>Status: {shipment.status}</p>
                      <p>Dispatch Date: {formatDate(shipment.dispatch_date)}</p>
                      {shipment.estimated_delivery && (
                        <p>Estimated Delivery: {formatDate(shipment.estimated_delivery)}</p>
                      )}
                      {shipment.actual_delivery && (
                        <p>Actual Delivery: {formatDate(shipment.actual_delivery)}</p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {shipment.status === 'processing' && (
                        <Button
                          onClick={() => handleUpdateStatus(shipment.id, 'shipped')}
                        >
                          Mark as Shipped
                        </Button>
                      )}
                      {shipment.status === 'shipped' && (
                        <Button
                          onClick={() => handleUpdateStatus(shipment.id, 'delivered')}
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