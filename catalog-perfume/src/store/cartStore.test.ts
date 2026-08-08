import { beforeEach, describe, expect, it } from "vitest"
import type { CartItem } from "../features/cart/cartTypes"
import { useCartStore } from "./cartStore"

const item: CartItem = {
  inventoryItemId: "inventory-id",
  perfumeId: "perfume-id",
  name: "9PM",
  brand: "Afnan",
  unitPrice: 80000,
  stockQuantity: 2,
  quantity: 1,
}

describe("cartStore", () => {
  beforeEach(() => {
    useCartStore.setState({ items: [], isOpen: false })
  })

  it("agrega productos y respeta las existencias", () => {
    useCartStore.getState().addItem(item)
    useCartStore.getState().addItem(item)
    useCartStore.getState().addItem(item)

    expect(useCartStore.getState().items[0].quantity).toBe(2)
    expect(useCartStore.getState().isOpen).toBe(true)
  })

  it("actualiza cantidades y elimina productos", () => {
    useCartStore.getState().addItem(item)
    useCartStore.getState().setQuantity(item.inventoryItemId, 0)
    expect(useCartStore.getState().items[0].quantity).toBe(1)

    useCartStore.getState().removeItem(item.inventoryItemId)
    expect(useCartStore.getState().items).toEqual([])
  })
})
