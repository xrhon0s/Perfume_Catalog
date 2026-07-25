import { useMemo, useRef, useState } from "react"
import {
  ArrowRight,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react"
import logo from "../../assets/eter_wordmark_white.webp"
import { useFiltersStore } from "../../store/filterStore"
import { useUIStore } from "../../store/uiStore"

export default function Header() {
  const toggleFilters = useUIStore((state) => state.toggleFilters)
  const pageIndex = useUIStore((state) => state.pageIndex)
  const totalPages = useUIStore((state) => state.totalPages)
  const requestJumpToPage = useUIStore((state) => state.requestJumpToPage)
  const query = useFiltersStore((state) => state.query)
  const setQuery = useFiltersStore((state) => state.setQuery)
  const brands = useFiltersStore((state) => state.brands)
  const families = useFiltersStore((state) => state.families)
  const [pageInput, setPageInput] = useState("")
  const searchInputRef = useRef<HTMLInputElement | null>(null)
  const hasPages = totalPages > 0

  const activeFiltersCount = useMemo(
    () => brands.length + families.length,
    [brands.length, families.length],
  )
  const parsedPage = Number(pageInput)
  const canJump =
    hasPages && pageInput.trim() !== "" && Number.isInteger(parsedPage)

  const goToPage = () => {
    if (!canJump) return

    requestJumpToPage(
      Math.max(0, Math.min(parsedPage - 1, totalPages - 1)),
    )
    setPageInput("")
  }

  return (
    <header className="relative z-[60] shrink-0 border-b border-white/10 bg-[#161814] text-white shadow-[0_1px_0_rgba(0,0,0,0.25)]">
      <div className="flex w-full flex-col gap-3 px-4 py-3 md:h-[76px] md:flex-row md:items-center md:gap-5 md:px-7 md:py-0 xl:px-12 2xl:px-20">
        <div className="flex min-w-0 items-center justify-between gap-4 md:w-[220px] md:shrink-0 xl:w-[280px]">
          <a
            aria-label="Éter, catálogo de perfumes"
            className="flex min-w-0 items-center gap-4"
            href="#/"
          >
            <img
              alt="Éter"
              className="h-auto w-[104px] shrink-0 md:w-[112px]"
              src={logo}
            />
            <span
              aria-hidden="true"
              className="hidden h-6 w-px bg-white/15 xl:block"
            />
            <span className="hidden truncate text-xs font-medium text-white/50 xl:block">
              Catálogo olfativo
            </span>
          </a>

          <button
            aria-label="Abrir filtros"
            className="relative grid h-10 w-10 shrink-0 place-items-center rounded-md border border-white/15 text-white transition hover:bg-white/10 md:hidden"
            title="Filtros"
            type="button"
            onClick={toggleFilters}
          >
            <SlidersHorizontal aria-hidden="true" size={18} />
            {activeFiltersCount > 0 ? (
              <span className="absolute -right-1.5 -top-1.5 grid h-5 min-w-5 place-items-center rounded-full bg-[#a43b56] px-1 text-[10px] font-bold text-white">
                {activeFiltersCount}
              </span>
            ) : null}
          </button>
        </div>

        <div className="relative min-w-0 flex-1">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40"
            size={18}
          />
          <input
            ref={searchInputRef}
            aria-label="Buscar en el catálogo"
            className="h-11 w-full rounded-md border border-white/10 bg-white/[0.07] px-11 pr-10 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-white/35 focus:bg-white/10"
            placeholder="Perfume, marca, familia o nota"
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          {query ? (
            <button
              aria-label="Limpiar búsqueda"
              className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-md text-white/50 transition hover:bg-white/10 hover:text-white"
              title="Limpiar búsqueda"
              type="button"
              onClick={() => {
                setQuery("")
                requestAnimationFrame(() => searchInputRef.current?.focus())
              }}
            >
              <X aria-hidden="true" size={16} />
            </button>
          ) : null}
        </div>

        <div className="hidden shrink-0 items-center gap-2 lg:flex">
          <div className="flex h-11 items-center rounded-md border border-white/10 bg-white/[0.04]">
            <span className="whitespace-nowrap px-3 text-xs text-white/55">
              {hasPages ? (
                <>
                  Página{" "}
                  <strong className="font-semibold text-white">
                    {pageIndex + 1}
                  </strong>{" "}
                  de {totalPages}
                </>
              ) : (
                "Sin páginas"
              )}
            </span>
            <span className="h-5 w-px bg-white/10" />
            <input
              aria-label="Número de página"
              className="h-9 w-[68px] bg-transparent px-2 text-center text-sm text-white outline-none placeholder:text-white/35 disabled:opacity-40"
              disabled={!hasPages}
              inputMode="numeric"
              placeholder="Ir a..."
              value={pageInput}
              onChange={(event) => {
                if (/^\d*$/.test(event.target.value)) {
                  setPageInput(event.target.value)
                }
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") goToPage()
              }}
            />
            <button
              aria-label="Ir a la página"
              className="mr-1 grid h-8 w-8 place-items-center rounded-md bg-white text-[#161814] transition hover:bg-[#e5e7e2] disabled:cursor-not-allowed disabled:opacity-35"
              disabled={!canJump}
              title="Ir a la página"
              type="button"
              onClick={goToPage}
            >
              <ArrowRight aria-hidden="true" size={16} />
            </button>
          </div>

          <button
            className={[
              "relative flex h-11 items-center gap-2 rounded-md border px-3.5 text-sm font-semibold transition",
              activeFiltersCount > 0
                ? "border-white bg-white text-[#161814]"
                : "border-white/15 text-white hover:bg-white/10",
            ].join(" ")}
            type="button"
            onClick={toggleFilters}
          >
            <SlidersHorizontal aria-hidden="true" size={17} />
            <span>Filtros</span>
            {activeFiltersCount > 0 ? (
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-[#a43b56] px-1 text-[10px] font-bold text-white">
                {activeFiltersCount}
              </span>
            ) : null}
          </button>
        </div>
      </div>
    </header>
  )
}
