import { describe, expect, it } from "vitest"
import {
  emptyPerfumeForm,
  findExistingPerfume,
  formToPerfumeInput,
  perfumeToForm,
} from "./perfumeForm"

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

  it("detecta si un perfume nuevo ya existe por nombre y marca", () => {
    const existing = {
      id: "6d9635f1-22f9-4414-b30a-42af96c1ca22",
      name: "Yara Candy",
      brand: "Lattafa",
    }

    expect(
      findExistingPerfume([existing], {
        ...emptyPerfumeForm,
        name: " Yára Candy ",
        brand: "LATTAFA",
      }),
    ).toBe(existing)
  })

  it("no reemplaza el perfume seleccionado durante una edición", () => {
    expect(
      findExistingPerfume(
        [
          {
            id: "6d9635f1-22f9-4414-b30a-42af96c1ca22",
            name: "Yara Candy",
            brand: "Lattafa",
          },
        ],
        {
          ...emptyPerfumeForm,
          id: "2d72382b-cb29-46b8-9527-85e2a9834ab3",
          name: "Yara Candy",
          brand: "Lattafa",
        },
      ),
    ).toBeUndefined()
  })
})
