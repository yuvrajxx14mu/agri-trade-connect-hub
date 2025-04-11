-- Drop shipments table and related indexes
DROP TABLE IF EXISTS public.shipments;

-- Remove shipment-related columns from other tables
ALTER TABLE public.orders DROP COLUMN IF EXISTS shipping_address;
ALTER TABLE public.products DROP COLUMN IF EXISTS shipping_availability;
ALTER TABLE public.products DROP COLUMN IF EXISTS shipping_policy;
ALTER TABLE public.auctions DROP COLUMN IF EXISTS shipping_options;

-- Update notification settings to remove shipment-related settings
UPDATE public.notification_settings 
SET settings = settings - 'push.shipments' - 'email.shipments';

-- Update order status check constraint to remove shipment-related statuses
ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE public.orders ADD CONSTRAINT orders_status_check CHECK (
  status = any (
    array[
      'pending'::text,
      'processing'::text,
      'completed'::text,
      'cancelled'::text
    ]
  )
); 