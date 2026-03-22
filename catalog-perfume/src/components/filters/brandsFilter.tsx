import { useFiltersStore } from "../../store/filterStore"
import { PERFUMERIES } from "../../data/perfumeries"

const PerfumeriesFilter = () => {
  const selected = useFiltersStore((state) => state.brands)
  const toggle = useFiltersStore((state) => state.toggleBrand)

  return (
    <div className="space-y-3">
      {PERFUMERIES.map((name) => {
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
