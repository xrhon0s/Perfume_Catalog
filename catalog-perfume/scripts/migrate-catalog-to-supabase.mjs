import { createClient } from "@supabase/supabase-js"
import { existsSync, readFileSync } from "node:fs"
import { resolve } from "node:path"
import vm from "node:vm"
import ts from "typescript"

const envFiles = [".env.migration.local", ".env.local"]

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return

  const lines = readFileSync(filePath, "utf8").split(/\r?\n/)

  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue

    const separatorIndex = trimmed.indexOf("=")
    if (separatorIndex === -1) continue

    const key = trimmed.slice(0, separatorIndex).trim()
    const rawValue = trimmed.slice(separatorIndex + 1).trim()
    const value = rawValue.replace(/^["']|["']$/g, "")

    if (!process.env[key]) {
      process.env[key] = value
    }
  }
}

for (const file of envFiles) {
  loadEnvFile(resolve(file))
}

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Missing Supabase migration credentials.")
  console.error("Create .env.migration.local with:")
  console.error("SUPABASE_URL=https://your-project.supabase.co")
  console.error("SUPABASE_SERVICE_ROLE_KEY=your-service-role-key")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

function toSlug(text) {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’]/g, "'")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

function loadTsModule(filePath) {
  const source = readFileSync(filePath, "utf8")
  const compiled = ts.transpileModule(source, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      esModuleInterop: true,
    },
  }).outputText

  const exports = {}
  const context = {
    exports,
    require: () => ({}),
  }

  vm.runInNewContext(compiled, context, { filename: filePath })
  return exports
}

function chunk(items, size) {
  const chunks = []

  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size))
  }

  return chunks
}

async function upsertOrThrow(table, rows, options) {
  if (rows.length === 0) return []

  const { data, error } = await supabase
    .from(table)
    .upsert(rows, options)
    .select()

  if (error) {
    throw new Error(`${table}: ${error.message}`)
  }

  return data ?? []
}

const { perfumeDb } = loadTsModule(resolve("src/data/legacy/perfumeDb.ts"))
const { perfumeDetails } = loadTsModule(resolve("src/data/legacy/perfumeDetails.ts"))

const perfumeBaseById = new Map(perfumeDb.map((perfume) => [perfume.id, perfume]))
const missingBasePerfumes = Object.keys(perfumeDetails).filter(
  (id) => !perfumeBaseById.has(id),
)

if (missingBasePerfumes.length > 0) {
  throw new Error(
    `perfumeDetails has records without perfumeDb base rows: ${missingBasePerfumes.join(", ")}`,
  )
}

const perfumes = Object.entries(perfumeDetails).map(([id, details]) => ({
  ...perfumeBaseById.get(id),
  ...details,
}))
const omittedPerfumes = perfumeDb.filter((perfume) => !perfumeDetails[perfume.id])

const brandRows = Array.from(new Set(perfumes.map((perfume) => perfume.brand)))
  .sort((a, b) => a.localeCompare(b))
  .map((brand) => ({
    name: brand,
    slug: toSlug(brand),
  }))
const slugKeys = perfumes.map((perfume) => `${perfume.brand}::${toSlug(perfume.name)}`)
const duplicateSlugKeys = new Set(
  slugKeys.filter((key, index) => slugKeys.indexOf(key) !== index),
)

function perfumeSlug(perfume) {
  const baseSlug = toSlug(perfume.name)
  const slugKey = `${perfume.brand}::${baseSlug}`

  if (!duplicateSlugKeys.has(slugKey)) {
    return baseSlug
  }

  return `${baseSlug}-${toSlug(perfume.id)}`
}

console.log(`Migrating ${brandRows.length} brands...`)
const brands = await upsertOrThrow("brands", brandRows, { onConflict: "slug" })
const brandIdBySlug = new Map(brands.map((brand) => [brand.slug, brand.id]))

const perfumeRows = perfumes.map((perfume) => {
  const brandId = brandIdBySlug.get(toSlug(perfume.brand))

  if (!brandId) {
    throw new Error(`Brand not found after upsert: ${perfume.brand}`)
  }

  return {
    legacy_id: perfume.id,
    brand_id: brandId,
    name: perfume.name,
    slug: perfumeSlug(perfume),
    family: perfume.family ?? null,
    concentration: perfume.concentration ?? null,
    gender: perfume.gender ?? null,
    year: perfume.year ?? null,
    description: perfume.description ?? null,
    tags: perfume.tags ?? [],
    notes: perfume.notes ?? {},
    primary_image_url: null,
    primary_image_path: null,
    is_active: true,
  }
})

console.log(`Migrating ${perfumeRows.length} perfumes...`)
const savedPerfumes = []
for (const rows of chunk(perfumeRows, 100)) {
  savedPerfumes.push(
    ...(await upsertOrThrow("perfumes", rows, { onConflict: "legacy_id" })),
  )
}

console.log("Catalog migration completed.")
console.log(
  `${brandRows.length} brands, ${savedPerfumes.length} enriched perfumes.`,
)
console.log(`${omittedPerfumes.length} perfumes were omitted because they do not have perfumeDetails records.`)
