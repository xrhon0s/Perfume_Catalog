import { describe, expect, it } from "vitest"
import {
  formatCatalogPrice,
  formatPerfumeSize,
} from "./catalogFormatting"

describe("catalogFormatting", () => {
  it("formatea precio y presentación para el catálogo", () => {
    expect(formatCatalogPrice(189900)).toContain("189.900")
    expect(formatPerfumeSize(100)).toBe("100 ml")
  })

  it("explica los valores todavía no configurados", () => {
    expect(formatCatalogPrice(undefined)).toBe("Sin precio")
    expect(formatPerfumeSize(undefined)).toBe("Sin tamaño")
  })
})
