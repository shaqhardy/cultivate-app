-- Discussions RLS
alter table public.discussions enable row level security;

create policy "Authenticated users can read discussions"
  on public.discussions for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can create discussions"
  on public.discussions for insert
  with check (auth.role() = 'authenticated' and auth.uid() = user_id);

create policy "Users can update own discussions"
  on public.discussions for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own discussions"
  on public.discussions for delete
  using (auth.uid() = user_id);

create policy "Admins can manage all discussions"
  on public.discussions for all
  using (public.is_admin());

-- Comments RLS
alter table public.comments enable row level security;

create policy "Authenticated users can read comments"
  on public.comments for select
  using (auth.role() = 'authenticated');

create policy "Authenticated users can create comments"
  on public.comments for insert
  with check (auth.role() = 'authenticated' and auth.uid() = user_id);

create policy "Users can update own comments"
  on public.comments for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own comments"
  on public.comments for delete
  using (auth.uid() = user_id);

create policy "Admins can manage all comments"
  on public.comments for all
  using (public.is_admin());
