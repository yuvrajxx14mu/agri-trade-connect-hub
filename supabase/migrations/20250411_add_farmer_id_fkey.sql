-- Add foreign key relationship between products and profiles tables
ALTER TABLE public.products
ADD CONSTRAINT products_farmer_id_fkey
FOREIGN KEY (farmer_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- Add RLS policy for products
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Allow farmers to view their own products
CREATE POLICY "Farmers can view their own products"
  ON public.products
  FOR SELECT
  USING (auth.uid() = farmer_id);

-- Allow traders to view all active products
CREATE POLICY "Traders can view active products"
  ON public.products
  FOR SELECT
  USING (status = 'active'); 