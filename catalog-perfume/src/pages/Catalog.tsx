import { useEffect, useMemo, useState } from "react"
import type { Perfume } from "../data/types"
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
  const [selectedPerfume, setSelectedPerfume] = useState<Perfume | null>(null)

  useEffect(() => {
    void loadPerfumes()
  }, [loadPerfumes])

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()

    return perfumes.filter((p) => {
      const matchesBrand =
        selectedBrands.length === 0 || selectedBrands.includes(p.brand)

      const matchesFamily =
        selectedFamilies.length === 0 ||
        (p.family ? selectedFamilies.includes(p.family) : false)

      const searchableText = [
        p.name,
        p.brand,
        p.family,
        p.concentration,
        p.gender,
        p.description,
        ...(p.tags ?? []),
        ...(p.notes?.top ?? []),
        ...(p.notes?.heart ?? []),
        ...(p.notes?.base ?? []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()

      const matchesQuery =
        normalizedQuery.length === 0 || searchableText.includes(normalizedQuery)

      return matchesBrand && matchesFamily && matchesQuery
    })
  }, [perfumes, query, selectedBrands, selectedFamilies])

  return (
    <main className="h-full w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {(isLoading || error) && (
        <div className="absolute left-1/2 top-24 z-[70] -translate-x-1/2 rounded-xl bg-black/50 px-4 py-2 text-sm text-white backdrop-blur">
          {isLoading ? "Cargando catálogo..." : error}
        </div>
      )}

      <PerfumeFlipbook
        items={filtered}
        onViewPerfume={setSelectedPerfume}
      />

      {selectedPerfume && (
        <PerfumeDetailModal
          perfume={selectedPerfume}
          onClose={() => setSelectedPerfume(null)}
        />
      )}
    </main>
  )
}
