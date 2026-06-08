import type { Perfume } from "../data/types"
import { getPerfumes as getLocalPerfumes } from "../data/legacy/getPerfumes"
import { isUuid } from "../shared/utils/text"
import { getOrCreateBrandId } from "./brandRepository"
import { mapCatalogRow, toPerfumePayload } from "./perfumeMapper"
import type { CatalogPerfumeRow, PerfumeInput } from "./perfumeTypes"
import { hasSupabaseConfig, getSupabaseClient } from "./supabaseClient"

export type { PerfumeInput } from "./perfumeTypes"

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
    throw new Error(error.message)
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
    throw new Error(error.message)
  }
}

export async function deletePerfume(id: string): Promise<void> {
  if (!hasSupabaseConfig) {
    throw new Error("Supabase no está configurado para eliminar perfumes.")
  }

  const supabase = await getSupabaseClient()

  const request = isUuid(id)
    ? supabase.from("perfumes").update({ is_active: false }).eq("id", id)
    : supabase.from("perfumes").update({ is_active: false }).eq("legacy_id", id)

  const { error } = await request

  if (error) {
    throw new Error(error.message)
  }
}

export { uploadPerfumeImage } from "./perfumeImageStorage"
