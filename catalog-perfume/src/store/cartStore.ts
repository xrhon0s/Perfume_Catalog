import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartItem } from "../features/cart/cartTypes"

type CartState = {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: CartItem) => void
  removeItem: (inventoryItemId: string) => void
  setQuantity: (inventoryItemId: string, quantity: number) => void
  clear: () => void
  open: () => void
  close: () => void
}

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      addItem: (item) =>
        set((state) => {
          const existing = state.items.find(
            (current) => current.inventoryItemId === item.inventoryItemId,
          )
          if (!existing) {
            return { items: [...state.items, item], isOpen: true }
          }

          return {
            items: state.items.map((current) =>
              current.inventoryItemId === item.inventoryItemId
                ? {
                    ...current,
                    quantity: Math.min(
                      current.quantity + 1,
                      current.stockQuantity,
                    ),
                  }
                : current,
            ),
            isOpen: true,
          }
        }),
      removeItem: (inventoryItemId) =>
        set((state) => ({
          items: state.items.filter(
            (item) => item.inventoryItemId !== inventoryItemId,
          ),
        })),
      setQuantity: (inventoryItemId, quantity) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.inventoryItemId === inventoryItemId
              ? {
                  ...item,
                  quantity: Math.max(
                    1,
                    Math.min(Math.trunc(quantity), item.stockQuantity),
                  ),
                }
              : item,
          ),
        })),
      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
    }),
    {
      name: "eter-cart",
      partialize: (state) => ({ items: state.items }),
    },
  ),
)
