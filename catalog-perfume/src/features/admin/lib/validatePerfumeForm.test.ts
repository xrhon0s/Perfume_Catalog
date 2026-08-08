import { describe, expect, it } from "vitest"
import { emptyPerfumeForm } from "./perfumeForm"
import { validatePerfumeForm } from "./validatePerfumeForm"

describe("validatePerfumeForm", () => {
  it("acepta una ficha completa", () => {
    const errors = validatePerfumeForm({
      ...emptyPerfumeForm,
      name: "Yara Candy",
      brand: "Lattafa",
      family: "Gourmand",
      concentration: "EDP",
      gender: "Femenino",
      year: "2024",
      topNotes: "grosella negra",
      sizeMl: "100",
      salePrice: "189900",
      stockQuantity: "4",
    })

    expect(errors).toEqual([])
  })

  it("explica los campos obligatorios faltantes", () => {
    const errors = validatePerfumeForm(emptyPerfumeForm)

    expect(errors).toContain("El nombre debe tener al menos 2 caracteres.")
    expect(errors).toContain("Selecciona una familia olfativa.")
    expect(errors).toContain("Agrega al menos una nota olfativa.")
    expect(errors).toContain(
      "El tamaño debe ser un número entero mayor que cero.",
    )
    expect(errors).toContain("El precio de venta debe ser cero o mayor.")
  })

  it("rechaza existencias negativas o decimales", () => {
    const baseForm = {
      ...emptyPerfumeForm,
      name: "Yara Candy",
      brand: "Lattafa",
      family: "Gourmand",
      concentration: "EDP",
      gender: "Femenino",
      topNotes: "grosella negra",
      sizeMl: "100",
      salePrice: "189900",
    }

    expect(
      validatePerfumeForm({ ...baseForm, stockQuantity: "-1" }),
    ).toContain(
      "Las existencias deben ser un número entero igual o mayor que cero.",
    )
    expect(
      validatePerfumeForm({ ...baseForm, stockQuantity: "1.5" }),
    ).toContain(
      "Las existencias deben ser un número entero igual o mayor que cero.",
    )
  })
})
