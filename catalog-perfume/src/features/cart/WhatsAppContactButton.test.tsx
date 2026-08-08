import { cleanup, render, screen } from "@testing-library/react"
import { afterEach, describe, expect, it, vi } from "vitest"
import WhatsAppContactButton from "./WhatsAppContactButton"

describe("WhatsAppContactButton", () => {
  afterEach(() => {
    cleanup()
    vi.unstubAllEnvs()
  })

  it("abre el número comercial con un mensaje de asesoría", () => {
    vi.stubEnv("VITE_WHATSAPP_NUMBER", "573126485885")

    render(<WhatsAppContactButton className="grid h-10 w-10" />)

    const link = screen.getByRole("link", { name: "Hablar por WhatsApp" })
    expect(link).toHaveAttribute(
      "href",
      expect.stringContaining("https://wa.me/573126485885"),
    )
    expect(decodeURIComponent(link.getAttribute("href") ?? "")).toContain(
      "asesoría sobre el catálogo",
    )
  })
})
