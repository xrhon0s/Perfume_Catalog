import { describe, expect, it } from "vitest"
import { formToPerfumeInput, perfumeToForm } from "./perfumeForm"

describe("perfumeToForm", () => {
  it("conserva la ruta de Storage al preparar un perfume para editar", () => {
    const form = perfumeToForm({
      id: "perfume-1",
      name: "Yara Candy",
      brand: "Lattafa",
      image: "https://example.com/yara.webp",
      imagePath: "perfumes/yara.webp",
    })

    expect(form.imagePath).toBe("perfumes/yara.webp")
  })

  it("prepara la presentación principal para guardar", () => {
    const input = formToPerfumeInput({
      id: "",
      name: "Yara Candy",
      brand: "Lattafa",
      image: "",
      imagePath: "",
      family: "Gourmand",
      concentration: "EDP",
      gender: "Femenino",
      year: "2024",
      description: "",
      tags: "",
      topNotes: "grosella negra",
      heartNotes: "",
      baseNotes: "",
      sku: " LAT-YARA-100 ",
      sizeMl: "100",
      salePrice: "189900",
      stockQuantity: "7",
      isActive: true,
    })

    expect(input.inventory).toEqual({
      sku: "LAT-YARA-100",
      sizeMl: 100,
      salePrice: 189900,
      stockQuantity: 7,
    })
  })
})
