import { useEffect, useId } from "react"
import { ShoppingBag } from "lucide-react"
import type { Perfume } from "../../data/types"
import { perfumeToCartItem } from "../../features/cart/cartTypes"
import {
  formatCatalogPrice,
  formatPerfumeSize,
} from "../../shared/utils/catalogFormatting"
import { useCartStore } from "../../store/cartStore"

type Props = {
  perfume: Perfume
  onClose: () => void
}

export default function PerfumeDetailModal({ perfume, onClose }: Props) {
  const titleId = useId()
  const addCartItem = useCartStore((state) => state.addItem)
  const cartItem = perfumeToCartItem(perfume)
  const profile = [
    perfume.family,
    perfume.concentration,
    perfume.gender,
    perfume.year,
  ].filter(Boolean)
  const notesGroups = [
    { label: "Salida", values: perfume.notes?.top },
    { label: "Corazón", values: perfume.notes?.heart },
    { label: "Fondo", values: perfume.notes?.base },
  ].filter((group) => group.values && group.values.length > 0)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
    }

    document.addEventListener("keydown", onKeyDown)

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose])

  return (
    <div className="fixed inset-0 z-[9998]">
      <button
        onClick={onClose}
        className="absolute inset-0 bg-black/50"
        aria-label="Cerrar detalle"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="absolute left-1/2 top-1/2 max-h-[92vh] w-[min(940px,92vw)] -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-2xl bg-white shadow-xl"
      >
        <div className="grid max-h-[92vh] grid-cols-1 overflow-y-auto md:grid-cols-[minmax(280px,0.9fr)_1.1fr]">
          <div className="min-h-72 bg-gray-100 md:min-h-full">
            {perfume.image ? (
              <img
                src={perfume.image}
                alt={perfume.name}
                className="h-full max-h-[48vh] w-full object-cover md:max-h-none"
                loading="lazy"
              />
            ) : (
              <div className="relative flex h-72 w-full items-end overflow-hidden bg-gradient-to-br from-slate-200 via-white to-zinc-100 p-6 md:h-full">
                <div className="absolute inset-x-6 top-6 h-px bg-slate-950/15" />
                <div className="absolute inset-x-6 bottom-6 h-px bg-slate-950/15" />
                <div className="absolute right-6 top-6 h-[calc(100%-3rem)] w-2 bg-slate-950" />
                <div className="relative max-w-[80%] text-slate-950">
                  <p className="text-sm font-semibold uppercase">{perfume.brand}</p>
                  <p className="mt-2 text-4xl font-semibold leading-tight">
                    {perfume.name}
                  </p>
                  {profile.length > 0 && (
                    <p className="mt-4 text-sm leading-6 text-slate-600">
                      {profile.join(" · ")}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-gray-500">{perfume.brand}</p>
                <h2 id={titleId} className="mt-1 text-2xl font-semibold">
                  {perfume.name}
                </h2>
              </div>

              <button
                onClick={onClose}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cerrar ✕
              </button>
            </div>

            {perfume.inventory ? (
              <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3 border-y border-slate-200 py-4 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-slate-500">Precio</p>
                  <p className="mt-1 font-semibold text-slate-950">
                    {formatCatalogPrice(perfume.inventory.salePrice)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Presentación</p>
                  <p className="mt-1 font-semibold text-slate-950">
                    {formatPerfumeSize(perfume.inventory.sizeMl)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Disponibilidad</p>
                  <p
                    className={[
                      "mt-1 font-semibold",
                      perfume.inventory.stockQuantity > 0
                        ? "text-emerald-700"
                        : "text-red-700",
                    ].join(" ")}
                  >
                    {perfume.inventory.stockQuantity > 0
                      ? `${perfume.inventory.stockQuantity} unidades`
                      : "Agotado"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">SKU</p>
                  <p className="mt-1 truncate font-mono text-sm font-semibold text-slate-700">
                    {perfume.inventory.sku ?? "Automático"}
                  </p>
                </div>
              </div>
            ) : null}

            <dl className="mt-6 grid grid-cols-2 gap-3 text-sm sm:grid-cols-4">
              {perfume.family && (
                <div className="rounded-lg bg-gray-50 p-3">
                  <dt className="text-xs text-gray-500">Familia</dt>
                  <dd className="mt-1 font-semibold text-gray-900">
                    {perfume.family}
                  </dd>
                </div>
              )}

              {perfume.concentration && (
                <div className="rounded-lg bg-gray-50 p-3">
                  <dt className="text-xs text-gray-500">Tipo</dt>
                  <dd className="mt-1 font-semibold text-gray-900">
                    {perfume.concentration}
                  </dd>
                </div>
              )}

              {perfume.gender && (
                <div className="rounded-lg bg-gray-50 p-3">
                  <dt className="text-xs text-gray-500">Género</dt>
                  <dd className="mt-1 font-semibold text-gray-900">
                    {perfume.gender}
                  </dd>
                </div>
              )}

              {perfume.year && (
                <div className="rounded-lg bg-gray-50 p-3">
                  <dt className="text-xs text-gray-500">Año</dt>
                  <dd className="mt-1 font-semibold text-gray-900">
                    {perfume.year}
                  </dd>
                </div>
              )}
            </dl>

            {perfume.description && (
              <p className="mt-6 text-sm leading-6 text-gray-700">
                {perfume.description}
              </p>
            )}

            {notesGroups.length > 0 && (
              <div className="mt-6 space-y-4">
                <h3 className="text-sm font-semibold text-gray-900">Notas</h3>
                <div className="grid gap-3 sm:grid-cols-3">
                  {notesGroups.map((group) => (
                    <div key={group.label} className="rounded-lg border p-3">
                      <p className="text-xs font-medium text-gray-500">
                        {group.label}
                      </p>
                      <p className="mt-2 text-sm text-gray-800">
                        {group.values?.join(", ")}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {perfume.tags && perfume.tags.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-2">
                {perfume.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="sticky bottom-0 mt-6 border-t border-slate-200 bg-white pt-4">
              <button
                className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-md bg-[#171914] px-5 text-sm font-semibold text-white transition hover:bg-[#292c26] disabled:cursor-not-allowed disabled:bg-slate-300"
                disabled={!cartItem}
                type="button"
                onClick={() => {
                  if (!cartItem) return
                  addCartItem(cartItem)
                  onClose()
                }}
              >
                <ShoppingBag aria-hidden="true" size={18} />
                {cartItem
                  ? "Agregar al carrito"
                  : perfume.inventory?.stockQuantity === 0
                    ? "Producto agotado"
                    : "No disponible para pedido"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
