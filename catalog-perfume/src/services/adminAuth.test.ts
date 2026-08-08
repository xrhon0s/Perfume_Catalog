import { beforeEach, describe, expect, it, vi } from "vitest"
import { isCurrentUserAdmin } from "./adminAuth"

const mocks = vi.hoisted(() => ({
  rpc: vi.fn(),
}))

vi.mock("./supabaseClient", () => ({
  hasSupabaseConfig: true,
  getSupabaseClient: vi.fn(async () => ({ rpc: mocks.rpc })),
}))

describe("isCurrentUserAdmin", () => {
  beforeEach(() => {
    mocks.rpc.mockReset()
  })

  it("autoriza únicamente cuando la función de Supabase responde true", async () => {
    mocks.rpc.mockResolvedValue({ data: true, error: null })

    await expect(isCurrentUserAdmin()).resolves.toBe(true)
    expect(mocks.rpc).toHaveBeenCalledWith("is_admin")
  })

  it("propaga un fallo de permisos", async () => {
    mocks.rpc.mockResolvedValue({
      data: null,
      error: { message: "permission denied" },
    })

    await expect(isCurrentUserAdmin()).rejects.toThrow("permission denied")
  })
})
