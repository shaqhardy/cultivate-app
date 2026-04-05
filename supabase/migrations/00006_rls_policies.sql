-- ============================================================
-- Row Level Security policies for all tables
-- ============================================================

-- Helper: check if the current user has an admin role
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer stable;

-- Helper: check if the current user has a paid membership
create or replace function public.is_paid_member()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('paid_member', 'admin')
  );
$$ language sql security definer stable;

-- ============================================================
-- PROFILES
-- ============================================================
alter table public.profiles enable row level security;

create policy "Users can read own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Admins can read all profiles"
  on public.profiles for select
  using (public.is_admin());

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- ============================================================
-- CONTENT
-- ============================================================
alter table public.content enable row level security;

-- Authenticated users can read published free content
create policy "Authenticated users can read published free content"
  on public.content for select
  using (
    auth.role() = 'authenticated'
    and published = true
    and access_level = 'free'
  );

-- Paid members and admins can read published paid content
create policy "Paid members can read published paid content"
  on public.content for select
  using (
    published = true
    and access_level = 'paid'
    and public.is_paid_member()
  );

-- Admins can read all content (including unpublished)
create policy "Admins can read all content"
  on public.content for select
  using (public.is_admin());

-- Admins can insert content
create policy "Admins can insert content"
  on public.content for insert
  with check (public.is_admin());

-- Admins can update content
create policy "Admins can update content"
  on public.content for update
  using (public.is_admin())
  with check (public.is_admin());

-- Admins can delete content
create policy "Admins can delete content"
  on public.content for delete
  using (public.is_admin());

-- ============================================================
-- BOOKMARKS
-- ============================================================
alter table public.bookmarks enable row level security;

create policy "Users can read own bookmarks"
  on public.bookmarks for select
  using (auth.uid() = user_id);

create policy "Users can insert own bookmarks"
  on public.bookmarks for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own bookmarks"
  on public.bookmarks for delete
  using (auth.uid() = user_id);

-- ============================================================
-- SUBSCRIPTIONS
-- ============================================================
alter table public.subscriptions enable row level security;

create policy "Users can read own subscriptions"
  on public.subscriptions for select
  using (auth.uid() = user_id);

create policy "Admins can read all subscriptions"
  on public.subscriptions for select
  using (public.is_admin());

-- ============================================================
-- PURCHASES
-- ============================================================
alter table public.purchases enable row level security;

create policy "Users can read own purchases"
  on public.purchases for select
  using (auth.uid() = user_id);

create policy "Admins can read all purchases"
  on public.purchases for select
  using (public.is_admin());
