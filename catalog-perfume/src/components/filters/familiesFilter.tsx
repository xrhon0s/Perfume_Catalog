import { useFiltersStore } from "../../store/filterStore"
import { useCatalogStore } from "../../store/catalogStore"

export default function FamiliesFilter() {
  const selectedFamilies = useFiltersStore((s) => s.families)
  const toggleFamily = useFiltersStore((s) => s.toggleFamily)
  const perfumes = useCatalogStore((s) => s.perfumes)

  const families = Array.from(
    new Set(
      perfumes
        .map((p) => p.family)
        .filter((family): family is NonNullable<typeof family> =>
          Boolean(family),
        ),
    ),
  ).sort((a, b) => a.localeCompare(b))

  return (
    <div className="flex flex-wrap gap-2">
      {families.map((f) => {
        const active = selectedFamilies.includes(f)
        return (
          <button
            key={f}
            type="button"
            onClick={() => toggleFamily(f)}
            className={[
              "rounded-full px-3 py-1 text-sm transition",
              active
                ? "bg-slate-900 text-white"
                : "bg-gray-100 text-gray-800 hover:bg-gray-200",
            ].join(" ")}
          >
            {f}
          </button>
        )
      })}
    </div>
  )
}
