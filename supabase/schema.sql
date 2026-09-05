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

insert into storage.buckets (id, name, public) values ('brand-assets', 'brand-assets', true) on conflict (id) do nothing;
create policy "Anyone can view brand assets" on storage.objects for select using (bucket_id = 'brand-assets');
create policy "Authenticated admin can upload brand assets" on storage.objects for insert to authenticated with check (bucket_id = 'brand-assets');
