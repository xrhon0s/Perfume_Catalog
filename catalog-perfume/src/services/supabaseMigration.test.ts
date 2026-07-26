// @vitest-environment node

import { readFileSync } from "node:fs"
import { resolve } from "node:path"
import { describe, expect, it } from "vitest"

const migration = readFileSync(
  resolve("supabase/migrations/003_primary_inventory.sql"),
  "utf8",
)

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
