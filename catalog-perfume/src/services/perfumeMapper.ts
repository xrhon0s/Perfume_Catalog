import type { Perfume } from "../data/types"
import { isUuid, toSlug } from "../shared/utils/text"
import type { CatalogPerfumeRow, PerfumeInput } from "./perfumeTypes"

export function mapCatalogRow(row: CatalogPerfumeRow): Perfume {
  return {
    id: row.id,
    name: row.name,
    brand: row.brand,
    image: row.image ?? undefined,
    imagePath: row.image_path ?? undefined,
    family: row.family ?? undefined,
    concentration: row.concentration ?? undefined,
    gender: row.gender ?? undefined,
    year: row.year ?? undefined,
    description: row.description ?? undefined,
    tags: row.tags ?? undefined,
    notes: row.notes ?? undefined,
    isActive: row.is_active,
    inventory:
      row.inventory_item_id ||
      row.sku ||
      row.size_ml !== null ||
      row.sale_price !== null
        ? {
            id: row.inventory_item_id ?? undefined,
            sku: row.sku ?? undefined,
            sizeMl: row.size_ml ?? undefined,
            salePrice:
              row.sale_price === null ? undefined : Number(row.sale_price),
            stockQuantity: row.stock_quantity ?? 0,
          }
        : undefined,
  }
}

export function toPerfumePayload(input: PerfumeInput, brandId: string) {
  return {
    legacy_id: input.id && !isUuid(input.id) ? input.id : null,
    brand_id: brandId,
    name: input.name.trim(),
    slug: toSlug(input.name),
    family: input.family || null,
    concentration: input.concentration || null,
    gender: input.gender || null,
    year: input.year || null,
    description: input.description || null,
    tags: input.tags ?? [],
    notes: input.notes ?? {},
    primary_image_url: input.image || null,
    primary_image_path: input.imagePath || null,
    is_active: input.isActive ?? true,
  }
}
