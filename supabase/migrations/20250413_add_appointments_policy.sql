-- Enable RLS on appointments table
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

-- Allow farmers to create appointments
CREATE POLICY "Farmers can create appointments"
ON public.appointments
FOR INSERT
WITH CHECK (auth.uid() = farmer_id);

-- Allow farmers to view their appointments
CREATE POLICY "Farmers can view their appointments"
ON public.appointments
FOR SELECT
USING (auth.uid() = farmer_id);

-- Allow traders to view appointments where they are the trader
CREATE POLICY "Traders can view their appointments"
ON public.appointments
FOR SELECT
USING (auth.uid() = trader_id);

-- Allow both farmers and traders to update their appointments
CREATE POLICY "Users can update their appointments"
ON public.appointments
FOR UPDATE
USING (auth.uid() = farmer_id OR auth.uid() = trader_id);

-- Allow both farmers and traders to delete their appointments
CREATE POLICY "Users can delete their appointments"
ON public.appointments
FOR DELETE
USING (auth.uid() = farmer_id OR auth.uid() = trader_id); 