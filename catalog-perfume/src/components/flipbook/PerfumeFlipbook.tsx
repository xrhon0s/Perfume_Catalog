import { useEffect, useMemo, useRef, useState } from "react"
import HTMLFlipBook from "react-pageflip"
import type { Perfume } from "../../data/types"
import MagazinePage from "../magazine/MagazinePage"
import { useUIStore } from "../../store/uiStore"



type Props = {
  items: Perfume[]
  onViewPerfume: (perfume: Perfume) => void
}

export default function PerfumeFlipbook({ items, onViewPerfume }: Props) {
  // Referencia al flipbook (necesaria para next/prev)
  const bookRef = useRef<any>(null)
  const isFilterOpen = useUIStore((s) => s.isFilterOpen)
  const setPageIndexGlobal = useUIStore((s) => s.setPageIndex)
const setTotalPages = useUIStore((s) => s.setTotalPages)

const jumpToPageRequest = useUIStore((s) => s.jumpToPageRequest)
const consumeJumpToPage = useUIStore((s) => s.consumeJumpToPage)
  // Lista de páginas: si es impar, agregamos una vacía al final
  const pages = useMemo(() => {
    return items.length % 2 === 0 ? (items as Array<Perfume | null>) : [...items, null]
  }, [items])

  useEffect(() => {
  setTotalPages(pages.length)
}, [pages.length, setTotalPages])

useEffect(() => {
  if (jumpToPageRequest === null) return

  const api = bookRef.current?.pageFlip?.()
  if (!api) return

  // clamp para que no se salga del rango
  const maxIndex = pages.length - 1
  const target = Math.max(0, Math.min(jumpToPageRequest, maxIndex))

  api.flip(target)
  consumeJumpToPage()
}, [jumpToPageRequest, consumeJumpToPage, pages.length])



  const [pageIndex, setPageIndex] = useState(0)





  // Flechas del teclado
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
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


  return (
    <div className="relative h-full w-full">
      {/* Botones */}
      <div className="absolute left-4 top-4 z-[80] hidden gap-2 md:flex">

        <button
          onClick={() => bookRef.current?.pageFlip()?.flipPrev()}
          className="rounded-xl bg-black/40 backdrop-blur px-3 py-2 text-xs text-white"

        >
          ← Anterior
        </button>

        <button
          onClick={() => bookRef.current?.pageFlip()?.flipNext()}
          className="rounded-xl bg-black/40 backdrop-blur px-3 py-2 text-xs text-white"

        >
          Siguiente →
        </button>
      </div>

      {/* Indicador página */}
      {!isFilterOpen && (
  <div className="absolute right-6 top-6 z-[80] rounded-lg bg-black/50 px-3 py-2 text-xs text-white">
      Página {pageIndex + 1}
    </div>
  )}


      {/* Flipbook */}
      <div className="h-full w-full flex items-center justify-center">
        <HTMLFlipBook
          ref={bookRef}
          width={600}
          height={800}
          size="stretch"
          minWidth={320}
          maxWidth={1400}
          minHeight={420}
          maxHeight={900}
          flippingTime={100}
          maxShadowOpacity={0.15}
          showCover={false}
          mobileScrollSupport={true}
          onFlip={(e: any) => {
            setPageIndex(e.data)
            setPageIndexGlobal(e.data)
          }}
          showPageCorners={false}
          //disableFlipByClick={true}


        >
          {pages.map((p, idx) => (
            <div key={idx} className="h-full w-full bg-white relative overflow-hidden">
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
