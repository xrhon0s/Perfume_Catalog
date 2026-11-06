import {
  cleanup,
  fireEvent,
  render,
  screen,
  within,
} from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import type { Perfume } from "../../data/types"
import { useCartStore } from "../../store/cartStore"
import MagazinePage from "./MagazinePage"

const perfume: Perfume = {
  id: "test",
  name: "Perfume de prueba",
  brand: "Casa de prueba",
  image: "https://example.com/perfume.webp",
  family: "Floral",
  concentration: "EDP",
  gender: "Unisex",
  year: 2024,
  inventory: {
    id: "inventory-test",
    sku: "CASA-PRUEBA-100",
    sizeMl: 100,
    salePrice: 189900,
    stockQuantity: 7,
  },
}

describe("MagazinePage", () => {
  afterEach(cleanup)

  beforeEach(() => {
    useCartStore.setState({ items: [], isOpen: false })
  })

  it("muestra la información esencial y abre el detalle", () => {
    const onView = vi.fn()

    render(<MagazinePage side="left" perfume={perfume} onView={onView} />)

    expect(screen.getByText("Casa de prueba")).toBeVisible()
    expect(screen.getByText("Perfume de prueba")).toBeVisible()
    expect(
      screen.getByText("Floral · EDP · Unisex · 2024 · 100 ml"),
    ).toBeVisible()
    expect(screen.getByText(/189.900/)).toBeVisible()
    expect(screen.getByText("Precio al detal")).toBeVisible()
    expect(screen.getByText("7 disponibles")).toBeVisible()

    fireEvent.click(screen.getByRole("button", { name: "Ver detalles" }))
    expect(onView).toHaveBeenCalledTimes(1)
  })

  it("agrega el perfume disponible al carrito", () => {
    render(<MagazinePage side="left" perfume={perfume} />)

    fireEvent.click(
      screen.getByRole("button", {
        name: "Agregar Perfume de prueba al carrito",
      }),
    )

    expect(useCartStore.getState().items).toHaveLength(1)
    expect(useCartStore.getState().isOpen).toBe(true)
  })

  it("usa el respaldo editorial cuando la imagen falla", () => {
    const { container } = render(
      <MagazinePage side="right" perfume={perfume} />,
    )
    const view = within(container)

    fireEvent.error(
      view.getByRole("img", {
        name: "Perfume de prueba de Casa de prueba",
      }),
    )

    expect(
      view.queryByRole("img", {
        name: "Perfume de prueba de Casa de prueba",
      }),
    ).not.toBeInTheDocument()
    expect(view.getByText("Éter")).toBeVisible()
  })

  it("muestra el producto completo sin recortarlo para llenar la página", () => {
    render(<MagazinePage side="left" perfume={perfume} />)

    expect(
      screen.getByRole("img", {
        name: "Perfume de prueba de Casa de prueba",
      }),
    ).toHaveClass("object-contain", "object-center")
  })
})
