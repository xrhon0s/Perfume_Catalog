import { useMemo, useRef, useState } from "react"
import logo from "../../assets/eter_no_bg_white.png"
import { useFiltersStore } from "../../store/filterStore"
import { useUIStore } from "../../store/uiStore"

const Header = () => {
  const toggleFilters = useUIStore((s) => s.toggleFilters)
  const pageIndex = useUIStore((s) => s.pageIndex)
  const totalPages = useUIStore((s) => s.totalPages)
  const requestJumpToPage = useUIStore((s) => s.requestJumpToPage)
  const query = useFiltersStore((s) => s.query)
  const setQuery = useFiltersStore((s) => s.setQuery)
  const brands = useFiltersStore((s) => s.brands)
  const families = useFiltersStore((s) => s.families)

  const [pageInput, setPageInput] = useState("")
  const inputRef = useRef<HTMLInputElement | null>(null)
  const hasPages = totalPages > 0

  const activeFiltersCount = useMemo(() => {
    const hasQuery = query.trim().length > 0 ? 1 : 0
    return brands.length + families.length + hasQuery
  }, [brands.length, families.length, query])

  const goToPage = () => {
    if (!hasPages) return

    const pageNumber = Number(pageInput)
    if (!Number.isFinite(pageNumber)) return

    const targetIndex = Math.max(0, Math.min(pageNumber - 1, totalPages - 1))
    requestJumpToPage(targetIndex)
    setPageInput("")
  }

  const clearSearch = () => {
    setQuery("")
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  return (
    <header className="sticky top-0 z-[60] w-full border-b border-white/10 bg-slate-950/88 shadow-[0_1px_0_rgba(255,255,255,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex min-h-20 w-full max-w-7xl flex-col justify-center gap-3 px-4 py-3 md:min-h-16 md:flex-row md:items-center md:gap-5 md:py-0">
        <div className="flex min-w-0 items-center justify-between gap-4 md:w-[330px] md:justify-start">
          <a className="flex min-w-0 items-center gap-3" href="#" aria-label="Éter catálogo">
            <img src={logo} alt="" className="h-9 w-auto shrink-0 object-contain" />
            <span className="min-w-0">
              <span className="block truncate text-base font-semibold leading-5 text-white md:text-lg">
                Catálogo de perfumes
              </span>
              <span className="block truncate text-xs text-white/48">
                Explora por marca, familia y notas
              </span>
            </span>
          </a>

          <button
            onClick={toggleFilters}
            className="relative shrink-0 rounded-lg border border-white/12 bg-white/[0.06] px-3 py-2 text-sm font-semibold text-white transition hover:bg-white/[0.11] active:scale-[0.98] md:hidden"
          >
            Filtros
            {activeFiltersCount > 0 && (
              <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs font-bold text-slate-950">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        <div className="relative flex-1 md:max-w-2xl">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/45">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </span>

          <input
            ref={inputRef}
            type="text"
            placeholder="Buscar perfumes, marcas, notas..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            className="h-11 w-full rounded-xl border border-white/10 bg-white/[0.07] px-10 text-sm text-white outline-none transition placeholder:text-white/38 focus:border-white/25 focus:bg-white/[0.1]"
          />

          {query.trim().length > 0 && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-lg px-2.5 py-1.5 text-sm text-white/60 transition hover:bg-white/10 hover:text-white"
              aria-label="Limpiar búsqueda"
              title="Limpiar"
            >
              ×
            </button>
          )}
        </div>

        <div className="hidden shrink-0 items-center justify-end gap-2 md:flex">
          <div className="hidden items-center gap-2 rounded-xl border border-white/10 bg-white/[0.045] px-3 py-2 lg:flex">
            <span className="whitespace-nowrap text-xs text-white/56">
              {hasPages ? (
                <>
                  Pág. <b className="font-semibold text-white/90">{pageIndex + 1}</b>{" "}
                  / {totalPages}
                </>
              ) : (
                "Pág. -"
              )}
            </span>

            <input
              value={pageInput}
              onChange={(event) => setPageInput(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") goToPage()
              }}
              placeholder="Ir a"
              disabled={!hasPages}
              className="h-8 w-16 rounded-lg border border-white/10 bg-white/[0.07] px-2 text-sm text-white outline-none transition placeholder:text-white/35 focus:border-white/25 disabled:cursor-not-allowed disabled:opacity-40"
            />

            <button
              onClick={goToPage}
              disabled={!hasPages}
              className="h-8 rounded-lg bg-white px-3 text-sm font-semibold text-slate-950 transition hover:bg-white/90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
            >
              Ir
            </button>
          </div>

          <button
            onClick={toggleFilters}
            className={[
              "relative rounded-lg border px-4 py-2.5 text-sm font-semibold transition active:scale-[0.98]",
              activeFiltersCount > 0
                ? "border-white bg-white text-slate-950"
                : "border-white/12 bg-white/[0.06] text-white hover:bg-white/[0.11]",
            ].join(" ")}
          >
            Filtros
            {activeFiltersCount > 0 && (
              <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-950 px-1 text-xs font-bold text-white">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header
