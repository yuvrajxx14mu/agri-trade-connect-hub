create table public.appointments (
  id uuid not null default extensions.uuid_generate_v4 (),
  trader_id uuid not null,
  farmer_id uuid not null,
  title text not null,
  appointment_date date not null,
  appointment_time text not null,
  location text not null,
  status text not null,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint appointments_pkey primary key (id),
  constraint appointments_farmer_id_fkey foreign KEY (farmer_id) references profiles (id),
  constraint appointments_trader_id_fkey foreign KEY (trader_id) references profiles (id),
  constraint appointments_status_check check (
    (
      status = any (
        array[
          'upcoming'::text,
          'completed'::text,
          'cancelled'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists appointments_trader_id_idx on public.appointments using btree (trader_id) TABLESPACE pg_default;

create index IF not exists appointments_farmer_id_idx on public.appointments using btree (farmer_id) TABLESPACE pg_default;

create index IF not exists appointments_appointment_date_idx on public.appointments using btree (appointment_date) TABLESPACE pg_default;

create index IF not exists appointments_status_idx on public.appointments using btree (status) TABLESPACE pg_default;

create trigger update_appointments_updated_at BEFORE
update on appointments for EACH row
execute FUNCTION update_updated_at_column ();


create table public.auctions (
  id uuid not null default gen_random_uuid (),
  product_id uuid null,
  farmer_id uuid null,
  start_price numeric(10, 2) not null,
  current_price numeric(10, 2) not null,
  reserve_price numeric(10, 2) null,
  min_increment numeric(10, 2) null default 50.00,
  quantity numeric(10, 2) not null,
  start_time timestamp with time zone not null,
  end_time timestamp with time zone not null,
  description text null,
  auction_type character varying(50) null default 'standard'::character varying,
  allow_auto_bids boolean null default true,
  visibility character varying(50) null default 'public'::character varying,
  shipping_options character varying(50) null default 'seller'::character varying,
  status character varying(50) null default 'active'::character varying,
  created_at timestamp with time zone null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone null default timezone ('utc'::text, now()),
  constraint auctions_pkey primary key (id),
  constraint auctions_farmer_id_fkey foreign KEY (farmer_id) references auth.users (id),
  constraint auctions_product_id_fkey foreign KEY (product_id) references products (id)
) TABLESPACE pg_default;


create table public.bids (
  id uuid not null default gen_random_uuid (),
  product_id uuid not null,
  bidder_id uuid not null,
  bidder_name text not null,
  amount numeric(10, 2) not null,
  status text not null default 'pending'::text,
  message text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint bids_pkey primary key (id),
  constraint bids_bidder_id_fkey foreign KEY (bidder_id) references auth.users (id) on delete CASCADE,
  constraint bids_product_id_fkey foreign KEY (product_id) references products (id) on delete CASCADE,
  constraint bids_status_check check (
    (
      status = any (
        array[
          'pending'::text,
          'accepted'::text,
          'rejected'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists idx_bids_product_status on public.bids using btree (product_id, status) TABLESPACE pg_default;
create index IF not exists idx_bids_bidder on public.bids using btree (bidder_id) TABLESPACE pg_default;

create trigger update_bids_timestamp BEFORE
update on bids for EACH row
execute FUNCTION update_updated_at_column ();



create table public.business_details (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  business_name text not null,
  business_type text not null,
  registration_number text null,
  gst_number text null,
  business_address text null,
  business_phone text null,
  business_email text null,
  business_website text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint business_details_pkey primary key (id),
  constraint business_details_user_id_key unique (user_id),
  constraint business_details_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger update_business_details_updated_at BEFORE
update on business_details for EACH row
execute FUNCTION update_updated_at_column ();



create table public.categories (
  id uuid not null default gen_random_uuid (),
  name text not null,
  description text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint categories_pkey primary key (id),
  constraint categories_name_key unique (name)
) TABLESPACE pg_default;

create trigger update_categories_updated_at BEFORE
update on categories for EACH row
execute FUNCTION update_updated_at_column ();



create table public.dashboard_metrics (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  metric_type text not null,
  value numeric not null,
  period text not null,
  date date not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint dashboard_metrics_pkey primary key (id),
  constraint dashboard_metrics_user_id_metric_type_period_date_key unique (user_id, metric_type, period, date),
  constraint dashboard_metrics_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger update_dashboard_metrics_updated_at BEFORE
update on dashboard_metrics for EACH row
execute FUNCTION update_updated_at_column ();



create table public.disputes (
  id uuid not null default gen_random_uuid (),
  order_id uuid not null,
  raised_by uuid not null,
  raised_against uuid not null,
  reason text not null,
  status text not null default 'open'::text,
  resolution text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint disputes_pkey primary key (id),
  constraint disputes_order_id_fkey foreign KEY (order_id) references orders (id) on delete CASCADE,
  constraint disputes_raised_against_fkey foreign KEY (raised_against) references auth.users (id) on delete CASCADE,
  constraint disputes_raised_by_fkey foreign KEY (raised_by) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger update_disputes_updated_at BEFORE
update on disputes for EACH row
execute FUNCTION update_updated_at_column ();



create table public.documents (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  document_type text not null,
  title text not null,
  file_url text not null,
  expiry_date timestamp with time zone null,
  status text not null default 'pending'::text,
  verified_by uuid null,
  verified_at timestamp with time zone null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint documents_pkey primary key (id),
  constraint documents_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE,
  constraint documents_verified_by_fkey foreign KEY (verified_by) references auth.users (id)
) TABLESPACE pg_default;

create trigger update_documents_updated_at BEFORE
update on documents for EACH row
execute FUNCTION update_updated_at_column ();




create table public.farm_details (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  farm_name text not null,
  farm_size numeric not null,
  farm_size_unit text not null default 'acres'::text,
  farm_type text not null,
  farm_address text not null,
  farm_phone text null,
  farm_email text null,
  irrigation_type text null,
  soil_type text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint farm_details_pkey primary key (id),
  constraint farm_details_user_id_key unique (user_id),
  constraint farm_details_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger update_farm_details_updated_at BEFORE
update on farm_details for EACH row
execute FUNCTION update_updated_at_column ();



create table public.locations (
  id uuid not null default gen_random_uuid (),
  name text not null,
  state text not null,
  pincode text null,
  latitude numeric null,
  longitude numeric null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint locations_pkey primary key (id),
  constraint locations_name_state_key unique (name, state)
) TABLESPACE pg_default;

create trigger update_locations_updated_at BEFORE
update on locations for EACH row
execute FUNCTION update_updated_at_column ();



create table public.market_rates (
  id uuid not null default gen_random_uuid (),
  product_name text not null,
  min_price numeric(10, 2) not null,
  max_price numeric(10, 2) not null,
  avg_price numeric(10, 2) not null,
  unit text not null,
  market text not null,
  location text not null,
  volume numeric(10, 2) null,
  date date not null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  location_id uuid null,
  constraint market_rates_pkey primary key (id),
  constraint market_rates_location_id_fkey foreign KEY (location_id) references locations (id)
) TABLESPACE pg_default;

create trigger update_market_rates_timestamp BEFORE
update on market_rates for EACH row
execute FUNCTION update_updated_at_column ();



create table public.messages (
  id uuid not null default extensions.uuid_generate_v4 (),
  sender_id uuid not null,
  receiver_id uuid not null,
  content text not null,
  read boolean null default false,
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  updated_at timestamp with time zone not null default timezone ('utc'::text, now()),
  constraint messages_pkey primary key (id),
  constraint messages_receiver_id_fkey foreign KEY (receiver_id) references profiles (id),
  constraint messages_sender_id_fkey foreign KEY (sender_id) references profiles (id)
) TABLESPACE pg_default;

create index IF not exists messages_sender_id_idx on public.messages using btree (sender_id) TABLESPACE pg_default;

create index IF not exists messages_receiver_id_idx on public.messages using btree (receiver_id) TABLESPACE pg_default;

create index IF not exists messages_created_at_idx on public.messages using btree (created_at) TABLESPACE pg_default;

create trigger update_messages_updated_at BEFORE
update on messages for EACH row
execute FUNCTION update_updated_at_column ();




create table public.notification_settings (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  settings jsonb not null default '{"push": {"bids": true, "orders": true, "shipments": true, "promotions": false, "appointments": true, "pricingAlerts": true}, "email": {"bids": true, "orders": true, "shipments": true, "promotions": false, "appointments": true, "pricingAlerts": true}}'::jsonb,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint notification_settings_pkey primary key (id),
  constraint notification_settings_user_id_key unique (user_id),
  constraint notification_settings_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;



create table public.notifications (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  title text not null,
  message text not null,
  type text not null,
  read boolean null default false,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint notifications_pkey primary key (id),
  constraint notifications_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create index IF not exists idx_notifications_user_id on public.notifications using btree (user_id, created_at desc) TABLESPACE pg_default;

create trigger update_notifications_updated_at BEFORE
update on notifications for EACH row
execute FUNCTION update_updated_at_column ();




create table public.orders (
  id uuid not null default gen_random_uuid (),
  product_id uuid not null,
  trader_id uuid not null,
  farmer_id uuid not null,
  quantity numeric(10, 2) not null,
  price numeric(10, 2) not null,
  total_amount numeric(10, 2) not null,
  status text not null default 'pending'::text,
  payment_status text not null default 'pending'::text,
  payment_date timestamp with time zone null,
  delivery_date timestamp with time zone null,
  notes text null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint orders_pkey primary key (id),
  constraint orders_farmer_id_fkey foreign KEY (farmer_id) references auth.users (id) on delete CASCADE,
  constraint orders_product_id_fkey foreign KEY (product_id) references products (id) on delete CASCADE,
  constraint orders_trader_id_fkey foreign KEY (trader_id) references auth.users (id) on delete CASCADE,
  constraint orders_payment_status_check check (
    (
      payment_status = any (
        array[
          'pending'::text,
          'processing'::text,
          'completed'::text
        ]
      )
    )
  ),
  constraint orders_status_check check (
    (
      status = any (
        array[
          'pending'::text,
          'processing'::text,
          'completed'::text,
          'cancelled'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create trigger update_orders_timestamp BEFORE
update on orders for EACH row
execute FUNCTION update_updated_at_column ();




create table public.payments (
  id uuid not null default gen_random_uuid (),
  order_id uuid not null,
  amount numeric not null,
  payment_method text not null,
  status text not null default 'pending'::text,
  transaction_id text null,
  payment_date timestamp with time zone null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint payments_pkey primary key (id),
  constraint payments_order_id_fkey foreign KEY (order_id) references orders (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger update_payments_updated_at BEFORE
update on payments for EACH row
execute FUNCTION update_updated_at_column ();



create table public.price_alerts (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  product_name text not null,
  target_price numeric not null,
  condition text not null,
  status text not null default 'active'::text,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint price_alerts_pkey primary key (id),
  constraint price_alerts_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger update_price_alerts_updated_at BEFORE
update on price_alerts for EACH row
execute FUNCTION update_updated_at_column ();




create table public.products (
  id uuid not null default gen_random_uuid (),
  farmer_id uuid not null,
  farmer_name text not null,
  name text not null,
  category text not null,
  description text null,
  price numeric(10, 2) not null,
  quantity numeric(10, 2) not null,
  unit text not null,
  quality text not null,
  location text not null,
  image_url text null,
  additional_images text[] null default '{}'::text[],
  status text not null default 'active'::text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  category_id uuid null,
  location_id uuid null,
  constraint products_pkey primary key (id),
  constraint products_category_id_fkey foreign KEY (category_id) references categories (id),
  constraint products_farmer_id_fkey foreign KEY (farmer_id) references auth.users (id) on delete CASCADE,
  constraint products_location_id_fkey foreign KEY (location_id) references locations (id),
  constraint products_status_check check (
    (
      status = any (
        array['active'::text, 'sold'::text, 'inactive'::text]
      )
    )
  )
) TABLESPACE pg_default;

create trigger update_products_timestamp BEFORE
update on products for EACH row
execute FUNCTION update_updated_at_column ();




create table public.profiles (
  id uuid not null,
  name text not null,
  phone text null,
  role text not null,
  address text null,
  city text null,
  state text null,
  pincode text null,
  business_details jsonb null,
  farm_details jsonb null,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  location_id uuid null,
  constraint profiles_pkey primary key (id),
  constraint profiles_id_fkey foreign KEY (id) references auth.users (id) on delete CASCADE,
  constraint profiles_location_id_fkey foreign KEY (location_id) references locations (id),
  constraint profiles_role_check check (
    (
      role = any (
        array['farmer'::text, 'trader'::text, 'admin'::text]
      )
    )
  )
) TABLESPACE pg_default;

create trigger update_profiles_timestamp BEFORE
update on profiles for EACH row
execute FUNCTION update_updated_at_column ();





create table public.quality_standards (
  id uuid not null default gen_random_uuid (),
  category_id uuid not null,
  name text not null,
  description text null,
  parameters jsonb not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint quality_standards_pkey primary key (id),
  constraint quality_standards_category_id_fkey foreign KEY (category_id) references categories (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger update_quality_standards_updated_at BEFORE
update on quality_standards for EACH row
execute FUNCTION update_updated_at_column ();





create table public.reports (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  report_type text not null,
  period text not null,
  data jsonb not null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint reports_pkey primary key (id),
  constraint reports_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger update_reports_updated_at BEFORE
update on reports for EACH row
execute FUNCTION update_updated_at_column ();




create table public.reviews (
  id uuid not null default gen_random_uuid (),
  order_id uuid not null,
  reviewer_id uuid not null,
  reviewed_id uuid not null,
  rating integer not null,
  comment text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint reviews_pkey primary key (id),
  constraint reviews_order_id_fkey foreign KEY (order_id) references orders (id) on delete CASCADE,
  constraint reviews_reviewed_id_fkey foreign KEY (reviewed_id) references auth.users (id) on delete CASCADE,
  constraint reviews_reviewer_id_fkey foreign KEY (reviewer_id) references auth.users (id) on delete CASCADE,
  constraint reviews_rating_check check (
    (
      (rating >= 1)
      and (rating <= 5)
    )
  )
) TABLESPACE pg_default;

create trigger update_reviews_updated_at BEFORE
update on reviews for EACH row
execute FUNCTION update_updated_at_column ();






create table public.shipments (
  id uuid not null default extensions.uuid_generate_v4 (),
  order_id uuid not null,
  farmer_id uuid not null,
  trader_id uuid not null,
  tracking_number text not null,
  status text not null,
  dispatch_date timestamp with time zone null,
  estimated_delivery timestamp with time zone null,
  actual_delivery timestamp with time zone null,
  current_location text null,
  destination text not null,
  carrier text not null,
  notes text null,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint shipments_pkey primary key (id),
  constraint shipments_farmer_id_fkey foreign KEY (farmer_id) references profiles (id),
  constraint shipments_order_id_fkey foreign KEY (order_id) references orders (id),
  constraint shipments_trader_id_fkey foreign KEY (trader_id) references profiles (id),
  constraint shipments_status_check check (
    (
      status = any (
        array[
          'processing'::text,
          'packed'::text,
          'shipped'::text,
          'in_transit'::text,
          'out_for_delivery'::text,
          'delivered'::text,
          'cancelled'::text
        ]
      )
    )
  )
) TABLESPACE pg_default;

create index IF not exists shipments_order_id_idx on public.shipments using btree (order_id) TABLESPACE pg_default;

create index IF not exists shipments_farmer_id_idx on public.shipments using btree (farmer_id) TABLESPACE pg_default;

create index IF not exists shipments_trader_id_idx on public.shipments using btree (trader_id) TABLESPACE pg_default;

create trigger set_updated_at BEFORE
update on shipments for EACH row
execute FUNCTION update_updated_at_column ();




create table public.user_preferences (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  dark_mode boolean null default false,
  compact_view boolean null default false,
  two_factor_auth boolean null default false,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint user_preferences_pkey primary key (id),
  constraint user_preferences_user_id_key unique (user_id),
  constraint user_preferences_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger update_user_preferences_updated_at BEFORE
update on user_preferences for EACH row
execute FUNCTION update_updated_at_column ();




create table public.wallets (
  id uuid not null default gen_random_uuid (),
  user_id uuid not null,
  balance numeric not null default 0,
  currency text not null default 'INR'::text,
  created_at timestamp with time zone null default now(),
  updated_at timestamp with time zone null default now(),
  constraint wallets_pkey primary key (id),
  constraint wallets_user_id_key unique (user_id),
  constraint wallets_user_id_fkey foreign KEY (user_id) references auth.users (id) on delete CASCADE
) TABLESPACE pg_default;

create trigger update_wallets_updated_at BEFORE
update on wallets for EACH row
execute FUNCTION update_updated_at_column ();