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
    })

    expect(errors).toEqual([])
  })

  it("explica los campos obligatorios faltantes", () => {
    const errors = validatePerfumeForm(emptyPerfumeForm)

    expect(errors).toContain("El nombre debe tener al menos 2 caracteres.")
    expect(errors).toContain("Selecciona una familia olfativa.")
    expect(errors).toContain("Agrega al menos una nota olfativa.")
  })
})
