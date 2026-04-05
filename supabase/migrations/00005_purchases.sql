create table public.purchases (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content_id uuid references public.content(id) on delete cascade not null,
  stripe_payment_intent_id text,
  amount integer,
  created_at timestamptz default now()
);
