create table public.orders (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete set null,
  status text not null default 'pending' check (status in ('pending', 'paid', 'shipped', 'delivered', 'canceled')),
  stripe_checkout_session_id text,
  subtotal integer not null default 0,
  shipping_name text,
  shipping_address text,
  shipping_city text,
  shipping_state text,
  shipping_zip text,
  shipping_country text default 'US',
  tracking_number text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table public.order_items (
  id uuid default gen_random_uuid() primary key,
  order_id uuid references public.orders(id) on delete cascade not null,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  quantity integer not null default 1,
  unit_price integer not null,
  created_at timestamptz default now()
);
