import { useState } from "react"
import { ArrowUpRight, ImageOff } from "lucide-react"
import type { Perfume } from "../../data/types"
import {
  formatCatalogPrice,
  formatPerfumeSize,
} from "../../shared/utils/catalogFormatting"

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

  const inventorySummary = inventory ? (
    <div
      className={[
        "flex flex-wrap items-center gap-x-3 gap-y-1",
        isLeft ? "justify-start" : "justify-end",
        "order-1 sm:order-2",
      ].join(" ")}
    >
      <span className="text-lg font-semibold">
        {formatCatalogPrice(inventory.salePrice)}
      </span>
      <span
        className={[
          "text-xs font-semibold",
          inventory.stockQuantity > 0
            ? "text-emerald-300"
            : "text-red-300",
        ].join(" ")}
      >
        {inventory.stockQuantity > 0
          ? `${inventory.stockQuantity} disponibles`
          : "Agotado"}
      </span>
    </div>
  ) : null

  const detailAction =
    onView && perfume ? (
      <div
        className={[
          "order-2 shrink-0",
          isLeft ? "sm:order-3" : "sm:order-1",
          !isLeft && !inventory ? "sm:ml-auto" : "",
        ].join(" ")}
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
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onView()
          }}
          className="inline-flex h-10 items-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-slate-950 shadow-sm transition hover:bg-slate-100"
        >
          Ver detalles
          <ArrowUpRight aria-hidden="true" size={16} />
        </button>
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
        <div className="flex h-full min-w-0 flex-col sm:flex-row sm:items-center sm:justify-between sm:gap-5">
          <div
            className={[
              "min-w-0 sm:flex-1",
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

          {(inventorySummary || detailAction) && (
            <div
              className={[
                "mt-auto flex flex-col gap-3 pt-3 sm:contents",
                isLeft ? "items-start" : "items-end",
              ].join(" ")}
            >
              {inventorySummary}
              {detailAction}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
