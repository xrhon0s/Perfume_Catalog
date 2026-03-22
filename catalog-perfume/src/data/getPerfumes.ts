import type { Perfume } from "./types"
import { perfumeDb } from "./perfumeDb"
import { perfumeDetails } from "./perfumeDetails"

export function getPerfumes(): Perfume[] {
  return perfumeDb.map((p) => {
    const extra = perfumeDetails[p.id]
    return extra ? { ...p, ...extra } : p
  })
}
