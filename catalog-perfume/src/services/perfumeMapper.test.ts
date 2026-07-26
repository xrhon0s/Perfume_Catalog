import { describe, expect, it } from "vitest"
import { mapCatalogRow } from "./perfumeMapper"
import type { CatalogPerfumeRow } from "./perfumeTypes"

const catalogRow: CatalogPerfumeRow = {
  id: "6d9635f1-22f9-4414-b30a-42af96c1ca22",
  legacy_id: null,
  name: "Yara Candy",
  brand: "Lattafa",
  image: null,
  image_path: null,
  family: "Gourmand",
  concentration: "EDP",
  gender: "Femenino",
  year: 2024,
  description: null,
  tags: [],
  notes: {},
  is_active: true,
  inventory_item_id: "2d72382b-cb29-46b8-9527-85e2a9834ab3",
  sku: "LATT-YARACAND-100",
  size_ml: 100,
  sale_price: "189900.00",
  stock_quantity: 7,
}

describe("mapCatalogRow", () => {
  it("convierte el inventario primario devuelto por Supabase", () => {
    expect(mapCatalogRow(catalogRow).inventory).toEqual({
      id: "2d72382b-cb29-46b8-9527-85e2a9834ab3",
      sku: "LATT-YARACAND-100",
      sizeMl: 100,
      salePrice: 189900,
      stockQuantity: 7,
    })
  })

  it("no inventa una presentación cuando la fila no tiene inventario", () => {
    expect(
      mapCatalogRow({
        ...catalogRow,
        inventory_item_id: null,
        sku: null,
        size_ml: null,
        sale_price: null,
        stock_quantity: null,
      }).inventory,
    ).toBeUndefined()
  })
})
