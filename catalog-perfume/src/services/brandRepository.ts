import { toSlug } from "../shared/utils/text"
import { getSupabaseClient } from "./supabaseClient"

export async function getOrCreateBrandId(name: string) {
  const supabase = await getSupabaseClient()
  const brandName = name.trim()
  const brandSlug = toSlug(brandName)

  const { data, error } = await supabase
    .from("brands")
    .upsert({ name: brandName, slug: brandSlug }, { onConflict: "slug" })
    .select("id")
    .single()

  if (error) {
    throw new Error(
      error.code === "42501"
        ? "No tienes permisos de administrador para guardar marcas."
        : error.message,
    )
  }

  return data.id as string
}
