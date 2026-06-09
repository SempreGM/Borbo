-- borbô - schema inicial do e-commerce

create extension if not exists "pgcrypto";

create type public.profile_role as enum ('customer', 'admin');
create type public.order_status as enum (
  'received',
  'pending_payment',
  'paid',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
);
create type public.payment_method as enum ('pix', 'card', 'transfer');
create type public.payment_status as enum ('pending', 'approved', 'failed', 'refunded');
create type public.coupon_discount_type as enum ('fixed', 'percentage');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  name text,
  phone text,
  role public.profile_role not null default 'customer',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text not null,
  price numeric(10, 2) not null check (price >= 0),
  category_id uuid references public.categories(id) on delete set null,
  category_name text,
  images text[] not null default '{}',
  stock integer not null default 0 check (stock >= 0),
  is_active boolean not null default true,
  is_featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.product_variants (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products(id) on delete cascade,
  size text not null,
  color text not null,
  image_url text,
  stock integer not null default 0 check (stock >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (product_id, size, color)
);

create table public.collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  highlight_label text not null default 'Destaque da semana',
  is_featured boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.collection_products (
  collection_id uuid not null references public.collections(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  order_index integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (collection_id, product_id)
);

create table public.coupons (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  description text,
  discount_type public.coupon_discount_type not null,
  discount_value numeric(10, 2) not null check (discount_value > 0),
  min_purchase numeric(10, 2) not null default 0 check (min_purchase >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, product_id)
);

create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  user_id uuid references auth.users(id) on delete set null,
  customer_name text not null,
  customer_email text not null,
  customer_phone text not null,
  customer_cpf text,
  shipping_address jsonb not null,
  payment_method public.payment_method not null,
  payment_status public.payment_status not null default 'pending',
  status public.order_status not null default 'received',
  notes text,
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  shipping_cost numeric(10, 2) not null default 0 check (shipping_cost >= 0),
  total numeric(10, 2) not null check (total >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  product_name text not null,
  product_image text,
  unit_price numeric(10, 2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  subtotal numeric(10, 2) not null check (subtotal >= 0),
  created_at timestamptz not null default now()
);

create table public.site_settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger product_variants_updated_at
before update on public.product_variants
for each row execute function public.set_updated_at();

create trigger collections_updated_at
before update on public.collections
for each row execute function public.set_updated_at();

create trigger coupons_updated_at
before update on public.coupons
for each row execute function public.set_updated_at();

create trigger orders_updated_at
before update on public.orders
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name)
  values (
    new.id,
    coalesce(new.email, ''),
    coalesce(new.raw_user_meta_data ->> 'name', split_part(coalesce(new.email, ''), '@', 1))
  )
  on conflict (id) do nothing;

  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.product_variants enable row level security;
alter table public.collections enable row level security;
alter table public.collection_products enable row level security;
alter table public.coupons enable row level security;
alter table public.favorites enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.site_settings enable row level security;

create policy "profiles_select_own_or_admin"
on public.profiles for select
using (id = auth.uid() or public.is_admin());

create policy "profiles_update_own_or_admin"
on public.profiles for update
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

create policy "profiles_insert_own"
on public.profiles for insert
with check (id = auth.uid());

create policy "categories_public_read"
on public.categories for select
using (true);

create policy "categories_admin_write"
on public.categories for all
using (public.is_admin())
with check (public.is_admin());

create policy "products_public_read_active"
on public.products for select
using (is_active = true or public.is_admin());

create policy "products_admin_write"
on public.products for all
using (public.is_admin())
with check (public.is_admin());

create policy "product_variants_public_read_active"
on public.product_variants for select
using (
  public.is_admin()
  or (
    active = true
    and exists (
    select 1
    from public.products
    where products.id = product_variants.product_id
      and products.is_active = true
    )
  )
);

create policy "product_variants_admin_write"
on public.product_variants for all
using (public.is_admin())
with check (public.is_admin());

create policy "collections_public_read_active"
on public.collections for select
using (active = true or public.is_admin());

create policy "collections_admin_write"
on public.collections for all
using (public.is_admin())
with check (public.is_admin());

create policy "collection_products_public_read"
on public.collection_products for select
using (
  exists (
    select 1
    from public.collections
    where collections.id = collection_products.collection_id
      and (collections.active = true or public.is_admin())
  )
);

create policy "collection_products_admin_write"
on public.collection_products for all
using (public.is_admin())
with check (public.is_admin());

create policy "coupons_public_read_active"
on public.coupons for select
using (active = true or public.is_admin());

create policy "coupons_admin_write"
on public.coupons for all
using (public.is_admin())
with check (public.is_admin());

create policy "favorites_select_own"
on public.favorites for select
using (user_id = auth.uid());

create policy "favorites_insert_own"
on public.favorites for insert
with check (user_id = auth.uid());

create policy "favorites_delete_own"
on public.favorites for delete
using (user_id = auth.uid());

create policy "orders_select_own_or_admin"
on public.orders for select
using (user_id = auth.uid() or public.is_admin());

create policy "orders_insert_own_or_guest"
on public.orders for insert
with check (user_id is null or user_id = auth.uid());

create policy "orders_admin_update"
on public.orders for update
using (public.is_admin())
with check (public.is_admin());

create policy "order_items_select_by_order_owner_or_admin"
on public.order_items for select
using (
  public.is_admin()
  or exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
  )
);

create policy "order_items_insert_for_owned_or_guest_order"
on public.order_items for insert
with check (
  exists (
    select 1
    from public.orders
    where orders.id = order_items.order_id
      and (orders.user_id is null or orders.user_id = auth.uid())
  )
);

create policy "site_settings_public_read"
on public.site_settings for select
using (true);

create policy "site_settings_admin_write"
on public.site_settings for all
using (public.is_admin())
with check (public.is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('site-assets', 'site-assets', true, 2097152, array['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
  ('product-images', 'product-images', true, 2097152, array['image/jpeg', 'image/png', 'image/webp', 'image/gif'])
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

create policy "public_read_site_assets"
on storage.objects for select
using (bucket_id in ('site-assets', 'product-images'));

create policy "admin_upload_site_assets"
on storage.objects for insert
with check (
  bucket_id in ('site-assets', 'product-images')
  and public.is_admin()
);

create policy "admin_update_site_assets"
on storage.objects for update
using (
  bucket_id in ('site-assets', 'product-images')
  and public.is_admin()
)
with check (
  bucket_id in ('site-assets', 'product-images')
  and public.is_admin()
);

create policy "admin_delete_site_assets"
on storage.objects for delete
using (
  bucket_id in ('site-assets', 'product-images')
  and public.is_admin()
);
