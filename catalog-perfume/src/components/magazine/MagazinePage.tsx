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
      ? "text-2xl sm:text-3xl"
      : titleLength > 22
        ? "text-3xl sm:text-4xl"
        : "text-4xl"

  return (
    <div className="relative h-full w-full overflow-hidden bg-white">
      {hasImage ? (
        <img
          alt={perfume ? `${perfume.name} de ${perfume.brand}` : ""}
          className="absolute inset-0 h-full w-full object-contain p-5 pb-[15rem] sm:p-8 sm:pb-[17rem]"
          loading="lazy"
          src={imageUrl}
          onError={() => setFailedImageUrl(imageUrl)}
        />
      ) : perfume ? (
        <div className="absolute inset-x-0 bottom-[15rem] top-0 grid place-items-center bg-[#f5f5f2] text-slate-950 sm:bottom-[17rem]">
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
          "absolute inset-x-0 bottom-0 z-10 min-h-[15rem] border-t border-white/10 bg-[#171914] pb-20 pt-5 text-white sm:min-h-[17rem] sm:pt-6",
          isLeft
            ? "pl-6 pr-12 text-left sm:pl-10 sm:pr-20"
            : "pl-12 pr-6 text-right sm:pl-20 sm:pr-10",
        ].join(" ")}
      >
        <div className="inline-block max-w-[92%]">
          {perfume?.brand && (
            <p className="text-[11px] font-semibold uppercase text-white/60">
              {perfume.brand}
            </p>
          )}

          {perfume?.name && (
            <h2
              className={`mt-2 font-display font-semibold leading-tight ${titleSize}`}
            >
              {perfume.name}
            </h2>
          )}

          {profile.length > 0 ? (
            <p className="mt-2 text-xs leading-5 text-white/60">
              {profile.join(" · ")}
            </p>
          ) : null}

          {perfume?.inventory ? (
            <div
              className={[
                "mt-2 flex flex-wrap items-center gap-x-3 gap-y-1",
                isLeft ? "justify-start" : "justify-end",
              ].join(" ")}
            >
              <span className="text-lg font-semibold">
                {formatCatalogPrice(perfume.inventory.salePrice)}
              </span>
              <span
                className={[
                  "text-xs font-semibold",
                  perfume.inventory.stockQuantity > 0
                    ? "text-emerald-300"
                    : "text-red-300",
                ].join(" ")}
              >
                {perfume.inventory.stockQuantity > 0
                  ? `${perfume.inventory.stockQuantity} disponibles`
                  : "Agotado"}
              </span>
            </div>
          ) : null}

          {onView && perfume && (
            <div
              className="mt-4 inline-block"
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
          )}
        </div>
      </div>
    </div>
  )
}
