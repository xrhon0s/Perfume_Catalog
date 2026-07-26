import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react"
import HTMLFlipBook from "react-pageflip"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { Perfume } from "../../data/types"
import {
  getCatalogPageCount,
  getCatalogPageIndex,
  getLeafIndexForCatalogPage,
} from "../../features/catalog/catalogPagination"
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
  turnToPage: (pageIndex: number) => void
}

type FlipBookRef = {
  pageFlip: () => FlipBookApi
}

type FlipEvent = {
  data: number
}

export default function PerfumeFlipbook({ items, onViewPerfume }: Props) {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const bookRef = useRef<FlipBookRef | null>(null)
  const setPageIndexGlobal = useUIStore((s) => s.setPageIndex)
  const setTotalPages = useUIStore((s) => s.setTotalPages)
  const jumpToPageRequest = useUIStore((s) => s.jumpToPageRequest)
  const consumeJumpToPage = useUIStore((s) => s.consumeJumpToPage)
  const [pageIndex, setPageIndex] = useState(0)
  const [pageWidth, setPageWidth] = useState(730)

  const pages = useMemo(() => {
    return items.length % 2 === 0
      ? (items as Array<Perfume | null>)
      : [...items, null]
  }, [items])
  const totalCatalogPages = getCatalogPageCount(items.length)

  useEffect(() => {
    setTotalPages(totalCatalogPages)
    return () => setTotalPages(0)
  }, [setTotalPages, totalCatalogPages])

  useEffect(() => {
    if (jumpToPageRequest === null) return

    const api = bookRef.current?.pageFlip()
    if (!api) return

    const target = getLeafIndexForCatalogPage(
      jumpToPageRequest,
      items.length,
    )

    api.turnToPage(target)
    consumeJumpToPage()
  }, [jumpToPageRequest, consumeJumpToPage, items.length])

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

  useLayoutEffect(() => {
    const host = hostRef.current
    if (!host || typeof ResizeObserver === "undefined") return

    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect
      if (width < 640 || height <= 0) return

      const nextPageWidth = Math.round((width * 400) / height)
      setPageWidth((current) =>
        current === nextPageWidth ? current : nextPageWidth,
      )
    })

    observer.observe(host)
    return () => observer.disconnect()
  }, [])

  const visiblePageIndex = Math.min(pageIndex, Math.max(0, pages.length - 1))
  const canGoBack = visiblePageIndex > 0
  const canGoForward = visiblePageIndex < items.length - 1
  const visiblePerfumePosition = Math.min(visiblePageIndex + 1, items.length)

  return (
    <div
      ref={hostRef}
      className="catalog-flipbook-surface relative h-full w-full"
    >
      <nav
        aria-label="Navegación del catálogo"
        className="absolute bottom-3 left-1/2 z-[80] flex -translate-x-1/2 items-center gap-1 rounded-md border border-white/15 bg-[#161814]/95 p-1 text-white shadow-lg backdrop-blur"
      >
        <button
          aria-label="Perfume anterior"
          className="grid h-10 w-10 place-items-center rounded text-white/80 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          disabled={!canGoBack}
          title="Anterior"
          type="button"
          onClick={() => bookRef.current?.pageFlip()?.flipPrev()}
        >
          <ChevronLeft aria-hidden="true" size={19} />
        </button>
        <div
          aria-live="polite"
          className="min-w-[112px] px-2 text-center"
        >
          <p className="text-xs font-semibold">
            {visiblePerfumePosition} de {items.length}
          </p>
          <p className="text-[10px] text-white/50">perfumes</p>
        </div>
        <button
          aria-label="Perfume siguiente"
          className="grid h-10 w-10 place-items-center rounded text-white/80 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
          disabled={!canGoForward}
          title="Siguiente"
          type="button"
          onClick={() => bookRef.current?.pageFlip()?.flipNext()}
        >
          <ChevronRight aria-hidden="true" size={19} />
        </button>
      </nav>

      <div className="flex h-full w-full items-center justify-center">
        <HTMLFlipBook
          key={pageWidth}
          ref={bookRef}
          className="h-full w-full shadow-2xl"
          style={{}}
          width={pageWidth}
          height={800}
          startPage={pageIndex}
          size="stretch"
          minWidth={320}
          maxWidth={1400}
          minHeight={420}
          maxHeight={900}
          drawShadow={true}
          flippingTime={360}
          usePortrait={true}
          startZIndex={0}
          autoSize={false}
          maxShadowOpacity={0.28}
          showCover={false}
          mobileScrollSupport={true}
          clickEventForward={true}
          useMouseEvents={true}
          swipeDistance={30}
          onFlip={(e: FlipEvent) => {
            setPageIndex(e.data)
            setPageIndexGlobal(getCatalogPageIndex(e.data))
          }}
          showPageCorners={false}
          disableFlipByClick={false}
        >
          {pages.map((p, idx) => (
            <div
              key={idx}
              className="absolute h-full w-full overflow-hidden bg-white"
            >
              <div className="relative h-full w-full">
                {p ? (
                  <MagazinePage
                    side={idx % 2 === 0 ? "left" : "right"}
                    perfume={p}
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
