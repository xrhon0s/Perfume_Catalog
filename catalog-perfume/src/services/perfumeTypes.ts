import type { Perfume } from "../data/types"

export type CatalogPerfumeRow = {
  id: string
  legacy_id: string | null
  name: string
  brand: string
  image: string | null
  family: Perfume["family"] | null
  concentration: Perfume["concentration"] | null
  gender: Perfume["gender"] | null
  year: number | null
  description: string | null
  tags: string[] | null
  notes: Perfume["notes"] | null
  is_active: boolean
}

export type PerfumeInput = {
  id?: string
  name: string
  brand: string
  image?: string
  imagePath?: string
  family?: Perfume["family"]
  concentration?: Perfume["concentration"]
  gender?: Perfume["gender"]
  year?: number
  description?: string
  tags?: string[]
  notes?: Perfume["notes"]
  isActive?: boolean
}
