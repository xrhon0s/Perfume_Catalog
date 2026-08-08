import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import Catalog from "./Catalog"

const mocks = vi.hoisted(() => ({
  loadPerfumes: vi.fn(),
  clearFilters: vi.fn(),
  catalogState: {
    perfumes: [] as Array<Record<string, unknown>>,
    isLoading: false,
    error: null as string | null,
  },
}))

vi.mock("../store/catalogStore", () => ({
  useCatalogStore: (
    selector: (state: Record<string, unknown>) => unknown,
  ) =>
    selector({
      ...mocks.catalogState,
      loadPerfumes: mocks.loadPerfumes,
    }),
}))

vi.mock("../store/filterStore", () => ({
  useFiltersStore: (
    selector: (state: Record<string, unknown>) => unknown,
  ) =>
    selector({
      brands: [],
      families: [],
      query: "",
      clearFilters: mocks.clearFilters,
    }),
}))

vi.mock("../components/flipbook/PerfumeFlipbook", () => ({
  default: () => <div>Flipbook</div>,
}))

vi.mock("../components/perfumes/PerfumeDetailModal", () => ({
  default: () => <div>Detalle</div>,
}))

describe("Catalog", () => {
  beforeEach(() => {
    mocks.loadPerfumes.mockReset()
    mocks.catalogState.perfumes = []
    mocks.catalogState.isLoading = false
    mocks.catalogState.error = null
  })

  it("permite reintentar cuando Supabase no responde", () => {
    mocks.catalogState.error = "No se pudo conectar con Supabase."

    render(<Catalog />)
    mocks.loadPerfumes.mockClear()
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }))

    expect(mocks.loadPerfumes).toHaveBeenCalledTimes(1)
    expect(screen.getByText("No pudimos cargar los perfumes")).toBeVisible()
  })

  it("conserva el catálogo visible si falla una actualización", () => {
    mocks.catalogState.perfumes = [
      {
        id: "test-perfume",
        name: "Perfume prueba",
        brand: "Marca prueba",
      },
    ]
    mocks.catalogState.error = "No se pudo actualizar."

    render(<Catalog />)

    expect(screen.getByText("Flipbook")).toBeVisible()
    expect(screen.getByText("No se pudo actualizar.")).toBeVisible()
  })
})
