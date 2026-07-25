import { describe, expect, it } from "vitest"
import { parsePerfumeText } from "./parsePerfumeText"

describe("parsePerfumeText", () => {
  it("interpreta una ficha estructurada sin confundir la marca", () => {
    const parsed = parsePerfumeText(`
Nombre: Lattafa Yara Candy
Marca: Lattafa
Género: Femenino
Año: 2024
Concentración: EDP
Familia olfativa: Gourmand
Notas de salida: grosella negra, mandarina verde
Notas de corazón: fresa fizz candy, gardenia
Notas de fondo: vainilla, ámbar, almizcle, sándalo
Tags: dulce, frutal, gourmand, juvenil
Descripción: Una fragancia dulce y cremosa.
`)

    expect(parsed).toMatchObject({
      name: "Lattafa Yara Candy",
      brand: "Lattafa",
      family: "Gourmand",
      concentration: "EDP",
      gender: "Femenino",
      year: "2024",
      topNotes: "grosella negra, mandarina verde",
      heartNotes: "fresa fizz candy, gardenia",
      baseNotes: "vainilla, ámbar, almizcle, sándalo",
      description: "Una fragancia dulce y cremosa",
    })
  })
})
