-- Create price history table
CREATE TABLE IF NOT EXISTS price_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    trader_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    farmer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    quantity DECIMAL(10,2) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    notes TEXT,
    shipping_address TEXT,
    payment_status VARCHAR(50) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT orders_status_check CHECK (
        status IN ('pending', 'processing', 'completed', 'cancelled')
    ),
    CONSTRAINT orders_payment_status_check CHECK (
        payment_status IN ('pending', 'processing', 'completed')
    )
);

-- Create order status history table
CREATE TABLE IF NOT EXISTS order_status_history (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create RLS policies
ALTER TABLE price_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_status_history ENABLE ROW LEVEL SECURITY;

-- Price history policies
CREATE POLICY "Users can view price history for products they own or are trading"
    ON price_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM products
            WHERE products.id = price_history.product_id
            AND (
                products.farmer_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM orders
                    WHERE orders.product_id = products.id
                    AND orders.trader_id = auth.uid()
                )
            )
        )
    );

-- Orders policies
CREATE POLICY "Users can view their own orders"
    ON orders FOR SELECT
    USING (
        trader_id = auth.uid()
        OR farmer_id = auth.uid()
    );

CREATE POLICY "Traders can create orders"
    ON orders FOR INSERT
    WITH CHECK (
        auth.uid() = trader_id
    );

CREATE POLICY "Users can update their own orders"
    ON orders FOR UPDATE
    USING (
        trader_id = auth.uid()
        OR farmer_id = auth.uid()
    );

-- Order status history policies
CREATE POLICY "Users can view status history for their orders"
    ON order_status_history FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM orders
            WHERE orders.id = order_status_history.order_id
            AND (
                orders.trader_id = auth.uid()
                OR orders.farmer_id = auth.uid()
            )
        )
    );

-- Create function to update order status
CREATE OR REPLACE FUNCTION update_order_status()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status != OLD.status THEN
        INSERT INTO order_status_history (order_id, status, notes)
        VALUES (NEW.id, NEW.status, NEW.notes);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for order status updates
CREATE TRIGGER order_status_update
    AFTER UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_order_status(); 