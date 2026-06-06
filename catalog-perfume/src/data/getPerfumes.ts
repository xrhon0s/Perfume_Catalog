import type { Perfume } from "./types"
import { perfumeDb } from "./perfumeDb"
import { perfumeDetails } from "./perfumeDetails"

const perfumes: Perfume[] = perfumeDb.map((p) => {
  const extra = perfumeDetails[p.id]
  return extra ? { ...p, ...extra } : p
})

export function getPerfumes(): Perfume[] {
  return perfumes
}

export function getPerfumeById(id: string): Perfume | undefined {
  return getPerfumes().find((p) => p.id === id)
}

export function getBrands(): string[] {
  return Array.from(new Set(getPerfumes().map((p) => p.brand))).sort((a, b) =>
    a.localeCompare(b),
  )
}

export function getFamilies(): NonNullable<Perfume["family"]>[] {
  return Array.from(
    new Set(
      getPerfumes()
        .map((p) => p.family)
        .filter((family): family is NonNullable<Perfume["family"]> =>
          Boolean(family),
        ),
    ),
  ).sort((a, b) => a.localeCompare(b))
}

export function getTags(): string[] {
  return Array.from(new Set(getPerfumes().flatMap((p) => p.tags ?? []))).sort(
    (a, b) => a.localeCompare(b),
  )
}
