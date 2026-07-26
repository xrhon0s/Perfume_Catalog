import { describe, expect, it } from "vitest"
import {
  getCatalogPageCount,
  getCatalogPageIndex,
  getLeafIndexForCatalogPage,
} from "./catalogPagination"

describe("catalogPagination", () => {
  it("cuenta pliegos de dos perfumes como páginas de catálogo", () => {
    expect(getCatalogPageCount(501)).toBe(251)
    expect(getCatalogPageCount(500)).toBe(250)
    expect(getCatalogPageCount(0)).toBe(0)
  })

  it("convierte entre página visible e índice interno del flipbook", () => {
    expect(getCatalogPageIndex(20)).toBe(10)
    expect(getCatalogPageIndex(21)).toBe(10)
    expect(getLeafIndexForCatalogPage(10, 501)).toBe(20)
  })

  it("limita el salto al rango disponible", () => {
    expect(getLeafIndexForCatalogPage(-1, 501)).toBe(0)
    expect(getLeafIndexForCatalogPage(999, 501)).toBe(500)
  })
})
