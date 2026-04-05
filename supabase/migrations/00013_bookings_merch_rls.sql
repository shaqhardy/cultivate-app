-- Events RLS (admin-only management)
alter table public.events enable row level security;

create policy "Admins can manage all events"
  on public.events for all
  using (public.is_admin());

-- Products RLS (public read, admin manage)
alter table public.products enable row level security;

create policy "Anyone authenticated can read active products"
  on public.products for select
  using (auth.role() = 'authenticated' and active = true);

create policy "Admins can read all products"
  on public.products for select
  using (public.is_admin());

create policy "Admins can manage products"
  on public.products for all
  using (public.is_admin());

-- Orders RLS
alter table public.orders enable row level security;

create policy "Users can read own orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "Users can create own orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "Admins can manage all orders"
  on public.orders for all
  using (public.is_admin());

-- Order Items RLS
alter table public.order_items enable row level security;

create policy "Users can read own order items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );

create policy "Admins can manage all order items"
  on public.order_items for all
  using (public.is_admin());
