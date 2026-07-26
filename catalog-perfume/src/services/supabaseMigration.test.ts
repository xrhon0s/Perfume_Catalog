import { describe, expect, it } from "vitest"
import migration from "../../supabase/migrations/003_primary_inventory.sql?raw"

describe("003_primary_inventory migration", () => {
  it("recrea catalog_perfumes para admitir esquemas anteriores sin image_path", () => {
    const dropView = migration.indexOf(
      "drop view if exists public.catalog_perfumes",
    )
    const createView = migration.indexOf("create view public.catalog_perfumes")

    expect(dropView).toBeGreaterThan(-1)
    expect(createView).toBeGreaterThan(dropView)
  })
})
