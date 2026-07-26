export function getCatalogPageCount(perfumeCount: number) {
  return Math.ceil(Math.max(0, perfumeCount) / 2)
}

export function getCatalogPageIndex(pageLeafIndex: number) {
  return Math.floor(Math.max(0, pageLeafIndex) / 2)
}

export function getLeafIndexForCatalogPage(
  catalogPageIndex: number,
  perfumeCount: number,
) {
  const totalPages = getCatalogPageCount(perfumeCount)
  if (totalPages === 0) return 0

  const safePageIndex = Math.max(
    0,
    Math.min(catalogPageIndex, totalPages - 1),
  )

  return safePageIndex * 2
}
