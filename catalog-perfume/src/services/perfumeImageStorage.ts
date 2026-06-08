import { toSlug } from "../shared/utils/text"
import { hasSupabaseConfig, getSupabaseClient } from "./supabaseClient"

const PERFUME_IMAGE_BUCKET = "perfume-images"

export async function uploadPerfumeImage(file: File): Promise<string> {
  if (!hasSupabaseConfig) {
    throw new Error("Supabase no está configurado para subir imágenes.")
  }

  const supabase = await getSupabaseClient()
  const extension = file.name.split(".").pop() ?? "jpg"
  const safeName = toSlug(file.name.replace(/\.[^/.]+$/, "")) || "perfume"
  const path = `${Date.now()}-${safeName}.${extension}`

  const { error } = await supabase.storage
    .from(PERFUME_IMAGE_BUCKET)
    .upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
    })

  if (error) {
    throw new Error(error.message)
  }

  const { data } = supabase.storage.from(PERFUME_IMAGE_BUCKET).getPublicUrl(path)

  return data.publicUrl
}
