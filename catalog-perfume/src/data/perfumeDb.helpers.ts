
import type { OlfactiveFamily, Perfume } from "./types"
import { perfumeDb } from "./perfumeDb"


/**
 * Devuelve todos los perfumes (como si fuera un endpoint GET /perfumes)
 */
export function getPerfumes(): Perfume[] {
  return perfumeDb
}

/**
 * Busca 1 perfume por id (GET /perfumes/:id)
 */
export function getPerfumeById(id: string): Perfume | undefined {
  return perfumeDb.find((p) => p.id === id)
}

/**
 * Lista de marcas únicas (para filtros)
 */
export function getBrands(): string[] {
  return Array.from(new Set(perfumeDb.map((p) => p.brand))).sort()
}

/**
 * Lista de familias únicas (para filtros)
 */

export function getFamilies(): OlfactiveFamily[] {
  const families = perfumeDb
    .map((p) => p.family)
    .filter((f): f is OlfactiveFamily => Boolean(f))

  return Array.from(new Set(families)).sort()
}

/**
 * Lista de tags únicas (para filtros opcionales)
 */
export function getTags(): string[] {
  return Array.from(
    new Set(perfumeDb.flatMap((p) => p.tags ?? []))
  ).sort()
}
