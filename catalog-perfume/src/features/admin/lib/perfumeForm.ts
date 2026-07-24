import type { Perfume } from "../../../data/types"
import type { PerfumeInput } from "../../../services/perfumeRepository"

export type PerfumeFormState = {
  id: string
  name: string
  brand: string
  image: string
  imagePath: string
  family: string
  concentration: string
  gender: string
  year: string
  description: string
  tags: string
  topNotes: string
  heartNotes: string
  baseNotes: string
  isActive: boolean
}

export const emptyPerfumeForm: PerfumeFormState = {
  id: "",
  name: "",
  brand: "",
  image: "",
  imagePath: "",
  family: "",
  concentration: "",
  gender: "",
  year: "",
  description: "",
  tags: "",
  topNotes: "",
  heartNotes: "",
  baseNotes: "",
  isActive: true,
}

function joinValues(values?: string[]) {
  return values?.join(", ") ?? ""
}

function splitValues(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean)
}

export function perfumeToForm(perfume: Perfume): PerfumeFormState {
  return {
    id: perfume.id,
    name: perfume.name,
    brand: perfume.brand,
    image: perfume.image ?? "",
    imagePath: "",
    family: perfume.family ?? "",
    concentration: perfume.concentration ?? "",
    gender: perfume.gender ?? "",
    year: perfume.year ? String(perfume.year) : "",
    description: perfume.description ?? "",
    tags: joinValues(perfume.tags),
    topNotes: joinValues(perfume.notes?.top),
    heartNotes: joinValues(perfume.notes?.heart),
    baseNotes: joinValues(perfume.notes?.base),
    isActive: perfume.isActive ?? true,
  }
}

export function formToPerfumeInput(form: PerfumeFormState): PerfumeInput {
  return {
    id: form.id || undefined,
    name: form.name,
    brand: form.brand,
    image: form.image || undefined,
    imagePath: form.imagePath || undefined,
    family: (form.family || undefined) as PerfumeInput["family"],
    concentration: (form.concentration ||
      undefined) as PerfumeInput["concentration"],
    gender: (form.gender || undefined) as PerfumeInput["gender"],
    year: form.year ? Number(form.year) : undefined,
    description: form.description || undefined,
    tags: splitValues(form.tags),
    notes: {
      top: splitValues(form.topNotes),
      heart: splitValues(form.heartNotes),
      base: splitValues(form.baseNotes),
    },
    isActive: form.isActive,
  }
}
