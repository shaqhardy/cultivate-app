create table public.events (
  id uuid default gen_random_uuid() primary key,
  -- Contact info
  host_name text not null,
  host_email text not null,
  host_phone text,
  organization text,
  -- Event details
  event_name text not null,
  event_type text not null default 'speaking' check (event_type in ('speaking', 'workshop', 'panel', 'conference', 'other')),
  event_date date,
  event_time text,
  location text,
  virtual boolean default false,
  audience_size integer,
  description text,
  -- Workflow
  stage text not null default 'inquiry' check (stage in ('inquiry', 'review', 'approved', 'deposit_paid', 'confirmed', 'completed', 'canceled')),
  admin_notes text,
  -- Financials
  deposit_amount integer,
  total_fee integer,
  stripe_payment_intent_id text,
  deposit_paid_at timestamptz,
  -- Host portal
  host_token uuid default gen_random_uuid() unique,
  -- Timestamps
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
