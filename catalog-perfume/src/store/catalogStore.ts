import { create } from "zustand"
import type { Perfume } from "../data/types"
import {
  deletePerfume,
  deletePerfumeImage,
  listAdminPerfumes,
  listPerfumes,
  savePerfume,
  type DeletedPerfume,
  type PerfumeInput,
  type UploadedPerfumeImage,
  uploadPerfumeImage,
} from "../services/perfumeRepository"

type CatalogState = {
  perfumes: Perfume[]
  isLoading: boolean
  error: string | null
  loadPerfumes: () => Promise<void>
  loadAdminPerfumes: () => Promise<void>
  savePerfume: (perfume: PerfumeInput) => Promise<void>
  deletePerfume: (id: string) => Promise<DeletedPerfume>
  uploadPerfumeImage: (file: File) => Promise<UploadedPerfumeImage>
  deletePerfumeImage: (path: string) => Promise<void>
}

export const useCatalogStore = create<CatalogState>((set, get) => ({
  perfumes: [],
  isLoading: false,
  error: null,

  loadPerfumes: async () => {
    set({ isLoading: true, error: null })
    try {
      set({ perfumes: await listPerfumes(), isLoading: false })
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : "No se pudo cargar el catálogo.",
        isLoading: false,
      })
    }
  },

  loadAdminPerfumes: async () => {
    set({ isLoading: true, error: null })
    try {
      set({ perfumes: await listAdminPerfumes(), isLoading: false })
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "No se pudo cargar el catálogo administrativo.",
        isLoading: false,
      })
    }
  },

  savePerfume: async (perfume) => {
    await savePerfume(perfume)
    await get().loadAdminPerfumes()
  },

  deletePerfume: async (id) => {
    const deleted = await deletePerfume(id)
    set((state) => ({
      perfumes: state.perfumes.filter((perfume) => perfume.id !== id),
    }))
    await get().loadAdminPerfumes()
    return deleted
  },

  uploadPerfumeImage,
  deletePerfumeImage,
}))
