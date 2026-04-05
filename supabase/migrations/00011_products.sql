create table public.products (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  description text,
  price integer not null,
  image_url text,
  category text,
  stock integer not null default 0,
  active boolean default true,
  stripe_price_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
