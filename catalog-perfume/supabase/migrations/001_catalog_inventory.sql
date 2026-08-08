create extension if not exists pgcrypto;

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create table if not exists public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.perfumes (
  id uuid primary key default gen_random_uuid(),
  legacy_id text unique,
  brand_id uuid not null references public.brands(id) on delete restrict,
  name text not null,
  slug text not null,
  family text,
  concentration text,
  gender text,
  year integer,
  description text,
  tags text[] not null default '{}',
  notes jsonb not null default '{}'::jsonb,
  primary_image_url text,
  primary_image_path text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (brand_id, slug)
);

create table if not exists public.perfume_images (
  id uuid primary key default gen_random_uuid(),
  perfume_id uuid not null references public.perfumes(id) on delete cascade,
  storage_path text,
  url text,
  alt text,
  is_primary boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (perfume_id, url)
);

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  perfume_id uuid not null references public.perfumes(id) on delete cascade,
  sku text unique,
  size_ml integer,
  cost_price numeric(12, 2),
  sale_price numeric(12, 2),
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.stock_movements (
  id uuid primary key default gen_random_uuid(),
  inventory_item_id uuid not null references public.inventory_items(id) on delete cascade,
  movement_type text not null check (movement_type in ('purchase', 'sale', 'adjustment', 'return')),
  quantity integer not null,
  reason text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'perfumes_family_check'
  ) then
    alter table public.perfumes
      add constraint perfumes_family_check
      check (
        family in (
          'Cítrico',
          'Floral',
          'Amaderado',
          'Oriental',
          'Aromático',
          'Fougère',
          'Gourmand',
          'Acuático',
          'Chipre',
          'Cuero',
          'Ámbar',
          'Frutal',
          'Especiado'
        )
      );
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'perfumes_concentration_check'
  ) then
    alter table public.perfumes
      add constraint perfumes_concentration_check
      check (concentration in ('EDT', 'EDP', 'Parfum', 'Extrait'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'perfumes_gender_check'
  ) then
    alter table public.perfumes
      add constraint perfumes_gender_check
      check (gender in ('Masculino', 'Femenino', 'Unisex'));
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'perfumes_year_check'
  ) then
    alter table public.perfumes
      add constraint perfumes_year_check
      check (year is null or year between 1900 and extract(year from now())::integer + 1);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'perfumes_notes_object_check'
  ) then
    alter table public.perfumes
      add constraint perfumes_notes_object_check
      check (jsonb_typeof(notes) = 'object');
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'inventory_items_size_ml_check'
  ) then
    alter table public.inventory_items
      add constraint inventory_items_size_ml_check
      check (size_ml is null or size_ml > 0);
  end if;

  if not exists (
    select 1 from pg_constraint where conname = 'inventory_items_prices_check'
  ) then
    alter table public.inventory_items
      add constraint inventory_items_prices_check
      check (
        (cost_price is null or cost_price >= 0)
        and (sale_price is null or sale_price >= 0)
      );
  end if;
end;
$$;

insert into storage.buckets (id, name, public)
values ('perfume-images', 'perfume-images', true)
on conflict (id) do update set public = excluded.public;

create or replace view public.catalog_perfumes as
select
  p.id,
  p.legacy_id,
  p.name,
  b.name as brand,
  p.primary_image_url as image,
  p.primary_image_path as image_path,
  p.family,
  p.concentration,
  p.gender,
  p.year,
  p.description,
  p.tags,
  p.notes,
  p.is_active,
  p.created_at,
  p.updated_at
from public.perfumes p
join public.brands b on b.id = p.brand_id;

create or replace view public.inventory_stock as
select
  i.id as inventory_item_id,
  i.perfume_id,
  i.sku,
  i.size_ml,
  i.cost_price,
  i.sale_price,
  i.is_active,
  coalesce(sum(sm.quantity), 0)::integer as stock_quantity
from public.inventory_items i
left join public.stock_movements sm on sm.inventory_item_id = i.id
group by
  i.id,
  i.perfume_id,
  i.sku,
  i.size_ml,
  i.cost_price,
  i.sale_price,
  i.is_active;

create index if not exists perfumes_brand_id_idx on public.perfumes (brand_id);
create index if not exists perfumes_legacy_id_idx on public.perfumes (legacy_id);
create index if not exists perfumes_is_active_idx on public.perfumes (is_active);
create index if not exists perfume_images_perfume_id_idx on public.perfume_images (perfume_id);
create index if not exists inventory_items_perfume_id_idx on public.inventory_items (perfume_id);
create index if not exists stock_movements_inventory_item_id_idx on public.stock_movements (inventory_item_id);

create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists brands_touch_updated_at on public.brands;
create trigger brands_touch_updated_at
before update on public.brands
for each row execute function public.touch_updated_at();

drop trigger if exists perfumes_touch_updated_at on public.perfumes;
create trigger perfumes_touch_updated_at
before update on public.perfumes
for each row execute function public.touch_updated_at();

drop trigger if exists inventory_items_touch_updated_at on public.inventory_items;
create trigger inventory_items_touch_updated_at
before update on public.inventory_items
for each row execute function public.touch_updated_at();

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

alter table public.admin_users enable row level security;
alter table public.brands enable row level security;
alter table public.perfumes enable row level security;
alter table public.perfume_images enable row level security;
alter table public.inventory_items enable row level security;
alter table public.stock_movements enable row level security;

drop policy if exists "Admins read admin users" on public.admin_users;
create policy "Admins read admin users"
on public.admin_users for select
to authenticated
using (public.is_admin());

drop policy if exists "Public read brands" on public.brands;
create policy "Public read brands"
on public.brands for select
to anon, authenticated
using (true);

drop policy if exists "Admins manage brands" on public.brands;
create policy "Admins manage brands"
on public.brands for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public read active perfumes" on public.perfumes;
create policy "Public read active perfumes"
on public.perfumes for select
to anon, authenticated
using (is_active = true or public.is_admin());

drop policy if exists "Admins manage perfumes" on public.perfumes;
create policy "Admins manage perfumes"
on public.perfumes for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public read perfume images" on public.perfume_images;
create policy "Public read perfume images"
on public.perfume_images for select
to anon, authenticated
using (true);

drop policy if exists "Admins manage perfume images" on public.perfume_images;
create policy "Admins manage perfume images"
on public.perfume_images for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage inventory items" on public.inventory_items;
create policy "Admins manage inventory items"
on public.inventory_items for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins manage stock movements" on public.stock_movements;
create policy "Admins manage stock movements"
on public.stock_movements for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Public read perfume image files" on storage.objects;
create policy "Public read perfume image files"
on storage.objects for select
to anon, authenticated
using (bucket_id = 'perfume-images');

drop policy if exists "Admins upload perfume image files" on storage.objects;
create policy "Admins upload perfume image files"
on storage.objects for insert
to authenticated
with check (bucket_id = 'perfume-images' and public.is_admin());

drop policy if exists "Admins update perfume image files" on storage.objects;
create policy "Admins update perfume image files"
on storage.objects for update
to authenticated
using (bucket_id = 'perfume-images' and public.is_admin())
with check (bucket_id = 'perfume-images' and public.is_admin());

drop policy if exists "Admins delete perfume image files" on storage.objects;
create policy "Admins delete perfume image files"
on storage.objects for delete
to authenticated
using (bucket_id = 'perfume-images' and public.is_admin());
