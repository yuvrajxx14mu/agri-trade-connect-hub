import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import DashboardSidebar from '@/components/DashboardSidebar';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface AuctionFormData {
  product_id: string;
  start_price: number;
  reserve_price: number;
  min_increment: number;
  quantity: number;
  start_time: string;
  end_time: string;
  status: string;
}

interface Product {
  id: string;
  name: string;
}

export const AuctionForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [formData, setFormData] = useState<AuctionFormData>({
    product_id: '',
    start_price: 0,
    reserve_price: 0,
    min_increment: 50,
    quantity: 0,
    start_time: '',
    end_time: '',
    status: 'active',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchProducts();
    if (id) {
      fetchAuction();
    }
  }, [id]);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .eq('farmer_id', user?.id);

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchAuction = async () => {
    try {
      const { data, error } = await supabase
        .from('auctions')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setFormData(data);
    } catch (error) {
      console.error('Error fetching auction:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (id) {
        const { error } = await supabase
          .from('auctions')
          .update(formData)
          .eq('id', id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('auctions')
          .insert([{ ...formData, farmer_id: user?.id }]);

        if (error) throw error;
      }

      navigate('/farmer/auctions');
    } catch (error) {
      console.error('Error saving auction:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name.includes('price') || name === 'quantity' || name === 'min_increment'
        ? Number(value)
        : value,
    }));
  };

  return (
    <div className="flex min-h-screen">
      <DashboardSidebar userRole="farmer" />
      <main className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-8">
          {id ? 'Edit Auction' : 'Create New Auction'}
        </h1>

        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
          <div>
            <Label htmlFor="product_id">Product</Label>
            <Select
              value={formData.product_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, product_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="start_price">Start Price</Label>
            <Input
              id="start_price"
              name="start_price"
              type="number"
              value={formData.start_price}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="reserve_price">Reserve Price</Label>
            <Input
              id="reserve_price"
              name="reserve_price"
              type="number"
              value={formData.reserve_price}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="min_increment">Minimum Increment</Label>
            <Input
              id="min_increment"
              name="min_increment"
              type="number"
              value={formData.min_increment}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              name="quantity"
              type="number"
              value={formData.quantity}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="start_time">Start Time</Label>
            <Input
              id="start_time"
              name="start_time"
              type="datetime-local"
              value={formData.start_time}
              onChange={handleChange}
              required
            />
          </div>

          <div>
            <Label htmlFor="end_time">End Time</Label>
            <Input
              id="end_time"
              name="end_time"
              type="datetime-local"
              value={formData.end_time}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Auction'}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/farmer/auctions')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}; 