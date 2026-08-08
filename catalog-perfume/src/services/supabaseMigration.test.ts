import { describe, expect, it } from "vitest"
import migration from "../../supabase/migrations/003_primary_inventory.sql?raw"
import ambiguityFix from "../../supabase/migrations/004_fix_inventory_function_ambiguity.sql?raw"
import customerOrders from "../../supabase/migrations/005_customer_orders.sql?raw"
import orderDeliveryAddress from "../../supabase/migrations/006_order_delivery_address.sql?raw"

describe("003_primary_inventory migration", () => {
  it("recrea catalog_perfumes para admitir esquemas anteriores sin image_path", () => {
    const dropView = migration.indexOf(
      "drop view if exists public.catalog_perfumes",
    )
    const createView = migration.indexOf("create view public.catalog_perfumes")

    expect(dropView).toBeGreaterThan(-1)
    expect(createView).toBeGreaterThan(dropView)
  })

  it("califica inventory_item_id para evitar conflictos con la salida SQL", () => {
    expect(migration).toContain(
      "where movements.inventory_item_id = item.id",
    )
    expect(ambiguityFix).toContain(
      "where movements.inventory_item_id = item.id",
    )
    expect(ambiguityFix).not.toContain(
      "\n  where inventory_item_id = item.id",
    )
  })
})

describe("005_customer_orders migration", () => {
  it("crea pedidos mediante una RPC pública sin exponer las tablas", () => {
    expect(customerOrders).toContain(
      "create or replace function public.create_catalog_order",
    )
    expect(customerOrders).toContain("revoke all on public.orders from anon")
    expect(customerOrders).toContain(
      "grant execute on function public.create_catalog_order",
    )
  })

  it("descuenta inventario únicamente al confirmar", () => {
    expect(customerOrders).toContain("requested_status = 'confirmed'")
    expect(customerOrders).toContain("'sale',")
    expect(customerOrders).toContain("-selected_item.quantity")
  })
})

describe("006_order_delivery_address migration", () => {
  it("agrega y exige la dirección estructurada del pedido", () => {
    expect(orderDeliveryAddress).toContain("customer_department")
    expect(orderDeliveryAddress).toContain("customer_municipality")
    expect(orderDeliveryAddress).toContain("customer_address")
    expect(orderDeliveryAddress).toContain(
      "Customer address is required",
    )
  })
})
