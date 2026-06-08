import { useEffect, useMemo, useRef, useState } from "react"
import HTMLFlipBook from "react-pageflip"
import type { Perfume } from "../../data/types"
import MagazinePage from "../magazine/MagazinePage"
import { useUIStore } from "../../store/uiStore"

type Props = {
  items: Perfume[]
  onViewPerfume: (perfume: Perfume) => void
}

type FlipBookApi = {
  flip: (pageIndex: number) => void
  flipNext: () => void
  flipPrev: () => void
}

type FlipBookRef = {
  pageFlip: () => FlipBookApi
}

type FlipEvent = {
  data: number
}

export default function PerfumeFlipbook({ items, onViewPerfume }: Props) {
  const bookRef = useRef<FlipBookRef | null>(null)
  const isDev = import.meta.env.DEV
  const isFilterOpen = useUIStore((s) => s.isFilterOpen)
  const setPageIndexGlobal = useUIStore((s) => s.setPageIndex)
  const setTotalPages = useUIStore((s) => s.setTotalPages)
  const jumpToPageRequest = useUIStore((s) => s.jumpToPageRequest)
  const consumeJumpToPage = useUIStore((s) => s.consumeJumpToPage)
  const [pageIndex, setPageIndex] = useState(0)
  const [flipDuration, setFlipDuration] = useState(360)

  const pages = useMemo(() => {
    return items.length % 2 === 0
      ? (items as Array<Perfume | null>)
      : [...items, null]
  }, [items])

  useEffect(() => {
    setTotalPages(pages.length)
  }, [pages.length, setTotalPages])

  useEffect(() => {
    if (jumpToPageRequest === null) return

    const api = bookRef.current?.pageFlip()
    if (!api) return

    const maxIndex = pages.length - 1
    const target = Math.max(0, Math.min(jumpToPageRequest, maxIndex))

    api.flip(target)
    consumeJumpToPage()
  }, [jumpToPageRequest, consumeJumpToPage, pages.length])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target
      const isTyping =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement ||
        target instanceof HTMLButtonElement ||
        (target instanceof HTMLElement && target.isContentEditable)

      if (isTyping) return

      if (e.key === "ArrowRight") {
        bookRef.current?.pageFlip()?.flipNext()
      }
      if (e.key === "ArrowLeft") {
        bookRef.current?.pageFlip()?.flipPrev()
      }
    }

    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [])

  const visiblePageIndex = Math.min(pageIndex, Math.max(0, pages.length - 1))

  return (
    <div className="relative h-full w-full">
      <div className="absolute left-4 top-4 z-[80] hidden gap-2 md:flex">
        <button
          onClick={() => bookRef.current?.pageFlip()?.flipPrev()}
          className="rounded-xl bg-black/40 px-3 py-2 text-xs text-white backdrop-blur"
        >
          ← Anterior
        </button>

        <button
          onClick={() => bookRef.current?.pageFlip()?.flipNext()}
          className="rounded-xl bg-black/40 px-3 py-2 text-xs text-white backdrop-blur"
        >
          Siguiente →
        </button>
      </div>

      {isDev && (
        <div className="absolute left-4 top-16 z-[80] hidden items-center gap-2 rounded-xl bg-black/40 px-3 py-2 text-xs text-white backdrop-blur md:flex">
          <span className="text-white/70">Flip</span>
          {[260, 320, 360, 420].map((duration) => (
            <button
              key={duration}
              className={[
                "rounded-lg px-2 py-1 font-semibold transition",
                flipDuration === duration
                  ? "bg-white text-slate-950"
                  : "bg-white/10 text-white hover:bg-white/20",
              ].join(" ")}
              onClick={() => setFlipDuration(duration)}
            >
              {duration}
            </button>
          ))}
        </div>
      )}

      {!isFilterOpen && (
        <div className="absolute right-6 top-6 z-[80] rounded-lg bg-black/50 px-3 py-2 text-xs text-white">
          Página {visiblePageIndex + 1}
        </div>
      )}

      <div className="flex h-full w-full items-center justify-center">
        <HTMLFlipBook
          key={flipDuration}
          ref={bookRef}
          className="shadow-2xl"
          style={{}}
          width={600}
          height={800}
          startPage={0}
          size="stretch"
          minWidth={320}
          maxWidth={1400}
          minHeight={420}
          maxHeight={900}
          drawShadow={true}
          flippingTime={flipDuration}
          usePortrait={true}
          startZIndex={0}
          autoSize={true}
          maxShadowOpacity={0.28}
          showCover={false}
          mobileScrollSupport={true}
          clickEventForward={true}
          useMouseEvents={true}
          swipeDistance={30}
          onFlip={(e: FlipEvent) => {
            setPageIndex(e.data)
            setPageIndexGlobal(e.data)
          }}
          showPageCorners={false}
          disableFlipByClick={false}
        >
          {pages.map((p, idx) => (
            <div key={idx} className="relative h-full w-full overflow-hidden bg-white">
              <div className="relative h-full w-full">
                {p ? (
                  <MagazinePage
                    side={idx % 2 === 0 ? "left" : "right"}
                    title={p.name}
                    subtitle={p.brand}
                    imageUrl={p.image}
                    onView={() => onViewPerfume(p)}
                  />
                ) : (
                  <MagazinePage side={idx % 2 === 0 ? "left" : "right"} />
                )}
              </div>
            </div>
          ))}
        </HTMLFlipBook>
      </div>
    </div>
  )
}
