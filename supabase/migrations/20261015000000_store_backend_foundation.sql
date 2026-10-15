-- AMIRA Collection backend foundation. Apply with Supabase CLI or SQL Editor.
-- No demo products, customer orders, credentials, or private keys are seeded here.

create schema if not exists private;

create table if not exists public.staff_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role text not null check (role in ('admin', 'editor')),
  created_at timestamptz not null default now()
);

create or replace function private.is_store_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.staff_roles
    where user_id = (select auth.uid())
      and role in ('admin', 'editor')
  );
$$;

create or replace function private.is_store_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.staff_roles
    where user_id = (select auth.uid()) and role = 'admin'
  );
$$;

revoke all on function private.is_store_staff() from public, anon;
revoke all on function private.is_store_admin() from public, anon;
grant usage on schema private to anon;
grant execute on function private.is_store_staff() to anon;
grant usage on schema private to authenticated;
grant execute on function private.is_store_staff() to authenticated;
grant execute on function private.is_store_admin() to authenticated;

create table if not exists public.products (
  id text primary key,
  name text not null,
  description text not null default '',
  category text not null,
  price numeric(12, 2) not null check (price >= 0),
  compare_at numeric(12, 2) check (compare_at is null or compare_at > price),
  sku text unique,
  inventory_quantity integer check (inventory_quantity is null or inventory_quantity >= 0),
  sizes text[] not null default '{}',
  colors text[] not null default '{}',
  tags text[] not null default '{}',
  images jsonb not null default '[]'::jsonb check (jsonb_typeof(images) = 'array'),
  image_url text,
  default_color text,
  label text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  featured boolean not null default false,
  is_new_arrival boolean not null default false,
  on_sale boolean not null default false,
  arrival_date date,
  best_seller_rank integer,
  relevance_rank integer,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.collections (
  id text primary key,
  title text not null,
  description text not null default '',
  image_url text,
  display_status text not null default 'draft' check (display_status in ('draft', 'published')),
  featured_on_homepage boolean not null default false,
  position integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.product_collections (
  product_id text not null references public.products(id) on delete cascade,
  collection_id text not null references public.collections(id) on delete cascade,
  primary key (product_id, collection_id)
);

create table if not exists public.homepage_content (
  id text primary key check (id = 'storefront'),
  content jsonb not null default '{}'::jsonb,
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

-- This table contains only public storefront settings. Never add secrets here.
create table if not exists public.store_settings (
  id text primary key check (id = 'storefront'),
  store_name text not null default 'Store',
  contact_email text,
  contact_phone text,
  instagram_url text,
  facebook_url text,
  currency text not null default 'CAD',
  published boolean not null default true,
  updated_at timestamptz not null default now()
);

-- Future order storage. No public client insert policy: create orders through a
-- trusted checkout/server flow after payment verification is implemented.
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text unique,
  customer_email text,
  status text not null default 'pending' check (status in ('pending', 'paid', 'fulfilment', 'shipped', 'cancelled', 'refunded')),
  currency text not null,
  subtotal numeric(12, 2) not null check (subtotal >= 0),
  total numeric(12, 2) not null check (total >= 0),
  line_items jsonb not null default '[]'::jsonb check (jsonb_typeof(line_items) = 'array'),
  shipping_address jsonb,
  payment_reference text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.staff_roles enable row level security;
alter table public.products enable row level security;
alter table public.collections enable row level security;
alter table public.product_collections enable row level security;
alter table public.homepage_content enable row level security;
alter table public.store_settings enable row level security;
alter table public.orders enable row level security;

grant select on public.products, public.collections, public.product_collections, public.homepage_content, public.store_settings to anon, authenticated;
grant insert, update, delete on public.products, public.collections, public.product_collections, public.homepage_content, public.store_settings to authenticated;
grant select on public.staff_roles to authenticated;
grant insert, update, delete on public.staff_roles to authenticated;
grant select, insert, update, delete on public.orders to authenticated;

drop policy if exists "Published products or staff can read products" on public.products;
create policy "Published products or staff can read products" on public.products
  for select to anon, authenticated
  using (status = 'published' or (select private.is_store_staff()));
drop policy if exists "Staff manage products" on public.products;
create policy "Staff manage products" on public.products
  for all to authenticated
  using ((select private.is_store_staff())) with check ((select private.is_store_staff()));

drop policy if exists "Published collections or staff can read collections" on public.collections;
create policy "Published collections or staff can read collections" on public.collections
  for select to anon, authenticated
  using (display_status = 'published' or (select private.is_store_staff()));
drop policy if exists "Staff manage collections" on public.collections;
create policy "Staff manage collections" on public.collections
  for all to authenticated
  using ((select private.is_store_staff())) with check ((select private.is_store_staff()));

drop policy if exists "Published memberships or staff can read" on public.product_collections;
create policy "Published memberships or staff can read" on public.product_collections
  for select to anon, authenticated
  using (
    (select private.is_store_staff())
    or exists (
      select 1 from public.products p join public.collections c on c.id = product_collections.collection_id
      where p.id = product_collections.product_id and p.status = 'published' and c.display_status = 'published'
    )
  );
drop policy if exists "Staff manage product memberships" on public.product_collections;
create policy "Staff manage product memberships" on public.product_collections
  for all to authenticated
  using ((select private.is_store_staff())) with check ((select private.is_store_staff()));

drop policy if exists "Published homepage content is public" on public.homepage_content;
create policy "Published homepage content is public" on public.homepage_content
  for select to anon, authenticated using (published or (select private.is_store_staff()));
drop policy if exists "Staff manage homepage content" on public.homepage_content;
create policy "Staff manage homepage content" on public.homepage_content
  for all to authenticated using ((select private.is_store_staff())) with check ((select private.is_store_staff()));

drop policy if exists "Published store settings are public" on public.store_settings;
create policy "Published store settings are public" on public.store_settings
  for select to anon, authenticated using (published or (select private.is_store_staff()));
drop policy if exists "Staff manage store settings" on public.store_settings;
create policy "Staff manage store settings" on public.store_settings
  for all to authenticated using ((select private.is_store_staff())) with check ((select private.is_store_staff()));

drop policy if exists "Staff can read their own role" on public.staff_roles;
create policy "Staff can read their own role" on public.staff_roles
  for select to authenticated using (user_id = (select auth.uid()) or (select private.is_store_admin()));
drop policy if exists "Admins manage staff roles" on public.staff_roles;
create policy "Admins manage staff roles" on public.staff_roles
  for all to authenticated using ((select private.is_store_admin())) with check ((select private.is_store_admin()));

drop policy if exists "Staff can manage future orders" on public.orders;
create policy "Staff can manage future orders" on public.orders
  for all to authenticated using ((select private.is_store_staff())) with check ((select private.is_store_staff()));

-- One authenticated admin save is a single database transaction. The function
-- runs with caller privileges (not SECURITY DEFINER), so table RLS still applies.
create or replace function public.save_store_snapshot(
  p_products jsonb,
  p_collections jsonb,
  p_homepage jsonb,
  p_settings jsonb
)
returns jsonb
language plpgsql
security invoker
set search_path = ''
as $$
begin
  if not (select private.is_store_staff()) then
    raise exception 'Authorized store staff required' using errcode = '42501';
  end if;

  delete from public.product_collections;
  delete from public.products p
    where not exists (
      select 1 from pg_catalog.jsonb_array_elements(coalesce(p_products, '[]'::jsonb)) entry
      where entry->>'id' = p.id
    );
  delete from public.collections c
    where not exists (
      select 1 from pg_catalog.jsonb_array_elements(coalesce(p_collections, '[]'::jsonb)) entry
      where entry->>'id' = c.id
    );

  insert into public.products (
    id, name, description, category, price, compare_at, sku, inventory_quantity,
    sizes, colors, tags, images, image_url, default_color, label, status,
    featured, is_new_arrival, on_sale, arrival_date, best_seller_rank, relevance_rank, updated_at
  )
  select x.id, x.name, coalesce(x.description, ''), x.category, x.price, x.compare_at,
    x.sku, x.inventory_quantity, coalesce(x.sizes, '{}'), coalesce(x.colors, '{}'),
    coalesce(x.tags, '{}'), coalesce(x.images, '[]'::jsonb), x.image_url, x.default_color,
    x.label, coalesce(x.status, 'draft'), coalesce(x.featured, false),
    coalesce(x.is_new_arrival, false), coalesce(x.on_sale, false), x.arrival_date,
    x.best_seller_rank, x.relevance_rank, now()
  from pg_catalog.jsonb_to_recordset(coalesce(p_products, '[]'::jsonb)) as x(
    id text, name text, description text, category text, price numeric, compare_at numeric,
    sku text, inventory_quantity integer, sizes text[], colors text[], tags text[], images jsonb,
    image_url text, default_color text, label text, status text, featured boolean,
    is_new_arrival boolean, on_sale boolean, arrival_date date, best_seller_rank integer,
    relevance_rank integer, collection_ids text[]
  )
  on conflict (id) do update set
    name = excluded.name, description = excluded.description, category = excluded.category,
    price = excluded.price, compare_at = excluded.compare_at, sku = excluded.sku,
    inventory_quantity = excluded.inventory_quantity, sizes = excluded.sizes,
    colors = excluded.colors, tags = excluded.tags, images = excluded.images,
    image_url = excluded.image_url, default_color = excluded.default_color, label = excluded.label,
    status = excluded.status, featured = excluded.featured, is_new_arrival = excluded.is_new_arrival,
    on_sale = excluded.on_sale, arrival_date = excluded.arrival_date,
    best_seller_rank = excluded.best_seller_rank, relevance_rank = excluded.relevance_rank,
    updated_at = now();

  insert into public.collections (id, title, description, image_url, display_status, featured_on_homepage, position, updated_at)
  select x.id, x.title, coalesce(x.description, ''), x.image_url, coalesce(x.display_status, 'draft'),
    coalesce(x.featured_on_homepage, false), coalesce(x.position, 0), now()
  from pg_catalog.jsonb_to_recordset(coalesce(p_collections, '[]'::jsonb)) as x(
    id text, title text, description text, image_url text, display_status text,
    featured_on_homepage boolean, position integer
  )
  on conflict (id) do update set
    title = excluded.title, description = excluded.description, image_url = excluded.image_url,
    display_status = excluded.display_status, featured_on_homepage = excluded.featured_on_homepage,
    position = excluded.position, updated_at = now();

  insert into public.product_collections (product_id, collection_id)
  select x.id, membership.collection_id
  from pg_catalog.jsonb_to_recordset(coalesce(p_products, '[]'::jsonb)) as x(id text, collection_ids text[])
  cross join lateral pg_catalog.unnest(coalesce(x.collection_ids, '{}')) as membership(collection_id)
  on conflict do nothing;

  insert into public.homepage_content (id, content, published, updated_at)
  values ('storefront', coalesce(p_homepage, '{}'::jsonb), true, now())
  on conflict (id) do update set content = excluded.content, published = true, updated_at = now();

  insert into public.store_settings (id, store_name, contact_email, contact_phone, instagram_url, facebook_url, currency, published, updated_at)
  values (
    'storefront', coalesce(p_settings->>'store_name', 'Store'), p_settings->>'contact_email',
    p_settings->>'contact_phone', p_settings->>'instagram_url', p_settings->>'facebook_url',
    coalesce(p_settings->>'currency', 'CAD'), true, now()
  )
  on conflict (id) do update set
    store_name = excluded.store_name, contact_email = excluded.contact_email,
    contact_phone = excluded.contact_phone, instagram_url = excluded.instagram_url,
    facebook_url = excluded.facebook_url, currency = excluded.currency,
    published = true, updated_at = now();

  return pg_catalog.jsonb_build_object('ok', true);
end;
$$;

revoke all on function public.save_store_snapshot(jsonb, jsonb, jsonb, jsonb) from public, anon;
grant execute on function public.save_store_snapshot(jsonb, jsonb, jsonb, jsonb) to authenticated;

-- Keep images private. Public reads are allowed only for an object referenced
-- by a published product; staff can upload, replace, and remove assets.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('product-images', 'product-images', false, 10485760, array['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
on conflict (id) do update set public = false, file_size_limit = excluded.file_size_limit, allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Published product images readable" on storage.objects;
create policy "Published product images readable" on storage.objects
  for select to anon, authenticated
  using (
    bucket_id = 'product-images' and exists (
      select 1 from public.products p
      where p.status = 'published'
        and (
          p.image_url = 'storage://product-images/' || storage.objects.name
          or p.images @> jsonb_build_array('storage://product-images/' || storage.objects.name)
        )
    )
  );
drop policy if exists "Staff can read product image objects" on storage.objects;
create policy "Staff can read product image objects" on storage.objects
  for select to authenticated using (bucket_id = 'product-images' and (select private.is_store_staff()));
drop policy if exists "Staff upload product images" on storage.objects;
create policy "Staff upload product images" on storage.objects
  for insert to authenticated with check (bucket_id = 'product-images' and (select private.is_store_staff()));
drop policy if exists "Staff update product images" on storage.objects;
create policy "Staff update product images" on storage.objects
  for update to authenticated using (bucket_id = 'product-images' and (select private.is_store_staff()))
  with check (bucket_id = 'product-images' and (select private.is_store_staff()));
drop policy if exists "Staff delete product images" on storage.objects;
create policy "Staff delete product images" on storage.objects
  for delete to authenticated using (bucket_id = 'product-images' and (select private.is_store_staff()));
