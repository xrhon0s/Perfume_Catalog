import { useState } from "react"
import type { Perfume } from "../data/types"
import { useFiltersStore } from "../store/filterStore"
import PerfumeFlipbook from "../components/flipbook/PerfumeFlipbook"
import PerfumeDetailModal from "../components/perfumes/PerfumeDetailModal"
//import { getPerfumes } from "../data/perfumeDb.helpers"
import { getPerfumes } from "../data/getPerfumes"




export default function Catalog() {
const selectedBrands = useFiltersStore((s) => s.brands)
const selectedFamilies = useFiltersStore((s) => s.families)

const query = useFiltersStore((s) => s.query)

const perfumeDb = getPerfumes()


const normalizedQuery = query.trim().toLowerCase()

const filtered = perfumeDb.filter((p) => {
  const matchesBrand =
    selectedBrands.length === 0 ? true : selectedBrands.includes(p.brand)

  const matchesFamily =
    selectedFamilies.length === 0 ? true : (p.family ? selectedFamilies.includes(p.family) : false)

  const matchesQuery =
    normalizedQuery.length === 0
      ? true
      : `${p.name} ${p.brand} ${(p.tags ?? []).join(" ")}`.toLowerCase().includes(normalizedQuery)

  return matchesBrand && matchesFamily && matchesQuery
})


  const [selectedPerfume, setSelectedPerfume] = useState<Perfume | null>(null)

  return (
    <main className="h-full w-full overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <PerfumeFlipbook
        items={filtered}
        onViewPerfume={(p) => {
  console.log("PERFUME:", p)
  setSelectedPerfume(p)
}}
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
