import { createClient } from "@supabase/supabase-js"
import {
  existsSync,
  readFileSync,
} from "node:fs"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

const PAGE_SIZE = 500
const BUCKET = process.env.SUPABASE_BUCKET || "perfume-images"
const DATA_ONLY = process.argv.includes("--data-only")
const TABLES = [
  { name: "admin_users", orderBy: "user_id" },
  { name: "brands", orderBy: "id" },
  { name: "perfumes", orderBy: "id" },
  { name: "perfume_images", orderBy: "id" },
  { name: "inventory_items", orderBy: "id" },
  { name: "stock_movements", orderBy: "id" },
  { name: "orders", orderBy: "id" },
  { name: "order_items", orderBy: "id" },
]

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

    process.env[key] ||= value
  }
}

loadEnvFile(path.resolve(".env.migration.local"))
loadEnvFile(path.resolve(".env.local"))

const supabaseUrl = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !serviceRoleKey) {
  console.error("Faltan las credenciales privadas de Supabase.")
  console.error("Configura SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
})

const timestamp = new Date().toISOString().replace(/[:.]/g, "-")
const backupDirectory = path.resolve("backups", timestamp)
const dataDirectory = path.join(backupDirectory, "data")
const storageDirectory = path.join(
  backupDirectory,
  "storage",
  BUCKET,
  "perfumes",
)

async function readAllRows(table, orderBy) {
  const rows = []

  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await supabase
      .from(table)
      .select("*")
      .order(orderBy, { ascending: true })
      .range(from, from + PAGE_SIZE - 1)

    if (error) {
      throw new Error(`${table}: ${error.message}`)
    }

    rows.push(...(data ?? []))
    if (!data || data.length < PAGE_SIZE) break
  }

  return rows
}

async function backupTables() {
  await mkdir(dataDirectory, { recursive: true })
  const counts = {}

  for (const table of TABLES) {
    const rows = await readAllRows(table.name, table.orderBy)
    await writeFile(
      path.join(dataDirectory, `${table.name}.json`),
      `${JSON.stringify(rows, null, 2)}\n`,
      "utf8",
    )
    counts[table.name] = rows.length
    console.log(`${table.name}: ${rows.length} filas`)
  }

  return counts
}

async function listAllPerfumeImages() {
  const files = []

  for (let offset = 0; ; offset += PAGE_SIZE) {
    const { data, error } = await supabase.storage.from(BUCKET).list("perfumes", {
      limit: PAGE_SIZE,
      offset,
      sortBy: { column: "name", order: "asc" },
    })

    if (error) {
      throw new Error(`storage ${BUCKET}: ${error.message}`)
    }

    const page = (data ?? []).filter((item) => item.id)
    files.push(...page)
    if (!data || data.length < PAGE_SIZE) break
  }

  return files
}

async function backupImages() {
  if (DATA_ONLY) return 0

  const files = await listAllPerfumeImages()
  await mkdir(storageDirectory, { recursive: true })

  for (const file of files) {
    if (path.basename(file.name) !== file.name) {
      throw new Error(`Nombre de archivo no válido en Storage: ${file.name}`)
    }

    const storagePath = `perfumes/${file.name}`
    const { data, error } = await supabase.storage.from(BUCKET).download(storagePath)

    if (error || !data) {
      throw new Error(
        `${storagePath}: ${error?.message || "no se recibió el archivo"}`,
      )
    }

    await writeFile(
      path.join(storageDirectory, file.name),
      Buffer.from(await data.arrayBuffer()),
    )
  }

  console.log(`${BUCKET}: ${files.length} imágenes`)
  return files.length
}

try {
  console.log(`Creando respaldo en ${backupDirectory}`)
  const tables = await backupTables()
  const images = await backupImages()
  const manifest = {
    createdAt: new Date().toISOString(),
    projectUrl: supabaseUrl,
    bucket: BUCKET,
    dataOnly: DATA_ONLY,
    tables,
    images,
  }

  await writeFile(
    path.join(backupDirectory, "manifest.json"),
    `${JSON.stringify(manifest, null, 2)}\n`,
    "utf8",
  )

  console.log("Respaldo completado correctamente.")
} catch (error) {
  console.error(
    error instanceof Error ? error.message : "No se pudo completar el respaldo.",
  )
  process.exitCode = 1
}
