import { fireEvent, render, screen, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import type { Perfume } from "../../data/types"
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
    sku: "CASA-PRUEBA-100",
    sizeMl: 100,
    salePrice: 189900,
    stockQuantity: 7,
  },
}

describe("MagazinePage", () => {
  it("muestra la información esencial y abre el detalle", () => {
    const onView = vi.fn()

    render(<MagazinePage side="left" perfume={perfume} onView={onView} />)

    expect(screen.getByText("Casa de prueba")).toBeVisible()
    expect(screen.getByText("Perfume de prueba")).toBeVisible()
    expect(
      screen.getByText("Floral · EDP · Unisex · 2024 · 100 ml"),
    ).toBeVisible()
    expect(screen.getByText(/189.900/)).toBeVisible()
    expect(screen.getByText("7 disponibles")).toBeVisible()

    fireEvent.click(screen.getByRole("button", { name: "Ver detalles" }))
    expect(onView).toHaveBeenCalledTimes(1)
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
})
