create table public.comments (
  id uuid default gen_random_uuid() primary key,
  body text not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  discussion_id uuid references public.discussions(id) on delete cascade,
  content_id uuid references public.content(id) on delete cascade,
  parent_id uuid references public.comments(id) on delete cascade,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  constraint comment_target check (
    (discussion_id is not null and content_id is null)
    or (discussion_id is null and content_id is not null)
  )
);
