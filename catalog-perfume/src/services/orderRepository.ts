import type { CartItem, CustomerDetails } from "../features/cart/cartTypes"
import { getSupabaseClient, hasSupabaseConfig } from "./supabaseClient"

export type OrderStatus =
  | "new"
  | "contacted"
  | "confirmed"
  | "cancelled"
  | "completed"

export type CatalogOrderItem = {
  id: string
  inventoryItemId: string
  perfumeName: string
  brandName: string
  sku?: string
  sizeMl?: number
  unitPrice: number
  quantity: number
  lineTotal: number
}

export type CatalogOrder = {
  id: string
  reference: string
  customerName: string
  customerPhone: string
  customerCity?: string
  customerDepartment?: string
  customerMunicipality?: string
  customerAddress?: string
  customerNotes?: string
  status: OrderStatus
  subtotal: number
  createdAt: string
  items: CatalogOrderItem[]
}

type OrderRow = {
  id: string
  reference: string
  customer_name: string
  customer_phone: string
  customer_city: string | null
  customer_department: string | null
  customer_municipality: string | null
  customer_address: string | null
  customer_notes: string | null
  status: OrderStatus
  subtotal: number | string
  created_at: string
  order_items: Array<{
    id: string
    inventory_item_id: string
    perfume_name: string
    brand_name: string
    sku: string | null
    size_ml: number | null
    unit_price: number | string
    quantity: number
    line_total: number | string
  }>
}

function mapOrder(row: OrderRow): CatalogOrder {
  return {
    id: row.id,
    reference: row.reference,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerCity: row.customer_city ?? undefined,
    customerDepartment: row.customer_department ?? undefined,
    customerMunicipality: row.customer_municipality ?? undefined,
    customerAddress: row.customer_address ?? undefined,
    customerNotes: row.customer_notes ?? undefined,
    status: row.status,
    subtotal: Number(row.subtotal),
    createdAt: row.created_at,
    items: row.order_items.map((item) => ({
      id: item.id,
      inventoryItemId: item.inventory_item_id,
      perfumeName: item.perfume_name,
      brandName: item.brand_name,
      sku: item.sku ?? undefined,
      sizeMl: item.size_ml ?? undefined,
      unitPrice: Number(item.unit_price),
      quantity: item.quantity,
      lineTotal: Number(item.line_total),
    })),
  }
}

export async function createCatalogOrder(
  customer: CustomerDetails,
  items: CartItem[],
) {
  if (!hasSupabaseConfig) {
    throw new Error("Supabase no está configurado para recibir pedidos.")
  }

  const supabase = await getSupabaseClient()
  const { data, error } = await supabase
    .rpc("create_catalog_order", {
      requested_customer_name: customer.name,
      requested_customer_phone: customer.phone,
      requested_customer_department: customer.department,
      requested_customer_municipality: customer.municipality,
      requested_customer_address: customer.address,
      requested_customer_notes: customer.notes,
      requested_items: items.map((item) => ({
        inventoryItemId: item.inventoryItemId,
        quantity: item.quantity,
      })),
    })
    .single()

  if (error) {
    throw new Error(
      error.code === "PGRST202"
        ? "Ejecuta las migraciones 005 y 006 de pedidos en Supabase."
        : error.message,
    )
  }

  return data as { order_id: string; reference: string; subtotal: number }
}

export async function listCatalogOrders(): Promise<CatalogOrder[]> {
  const supabase = await getSupabaseClient()
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .order("created_at", { ascending: false })

  if (error) {
    throw new Error(
      error.code === "42P01"
        ? "Ejecuta las migraciones 005 y 006 de pedidos en Supabase."
        : error.message,
    )
  }

  return (data as OrderRow[]).map(mapOrder)
}

export async function setCatalogOrderStatus(
  orderId: string,
  status: Exclude<OrderStatus, "new">,
) {
  const supabase = await getSupabaseClient()
  const { error } = await supabase.rpc("set_catalog_order_status", {
    requested_order_id: orderId,
    requested_status: status,
  })

  if (error) throw new Error(error.message)
}
