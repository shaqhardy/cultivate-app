create table public.discussions (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  body text not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  pinned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
