import { describe, expect, it } from "vitest"
import type { CartItem } from "./cartTypes"
import {
  buildCartWhatsAppMessage,
  createWhatsAppUrl,
  normalizeWhatsAppPhone,
} from "./whatsapp"

const item: CartItem = {
  inventoryItemId: "inventory-id",
  perfumeId: "perfume-id",
  name: "9PM",
  brand: "Afnan",
  sizeMl: 100,
  unitPrice: 80000,
  stockQuantity: 8,
  quantity: 2,
}

describe("WhatsApp cart messages", () => {
  it("genera el resumen con cantidades y total", () => {
    const message = buildCartWhatsAppMessage([item], {
      name: "Daniel",
      phone: "",
      department: "Antioquia",
      municipality: "Medellín",
      address: "Carrera 43 # 10-20",
      notes: "Entrega en la tarde",
    })

    expect(message).toContain("Afnan 9PM")
    expect(message).toContain("2 x")
    expect(message).toContain("160.000")
    expect(message).toContain("Daniel")
    expect(message).toContain("Antioquia")
    expect(message).toContain("Carrera 43 # 10-20")
  })

  it("normaliza el teléfono y codifica el mensaje", () => {
    expect(normalizeWhatsAppPhone("+57 312 648-5885")).toBe("573126485885")
    expect(normalizeWhatsAppPhone("312 648-5885")).toBe("573126485885")
    expect(createWhatsAppUrl("+57 300", "Hola mundo")).toBe(
      "https://wa.me/57300?text=Hola%20mundo",
    )
  })
})
