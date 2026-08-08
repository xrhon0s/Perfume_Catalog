import type { OlfactiveFamily, Perfume } from "../../data/types"

type CatalogFilters = {
  query: string
  brands: string[]
  families: OlfactiveFamily[]
}

export function filterCatalogPerfumes(
  perfumes: Perfume[],
  { query, brands, families }: CatalogFilters,
) {
  const normalizedQuery = query.trim().toLowerCase()

  return perfumes.filter((perfume) => {
    const matchesBrand =
      brands.length === 0 || brands.includes(perfume.brand)
    const matchesFamily =
      families.length === 0 ||
      (perfume.family ? families.includes(perfume.family) : false)

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
      (normalizedQuery.length === 0 ||
        searchableText.includes(normalizedQuery))
    )
  })
}
