import { useEffect, useMemo, useState } from "react"
import {
  Check,
  CheckCircle2,
  Clipboard,
  LoaderCircle,
  MessageCircle,
  RefreshCw,
  XCircle,
} from "lucide-react"
import {
  listCatalogOrders,
  setCatalogOrderStatus,
  type CatalogOrder,
  type OrderStatus,
} from "../../../services/orderRepository"
import {
  formatCatalogPrice,
  formatPerfumeSize,
} from "../../../shared/utils/catalogFormatting"
import {
  buildAdminWhatsAppMessage,
  createWhatsAppUrl,
} from "../../cart/whatsapp"
import AdminAlert from "./AdminAlert"

const statusLabels: Record<OrderStatus, string> = {
  new: "Nuevo",
  contacted: "Contactado",
  confirmed: "Confirmado",
  cancelled: "Cancelado",
  completed: "Completado",
}

const statusStyles: Record<OrderStatus, string> = {
  new: "bg-amber-100 text-amber-800",
  contacted: "bg-blue-100 text-blue-800",
  confirmed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-700",
  completed: "bg-slate-200 text-slate-700",
}

type OrdersPanelProps = {
  onInventoryChange?: () => Promise<void>
}

export default function OrdersPanel({
  onInventoryChange,
}: OrdersPanelProps) {
  const [orders, setOrders] = useState<CatalogOrder[]>([])
  const [loading, setLoading] = useState(true)
  const [updatingId, setUpdatingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")

  const loadOrders = async () => {
    setLoading(true)
    setError(null)
    try {
      setOrders(await listCatalogOrders())
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "No fue posible cargar los pedidos.",
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadOrders()
  }, [])

  const filtered = useMemo(
    () =>
      statusFilter === "all"
        ? orders
        : orders.filter((order) => order.status === statusFilter),
    [orders, statusFilter],
  )

  const updateStatus = async (
    order: CatalogOrder,
    status: Exclude<OrderStatus, "new">,
  ) => {
    setUpdatingId(order.id)
    setError(null)
    try {
      await setCatalogOrderStatus(order.id, status)
      if (["confirmed", "cancelled"].includes(status)) {
        await onInventoryChange?.()
      }
      setNotice(`${order.reference}: ${statusLabels[status].toLowerCase()}.`)
      await loadOrders()
    } catch (statusError) {
      setError(
        statusError instanceof Error
          ? statusError.message
          : "No fue posible actualizar el pedido.",
      )
    } finally {
      setUpdatingId(null)
    }
  }

  const contactCustomer = async (order: CatalogOrder) => {
    const message = buildAdminWhatsAppMessage(order)
    const url = createWhatsAppUrl(order.customerPhone, message)
    if (!url) {
      setError("El pedido no tiene un teléfono válido.")
      return
    }

    window.open(url, "_blank", "noopener,noreferrer")
    if (order.status === "new") {
      await updateStatus(order, "contacted")
    }
  }

  const copyMessage = async (order: CatalogOrder) => {
    await navigator.clipboard.writeText(buildAdminWhatsAppMessage(order))
    setNotice(`Mensaje de ${order.reference} copiado.`)
  }

  return (
    <section className="mx-auto max-w-[1600px] px-4 py-5 sm:px-6">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold">Pedidos</h1>
          <p className="mt-1 text-sm text-slate-500">
            Revisa solicitudes y continúa la venta por WhatsApp.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filtrar pedidos por estado"
            className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm"
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(event.target.value as OrderStatus | "all")
            }
          >
            <option value="all">Todos</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <button
            className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-semibold"
            type="button"
            onClick={() => void loadOrders()}
          >
            <RefreshCw aria-hidden="true" size={16} />
            Actualizar
          </button>
        </div>
      </div>

      {error ? <AdminAlert message={error} tone="error" /> : null}
      {notice ? <AdminAlert message={notice} tone="success" /> : null}

      {loading ? (
        <div className="mt-4 flex items-center gap-3 bg-white p-6 text-sm text-slate-500">
          <LoaderCircle aria-hidden="true" className="animate-spin" size={18} />
          Cargando pedidos
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {filtered.map((order) => {
            const isUpdating = updatingId === order.id
            return (
              <article
                className="border border-slate-200 bg-white"
                key={order.id}
              >
                <div className="flex flex-col gap-4 border-b border-slate-100 px-4 py-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">{order.reference}</h2>
                      <span
                        className={`rounded px-2 py-1 text-[11px] font-semibold ${statusStyles[order.status]}`}
                      >
                        {statusLabels[order.status]}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">
                      {order.customerName} · {order.customerPhone}
                      {order.customerMunicipality
                        ? ` · ${order.customerMunicipality}`
                        : order.customerCity
                          ? ` · ${order.customerCity}`
                          : ""}
                      {order.customerDepartment
                        ? `, ${order.customerDepartment}`
                        : ""}
                    </p>
                    {order.customerAddress ? (
                      <p className="mt-1 text-sm text-slate-500">
                        {order.customerAddress}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-slate-400">
                      {new Intl.DateTimeFormat("es-CO", {
                        dateStyle: "medium",
                        timeStyle: "short",
                      }).format(new Date(order.createdAt))}
                    </p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 px-3 text-sm font-semibold"
                      type="button"
                      onClick={() => void copyMessage(order)}
                    >
                      <Clipboard aria-hidden="true" size={15} />
                      Copiar
                    </button>
                    <button
                      className="inline-flex h-9 items-center gap-2 rounded-md bg-[#1f9d55] px-3 text-sm font-semibold text-white"
                      type="button"
                      onClick={() => void contactCustomer(order)}
                    >
                      <MessageCircle aria-hidden="true" size={16} />
                      WhatsApp
                    </button>
                    {["new", "contacted"].includes(order.status) ? (
                      <button
                        className="inline-flex h-9 items-center gap-2 rounded-md bg-[#171914] px-3 text-sm font-semibold text-white disabled:opacity-50"
                        disabled={isUpdating}
                        type="button"
                        onClick={() => void updateStatus(order, "confirmed")}
                      >
                        <Check aria-hidden="true" size={16} />
                        Confirmar
                      </button>
                    ) : null}
                    {order.status === "confirmed" ? (
                      <button
                        className="inline-flex h-9 items-center gap-2 rounded-md bg-emerald-700 px-3 text-sm font-semibold text-white disabled:opacity-50"
                        disabled={isUpdating}
                        type="button"
                        onClick={() => void updateStatus(order, "completed")}
                      >
                        <CheckCircle2 aria-hidden="true" size={16} />
                        Completar
                      </button>
                    ) : null}
                    {!["cancelled", "completed"].includes(order.status) ? (
                      <button
                        aria-label={`Cancelar ${order.reference}`}
                        className="grid h-9 w-9 place-items-center rounded-md border border-red-100 text-red-600 disabled:opacity-50"
                        disabled={isUpdating}
                        title="Cancelar"
                        type="button"
                        onClick={() => {
                          if (window.confirm(`¿Cancelar ${order.reference}?`)) {
                            void updateStatus(order, "cancelled")
                          }
                        }}
                      >
                        <XCircle aria-hidden="true" size={17} />
                      </button>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-4 px-4 py-4 lg:grid-cols-[1fr_auto]">
                  <div className="divide-y divide-slate-100">
                    {order.items.map((item) => (
                      <div
                        className="grid grid-cols-[1fr_auto] gap-4 py-2 text-sm first:pt-0 last:pb-0"
                        key={item.id}
                      >
                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {item.brandName} {item.perfumeName}
                          </p>
                          <p className="text-xs text-slate-500">
                            {formatPerfumeSize(item.sizeMl)} · {item.quantity} ×{" "}
                            {formatCatalogPrice(item.unitPrice)}
                          </p>
                        </div>
                        <strong>{formatCatalogPrice(item.lineTotal)}</strong>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-slate-200 pt-3 text-right lg:min-w-48 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0">
                    <p className="text-xs text-slate-500">Total</p>
                    <p className="mt-1 text-xl font-semibold">
                      {formatCatalogPrice(order.subtotal)}
                    </p>
                    {order.customerNotes ? (
                      <p className="mt-3 max-w-xs text-xs leading-5 text-slate-500">
                        {order.customerNotes}
                      </p>
                    ) : null}
                  </div>
                </div>
              </article>
            )
          })}
          {filtered.length === 0 ? (
            <div className="bg-white px-5 py-12 text-center text-sm text-slate-500">
              No hay pedidos con este estado.
            </div>
          ) : null}
        </div>
      )}
    </section>
  )
}
