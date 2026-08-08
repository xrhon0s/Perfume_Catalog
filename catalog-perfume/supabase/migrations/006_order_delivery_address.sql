alter table public.orders
add column if not exists customer_department text,
add column if not exists customer_municipality text,
add column if not exists customer_address text;

create or replace function public.create_catalog_order(
  requested_customer_name text,
  requested_customer_phone text,
  requested_customer_department text,
  requested_customer_municipality text,
  requested_customer_address text,
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
  created_order record;
begin
  if nullif(trim(requested_customer_department), '') is null then
    raise exception 'Customer department is required';
  end if;

  if nullif(trim(requested_customer_municipality), '') is null then
    raise exception 'Customer municipality is required';
  end if;

  if nullif(trim(requested_customer_address), '') is null then
    raise exception 'Customer address is required';
  end if;

  select created.order_id, created.reference, created.subtotal
  into created_order
  from public.create_catalog_order(
    requested_customer_name,
    requested_customer_phone,
    requested_customer_municipality,
    requested_customer_notes,
    requested_items
  ) as created;

  update public.orders
  set
    customer_department = trim(requested_customer_department),
    customer_municipality = trim(requested_customer_municipality),
    customer_address = trim(requested_customer_address)
  where id = created_order.order_id;

  return query
  select
    created_order.order_id::uuid,
    created_order.reference::text,
    created_order.subtotal::numeric;
end;
$$;

revoke execute on function public.create_catalog_order(
  text,
  text,
  text,
  text,
  jsonb
) from anon, authenticated;

revoke execute on function public.create_catalog_order(
  text,
  text,
  text,
  text,
  text,
  text,
  jsonb
) from public;

grant execute on function public.create_catalog_order(
  text,
  text,
  text,
  text,
  text,
  text,
  jsonb
) to anon, authenticated;
