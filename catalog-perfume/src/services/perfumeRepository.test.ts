import { beforeEach, describe, expect, it, vi } from "vitest"
import {
  deletePerfume,
  listAdminPerfumes,
  savePerfume,
} from "./perfumeRepository"

const mocks = vi.hoisted(() => ({
  from: vi.fn(),
  rpc: vi.fn(),
  getOrCreateBrandId: vi.fn(),
}))

vi.mock("./supabaseClient", () => ({
  hasSupabaseConfig: true,
  getSupabaseClient: vi.fn(async () => ({
    from: mocks.from,
    rpc: mocks.rpc,
  })),
}))

vi.mock("./brandRepository", () => ({
  getOrCreateBrandId: mocks.getOrCreateBrandId,
}))

describe("perfumeRepository", () => {
  beforeEach(() => {
    mocks.from.mockReset()
    mocks.rpc.mockReset()
    mocks.getOrCreateBrandId.mockReset()
  })

  it("crea un perfume con su marca resuelta", async () => {
    const insert = vi.fn(async () => ({ error: null }))
    mocks.getOrCreateBrandId.mockResolvedValue("brand-id")
    mocks.from.mockReturnValue({ insert })

    await savePerfume({
      name: "Yara Candy",
      brand: "Lattafa",
      family: "Gourmand",
      concentration: "EDP",
      gender: "Femenino",
    })

    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        brand_id: "brand-id",
        name: "Yara Candy",
        slug: "yara-candy",
      }),
    )
  })

  it("edita por UUID sin crear otra fila", async () => {
    const eq = vi.fn(async () => ({ error: null }))
    const update = vi.fn(() => ({ eq }))
    mocks.getOrCreateBrandId.mockResolvedValue("brand-id")
    mocks.from.mockReturnValue({ update })
    const id = "6d9635f1-22f9-4414-b30a-42af96c1ca22"

    await savePerfume({
      id,
      name: "Yara Candy",
      brand: "Lattafa",
    })

    expect(update).toHaveBeenCalledOnce()
    expect(eq).toHaveBeenCalledWith("id", id)
  })

  it("entrega UUIDs al panel incluso para perfumes migrados", async () => {
    const order = vi.fn(async () => ({
      data: [
        {
          id: "6d9635f1-22f9-4414-b30a-42af96c1ca22",
          legacy_id: "lattafa-yara-candy",
          name: "Yara Candy",
          brand: "Lattafa",
          image: null,
          image_path: null,
          family: "Gourmand",
          concentration: "EDP",
          gender: "Femenino",
          year: 2024,
          description: null,
          tags: [],
          notes: {},
          is_active: true,
          inventory_item_id: null,
          sku: null,
          size_ml: null,
          sale_price: null,
          stock_quantity: null,
        },
      ],
      error: null,
    }))
    const firstOrder = vi.fn(() => ({ order }))
    const select = vi.fn(() => ({ order: firstOrder }))
    mocks.from.mockReturnValue({ select })

    const perfumes = await listAdminPerfumes()

    expect(perfumes[0]?.id).toBe(
      "6d9635f1-22f9-4414-b30a-42af96c1ca22",
    )
  })

  it("guarda la presentación principal y ajusta sus existencias", async () => {
    mocks.rpc.mockResolvedValue({ error: null })

    await savePerfume({
      name: "Yara Candy",
      brand: "Lattafa",
      family: "Gourmand",
      concentration: "EDP",
      gender: "Femenino",
      inventory: {
        sizeMl: 100,
        salePrice: 189900,
        stockQuantity: 7,
      },
    })

    expect(mocks.rpc).toHaveBeenCalledWith(
      "save_perfume_product",
      expect.objectContaining({
        requested_perfume_id: null,
        requested_legacy_id: null,
        requested_brand_name: "Lattafa",
        requested_name: "Yara Candy",
        requested_slug: "yara-candy",
        requested_sku: null,
        requested_size_ml: 100,
        requested_sale_price: 189900,
        requested_stock_quantity: 7,
      }),
    )
  })

  it("explica claramente cuando nombre y marca ya existen", async () => {
    mocks.rpc.mockResolvedValue({
      error: {
        code: "23505",
        message:
          'duplicate key value violates unique constraint "perfumes_brand_id_slug_key"',
      },
    })

    await expect(
      savePerfume({
        name: "Yara Candy",
        brand: "Lattafa",
        inventory: {
          sizeMl: 100,
          salePrice: 189900,
          stockQuantity: 7,
        },
      }),
    ).rejects.toThrow(
      "Ya existe un perfume con ese nombre dentro de la misma marca.",
    )
  })

  it("confirma la fila borrada y devuelve su imagen", async () => {
    const maybeSingle = vi.fn(async () => ({
      data: {
        id: "6d9635f1-22f9-4414-b30a-42af96c1ca22",
        primary_image_path: "perfumes/yara.webp",
        primary_image_url: "https://example.com/yara.webp",
      },
      error: null,
    }))
    const select = vi.fn(() => ({ maybeSingle }))
    const eq = vi.fn(() => ({ select }))
    const remove = vi.fn(() => ({ eq }))
    mocks.from.mockReturnValue({ delete: remove })

    await expect(
      deletePerfume("6d9635f1-22f9-4414-b30a-42af96c1ca22"),
    ).resolves.toEqual({
      id: "6d9635f1-22f9-4414-b30a-42af96c1ca22",
      imagePath: "perfumes/yara.webp",
      imageUrl: "https://example.com/yara.webp",
    })
  })

  it("rechaza un éxito vacío de Supabase", async () => {
    const maybeSingle = vi.fn(async () => ({ data: null, error: null }))
    const select = vi.fn(() => ({ maybeSingle }))
    const eq = vi.fn(() => ({ select }))
    mocks.from.mockReturnValue({ delete: vi.fn(() => ({ eq })) })

    await expect(deletePerfume("legacy-perfume")).rejects.toThrow(
      "Supabase no eliminó ningún perfume",
    )
  })
})
