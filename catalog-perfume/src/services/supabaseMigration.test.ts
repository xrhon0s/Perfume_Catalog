import { describe, expect, it } from "vitest"
import migration from "../../supabase/migrations/003_primary_inventory.sql?raw"
import ambiguityFix from "../../supabase/migrations/004_fix_inventory_function_ambiguity.sql?raw"

describe("003_primary_inventory migration", () => {
  it("recrea catalog_perfumes para admitir esquemas anteriores sin image_path", () => {
    const dropView = migration.indexOf(
      "drop view if exists public.catalog_perfumes",
    )
    const createView = migration.indexOf("create view public.catalog_perfumes")

    expect(dropView).toBeGreaterThan(-1)
    expect(createView).toBeGreaterThan(dropView)
  })

  it("califica inventory_item_id para evitar conflictos con la salida SQL", () => {
    expect(migration).toContain(
      "where movements.inventory_item_id = item.id",
    )
    expect(ambiguityFix).toContain(
      "where movements.inventory_item_id = item.id",
    )
    expect(ambiguityFix).not.toContain(
      "\n  where inventory_item_id = item.id",
    )
  })
})
