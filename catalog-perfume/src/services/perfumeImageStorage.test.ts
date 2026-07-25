import { afterEach, describe, expect, it, vi } from "vitest"
import {
  deletePerfumeImage,
  getPerfumeImageStoragePath,
  uploadPerfumeImage,
} from "./perfumeImageStorage"

vi.mock("./supabaseClient", () => ({
  hasSupabaseConfig: true,
  getSupabaseClient: vi.fn(async () => ({
    auth: {
      getSession: vi.fn(async () => ({
        data: { session: { access_token: "test-token" } },
      })),
    },
  })),
}))

describe("perfumeImageStorage", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("sube una imagen optimizada y conserva sus métricas", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          path: "perfumes/test.webp",
          publicUrl: "https://example.com/test.webp",
          original: { bytes: 2_000_000 },
          optimized: { bytes: 200_000 },
          savedPercent: 90,
        }),
        { status: 201, headers: { "content-type": "application/json" } },
      ),
    )
    vi.stubGlobal("fetch", fetchMock)

    await expect(
      uploadPerfumeImage(
        new File(["image"], "perfume.png", { type: "image/png" }),
      ),
    ).resolves.toMatchObject({
      path: "perfumes/test.webp",
      optimization: {
        originalBytes: 2_000_000,
        optimizedBytes: 200_000,
        savedPercent: 90,
      },
    })
  })

  it("solicita eliminar el archivo con la sesión admin", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ ok: true }), { status: 200 }),
    )
    vi.stubGlobal("fetch", fetchMock)

    await deletePerfumeImage("perfumes/test.webp")

    expect(fetchMock).toHaveBeenCalledWith(
      "/api/optimize-image",
      expect.objectContaining({
        method: "DELETE",
        body: JSON.stringify({ path: "perfumes/test.webp" }),
      }),
    )
  })

  it("recupera rutas de Storage desde URLs antiguas", () => {
    expect(
      getPerfumeImageStoragePath(
        "https://project.supabase.co/storage/v1/object/public/perfume-images/perfumes/test.webp",
      ),
    ).toBe("perfumes/test.webp")
  })
})
