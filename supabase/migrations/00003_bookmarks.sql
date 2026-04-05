create table public.bookmarks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content_id uuid references public.content(id) on delete cascade not null,
  created_at timestamptz default now(),
  unique(user_id, content_id)
);
