import type { Perfume } from "../data/types"
import { getPerfumes as getLocalPerfumes } from "../data/legacy/getPerfumes"
import { isUuid, toSlug } from "../shared/utils/text"
import { getOrCreateBrandId } from "./brandRepository"
import { mapCatalogRow, toPerfumePayload } from "./perfumeMapper"
import type { CatalogPerfumeRow, PerfumeInput } from "./perfumeTypes"
import { hasSupabaseConfig, getSupabaseClient } from "./supabaseClient"

export type { PerfumeInput } from "./perfumeTypes"
export type { UploadedPerfumeImage } from "./perfumeImageStorage"

export type DeletedPerfume = {
  id: string
  imagePath?: string
  imageUrl?: string
}

export async function listPerfumes(): Promise<Perfume[]> {
  if (!hasSupabaseConfig) {
    return getLocalPerfumes()
  }

  const supabase = await getSupabaseClient()

  const { data, error } = await supabase
    .from("catalog_perfumes")
    .select("*")
    .eq("is_active", true)
    .order("brand", { ascending: true })
    .order("name", { ascending: true })

  if (error) {
    throw new Error(
      error.code === "42501"
        ? "No tienes permisos para cargar el catálogo."
        : error.message,
    )
  }

  return (data as CatalogPerfumeRow[]).map(mapCatalogRow)
}

export async function listAdminPerfumes(): Promise<Perfume[]> {
  if (!hasSupabaseConfig) {
    return getLocalPerfumes()
  }

  const supabase = await getSupabaseClient()

  const { data, error } = await supabase
    .from("catalog_perfumes")
    .select("*")
    .order("brand", { ascending: true })
    .order("name", { ascending: true })

  if (error) {
    throw new Error(error.message)
  }

  return (data as CatalogPerfumeRow[]).map(mapCatalogRow)
}

export async function savePerfume(input: PerfumeInput): Promise<void> {
  if (!hasSupabaseConfig) {
    throw new Error("Supabase no está configurado para guardar perfumes.")
  }

  const supabase = await getSupabaseClient()

  if (input.inventory) {
    const { error: productError } = await supabase.rpc(
      "save_perfume_product",
      {
        requested_perfume_id:
          input.id && isUuid(input.id) ? input.id : null,
        requested_legacy_id:
          input.id && !isUuid(input.id) ? input.id : null,
        requested_brand_name: input.brand.trim(),
        requested_name: input.name.trim(),
        requested_slug: toSlug(input.name),
        requested_family: input.family || null,
        requested_concentration: input.concentration || null,
        requested_gender: input.gender || null,
        requested_year: input.year || null,
        requested_description: input.description || null,
        requested_tags: input.tags ?? [],
        requested_notes: input.notes ?? {},
        requested_image_url: input.image || null,
        requested_image_path: input.imagePath || null,
        requested_is_active: input.isActive ?? true,
        requested_sku: input.inventory.sku || null,
        requested_size_ml: input.inventory.sizeMl,
        requested_sale_price: input.inventory.salePrice,
        requested_stock_quantity: input.inventory.stockQuantity,
      },
    )

    if (productError) {
      throw new Error(
        productError.code === "PGRST202"
          ? "Ejecuta la migración 003_primary_inventory.sql en Supabase antes de guardar inventario."
          : productError.code === "42501"
            ? "No tienes permisos de administrador para guardar el producto."
            : productError.message,
      )
    }
    return
  }

  const brandId = await getOrCreateBrandId(input.brand)
  const payload = toPerfumePayload(input, brandId)

  const request =
    input.id && isUuid(input.id)
      ? supabase.from("perfumes").update(payload).eq("id", input.id)
      : input.id
        ? supabase.from("perfumes").upsert(payload, { onConflict: "legacy_id" })
        : supabase.from("perfumes").insert(payload)

  const { error } = await request

  if (error) {
    throw new Error(
      error.code === "42501"
        ? "No tienes permisos de administrador para guardar perfumes."
        : error.message,
    )
  }
}

export async function deletePerfume(id: string): Promise<DeletedPerfume> {
  if (!hasSupabaseConfig) {
    throw new Error("Supabase no está configurado para eliminar perfumes.")
  }

  const supabase = await getSupabaseClient()

  const request = isUuid(id)
    ? supabase
        .from("perfumes")
        .delete()
        .eq("id", id)
        .select("id, primary_image_path, primary_image_url")
        .maybeSingle()
    : supabase
        .from("perfumes")
        .delete()
        .eq("legacy_id", id)
        .select("id, primary_image_path, primary_image_url")
        .maybeSingle()

  const { data, error } = await request

  if (error) {
    throw new Error(
      error.code === "42501"
        ? "No tienes permisos de administrador para eliminar perfumes."
        : error.message,
    )
  }

  if (!data) {
    throw new Error(
      "Supabase no eliminó ningún perfume. Recarga la lista y vuelve a intentarlo.",
    )
  }

  return {
    id: data.id,
    imagePath: data.primary_image_path ?? undefined,
    imageUrl: data.primary_image_url ?? undefined,
  }
}

export {
  deletePerfumeImage,
  getPerfumeImageStoragePath,
  uploadPerfumeImage,
} from "./perfumeImageStorage"
