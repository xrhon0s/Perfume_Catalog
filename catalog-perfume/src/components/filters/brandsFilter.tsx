import { useFiltersStore } from "../../store/filterStore"
import { useCatalogStore } from "../../store/catalogStore"

const PerfumeriesFilter = () => {
  const selected = useFiltersStore((state) => state.brands)
  const toggle = useFiltersStore((state) => state.toggleBrand)
  const perfumes = useCatalogStore((state) => state.perfumes)
  const brands = Array.from(new Set(perfumes.map((p) => p.brand))).sort((a, b) =>
    a.localeCompare(b),
  )

  return (
    <div className="space-y-3">
      {brands.map((name) => {
        const checked = selected.includes(name)

        return (
          <label
            key={name}
            className="flex items-center gap-3 cursor-pointer"
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() => toggle(name)}
              className="accent-slate-900"
            />

            <span className={checked ? "font-semibold" : ""}>
              {name}
            </span>
          </label>
        )
      })}
    </div>
  )
}

export default PerfumeriesFilter
