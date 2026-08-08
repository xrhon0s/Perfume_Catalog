import { useState } from "react"
import { ArrowUpRight, ImageOff, ShoppingBag } from "lucide-react"
import type { Perfume } from "../../data/types"
import { perfumeToCartItem } from "../../features/cart/cartTypes"
import {
  formatCatalogPrice,
  formatPerfumeSize,
} from "../../shared/utils/catalogFormatting"
import { useCartStore } from "../../store/cartStore"

type MagazinePageProps = {
  side: "left" | "right"
  perfume?: Perfume
  onView?: () => void
}

export default function MagazinePage({
  side,
  perfume,
  onView,
}: MagazinePageProps) {
  const isLeft = side === "left"
  const addCartItem = useCartStore((state) => state.addItem)
  const [failedImageUrl, setFailedImageUrl] = useState<string | undefined>()
  const imageUrl = perfume?.image
  const hasImage = Boolean(imageUrl) && failedImageUrl !== imageUrl
  const profile = [
    perfume?.family,
    perfume?.concentration,
    perfume?.gender,
    perfume?.year,
    perfume?.inventory?.sizeMl
      ? formatPerfumeSize(perfume.inventory.sizeMl)
      : undefined,
  ].filter(Boolean)
  const titleLength = perfume?.name.length ?? 0
  const titleSize =
    titleLength > 34
      ? "text-2xl sm:text-xl"
      : titleLength > 22
        ? "text-2xl"
        : "text-3xl"
  const inventory = perfume?.inventory
  const cartItem = perfume ? perfumeToCartItem(perfume) : null

  const priceSummary = inventory ? (
    <div className="whitespace-nowrap">
      <p className="text-lg font-semibold">
        {formatCatalogPrice(inventory.salePrice)}
      </p>
      <p className="mt-0.5 text-[10px] font-medium text-white/50">
        Precio al detal
      </p>
    </div>
  ) : null

  const purchaseActions =
    perfume && (cartItem || onView) ? (
      <div
        className="flex shrink-0 flex-col items-stretch gap-1.5"
        onPointerDownCapture={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onMouseDownCapture={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        onTouchStartCapture={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
      >
        <div className="flex flex-wrap items-center gap-1.5 sm:w-[138px] sm:flex-col sm:items-stretch">
          {cartItem ? (
            <button
              aria-label={`Agregar ${perfume.name} al carrito`}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md border border-white/25 px-2.5 text-xs font-semibold text-white transition hover:bg-white/10"
              title="Agregar al carrito"
              type="button"
              onClick={(event) => {
                event.stopPropagation()
                addCartItem(cartItem)
              }}
            >
              <ShoppingBag aria-hidden="true" size={14} />
              Añadir al carrito
            </button>
          ) : null}
          {onView ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onView()
              }}
              className="inline-flex h-8 items-center justify-center gap-1.5 rounded-md bg-white px-3 text-xs font-semibold text-slate-950 shadow-sm transition hover:bg-slate-100"
            >
              Ver detalles
              <ArrowUpRight aria-hidden="true" size={14} />
            </button>
          ) : null}
        </div>
        {inventory ? (
          <p
            className={[
              "text-[11px] font-semibold sm:text-center",
              inventory.stockQuantity > 0
                ? "text-emerald-300"
                : "text-red-300",
            ].join(" ")}
          >
            {inventory.stockQuantity > 0
              ? `${inventory.stockQuantity} disponibles`
              : "Agotado"}
          </p>
        ) : null}
      </div>
    ) : null

  return (
    <div className="relative h-full w-full overflow-hidden bg-white">
      {hasImage ? (
        <img
          alt={perfume ? `${perfume.name} de ${perfume.brand}` : ""}
          className="absolute inset-0 h-full w-full object-cover pb-[15rem] sm:pb-[8rem]"
          loading="lazy"
          src={imageUrl}
          onError={() => setFailedImageUrl(imageUrl)}
        />
      ) : perfume ? (
        <div className="absolute inset-x-0 bottom-[15rem] top-0 grid place-items-center bg-[#f5f5f2] text-slate-950 sm:bottom-[8rem]">
          <div className="absolute inset-x-8 top-8 flex items-center justify-between border-t border-slate-950/15 pt-4 text-[10px] font-semibold uppercase text-slate-500">
            <span>Éter</span>
            <span>{perfume.family ?? "Catálogo olfativo"}</span>
          </div>
          <div className="grid h-32 w-32 place-items-center border border-slate-950/15">
            <ImageOff aria-hidden="true" className="text-slate-400" size={30} />
          </div>
        </div>
      ) : null}

      <div
        className={[
          "absolute inset-x-0 bottom-0 z-10 h-[15rem] border-t border-white/10 bg-[#171914] py-5 text-white sm:h-[8rem] sm:py-4",
          isLeft
            ? "pl-6 pr-20 text-left sm:pl-10 sm:pr-32"
            : "pl-20 pr-6 text-right sm:pl-32 sm:pr-10",
        ].join(" ")}
      >
        <div
          className={[
            "flex h-full min-w-0 flex-col gap-3 sm:grid sm:items-center sm:gap-6",
            isLeft
              ? "sm:grid-cols-[minmax(0,1fr)_auto_auto]"
              : "sm:grid-cols-[auto_auto_minmax(0,1fr)]",
          ].join(" ")}
        >
          <div
            className={[
              "min-w-0",
              isLeft ? "sm:order-1" : "sm:order-3",
            ].join(" ")}
          >
            {perfume?.brand && (
              <p className="truncate text-[11px] font-semibold uppercase text-white/60">
                {perfume.brand}
              </p>
            )}

            {perfume?.name && (
              <h2
                className={`mt-1.5 line-clamp-2 font-display font-semibold leading-tight sm:line-clamp-1 ${titleSize}`}
                title={perfume.name}
              >
                {perfume.name}
              </h2>
            )}

            {profile.length > 0 ? (
              <p className="mt-1.5 truncate text-xs leading-5 text-white/60">
                {profile.join(" · ")}
              </p>
            ) : null}
          </div>

          {(priceSummary || purchaseActions) && (
            <div
              className={[
                "mt-auto flex items-end gap-4 sm:contents",
                isLeft ? "justify-between" : "flex-row-reverse justify-between",
              ].join(" ")}
            >
              {priceSummary ? (
                <div className="sm:order-2">{priceSummary}</div>
              ) : null}
              {purchaseActions ? (
                <div className={isLeft ? "sm:order-3" : "sm:order-1"}>
                  {purchaseActions}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
