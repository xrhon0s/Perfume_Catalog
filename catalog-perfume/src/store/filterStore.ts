import { create } from "zustand"
import type { OlfactiveFamily } from "../data/types"

interface FiltersState {
  query: string
  setQuery: (value: string) => void

  brands: string[]
  toggleBrand: (name: string) => void

  families: OlfactiveFamily[]
  toggleFamily: (family: OlfactiveFamily) => void

  clearFilters: () => void
}

export const useFiltersStore = create<FiltersState>((set) => ({
  query: "",
  setQuery: (value) => set({ query: value }),

  brands: [],
  toggleBrand: (name) =>
    set((state) => ({
      brands: state.brands.includes(name)
        ? state.brands.filter((b) => b !== name)
        : [...state.brands, name],
    })),

  families: [],
  toggleFamily: (family) =>
    set((state) => ({
      families: state.families.includes(family)
        ? state.families.filter((f) => f !== family)
        : [...state.families, family],
    })),

  clearFilters: () => set({ query: "", brands: [], families: [] }),
}))
