import type { CartItem, CustomerDetails } from "./cartTypes"
import type { CatalogOrder } from "../../services/orderRepository"
import {
  formatCatalogPrice,
  formatPerfumeSize,
} from "../../shared/utils/catalogFormatting"

const defaultCountryCode =
  (import.meta.env.VITE_WHATSAPP_DEFAULT_COUNTRY_CODE as string | undefined) ??
  "57"

export function normalizeWhatsAppPhone(value: string) {
  const digits = value.replace(/\D/g, "")
  return digits.length === 10 && digits.startsWith("3")
    ? `${defaultCountryCode}${digits}`
    : digits
}

export function buildCartWhatsAppMessage(
  items: CartItem[],
  customer: CustomerDetails,
) {
  const total = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  )
  const lines = items.map(
    (item, index) =>
      `${index + 1}. ${item.brand} ${item.name} · ${formatPerfumeSize(
        item.sizeMl,
      )} · ${item.quantity} x ${formatCatalogPrice(item.unitPrice)}`,
  )

  const customerLines = [
    customer.name.trim() ? `Nombre: ${customer.name.trim()}` : "",
    customer.phone.trim() ? `Teléfono: ${customer.phone.trim()}` : "",
    customer.department.trim()
      ? `Departamento: ${customer.department.trim()}`
      : "",
    customer.municipality.trim()
      ? `Municipio: ${customer.municipality.trim()}`
      : "",
    customer.address.trim() ? `Dirección: ${customer.address.trim()}` : "",
    customer.notes.trim() ? `Nota: ${customer.notes.trim()}` : "",
  ].filter(Boolean)

  return [
    "Hola, quiero solicitar este pedido:",
    "",
    ...lines,
    "",
    `Total estimado: ${formatCatalogPrice(total)}`,
    ...customerLines,
    "",
    "¿Me ayudas a confirmar disponibilidad, envío y forma de pago?",
  ].join("\n")
}

export function buildAdminWhatsAppMessage(order: CatalogOrder) {
  const lines = order.items.map(
    (item, index) =>
      `${index + 1}. ${item.brandName} ${item.perfumeName} · ${formatPerfumeSize(
        item.sizeMl,
      )} · ${item.quantity} x ${formatCatalogPrice(item.unitPrice)}`,
  )

  return [
    `Hola ${order.customerName}, recibimos tu solicitud ${order.reference}:`,
    "",
    ...lines,
    "",
    `Total: ${formatCatalogPrice(order.subtotal)}`,
    order.customerDepartment
      ? `Departamento: ${order.customerDepartment}`
      : "",
    order.customerMunicipality
      ? `Municipio: ${order.customerMunicipality}`
      : "",
    order.customerAddress ? `Dirección: ${order.customerAddress}` : "",
    "",
    "Revisamos la disponibilidad. Continuemos por aquí para coordinar envío y pago.",
  ]
    .filter((line, index, lines) => line || lines[index - 1] !== "")
    .join("\n")
}

export function createWhatsAppUrl(phone: string, message: string) {
  const normalizedPhone = normalizeWhatsAppPhone(phone)
  if (!normalizedPhone) return null
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`
}
