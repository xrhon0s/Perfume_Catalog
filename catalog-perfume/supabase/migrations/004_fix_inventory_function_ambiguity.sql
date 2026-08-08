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

  select inventory.*
  into item
  from public.inventory_items as inventory
  where inventory.perfume_id = requested_perfume_id
    and inventory.is_primary
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
    update public.inventory_items as inventory
    set
      sku = coalesce(nullif(trim(requested_sku), ''), item.sku),
      size_ml = requested_size_ml,
      sale_price = requested_sale_price,
      is_active = true
    where inventory.id = item.id
    returning inventory.* into item;
  end if;

  select coalesce(sum(movements.quantity), 0)::integer
  into current_stock
  from public.stock_movements as movements
  where movements.inventory_item_id = item.id;

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
