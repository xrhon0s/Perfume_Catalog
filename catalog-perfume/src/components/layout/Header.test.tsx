import { cleanup, fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { useFiltersStore } from "../../store/filterStore"
import { useUIStore } from "../../store/uiStore"
import Header from "./Header"

describe("Header catalog pagination", () => {
  afterEach(cleanup)

  beforeEach(() => {
    useFiltersStore.setState({ query: "", brands: [], families: [] })
    useUIStore.setState({
      pageIndex: 10,
      totalPages: 251,
      jumpToPageRequest: null,
    })
  })

  it("muestra páginas de catálogo y solicita el salto escrito", () => {
    render(<Header />)

    expect(screen.getByText("11")).toBeVisible()
    expect(screen.getByText(/de 251/)).toBeVisible()

    fireEvent.change(screen.getByLabelText("Número de página"), {
      target: { value: "25" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Ir a la página" }))

    expect(useUIStore.getState().jumpToPageRequest).toBe(24)
  })

  it("no permite páginas fuera del rango", () => {
    render(<Header />)

    const input = screen.getByLabelText("Número de página")
    const button = screen.getByRole("button", { name: "Ir a la página" })

    fireEvent.change(input, { target: { value: "252" } })
    expect(button).toBeDisabled()

    fireEvent.change(input, { target: { value: "0" } })
    expect(button).toBeDisabled()
  })
})
