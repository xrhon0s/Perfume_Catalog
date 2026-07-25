import { describe, expect, it } from "vitest"
import type { Perfume } from "../../data/types"
import { filterCatalogPerfumes } from "./filterCatalogPerfumes"

const perfumes: Perfume[] = [
  {
    id: "yara",
    name: "Yara Candy",
    brand: "Lattafa",
    family: "Gourmand",
    tags: ["dulce", "cremoso"],
    notes: { base: ["vainilla"] },
  },
  {
    id: "bleu",
    name: "Bleu de Chanel",
    brand: "Chanel",
    family: "Amaderado",
    tags: ["fresco"],
    notes: { top: ["cítricos"] },
  },
]

describe("filterCatalogPerfumes", () => {
  it("busca en nombre, tags y notas", () => {
    expect(
      filterCatalogPerfumes(perfumes, {
        query: "vainilla",
        brands: [],
        families: [],
      }).map((perfume) => perfume.id),
    ).toEqual(["yara"])
  })

  it("combina marca y familia", () => {
    expect(
      filterCatalogPerfumes(perfumes, {
        query: "",
        brands: ["Chanel"],
        families: ["Amaderado"],
      }).map((perfume) => perfume.id),
    ).toEqual(["bleu"])
  })
})
