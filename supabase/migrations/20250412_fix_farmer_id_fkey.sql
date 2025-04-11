-- First, drop the existing foreign key constraint
ALTER TABLE public.products
DROP CONSTRAINT IF EXISTS products_farmer_id_fkey;

-- Add the correct foreign key constraint to reference profiles table
ALTER TABLE public.products
ADD CONSTRAINT products_farmer_id_fkey
FOREIGN KEY (farmer_id)
REFERENCES public.profiles(id)
ON DELETE CASCADE;

-- Update RLS policies
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Farmers can view their own products" ON public.products;
DROP POLICY IF EXISTS "Traders can view active products" ON public.products;

-- Create new RLS policies
CREATE POLICY "Farmers can view their own products"
  ON public.products
  FOR SELECT
  USING (auth.uid() = farmer_id);

CREATE POLICY "Traders can view active products"
  ON public.products
  FOR SELECT
  USING (status = 'active');

-- Allow farmers to insert their own products
CREATE POLICY "Farmers can insert their own products"
  ON public.products
  FOR INSERT
  WITH CHECK (auth.uid() = farmer_id);

-- Allow farmers to update their own products
CREATE POLICY "Farmers can update their own products"
  ON public.products
  FOR UPDATE
  USING (auth.uid() = farmer_id);

-- Allow farmers to delete their own products
CREATE POLICY "Farmers can delete their own products"
  ON public.products
  FOR DELETE
  USING (auth.uid() = farmer_id); 