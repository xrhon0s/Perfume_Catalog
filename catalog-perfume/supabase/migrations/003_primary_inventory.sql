alter table public.inventory_items
add column if not exists is_primary boolean not null default false;

with ranked_items as (
  select
    id,
    row_number() over (
      partition by perfume_id
      order by is_active desc, created_at asc, id asc
    ) as item_position
  from public.inventory_items
)
update public.inventory_items as inventory
set is_primary = true
from ranked_items
where inventory.id = ranked_items.id
  and ranked_items.item_position = 1
  and not exists (
    select 1
    from public.inventory_items as existing_primary
    where existing_primary.perfume_id = inventory.perfume_id
      and existing_primary.is_primary
  );

create unique index if not exists inventory_items_primary_perfume_idx
on public.inventory_items (perfume_id)
where is_primary;

create or replace function public.build_inventory_sku(
  requested_perfume_id uuid,
  requested_size_ml integer
)
returns text
language plpgsql
volatile
set search_path = public
as $$
declare
  brand_code text;
  perfume_code text;
  size_code text;
  base_sku text;
  candidate text;
begin
  select
    upper(left(regexp_replace(b.slug, '[^a-zA-Z0-9]', '', 'g'), 4)),
    upper(left(regexp_replace(p.slug, '[^a-zA-Z0-9]', '', 'g'), 8))
  into brand_code, perfume_code
  from public.perfumes p
  join public.brands b on b.id = p.brand_id
  where p.id = requested_perfume_id;

  brand_code := coalesce(nullif(brand_code, ''), 'ETER');
  perfume_code := coalesce(nullif(perfume_code, ''), 'PERFUME');
  size_code := coalesce(requested_size_ml::text, 'NA');
  base_sku := concat_ws('-', brand_code, perfume_code, size_code);
  candidate := base_sku;

  while exists (
    select 1 from public.inventory_items where sku = candidate
  ) loop
    candidate := base_sku || '-' || upper(substr(gen_random_uuid()::text, 1, 4));
  end loop;

  return candidate;
end;
$$;

create or replace function public.assign_inventory_sku()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if nullif(trim(new.sku), '') is null then
    new.sku := public.build_inventory_sku(new.perfume_id, new.size_ml);
  else
    new.sku := upper(trim(new.sku));
  end if;

  return new;
end;
$$;

revoke execute on function public.build_inventory_sku(uuid, integer) from public;
revoke execute on function public.assign_inventory_sku() from public;

drop trigger if exists inventory_items_assign_sku on public.inventory_items;
create trigger inventory_items_assign_sku
before insert or update of sku, size_ml, perfume_id
on public.inventory_items
for each row execute function public.assign_inventory_sku();

update public.inventory_items
set sku = null
where nullif(trim(sku), '') is null;

create or replace function public.upsert_primary_inventory(
  requested_perfume_id uuid,
  requested_sku text,
  requested_size_ml integer,
  requested_sale_price numeric,
  requested_stock_quantity integer
)
returns table (
  inventory_item_id uuid,
  sku text,
  size_ml integer,
  sale_price numeric,
  stock_quantity integer
)
language plpgsql
security invoker
set search_path = public
as $$
declare
  item public.inventory_items;
  current_stock integer;
  stock_difference integer;
begin
  if not public.is_admin() then
    raise exception 'Admin permission required' using errcode = '42501';
  end if;

  if requested_size_ml is null or requested_size_ml <= 0 then
    raise exception 'Size must be greater than zero';
  end if;

  if requested_sale_price is null or requested_sale_price < 0 then
    raise exception 'Sale price must be zero or greater';
  end if;

  if requested_stock_quantity is null or requested_stock_quantity < 0 then
    raise exception 'Stock quantity must be zero or greater';
  end if;

  select *
  into item
  from public.inventory_items
  where perfume_id = requested_perfume_id
    and is_primary
  for update;

  if item.id is null then
    insert into public.inventory_items (
      perfume_id,
      sku,
      size_ml,
      sale_price,
      is_active,
      is_primary
    )
    values (
      requested_perfume_id,
      nullif(trim(requested_sku), ''),
      requested_size_ml,
      requested_sale_price,
      true,
      true
    )
    returning * into item;
  else
    update public.inventory_items
    set
      sku = coalesce(nullif(trim(requested_sku), ''), item.sku),
      size_ml = requested_size_ml,
      sale_price = requested_sale_price,
      is_active = true
    where id = item.id
    returning * into item;
  end if;

  select coalesce(sum(quantity), 0)::integer
  into current_stock
  from public.stock_movements
  where inventory_item_id = item.id;

  stock_difference := requested_stock_quantity - current_stock;

  if stock_difference <> 0 then
    insert into public.stock_movements (
      inventory_item_id,
      movement_type,
      quantity,
      reason,
      created_by
    )
    values (
      item.id,
      'adjustment',
      stock_difference,
      'Ajuste desde el panel administrativo',
      auth.uid()
    );
  end if;

  return query
  select
    item.id,
    item.sku,
    item.size_ml,
    item.sale_price,
    requested_stock_quantity;
end;
$$;

create or replace function public.save_perfume_product(
  requested_perfume_id uuid,
  requested_legacy_id text,
  requested_brand_name text,
  requested_name text,
  requested_slug text,
  requested_family text,
  requested_concentration text,
  requested_gender text,
  requested_year integer,
  requested_description text,
  requested_tags text[],
  requested_notes jsonb,
  requested_image_url text,
  requested_image_path text,
  requested_is_active boolean,
  requested_sku text,
  requested_size_ml integer,
  requested_sale_price numeric,
  requested_stock_quantity integer
)
returns uuid
language plpgsql
security invoker
set search_path = public
as $$
declare
  saved_brand_id uuid;
  saved_perfume_id uuid;
  normalized_brand_name text;
  normalized_brand_slug text;
begin
  if not public.is_admin() then
    raise exception 'Admin permission required' using errcode = '42501';
  end if;

  normalized_brand_name := trim(requested_brand_name);
  normalized_brand_slug := lower(
    trim(
      both '-'
      from regexp_replace(
        translate(
          normalized_brand_name,
          'ÁÉÍÓÚÜÑáéíóúüñ',
          'AEIOUUNaeiouun'
        ),
        '[^a-zA-Z0-9]+',
        '-',
        'g'
      )
    )
  );

  insert into public.brands (name, slug)
  values (normalized_brand_name, normalized_brand_slug)
  on conflict (slug) do update
  set name = excluded.name
  returning id into saved_brand_id;

  if requested_perfume_id is not null then
    update public.perfumes
    set
      brand_id = saved_brand_id,
      name = trim(requested_name),
      slug = requested_slug,
      family = requested_family,
      concentration = requested_concentration,
      gender = requested_gender,
      year = requested_year,
      description = requested_description,
      tags = coalesce(requested_tags, '{}'),
      notes = coalesce(requested_notes, '{}'::jsonb),
      primary_image_url = requested_image_url,
      primary_image_path = requested_image_path,
      is_active = coalesce(requested_is_active, true)
    where id = requested_perfume_id
    returning id into saved_perfume_id;

    if saved_perfume_id is null then
      raise exception 'Perfume not found';
    end if;
  elsif nullif(trim(requested_legacy_id), '') is not null then
    insert into public.perfumes (
      legacy_id,
      brand_id,
      name,
      slug,
      family,
      concentration,
      gender,
      year,
      description,
      tags,
      notes,
      primary_image_url,
      primary_image_path,
      is_active
    )
    values (
      trim(requested_legacy_id),
      saved_brand_id,
      trim(requested_name),
      requested_slug,
      requested_family,
      requested_concentration,
      requested_gender,
      requested_year,
      requested_description,
      coalesce(requested_tags, '{}'),
      coalesce(requested_notes, '{}'::jsonb),
      requested_image_url,
      requested_image_path,
      coalesce(requested_is_active, true)
    )
    on conflict (legacy_id) do update
    set
      brand_id = excluded.brand_id,
      name = excluded.name,
      slug = excluded.slug,
      family = excluded.family,
      concentration = excluded.concentration,
      gender = excluded.gender,
      year = excluded.year,
      description = excluded.description,
      tags = excluded.tags,
      notes = excluded.notes,
      primary_image_url = excluded.primary_image_url,
      primary_image_path = excluded.primary_image_path,
      is_active = excluded.is_active
    returning id into saved_perfume_id;
  else
    insert into public.perfumes (
      brand_id,
      name,
      slug,
      family,
      concentration,
      gender,
      year,
      description,
      tags,
      notes,
      primary_image_url,
      primary_image_path,
      is_active
    )
    values (
      saved_brand_id,
      trim(requested_name),
      requested_slug,
      requested_family,
      requested_concentration,
      requested_gender,
      requested_year,
      requested_description,
      coalesce(requested_tags, '{}'),
      coalesce(requested_notes, '{}'::jsonb),
      requested_image_url,
      requested_image_path,
      coalesce(requested_is_active, true)
    )
    returning id into saved_perfume_id;
  end if;

  perform public.upsert_primary_inventory(
    saved_perfume_id,
    requested_sku,
    requested_size_ml,
    requested_sale_price,
    requested_stock_quantity
  );

  return saved_perfume_id;
end;
$$;

create or replace view public.inventory_stock as
select
  i.id as inventory_item_id,
  i.perfume_id,
  i.sku,
  i.size_ml,
  i.cost_price,
  i.sale_price,
  i.is_active,
  coalesce(sum(sm.quantity), 0)::integer as stock_quantity,
  i.is_primary
from public.inventory_items i
left join public.stock_movements sm on sm.inventory_item_id = i.id
group by
  i.id,
  i.perfume_id,
  i.sku,
  i.size_ml,
  i.cost_price,
  i.sale_price,
  i.is_active,
  i.is_primary;

-- The original 001 view did not include image_path. PostgreSQL cannot insert a
-- view column in the middle with CREATE OR REPLACE, so rebuild this read-only
-- view while preserving all underlying table data.
drop view if exists public.catalog_perfumes;

create view public.catalog_perfumes as
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
  p.updated_at,
  inventory.inventory_item_id,
  inventory.sku,
  inventory.size_ml,
  inventory.sale_price,
  inventory.stock_quantity
from public.perfumes p
join public.brands b on b.id = p.brand_id
left join public.inventory_stock inventory
  on inventory.perfume_id = p.id
  and inventory.is_primary;

grant select on public.catalog_perfumes to anon, authenticated;
revoke execute on function public.upsert_primary_inventory(
  uuid,
  text,
  integer,
  numeric,
  integer
) from public;

grant execute on function public.upsert_primary_inventory(
  uuid,
  text,
  integer,
  numeric,
  integer
) to authenticated;

revoke execute on function public.save_perfume_product(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  integer,
  text,
  text[],
  jsonb,
  text,
  text,
  boolean,
  text,
  integer,
  numeric,
  integer
) from public;

grant execute on function public.save_perfume_product(
  uuid,
  text,
  text,
  text,
  text,
  text,
  text,
  text,
  integer,
  text,
  text[],
  jsonb,
  text,
  text,
  boolean,
  text,
  integer,
  numeric,
  integer
) to authenticated;
