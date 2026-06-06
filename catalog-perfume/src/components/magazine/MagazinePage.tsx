type MagazinePageProps = {
  side: "left" | "right"
  title?: string
  subtitle?: string
  imageUrl?: string
  onView?: () => void
}

export default function MagazinePage({
  side,
  title,
  subtitle,
  imageUrl,
  onView,
}: MagazinePageProps) {
  const isLeft = side === "left"

  return (
    <div
      className="relative h-full w-full overflow-hidden bg-gray-200 bg-cover bg-center"
      style={{
        ...(imageUrl ? { backgroundImage: `url(${imageUrl})` } : {}),
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

      <div
        className={[
          "absolute inset-x-0 z-10",
          "bottom-10 sm:bottom-28 md:bottom-32",
          isLeft
            ? "pl-6 pr-16 text-left sm:pl-10 sm:pr-24"
            : "pl-16 pr-6 text-right sm:pl-24 sm:pr-10",
        ].join(" ")}
      >
        <div className="inline-block max-w-[70%] text-white">
          {subtitle && (
            <p className="text-base font-medium opacity-95 drop-shadow">
              {subtitle}
            </p>
          )}

          {title && (
            <h2 className="mt-1 text-5xl font-semibold leading-tight drop-shadow">
              {title}
            </h2>
          )}

          {onView && (
            <div
              className="mt-6 inline-block"
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
                className="rounded-xl bg-white px-8 py-3 text-sm font-semibold text-black shadow hover:bg-gray-100"
              >
                Ver más
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
