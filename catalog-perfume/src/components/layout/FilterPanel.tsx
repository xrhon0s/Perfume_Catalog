import { useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useUIStore } from "../../store/uiStore"
import PerfumeriesFilter from "../filters/brandsFilter"
import { useFiltersStore } from "../../store/filterStore"
import FamiliesFilter from "../filters/familiesFilter"
import { useCatalogStore } from "../../store/catalogStore"


const FilterPanel = () => {
  const isOpen = useUIStore((state) => state.isFilterOpen)
  const closeFilters = useUIStore((state) => state.closeFilters)
  const perfumes = useCatalogStore((s) => s.perfumes)
  const query = useFiltersStore((s) => s.query)
  const selectedBrands = useFiltersStore((s) => s.brands)
  const selectedFamilies = useFiltersStore((s) => s.families)
  const clearFilters = useFiltersStore((s) => s.clearFilters)
  const activeFiltersCount =
    selectedBrands.length + selectedFamilies.length + (query.trim() ? 1 : 0)
  const resultCount = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return perfumes.filter((perfume) => {
      const matchesBrand =
        selectedBrands.length === 0 || selectedBrands.includes(perfume.brand)
      const matchesFamily =
        selectedFamilies.length === 0 ||
        (perfume.family ? selectedFamilies.includes(perfume.family) : false)
      const searchableText = [
        perfume.name,
        perfume.brand,
        perfume.family,
        perfume.concentration,
        perfume.gender,
        perfume.description,
        perfume.inventory?.sku,
        perfume.inventory?.sizeMl,
        ...(perfume.tags ?? []),
        ...(perfume.notes?.top ?? []),
        ...(perfume.notes?.heart ?? []),
        ...(perfume.notes?.base ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      return (
        matchesBrand &&
        matchesFamily &&
        (!normalizedQuery || searchableText.includes(normalizedQuery))
      )
    }).length
  }, [perfumes, query, selectedBrands, selectedFamilies])

  useEffect(() => {
    if (!isOpen) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [isOpen])

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            className="fixed inset-0 z-[80] bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeFilters}
          />

          {/* Panel */}
          <motion.aside
            className="fixed right-0 top-0 z-[90] flex h-full w-full max-w-[390px] flex-col bg-white shadow-2xl"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.25 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold">Filtros</h2>
                <p className="text-xs text-gray-500">
                  {activeFiltersCount > 0
                    ? `${activeFiltersCount} activos`
                    : "Sin filtros activos"}
                </p>
              </div>

              <button
                onClick={closeFilters}
                className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                Cerrar
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 space-y-8 overflow-y-auto p-6">
              <section>
                <h3 className="mb-3 text-sm font-semibold text-gray-800">
                  Marca
                </h3>
                <div className="max-h-72 overflow-y-auto border-y py-4">
                  <PerfumeriesFilter />
                </div>
              </section>

              <section>
                <h3 className="mb-3 text-sm font-semibold text-gray-800">
                  Familia olfativa
                </h3>
                <div className="border-y py-4">
                  <FamiliesFilter />
                </div>
              </section>
            </div>

            <div className="border-t px-6 py-4">
              <p className="mb-3 text-sm text-gray-600">
                {resultCount} perfumes encontrados
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={clearFilters}
                  disabled={activeFiltersCount === 0}
                  className="rounded-lg bg-gray-100 px-4 py-3 text-sm font-semibold text-black hover:bg-gray-200 disabled:cursor-not-allowed disabled:text-gray-400"
                >
                  Limpiar
                </button>
                <button
                  onClick={closeFilters}
                  className="rounded-lg bg-slate-950 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Ver resultados
                </button>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

export default FilterPanel
