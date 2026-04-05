create table public.subscriptions (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  stripe_subscription_id text unique,
  stripe_price_id text,
  status text not null default 'inactive' check (status in ('active', 'canceled', 'past_due', 'inactive')),
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
