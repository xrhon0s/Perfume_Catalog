const catalogLocale =
  (import.meta.env.VITE_CATALOG_LOCALE as string | undefined) || "es-CO"
const catalogCurrency =
  (import.meta.env.VITE_CATALOG_CURRENCY as string | undefined) || "COP"

const priceFormatter = new Intl.NumberFormat(catalogLocale, {
  style: "currency",
  currency: catalogCurrency,
  maximumFractionDigits: 0,
})

export function formatCatalogPrice(value: number | undefined) {
  return value === undefined ? "Sin precio" : priceFormatter.format(value)
}

export function formatPerfumeSize(value: number | undefined) {
  return value === undefined ? "Sin tamaño" : `${value} ml`
}
