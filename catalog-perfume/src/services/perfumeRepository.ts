import type { Perfume } from "../data/types"
import { getPerfumes as getLocalPerfumes } from "../data/legacy/getPerfumes"
import { isUuid } from "../shared/utils/text"
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
