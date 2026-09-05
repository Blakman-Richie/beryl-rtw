create table if not exists public.products (
  id bigint primary key,
  name text not null,
  type text not null,
  price text not null,
  usd text not null,
  tag text not null default 'New drop',
  image text not null,
  color text not null,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
create policy "Anyone can view products" on public.products for select using (true);
create policy "Authenticated admin can manage products" on public.products for all to authenticated using (true) with check (true);

create table if not exists public.brand_settings (
  id int primary key default 1 check (id = 1),
  logo_url text,
  updated_at timestamptz not null default now()
);

alter table public.brand_settings enable row level security;
create policy "Anyone can view brand settings" on public.brand_settings for select using (true);
create policy "Authenticated admin can manage brand settings" on public.brand_settings for all to authenticated using (true) with check (true);

-- Merchant studio: richer catalogue controls and visual storefront builder.
alter table public.products add column if not exists stock integer not null default 0;
alter table public.products add column if not exists status text not null default 'active';
alter table public.products add column if not exists description text;

create table if not exists public.storefront_layout (
  id integer primary key default 1 check (id = 1),
  sections jsonb not null default '[]'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.storefront_layout enable row level security;
create policy "Anyone can view storefront layout" on public.storefront_layout for select using (true);
create policy "Authenticated admin can manage storefront layout" on public.storefront_layout for all to authenticated using (true) with check (true);

insert into storage.buckets (id, name, public) values ('brand-assets', 'brand-assets', true) on conflict (id) do nothing;
create policy "Anyone can view brand assets" on storage.objects for select using (bucket_id = 'brand-assets');
create policy "Authenticated admin can upload brand assets" on storage.objects for insert to authenticated with check (bucket_id = 'brand-assets');

-- Storefront engagement: customer saved pieces and anonymous swipe signals.
create table if not exists public.wishlist_items (
  customer_id uuid not null references auth.users(id) on delete cascade,
  product_id bigint not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (customer_id, product_id)
);

alter table public.wishlist_items enable row level security;
create policy "Customers manage their own saved pieces" on public.wishlist_items
  for all to authenticated using (auth.uid() = customer_id) with check (auth.uid() = customer_id);

create table if not exists public.swipe_events (
  id bigint generated always as identity primary key,
  product_id bigint not null references public.products(id) on delete cascade,
  session_id text not null,
  direction text not null check (direction in ('like', 'skip')),
  created_at timestamptz not null default now()
);

create index if not exists swipe_events_product_created_idx on public.swipe_events (product_id, created_at desc);
alter table public.swipe_events enable row level security;
create policy "Anyone can record a swipe choice" on public.swipe_events for insert with check (true);
create policy "Authenticated admin can view swipe choices" on public.swipe_events for select to authenticated using (true);

-- Merchant operations: orders are logged from WhatsApp until a card checkout is connected.
create table if not exists public.orders (
  id bigint generated always as identity primary key,
  customer_name text not null,
  customer_email text not null,
  customer_phone text,
  items text not null,
  total numeric(12,2) not null default 0,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  created_at timestamptz not null default now()
);
create index if not exists orders_created_at_idx on public.orders (created_at desc);
alter table public.orders enable row level security;
create policy "Authenticated admin can manage orders" on public.orders for all to authenticated using (true) with check (true);

create table if not exists public.discounts (
  id bigint generated always as identity primary key,
  code text not null unique,
  kind text not null default 'percent' check (kind in ('percent', 'fixed')),
  amount numeric(12,2) not null,
  expires_at timestamptz,
  usage_limit integer,
  uses integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.discounts enable row level security;
create policy "Authenticated admin can manage discounts" on public.discounts for all to authenticated using (true) with check (true);
