import { useMemo, useRef, useState } from "react"
import { useUIStore } from "../../store/uiStore"
import logo from "../../assets/eter_no_bg_white.png"
import { useFiltersStore } from "../../store/filterStore"

const Header = () => {
  const toggleFilters = useUIStore((s) => s.toggleFilters)

  const pageIndex = useUIStore((s) => s.pageIndex)
  const totalPages = useUIStore((s) => s.totalPages)
  const requestJumpToPage = useUIStore((s) => s.requestJumpToPage)

  const [pageInput, setPageInput] = useState("")


  const query = useFiltersStore((s) => s.query)
  const setQuery = useFiltersStore((s) => s.setQuery)
  const brands = useFiltersStore((s) => s.brands)
  const families = useFiltersStore((s) => s.families)

  const inputRef = useRef<HTMLInputElement | null>(null)

  const activeFiltersCount = useMemo(() => {
    const q = query.trim().length > 0 ? 1 : 0
    return brands.length + families.length + q
  }, [brands.length, families.length, query])

  const goToPage = () => {
    if (!totalPages) return

    const n = Number(pageInput)
    if (!Number.isFinite(n)) return

    const targetIndex = n - 1

    const safeIndex = Math.max(0, Math.min(targetIndex, totalPages - 1))

    requestJumpToPage(safeIndex)
    setPageInput("")
  }


  return (
    <header className="sticky top-0 z-[60] w-full border-b border-white/10 bg-gradient-to-b from-slate-950/80 to-slate-950/50 backdrop-blur-md">
      <div className="mx-auto w-full max-w-7xl px-3 py-2 md:px-4 md:py-0">
        {/* =========================
            MOBILE (<= md)
            Fila 1: Marca + Botón filtros
            Fila 2: Buscador
           ========================= */}
        <div className="md:hidden">
          {/* Fila 1 */}
          <div className="flex items-center justify-between gap-3">
            {/* Marca */}
            <div className="flex items-center gap-3 md:gap-4">
              <img src={logo} alt="Éter" className="h-12 w-auto object-contain" />

              {/* Textos: los dejamos, pero discretos para móvil */}
              <div className="flex flex-col leading-none">
                <span className="text-sm font-semibold text-white/90">
                  Catálogo de perfumes
                </span>
                <span className="text-[11px] text-white/50">
                  Explora por marca, familia y notas
                </span>
              </div>
            </div>

            {/* Filtros */}
            <button
              onClick={toggleFilters}
              className="relative shrink-0 rounded-2xl bg-white/8 px-4 py-2 text-sm font-semibold text-white ring-1 ring-white/10 hover:bg-white/15 active:scale-[0.98] transition"
            >
              Filtros
              {activeFiltersCount > 0 && (
                <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs font-bold text-slate-900">
                  {activeFiltersCount}
                </span>
              )}
            </button>
          </div>

          {/* Fila 2 (buscador) */}
          <div className="mt-3">
            <div className="relative w-full">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
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
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-2xl bg-white/10 px-10 py-2.5 text-sm text-white placeholder:text-white/50 outline-none ring-1 ring-white/10 focus:bg-white/15 focus:ring-2 focus:ring-white/30"
              />

              {query.trim().length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery("")
                    requestAnimationFrame(() => inputRef.current?.focus())
                  }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-3 py-2 text-white/70 hover:bg-white/10 hover:text-white"
                  aria-label="Limpiar búsqueda"
                  title="Limpiar"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

      {/* =========================
    DESKTOP (md+)
    Izq: Marca | Centro: Buscador | Der: Páginas + Ir + Filtros
   ========================= */}
<div className="hidden md:grid md:h-16 md:grid-cols-[340px_1fr_auto] md:items-center md:gap-4">
  {/* IZQUIERDA: Marca (más a la izquierda) */}
  <div className="flex items-center gap-4">
    <img src={logo} alt="Éter" className="h-12 w-auto object-contain" />

    <div className="flex flex-col leading-none">
      <span className="text-lg font-semibold text-white/90">
        Catálogo de perfumes
      </span>
      <span className="text-xs text-white/50">
        Explora por marca, familia y notas
      </span>
    </div>
  </div>

  {/* CENTRO: Buscador (centrado de verdad) */}
  <div className="flex justify-center">
    <div className="relative w-full max-w-xl">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-white/60">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
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
        onChange={(e) => setQuery(e.target.value)}
        className="w-full rounded-2xl bg-white/10 px-10 py-2.5 text-sm text-white placeholder:text-white/50 outline-none ring-1 ring-white/10 focus:bg-white/15 focus:ring-2 focus:ring-white/30"
      />

      {query.trim().length > 0 && (
        <button
          type="button"
          onClick={() => {
            setQuery("")
            requestAnimationFrame(() => inputRef.current?.focus())
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl px-3 py-2 text-white/70 hover:bg-white/10 hover:text-white"
          aria-label="Limpiar búsqueda"
          title="Limpiar"
        >
          ✕
        </button>
      )}
    </div>
  </div>

  {/* DERECHA: Páginas + Ir + Filtros */}
  <div className="flex items-center justify-end gap-3">
    {/* Páginas */}
    <div className="hidden lg:flex items-center gap-2 rounded-2xl bg-white/5 px-3 py-2 ring-1 ring-white/10">
      <span className="text-xs text-white/70">
        Pág. <b className="text-white/90">{pageIndex + 1}</b> / {totalPages}
      </span>

      <input
        value={pageInput}
        onChange={(e) => setPageInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") goToPage()
        }}
        placeholder="Ir a..."
        className="w-20 rounded-xl bg-white/10 px-3 py-1.5 text-sm text-white placeholder:text-white/40 outline-none ring-1 ring-white/10 focus:ring-2 focus:ring-white/30"
      />

      <button
        onClick={goToPage}
        className="rounded-xl bg-white/10 px-3 py-1.5 text-sm font-semibold text-white ring-1 ring-white/10 hover:bg-white/15 active:scale-[0.98] transition"
      >
        Ir
      </button>
    </div>

    {/* Filtros */}
    <button
      onClick={toggleFilters}
      className="relative rounded-2xl bg-white/8 px-4 py-2.5 text-sm font-semibold text-white ring-1 ring-white/10 hover:bg-white/15 active:scale-[0.98] transition"
    >
      Filtros
      {activeFiltersCount > 0 && (
        <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1 text-xs font-bold text-slate-900">
          {activeFiltersCount}
        </span>
      )}
    </button>
  </div>
</div>

      </div>
    </header>
  )
}

export default Header
