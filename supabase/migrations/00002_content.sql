create table public.content (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text,
  body text,
  content_type text not null check (content_type in ('article', 'video', 'pdf', 'audio')),
  embed_url text,
  file_url text,
  access_level text not null default 'free' check (access_level in ('free', 'paid')),
  tags text[] default '{}',
  book_of_bible text,
  series text,
  published boolean default false,
  created_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
