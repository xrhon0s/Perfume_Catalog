import { describe, expect, it } from "vitest"
import { perfumeToForm } from "./perfumeForm"

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
})
