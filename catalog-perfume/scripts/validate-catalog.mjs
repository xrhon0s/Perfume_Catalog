import { readFileSync } from "node:fs"

const dbSource = readFileSync("src/data/perfumeDb.ts", "utf8")
const detailsSource = readFileSync("src/data/perfumeDetails.ts", "utf8")

function toId(text) {
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

const literalIds = [...dbSource.matchAll(/id:\s*"([^"]+)"/g)].map(
  (match) => match[1],
)

const factoryIds = [
  ...dbSource.matchAll(
    /makePerfume\("([^"]+)",\s*"([^"]+)"(?:,\s*"([^"]+)")?\)/g,
  ),
].map((match) => match[3] ?? toId(`${match[2]}-${match[1]}`))

const perfumeIds = [...literalIds, ...factoryIds]
const detailIds = [...detailsSource.matchAll(/^"([^"]+)":\s*{/gm)].map(
  (match) => match[1],
)

const duplicateIds = perfumeIds.filter(
  (id, index) => perfumeIds.indexOf(id) !== index,
)
const orphanDetailIds = detailIds.filter((id) => !perfumeIds.includes(id))

if (duplicateIds.length > 0 || orphanDetailIds.length > 0) {
  console.error("Catalog validation failed.")

  if (duplicateIds.length > 0) {
    console.error(`Duplicate perfume IDs: ${duplicateIds.join(", ")}`)
  }

  if (orphanDetailIds.length > 0) {
    console.error(`Detail IDs without perfume: ${orphanDetailIds.join(", ")}`)
  }

  process.exit(1)
}

console.log(
  `Catalog validation passed: ${perfumeIds.length} perfumes, ${detailIds.length} detail records.`,
)
