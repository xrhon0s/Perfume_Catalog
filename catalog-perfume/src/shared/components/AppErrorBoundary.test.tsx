import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import AppErrorBoundary from "./AppErrorBoundary"

function BrokenView({ fail }: { fail: boolean }) {
  if (fail) throw new Error("fallo de prueba")
  return <p>Contenido recuperado</p>
}

describe("AppErrorBoundary", () => {
  it("muestra una salida recuperable ante un error inesperado", () => {
    const consoleError = vi.spyOn(console, "error").mockImplementation(() => undefined)

    const { rerender } = render(
      <AppErrorBoundary>
        <BrokenView fail />
      </AppErrorBoundary>,
    )

    expect(screen.getByText("No pudimos mostrar esta pantalla")).toBeVisible()

    rerender(
      <AppErrorBoundary>
        <BrokenView fail={false} />
      </AppErrorBoundary>,
    )
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }))

    expect(screen.getByText("Contenido recuperado")).toBeVisible()
    consoleError.mockRestore()
  })
})
