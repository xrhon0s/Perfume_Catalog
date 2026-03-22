import { motion, AnimatePresence } from "framer-motion"
import { useUIStore } from "../../store/uiStore"
import PerfumeriesFilter from "../filters/brandsFilter"
import { useFiltersStore } from "../../store/filterStore"
import FamiliesFilter from "../filters/familiesFilter"


const FilterPanel = () => {
  const isOpen = useUIStore((state) => state.isFilterOpen)
  const closeFilters = useUIStore((state) => state.closeFilters)

  const clearFilters = useFiltersStore((s) => s.clearFilters)

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
            className="fixed top-0 right-0 z-[90] h-full w-[360px] bg-white shadow-2xl"
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
                <p className="text-xs text-gray-500">Refina tu búsqueda</p>
              </div>

              <button
                onClick={closeFilters}
                className="rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
              >
                Cerrar ✕
              </button>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              <section>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  Perfumería
                </h3>
                <div className="rounded-xl border p-4">
                  <PerfumeriesFilter />
                </div>
              </section>

              <section>
                <h3 className="text-sm font-semibold text-gray-800 mb-3">
                  Familia olfativa
                </h3>
                <div className="rounded-xl border p-4">
                  <FamiliesFilter />
                </div>
              </section>


              <button
                onClick={clearFilters}
                className="w-full rounded-xl bg-gray-100 px-4 py-3 text-sm font-semibold text-black hover:bg-gray-200"
              >
                Limpiar filtros
              </button>
            </div>

            {/* Footer opcional */}
            <div className="absolute bottom-0 left-0 right-0 border-t px-6 py-4 text-xs text-gray-500">
              Tip: usa el buscador para encontrar rápido.
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

export default FilterPanel
