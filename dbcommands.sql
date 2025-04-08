-- Enable Row Level Security for all tables
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_rates ENABLE ROW LEVEL SECURITY;

-- Create a table for appointments
CREATE TABLE IF NOT EXISTS public.appointments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  with_name TEXT NOT NULL,
  with_id UUID REFERENCES auth.users(id),
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'upcoming',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create a table for messages
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create a table for conversations
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, 
  last_message_id UUID REFERENCES public.messages(id),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user1_id, user2_id)
);

-- Create a table for notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  related_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create a table for shipments
CREATE TABLE IF NOT EXISTS public.shipments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE NOT NULL,
  tracking_number TEXT,
  status TEXT NOT NULL DEFAULT 'processing',
  dispatch_date TIMESTAMP WITH TIME ZONE,
  estimated_delivery TIMESTAMP WITH TIME ZONE,
  current_location TEXT,
  destination TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create a table for auctions
CREATE TABLE IF NOT EXISTS public.auctions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE NOT NULL,
  farmer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  start_price NUMERIC NOT NULL,
  current_price NUMERIC,
  min_increment NUMERIC DEFAULT 100,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add RLS policies for all tables
-- Products policies
CREATE POLICY "Farmers can create their own products" ON products FOR INSERT TO authenticated WITH CHECK (auth.uid() = farmer_id);
CREATE POLICY "Farmers can update their own products" ON products FOR UPDATE TO authenticated USING (auth.uid() = farmer_id);
CREATE POLICY "Farmers can delete their own products" ON products FOR DELETE TO authenticated USING (auth.uid() = farmer_id);
CREATE POLICY "Everyone can view all products" ON products FOR SELECT USING (true);

-- Orders policies
CREATE POLICY "Farmers can view orders for their products" ON orders FOR SELECT TO authenticated USING (auth.uid() = farmer_id);
CREATE POLICY "Traders can view their own orders" ON orders FOR SELECT TO authenticated USING (auth.uid() = trader_id);
CREATE POLICY "Traders can create orders" ON orders FOR INSERT TO authenticated WITH CHECK (auth.uid() = trader_id);
CREATE POLICY "Traders can update their own orders" ON orders FOR UPDATE TO authenticated USING (auth.uid() = trader_id);
CREATE POLICY "Farmers can update orders for their products" ON orders FOR UPDATE TO authenticated USING (auth.uid() = farmer_id);

-- Bids policies
CREATE POLICY "Traders can create bids" ON bids FOR INSERT TO authenticated WITH CHECK (auth.uid() = bidder_id);
CREATE POLICY "Traders can view their own bids" ON bids FOR SELECT TO authenticated USING (auth.uid() = bidder_id);
CREATE POLICY "Farmers can view bids on their products" ON bids FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM products p
    JOIN auctions a ON p.id = a.product_id
    WHERE a.id = product_id AND p.farmer_id = auth.uid()
  )
);

-- Appointments policies
CREATE POLICY "Users can create their own appointments" ON appointments FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own appointments" ON appointments FOR SELECT TO authenticated USING (auth.uid() = user_id OR auth.uid() = with_id);
CREATE POLICY "Users can update their own appointments" ON appointments FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own appointments" ON appointments FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Messages policies
CREATE POLICY "Users can send messages" ON messages FOR INSERT TO authenticated WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "Users can view their own messages" ON messages FOR SELECT TO authenticated USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

-- Conversations policies
CREATE POLICY "Users can view their own conversations" ON conversations FOR SELECT TO authenticated USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Users can create conversations they're part of" ON conversations FOR INSERT TO authenticated WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "Users can update conversations they're part of" ON conversations FOR UPDATE TO authenticated USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- Notifications policies
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert notifications for other users" ON notifications FOR INSERT TO authenticated WITH CHECK (true);

-- Shipments policies
CREATE POLICY "Farmers can view shipments related to their orders" ON shipments FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM orders o
    WHERE o.id = order_id AND o.farmer_id = auth.uid()
  )
);
CREATE POLICY "Traders can view shipments related to their orders" ON shipments FOR SELECT TO authenticated USING (
  EXISTS (
    SELECT 1 FROM orders o
    WHERE o.id = order_id AND o.trader_id = auth.uid()
  )
);
CREATE POLICY "Farmers can create shipments for their orders" ON shipments FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM orders o
    WHERE o.id = order_id AND o.farmer_id = auth.uid()
  )
);
CREATE POLICY "Farmers can update shipments for their orders" ON shipments FOR UPDATE TO authenticated USING (
  EXISTS (
    SELECT 1 FROM orders o
    WHERE o.id = order_id AND o.farmer_id = auth.uid()
  )
);

-- Auctions policies
CREATE POLICY "Farmers can create auctions for their products" ON auctions FOR INSERT TO authenticated WITH CHECK (
  EXISTS (
    SELECT 1 FROM products p
    WHERE p.id = product_id AND p.farmer_id = auth.uid()
  )
);
CREATE POLICY "Farmers can update their own auctions" ON auctions FOR UPDATE TO authenticated USING (auth.uid() = farmer_id);
CREATE POLICY "Everyone can view all auctions" ON auctions FOR SELECT USING (true);

-- Market rates policies
CREATE POLICY "Anyone can view market rates" ON market_rates FOR SELECT USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_shipments_updated_at BEFORE UPDATE ON shipments
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_auctions_updated_at BEFORE UPDATE ON auctions
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name, role, phone)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'name', new.email),
    COALESCE(new.raw_user_meta_data->>'role', 'farmer'),
    COALESCE(new.raw_user_meta_data->>'phone', '')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
