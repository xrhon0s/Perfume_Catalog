create sequence if not exists public.order_reference_sequence start 1001;

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default (
    'ETER-' || lpad(nextval('public.order_reference_sequence')::text, 6, '0')
  ),
  customer_name text not null,
  customer_phone text not null,
  customer_city text,
  customer_notes text,
  status text not null default 'new'
    check (status in ('new', 'contacted', 'confirmed', 'cancelled', 'completed')),
  subtotal numeric(12, 2) not null default 0 check (subtotal >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  confirmed_at timestamptz
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  inventory_item_id uuid not null references public.inventory_items(id) on delete restrict,
  perfume_id uuid not null references public.perfumes(id) on delete restrict,
  perfume_name text not null,
  brand_name text not null,
  sku text,
  size_ml integer,
  unit_price numeric(12, 2) not null check (unit_price >= 0),
  quantity integer not null check (quantity > 0),
  line_total numeric(12, 2) not null check (line_total >= 0),
  created_at timestamptz not null default now(),
  unique (order_id, inventory_item_id)
);

create index if not exists orders_status_created_at_idx
on public.orders (status, created_at desc);

create index if not exists order_items_order_id_idx
on public.order_items (order_id);

drop trigger if exists orders_touch_updated_at on public.orders;
create trigger orders_touch_updated_at
before update on public.orders
for each row execute function public.touch_updated_at();

alter table public.orders enable row level security;
alter table public.order_items enable row level security;

drop policy if exists "Admins read orders" on public.orders;
create policy "Admins read orders"
on public.orders for select
to authenticated
using (public.is_admin());

drop policy if exists "Admins update orders" on public.orders;
create policy "Admins update orders"
on public.orders for update
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "Admins read order items" on public.order_items;
create policy "Admins read order items"
on public.order_items for select
to authenticated
using (public.is_admin());

create or replace function public.create_catalog_order(
  requested_customer_name text,
  requested_customer_phone text,
  requested_customer_city text,
  requested_customer_notes text,
  requested_items jsonb
)
returns table (
  order_id uuid,
  reference text,
  subtotal numeric
)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  created_order public.orders;
  requested_item jsonb;
  selected_inventory record;
  requested_quantity integer;
  normalized_phone text;
  item_count integer;
begin
  if nullif(trim(requested_customer_name), '') is null then
    raise exception 'Customer name is required';
  end if;

  normalized_phone := regexp_replace(coalesce(requested_customer_phone, ''), '[^0-9]', '', 'g');
  if length(normalized_phone) < 7 or length(normalized_phone) > 15 then
    raise exception 'Customer phone is invalid';
  end if;

  if (
    select count(*)
    from public.orders
    where customer_phone = normalized_phone
      and created_at > now() - interval '1 hour'
  ) >= 5 then
    raise exception 'Too many recent orders for this phone';
  end if;

  if jsonb_typeof(requested_items) <> 'array' then
    raise exception 'Order items must be an array';
  end if;

  item_count := jsonb_array_length(requested_items);
  if item_count < 1 or item_count > 30 then
    raise exception 'Order must contain between 1 and 30 items';
  end if;

  insert into public.orders (
    customer_name,
    customer_phone,
    customer_city,
    customer_notes
  )
  values (
    trim(requested_customer_name),
    normalized_phone,
    nullif(trim(requested_customer_city), ''),
    nullif(trim(requested_customer_notes), '')
  )
  returning * into created_order;

  for requested_item in
    select value from jsonb_array_elements(requested_items)
  loop
    requested_quantity := (requested_item ->> 'quantity')::integer;
    if requested_quantity is null or requested_quantity < 1 or requested_quantity > 99 then
      raise exception 'Invalid item quantity';
    end if;

    select
      inventory.id as inventory_item_id,
      inventory.perfume_id,
      inventory.sku,
      inventory.size_ml,
      inventory.sale_price,
      perfume.name as perfume_name,
      brand.name as brand_name,
      coalesce(sum(movement.quantity), 0)::integer as stock_quantity
    into selected_inventory
    from public.inventory_items as inventory
    join public.perfumes as perfume on perfume.id = inventory.perfume_id
    join public.brands as brand on brand.id = perfume.brand_id
    left join public.stock_movements as movement
      on movement.inventory_item_id = inventory.id
    where inventory.id = (requested_item ->> 'inventoryItemId')::uuid
      and inventory.is_active
      and perfume.is_active
      and inventory.sale_price is not null
    group by inventory.id, perfume.id, brand.id;

    if selected_inventory.inventory_item_id is null then
      raise exception 'A requested product is not available';
    end if;

    if requested_quantity > selected_inventory.stock_quantity then
      raise exception 'Insufficient stock for %', selected_inventory.perfume_name;
    end if;

    insert into public.order_items (
      order_id,
      inventory_item_id,
      perfume_id,
      perfume_name,
      brand_name,
      sku,
      size_ml,
      unit_price,
      quantity,
      line_total
    )
    values (
      created_order.id,
      selected_inventory.inventory_item_id,
      selected_inventory.perfume_id,
      selected_inventory.perfume_name,
      selected_inventory.brand_name,
      selected_inventory.sku,
      selected_inventory.size_ml,
      selected_inventory.sale_price,
      requested_quantity,
      selected_inventory.sale_price * requested_quantity
    );
  end loop;

  update public.orders as saved_order
  set subtotal = (
    select coalesce(sum(item.line_total), 0)
    from public.order_items as item
    where item.order_id = created_order.id
  )
  where saved_order.id = created_order.id
  returning saved_order.* into created_order;

  return query
  select created_order.id, created_order.reference, created_order.subtotal;
end;
$$;

create or replace function public.set_catalog_order_status(
  requested_order_id uuid,
  requested_status text
)
returns text
language plpgsql
security invoker
set search_path = public
as $$
declare
  selected_order public.orders;
  selected_item record;
  available_stock integer;
begin
  if not public.is_admin() then
    raise exception 'Admin permission required' using errcode = '42501';
  end if;

  if requested_status not in ('contacted', 'confirmed', 'cancelled', 'completed') then
    raise exception 'Invalid order status';
  end if;

  select *
  into selected_order
  from public.orders
  where id = requested_order_id
  for update;

  if selected_order.id is null then
    raise exception 'Order not found';
  end if;

  if selected_order.status = requested_status then
    return selected_order.status;
  end if;

  if requested_status = 'confirmed' then
    if selected_order.status not in ('new', 'contacted') then
      raise exception 'Only new or contacted orders can be confirmed';
    end if;

    for selected_item in
      select item.*
      from public.order_items as item
      where item.order_id = selected_order.id
      order by item.inventory_item_id
    loop
      perform 1
      from public.inventory_items
      where id = selected_item.inventory_item_id
      for update;

      select coalesce(sum(quantity), 0)::integer
      into available_stock
      from public.stock_movements
      where inventory_item_id = selected_item.inventory_item_id;

      if available_stock < selected_item.quantity then
        raise exception 'Insufficient stock for %', selected_item.perfume_name;
      end if;

      insert into public.stock_movements (
        inventory_item_id,
        movement_type,
        quantity,
        reason,
        created_by
      )
      values (
        selected_item.inventory_item_id,
        'sale',
        -selected_item.quantity,
        'Pedido confirmado ' || selected_order.reference,
        auth.uid()
      );
    end loop;

    update public.orders
    set status = 'confirmed', confirmed_at = now()
    where id = selected_order.id;
  elsif requested_status = 'cancelled' then
    if selected_order.status = 'completed' then
      raise exception 'Completed orders cannot be cancelled';
    end if;

    if selected_order.status = 'confirmed' then
      insert into public.stock_movements (
        inventory_item_id,
        movement_type,
        quantity,
        reason,
        created_by
      )
      select
        item.inventory_item_id,
        'return',
        item.quantity,
        'Cancelación de pedido ' || selected_order.reference,
        auth.uid()
      from public.order_items as item
      where item.order_id = selected_order.id;
    end if;

    update public.orders
    set status = 'cancelled'
    where id = selected_order.id;
  elsif requested_status = 'completed' then
    if selected_order.status <> 'confirmed' then
      raise exception 'Only confirmed orders can be completed';
    end if;

    update public.orders set status = 'completed' where id = selected_order.id;
  else
    if selected_order.status <> 'new' then
      raise exception 'Only new orders can be marked as contacted';
    end if;

    update public.orders set status = 'contacted' where id = selected_order.id;
  end if;

  return requested_status;
end;
$$;

revoke all on public.orders from anon;
revoke all on public.order_items from anon;
grant select, update on public.orders to authenticated;
grant select on public.order_items to authenticated;

revoke execute on function public.create_catalog_order(text, text, text, text, jsonb) from public;
grant execute on function public.create_catalog_order(text, text, text, text, jsonb)
to anon, authenticated;

revoke execute on function public.set_catalog_order_status(uuid, text) from public;
grant execute on function public.set_catalog_order_status(uuid, text)
to authenticated;
