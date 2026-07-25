import { useEffect, useMemo, useState } from "react"
import type { Perfume } from "../data/types"
import { filterCatalogPerfumes } from "../features/catalog/filterCatalogPerfumes"
import { useFiltersStore } from "../store/filterStore"
import PerfumeFlipbook from "../components/flipbook/PerfumeFlipbook"
import PerfumeDetailModal from "../components/perfumes/PerfumeDetailModal"
import { useCatalogStore } from "../store/catalogStore"

export default function Catalog() {
  const perfumes = useCatalogStore((s) => s.perfumes)
  const isLoading = useCatalogStore((s) => s.isLoading)
  const error = useCatalogStore((s) => s.error)
  const loadPerfumes = useCatalogStore((s) => s.loadPerfumes)
  const selectedBrands = useFiltersStore((s) => s.brands)
  const selectedFamilies = useFiltersStore((s) => s.families)
  const query = useFiltersStore((s) => s.query)
  const clearFilters = useFiltersStore((s) => s.clearFilters)
  const [selectedPerfume, setSelectedPerfume] = useState<Perfume | null>(null)

  useEffect(() => {
    void loadPerfumes()
  }, [loadPerfumes])

  const filtered = useMemo(() => {
    return filterCatalogPerfumes(perfumes, {
      query,
      brands: selectedBrands,
      families: selectedFamilies,
    })
  }, [perfumes, query, selectedBrands, selectedFamilies])

  const isInitialLoading = isLoading && perfumes.length === 0
  const hasBlockingError = Boolean(error) && perfumes.length === 0

  return (
    <main className="h-full w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {(isLoading || (error && perfumes.length > 0)) && (
        <div
          aria-live="polite"
          className="absolute left-1/2 top-24 z-[70] flex -translate-x-1/2 items-center gap-3 rounded-lg bg-black/60 px-4 py-2 text-sm text-white backdrop-blur"
        >
          <span>{isLoading ? "Actualizando catálogo..." : error}</span>
          {error && !isLoading ? (
            <button
              className="font-semibold underline underline-offset-4"
              type="button"
              onClick={() => void loadPerfumes()}
            >
              Reintentar
            </button>
          ) : null}
        </div>
      )}

      {isInitialLoading ? (
        <section className="flex h-full w-full items-center justify-center px-6 text-center text-white">
          <div>
            <p className="text-sm uppercase text-white/50">Cargando</p>
            <h1 className="mt-3 text-3xl font-semibold">Preparando catálogo</h1>
          </div>
        </section>
      ) : hasBlockingError ? (
        <section
          className="flex h-full w-full items-center justify-center px-6 text-center text-white"
          role="alert"
        >
          <div className="max-w-md">
            <p className="text-sm font-semibold uppercase text-white/45">
              Catálogo no disponible
            </p>
            <h1 className="mt-3 text-3xl font-semibold">
              No pudimos cargar los perfumes
            </h1>
            <p className="mt-3 text-sm leading-6 text-white/65">{error}</p>
            <button
              className="mt-6 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-white/90"
              type="button"
              onClick={() => void loadPerfumes()}
            >
              Reintentar
            </button>
          </div>
        </section>
      ) : filtered.length > 0 ? (
        <PerfumeFlipbook
          items={filtered}
          onViewPerfume={setSelectedPerfume}
        />
      ) : (
        <section className="flex h-full w-full items-center justify-center px-6 text-center text-white">
          <div className="max-w-md">
            <p className="text-sm uppercase text-white/50">
              Sin resultados
            </p>
            <h1 className="mt-3 text-3xl font-semibold">
              No encontramos perfumes con esos filtros
            </h1>
            <p className="mt-3 text-sm leading-6 text-white/65">
              Prueba quitando una marca, una familia olfativa o ajustando la búsqueda.
            </p>
            <button
              className="mt-6 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-white/90"
              onClick={clearFilters}
            >
              Limpiar filtros
            </button>
          </div>
        </section>
      )}

      {selectedPerfume && (
        <PerfumeDetailModal
          perfume={selectedPerfume}
          onClose={() => setSelectedPerfume(null)}
        />
      )}
    </main>
  )
}
