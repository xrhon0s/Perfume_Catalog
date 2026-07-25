import {
  CONCENTRATIONS,
  GENDERS,
  OLFACTIVE_FAMILIES,
} from "../../../shared/constants/perfumeOptions"
import type { PerfumeFormState } from "./perfumeForm"

export type ParsedPerfumeFields = Partial<
  Pick<
    PerfumeFormState,
    | "name"
    | "brand"
    | "family"
    | "concentration"
    | "gender"
    | "year"
    | "description"
    | "tags"
    | "topNotes"
    | "heartNotes"
    | "baseNotes"
  >
>

const TAG_KEYWORDS = [
  "dulce",
  "fresco",
  "cítrico",
  "citrico",
  "floral",
  "frutal",
  "amaderado",
  "ámbar",
  "ambar",
  "vainilla",
  "almizcle",
  "especiado",
  "aromático",
  "aromatico",
  "acuático",
  "acuatico",
  "gourmand",
  "oud",
  "cuero",
  "juvenil",
  "cremoso",
  "elegante",
  "nocturno",
  "verano",
  "fiesta",
]

const normalize = (value: string) =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()

const cleanValue = (value: string) =>
  value
    .replace(/^[\s:.-]+/, "")
    .replace(/\s+/g, " ")
    .replace(/[.;,\s]+$/, "")
    .trim()

function findLabeledValue(text: string, labels: string[]) {
  const labelPattern = labels
    .map((label) => label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
    .join("|")
  const match = text.match(
    new RegExp(`(?:^|\\n)\\s*(?:${labelPattern})\\s*[:\\-]\\s*([^\\n]+)`, "i"),
  )

  return match?.[1] ? cleanValue(match[1]) : ""
}

function splitList(value: string) {
  return value
    .replace(/\sy\s/gi, ", ")
    .split(/[,/|]+/)
    .map(cleanValue)
    .filter(Boolean)
}

function findOption<T extends readonly string[]>(text: string, options: T) {
  const normalizedText = normalize(text)
  return options.find((option) => normalizedText.includes(normalize(option))) || ""
}

function parseName(text: string) {
  const labeled = findLabeledValue(text, ["nombre", "perfume", "fragancia"])
  if (labeled) return labeled

  const firstLine = text.split("\n").map(cleanValue).find(Boolean) || ""
  const firstSentence = firstLine
    .split(/\s+(?:es|fue|lanzad[ao]|pertenece|de la familia)\s+/i)[0]
    .replace(/^perfume\s+/i, "")

  return cleanValue(firstSentence)
}

function parseBrand(text: string) {
  const labeled = findLabeledValue(text, ["marca", "casa", "brand"])
  if (labeled) return labeled

  const byMatch = text.match(/\b(?:de la casa|de|by)\s+([A-ZÁÉÍÓÚÑ][\wÁÉÍÓÚÑáéíóúñ&'. -]{1,40})/i)
  return byMatch?.[1] ? cleanValue(byMatch[1]) : ""
}

function parseConcentration(text: string) {
  const labeled = findLabeledValue(text, ["concentración", "concentracion", "tipo"])
  const source = `${labeled} ${text}`
  const normalized = normalize(source)

  if (/\beau de toilette\b|\bedt\b/.test(normalized)) return "EDT"
  if (/\beau de parfum\b|\bedp\b/.test(normalized)) return "EDP"
  if (/\bextrait\b/.test(normalized)) return "Extrait"
  if (/\bparfum\b/.test(normalized)) return "Parfum"

  return findOption(source, CONCENTRATIONS)
}

function parseGender(text: string) {
  const labeled = findLabeledValue(text, ["género", "genero", "gender"])
  const normalized = normalize(`${labeled} ${text}`)

  if (/\bunisex\b/.test(normalized)) return "Unisex"
  if (/\bfemenin[ao]\b|\bmujer(?:es)?\b|\bwomen\b|\bfemale\b/.test(normalized)) {
    return "Femenino"
  }
  if (/\bmasculin[ao]\b|\bhombre(?:s)?\b|\bmen\b|\bmale\b/.test(normalized)) {
    return "Masculino"
  }

  return findOption(text, GENDERS)
}

function parseYear(text: string) {
  const labeled = findLabeledValue(text, ["año", "ano", "lanzamiento", "year"])
  const year = labeled.match(/\b(19\d{2}|20\d{2})\b/) || text.match(/\b(19\d{2}|20\d{2})\b/)
  return year?.[1] || ""
}

function parseFamily(text: string) {
  const labeled = findLabeledValue(text, [
    "familia",
    "familia olfativa",
    "olfactive family",
  ])
  return findOption(`${labeled} ${text}`, OLFACTIVE_FAMILIES)
}

function parseNotes(text: string, labels: string[]) {
  const value = findLabeledValue(text, labels)
  return splitList(value).join(", ")
}

function parseTags(text: string) {
  const explicit = findLabeledValue(text, ["tags", "etiquetas", "acordes", "acuerdos"])
  const tags = new Set(splitList(explicit).map((tag) => normalize(tag)))
  const normalizedText = normalize(text)

  for (const keyword of TAG_KEYWORDS) {
    if (normalizedText.includes(normalize(keyword))) tags.add(normalize(keyword))
  }

  return Array.from(tags)
    .map((tag) => {
      if (tag === "citrico") return "cítrico"
      if (tag === "ambar") return "ámbar"
      if (tag === "aromatico") return "aromático"
      if (tag === "acuatico") return "acuático"
      return tag
    })
    .slice(0, 8)
    .join(", ")
}

function parseDescription(text: string) {
  const labeled = findLabeledValue(text, ["descripción", "descripcion", "description"])
  if (labeled) return labeled

  const paragraph = text
    .split(/\n{2,}/)
    .map(cleanValue)
    .find((item) => item.length > 80)

  return paragraph || ""
}

export function parsePerfumeText(text: string): ParsedPerfumeFields {
  const normalizedText = text.trim()
  if (!normalizedText) return {}

  return {
    name: parseName(normalizedText),
    brand: parseBrand(normalizedText),
    family: parseFamily(normalizedText),
    concentration: parseConcentration(normalizedText),
    gender: parseGender(normalizedText),
    year: parseYear(normalizedText),
    description: parseDescription(normalizedText),
    tags: parseTags(normalizedText),
    topNotes: parseNotes(normalizedText, [
      "notas de salida",
      "salida",
      "top notes",
      "top",
    ]),
    heartNotes: parseNotes(normalizedText, [
      "notas de corazón",
      "notas de corazon",
      "corazón",
      "corazon",
      "heart notes",
      "middle notes",
      "heart",
    ]),
    baseNotes: parseNotes(normalizedText, [
      "notas de fondo",
      "fondo",
      "base notes",
      "base",
    ]),
  }
}

export function parsedEntries(fields: ParsedPerfumeFields) {
  return Object.entries(fields).filter(([, value]) => Boolean(value?.trim()))
}
