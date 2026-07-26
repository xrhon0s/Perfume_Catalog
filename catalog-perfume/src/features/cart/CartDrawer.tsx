import { useEffect, useMemo, useState } from "react"
import {
  CheckCircle2,
  LoaderCircle,
  MessageCircle,
  Minus,
  Plus,
  Send,
  ShoppingBag,
  Trash2,
  X,
} from "lucide-react"
import { createCatalogOrder } from "../../services/orderRepository"
import {
  formatCatalogPrice,
  formatPerfumeSize,
} from "../../shared/utils/catalogFormatting"
import { useCartStore } from "../../store/cartStore"
import type { CustomerDetails } from "./cartTypes"
import {
  buildCartWhatsAppMessage,
  createWhatsAppUrl,
} from "./whatsapp"

const emptyCustomer: CustomerDetails = {
  name: "",
  phone: "",
  city: "",
  notes: "",
}

const businessWhatsApp =
  (import.meta.env.VITE_WHATSAPP_NUMBER as string | undefined) ?? ""

export default function CartDrawer() {
  const items = useCartStore((state) => state.items)
  const isOpen = useCartStore((state) => state.isOpen)
  const close = useCartStore((state) => state.close)
  const clear = useCartStore((state) => state.clear)
  const removeItem = useCartStore((state) => state.removeItem)
  const setQuantity = useCartStore((state) => state.setQuantity)
  const [customer, setCustomer] = useState<CustomerDetails>(emptyCustomer)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [createdReference, setCreatedReference] = useState<string | null>(null)
  const total = useMemo(
    () =>
      items.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0,
      ),
    [items],
  )

  useEffect(() => {
    if (!isOpen) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close()
    }
    document.addEventListener("keydown", onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", onKeyDown)
    }
  }, [close, isOpen])

  if (!isOpen) return null

  const updateCustomer = (field: keyof CustomerDetails, value: string) => {
    setCustomer((current) => ({ ...current, [field]: value }))
    setError(null)
  }

  const sendDirectly = () => {
    if (!businessWhatsApp) {
      setError("Configura VITE_WHATSAPP_NUMBER para enviar pedidos por WhatsApp.")
      return
    }
    const url = createWhatsAppUrl(
      businessWhatsApp,
      buildCartWhatsAppMessage(items, customer),
    )
    if (url) window.open(url, "_blank", "noopener,noreferrer")
  }

  const submitForReview = async () => {
    if (!customer.name.trim() || !customer.phone.trim()) {
      setError("Escribe tu nombre y teléfono para guardar la solicitud.")
      return
    }

    setSubmitting(true)
    setError(null)
    try {
      const order = await createCatalogOrder(customer, items)
      setCreatedReference(order.reference)
      clear()
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "No fue posible enviar la solicitud.",
      )
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[9999]">
      <button
        aria-label="Cerrar carrito"
        className="absolute inset-0 bg-black/45"
        type="button"
        onClick={close}
      />
      <aside
        aria-label="Carrito"
        className="absolute inset-y-0 right-0 flex w-full max-w-[480px] flex-col bg-[#f7f8f5] shadow-2xl"
      >
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-5">
          <div className="flex items-center gap-3">
            <ShoppingBag aria-hidden="true" size={20} />
            <div>
              <h2 className="font-semibold text-slate-950">Tu pedido</h2>
              <p className="text-xs text-slate-500">
                {items.length} {items.length === 1 ? "perfume" : "perfumes"}
              </p>
            </div>
          </div>
          <button
            aria-label="Cerrar"
            className="grid h-9 w-9 place-items-center rounded-md text-slate-500 hover:bg-slate-100"
            type="button"
            onClick={close}
          >
            <X aria-hidden="true" size={19} />
          </button>
        </header>

        {createdReference ? (
          <div className="grid flex-1 place-items-center px-6 text-center">
            <div className="max-w-sm">
              <CheckCircle2
                aria-hidden="true"
                className="mx-auto text-emerald-600"
                size={38}
              />
              <h3 className="mt-4 text-xl font-semibold">Solicitud recibida</h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Tu referencia es <strong>{createdReference}</strong>. Revisaremos
                el pedido y te contactaremos por WhatsApp.
              </p>
              <button
                className="mt-6 h-10 rounded-md bg-[#171914] px-5 text-sm font-semibold text-white"
                type="button"
                onClick={() => {
                  setCreatedReference(null)
                  setCustomer(emptyCustomer)
                  close()
                }}
              >
                Volver al catálogo
              </button>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="grid flex-1 place-items-center px-6 text-center">
            <div>
              <ShoppingBag
                aria-hidden="true"
                className="mx-auto text-slate-300"
                size={36}
              />
              <h3 className="mt-4 font-semibold">El carrito está vacío</h3>
              <p className="mt-2 text-sm text-slate-500">
                Agrega perfumes para preparar tu solicitud.
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="min-h-0 flex-1 overflow-y-auto">
              <div className="divide-y divide-slate-200 bg-white">
                {items.map((item) => (
                  <article
                    className="grid grid-cols-[64px_minmax(0,1fr)_auto] gap-3 px-5 py-4"
                    key={item.inventoryItemId}
                  >
                    <div className="h-16 overflow-hidden bg-slate-100">
                      {item.image ? (
                        <img
                          alt=""
                          className="h-full w-full object-cover"
                          src={item.image}
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs text-slate-500">
                        {item.brand}
                      </p>
                      <h3 className="truncate text-sm font-semibold">
                        {item.name}
                      </h3>
                      <p className="mt-1 text-xs text-slate-500">
                        {formatPerfumeSize(item.sizeMl)} ·{" "}
                        {formatCatalogPrice(item.unitPrice)}
                      </p>
                      <div className="mt-2 inline-flex items-center border border-slate-200">
                        <button
                          aria-label={`Quitar una unidad de ${item.name}`}
                          className="grid h-7 w-7 place-items-center"
                          type="button"
                          onClick={() =>
                            setQuantity(item.inventoryItemId, item.quantity - 1)
                          }
                        >
                          <Minus aria-hidden="true" size={14} />
                        </button>
                        <span className="w-8 text-center text-xs font-semibold">
                          {item.quantity}
                        </span>
                        <button
                          aria-label={`Agregar una unidad de ${item.name}`}
                          className="grid h-7 w-7 place-items-center disabled:opacity-30"
                          disabled={item.quantity >= item.stockQuantity}
                          type="button"
                          onClick={() =>
                            setQuantity(item.inventoryItemId, item.quantity + 1)
                          }
                        >
                          <Plus aria-hidden="true" size={14} />
                        </button>
                      </div>
                    </div>
                    <button
                      aria-label={`Eliminar ${item.name}`}
                      className="grid h-8 w-8 place-items-center text-slate-400 hover:text-red-600"
                      type="button"
                      onClick={() => removeItem(item.inventoryItemId)}
                    >
                      <Trash2 aria-hidden="true" size={16} />
                    </button>
                  </article>
                ))}
              </div>

              <div className="space-y-3 px-5 py-5">
                <div className="grid grid-cols-2 gap-3">
                  <label className="col-span-2 sm:col-span-1">
                    <span className="text-xs font-medium text-slate-600">Nombre *</span>
                    <input
                      className="mt-1 h-10 w-full border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-500"
                      value={customer.name}
                      onChange={(event) =>
                        updateCustomer("name", event.target.value)
                      }
                    />
                  </label>
                  <label className="col-span-2 sm:col-span-1">
                    <span className="text-xs font-medium text-slate-600">WhatsApp *</span>
                    <input
                      className="mt-1 h-10 w-full border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-500"
                      inputMode="tel"
                      placeholder="57..."
                      value={customer.phone}
                      onChange={(event) =>
                        updateCustomer("phone", event.target.value)
                      }
                    />
                  </label>
                </div>
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">Ciudad</span>
                  <input
                    className="mt-1 h-10 w-full border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-500"
                    value={customer.city}
                    onChange={(event) =>
                      updateCustomer("city", event.target.value)
                    }
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-slate-600">
                    Nota opcional
                  </span>
                  <textarea
                    className="mt-1 min-h-20 w-full resize-none border border-slate-200 bg-white p-3 text-sm outline-none focus:border-slate-500"
                    value={customer.notes}
                    onChange={(event) =>
                      updateCustomer("notes", event.target.value)
                    }
                  />
                </label>
                {error ? (
                  <p className="text-sm font-medium text-red-700" role="alert">
                    {error}
                  </p>
                ) : null}
              </div>
            </div>

            <footer className="shrink-0 border-t border-slate-200 bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-slate-500">Total estimado</span>
                <strong className="text-lg">{formatCatalogPrice(total)}</strong>
              </div>
              <div className="grid gap-2">
                <button
                  className="inline-flex h-11 items-center justify-center gap-2 bg-[#1f9d55] px-4 text-sm font-semibold text-white disabled:opacity-40"
                  type="button"
                  onClick={sendDirectly}
                >
                  <MessageCircle aria-hidden="true" size={18} />
                  Continuar ahora por WhatsApp
                </button>
                <button
                  className="inline-flex h-11 items-center justify-center gap-2 border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-950 disabled:opacity-50"
                  disabled={submitting}
                  type="button"
                  onClick={() => void submitForReview()}
                >
                  {submitting ? (
                    <LoaderCircle
                      aria-hidden="true"
                      className="animate-spin"
                      size={18}
                    />
                  ) : (
                    <Send aria-hidden="true" size={18} />
                  )}
                  Enviar solicitud para revisión
                </button>
              </div>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}
