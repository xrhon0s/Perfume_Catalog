import type { Perfume } from "../../data/types"

type MagazinePageProps = {
  side: "left" | "right"
  perfume?: Perfume
  onView?: () => void
}

const familyThemes: Record<string, { bg: string; accent: string; text: string }> = {
  Cítrico: {
    bg: "from-lime-100 via-white to-sky-100",
    accent: "bg-lime-500",
    text: "text-lime-950",
  },
  Floral: {
    bg: "from-rose-100 via-white to-emerald-100",
    accent: "bg-rose-500",
    text: "text-rose-950",
  },
  Amaderado: {
    bg: "from-stone-200 via-white to-emerald-100",
    accent: "bg-stone-700",
    text: "text-stone-950",
  },
  Oriental: {
    bg: "from-red-100 via-white to-amber-100",
    accent: "bg-red-700",
    text: "text-red-950",
  },
  Aromático: {
    bg: "from-teal-100 via-white to-slate-200",
    accent: "bg-teal-600",
    text: "text-teal-950",
  },
  Fougère: {
    bg: "from-green-100 via-white to-slate-200",
    accent: "bg-green-700",
    text: "text-green-950",
  },
  Gourmand: {
    bg: "from-amber-100 via-white to-pink-100",
    accent: "bg-amber-600",
    text: "text-amber-950",
  },
  Acuático: {
    bg: "from-cyan-100 via-white to-blue-100",
    accent: "bg-cyan-600",
    text: "text-cyan-950",
  },
  Chipre: {
    bg: "from-emerald-100 via-white to-stone-200",
    accent: "bg-emerald-700",
    text: "text-emerald-950",
  },
  Cuero: {
    bg: "from-zinc-200 via-white to-orange-100",
    accent: "bg-zinc-800",
    text: "text-zinc-950",
  },
  Ámbar: {
    bg: "from-orange-100 via-white to-yellow-100",
    accent: "bg-orange-600",
    text: "text-orange-950",
  },
  Frutal: {
    bg: "from-fuchsia-100 via-white to-lime-100",
    accent: "bg-fuchsia-600",
    text: "text-fuchsia-950",
  },
  Especiado: {
    bg: "from-red-100 via-white to-stone-200",
    accent: "bg-red-800",
    text: "text-red-950",
  },
}

const fallbackTheme = {
  bg: "from-slate-200 via-white to-zinc-100",
  accent: "bg-slate-900",
  text: "text-slate-950",
}

export default function MagazinePage({
  side,
  perfume,
  onView,
}: MagazinePageProps) {
  const isLeft = side === "left"
  const theme = perfume?.family
    ? familyThemes[perfume.family] ?? fallbackTheme
    : fallbackTheme
  const notes = [
    ...(perfume?.notes?.top ?? []),
    ...(perfume?.notes?.heart ?? []),
    ...(perfume?.notes?.base ?? []),
  ].slice(0, 4)
  const profile = [
    perfume?.family,
    perfume?.concentration,
    perfume?.gender,
    perfume?.year,
  ].filter(Boolean)

  return (
    <div
      className={[
        "relative h-full w-full overflow-hidden",
        `bg-gradient-to-br ${theme.bg}`,
      ].join(" ")}
    >
      {perfume?.image ? (
        <>
          <div className="absolute inset-x-8 top-8 h-px bg-slate-950/15" />
          <div className="absolute inset-x-8 bottom-8 h-px bg-slate-950/15" />
          <div
            className={[
              "absolute top-8 h-[calc(100%-4rem)] w-2",
              theme.accent,
              isLeft ? "right-8" : "left-8",
            ].join(" ")}
          />
          <div className="absolute inset-0 flex items-center justify-center px-12 pb-32 pt-20">
            <img
              src={perfume.image}
              alt={perfume.name}
              className="max-h-full max-w-[82%] object-contain drop-shadow-2xl"
              loading="lazy"
            />
          </div>
        </>
      ) : (
        <>
          <div className="absolute inset-x-8 top-8 h-px bg-slate-950/15" />
          <div className="absolute inset-x-8 bottom-8 h-px bg-slate-950/15" />
          <div
            className={[
              "absolute top-8 h-[calc(100%-4rem)] w-2",
              theme.accent,
              isLeft ? "right-8" : "left-8",
            ].join(" ")}
          />
          <div className="absolute -bottom-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full border border-slate-950/10" />
        </>
      )}

      <div
        className={[
          "absolute inset-x-0 z-10",
          perfume?.image ? "bottom-10 sm:bottom-12" : "bottom-10 sm:bottom-16",
          isLeft
            ? "pl-6 pr-16 text-left sm:pl-10 sm:pr-24"
            : "pl-16 pr-6 text-right sm:pl-24 sm:pr-10",
        ].join(" ")}
      >
        <div
          className={[
            "inline-block max-w-[78%]",
            theme.text,
          ].join(" ")}
        >
          {perfume?.brand && (
            <p className="text-sm font-semibold uppercase">
              {perfume.brand}
            </p>
          )}

          {perfume?.name && (
            <h2 className="mt-2 text-4xl font-semibold leading-tight sm:text-5xl">
              {perfume.name}
            </h2>
          )}

          {profile.length > 0 && (
            <p
              className={[
                "mt-4 text-sm leading-6",
                "text-slate-700",
              ].join(" ")}
            >
              {profile.join(" · ")}
            </p>
          )}

          {!perfume?.image && notes.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {notes.map((note) => (
                <span
                  key={note}
                  className="rounded-full border border-slate-950/15 bg-white/50 px-3 py-1 text-xs font-medium text-slate-800"
                >
                  {note}
                </span>
              ))}
            </div>
          )}

        </div>
      </div>

      {onView && (
        <div
          className={[
            "absolute top-10 z-20",
            isLeft ? "left-10" : "right-10",
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
            className="rounded-lg bg-slate-950 px-5 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-slate-800"
          >
            Ver detalle
          </button>
        </div>
      )}
    </div>
  )
}
