import type { Perfume } from "../../data/types"

export type CartItem = {
  inventoryItemId: string
  perfumeId: string
  name: string
  brand: string
  image?: string
  sizeMl?: number
  unitPrice: number
  stockQuantity: number
  quantity: number
}

export type CustomerDetails = {
  name: string
  phone: string
  department: string
  municipality: string
  address: string
  notes: string
}

export function perfumeToCartItem(perfume: Perfume): CartItem | null {
  const inventory = perfume.inventory
  if (
    !inventory?.id ||
    inventory.salePrice === undefined ||
    inventory.stockQuantity < 1
  ) {
    return null
  }

  return {
    inventoryItemId: inventory.id,
    perfumeId: perfume.id,
    name: perfume.name,
    brand: perfume.brand,
    image: perfume.image,
    sizeMl: inventory.sizeMl,
    unitPrice: inventory.salePrice,
    stockQuantity: inventory.stockQuantity,
    quantity: 1,
  }
}
