import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { useCartStore } from "../../store/cartStore"
import CartDrawer from "./CartDrawer"

const createCatalogOrder = vi.fn()

vi.mock("../../services/orderRepository", () => ({
  createCatalogOrder: (...args: unknown[]) => createCatalogOrder(...args),
}))

describe("CartDrawer", () => {
  afterEach(cleanup)

  beforeEach(() => {
    createCatalogOrder.mockReset()
    useCartStore.setState({
      isOpen: true,
      items: [
        {
          inventoryItemId: "inventory-id",
          perfumeId: "perfume-id",
          name: "9PM",
          brand: "Afnan",
          sizeMl: 100,
          unitPrice: 80000,
          stockQuantity: 3,
          quantity: 1,
        },
      ],
    })
  })

  it("muestra las dos rutas para finalizar el pedido", () => {
    render(<CartDrawer />)

    expect(
      screen.getByRole("button", {
        name: "Continuar ahora por WhatsApp",
      }),
    ).toBeVisible()
    expect(
      screen.getByRole("button", {
        name: "Enviar solicitud para revisión",
      }),
    ).toBeVisible()
  })

  it("guarda la solicitud y muestra su referencia", async () => {
    createCatalogOrder.mockResolvedValue({
      order_id: "order-id",
      reference: "ETER-001001",
      subtotal: 80000,
    })
    render(<CartDrawer />)

    fireEvent.change(screen.getByLabelText("Nombre *"), {
      target: { value: "Daniel" },
    })
    fireEvent.change(screen.getByLabelText("WhatsApp *"), {
      target: { value: "3126485885" },
    })
    fireEvent.change(screen.getByLabelText("Departamento *"), {
      target: { value: "Antioquia" },
    })
    fireEvent.change(screen.getByLabelText("Municipio *"), {
      target: { value: "Medellín" },
    })
    fireEvent.change(screen.getByLabelText("Dirección *"), {
      target: { value: "Carrera 43 # 10-20" },
    })
    fireEvent.click(
      screen.getByRole("button", {
        name: "Enviar solicitud para revisión",
      }),
    )

    await waitFor(() => {
      expect(screen.getByText("Solicitud recibida")).toBeVisible()
    })
    expect(createCatalogOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        department: "Antioquia",
        municipality: "Medellín",
        address: "Carrera 43 # 10-20",
      }),
      expect.any(Array),
    )
    expect(screen.getByText(/ETER-001001/)).toBeVisible()
    expect(useCartStore.getState().items).toEqual([])
  })

  it("conserva el drawer durante la animación y lo desmonta al cerrar", async () => {
    render(<CartDrawer />)

    fireEvent.click(screen.getByRole("button", { name: "Cerrar" }))

    expect(screen.getByRole("dialog", { name: "Carrito" })).toBeInTheDocument()
    await waitFor(() => {
      expect(
        screen.queryByRole("dialog", { name: "Carrito" }),
      ).not.toBeInTheDocument()
    })
  })
})
