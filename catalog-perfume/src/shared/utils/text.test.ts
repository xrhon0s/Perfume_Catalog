import { describe, expect, it } from "vitest"
import { isUuid, toSlug } from "./text"

describe("text utilities", () => {
  it("reconoce UUID válidos de Supabase", () => {
    expect(isUuid("6d9635f1-22f9-4414-b30a-42af96c1ca22")).toBe(true)
    expect(isUuid("lattafa-yara-candy")).toBe(false)
  })

  it("genera slugs estables sin acentos", () => {
    expect(toSlug("  Ámbar & Vainilla  ")).toBe("ambar-vainilla")
  })
})
