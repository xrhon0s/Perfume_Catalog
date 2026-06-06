import { create } from "zustand"

interface UIState {
  isFilterOpen: boolean
  openFilters: () => void
  closeFilters: () => void
  toggleFilters: () => void
  pageIndex: number
  totalPages: number
  setPageIndex: (index: number) => void
  setTotalPages: (total: number) => void
  jumpToPageRequest: number | null
  requestJumpToPage: (pageIndex0Based: number) => void
  consumeJumpToPage: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isFilterOpen: false,
  openFilters: () => set({ isFilterOpen: true }),
  closeFilters: () => set({ isFilterOpen: false }),
  toggleFilters: () =>
    set((state) => ({ isFilterOpen: !state.isFilterOpen })),
  pageIndex: 0,
  totalPages: 0,
  setPageIndex: (index) => set({ pageIndex: index }),
  setTotalPages: (total) => set({ totalPages: total }),
  jumpToPageRequest: null,
  requestJumpToPage: (pageIndex0Based) =>
    set({ jumpToPageRequest: pageIndex0Based }),
  consumeJumpToPage: () => set({ jumpToPageRequest: null }),
}))
