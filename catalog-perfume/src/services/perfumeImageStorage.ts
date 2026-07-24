import { toSlug } from "../shared/utils/text"
import { hasSupabaseConfig, getSupabaseClient } from "./supabaseClient"

const PERFUME_IMAGE_BUCKET = "perfume-images"
const MAX_IMAGE_SIZE_BYTES = 3 * 1024 * 1024

export type UploadedPerfumeImage = {
  path: string
  publicUrl: string
}

export async function uploadPerfumeImage(file: File): Promise<UploadedPerfumeImage> {
  if (!hasSupabaseConfig) {
    throw new Error("Supabase no está configurado para subir imágenes.")
  }

  if (!file.type.startsWith("image/")) {
    throw new Error("Selecciona un archivo de imagen válido.")
  }

  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new Error("La imagen debe pesar máximo 3 MB.")
  }

  const supabase = await getSupabaseClient()
  const extension = file.name.split(".").pop() ?? "jpg"
  const safeName = toSlug(file.name.replace(/\.[^/.]+$/, "")) || "perfume"
  const path = `perfumes/${Date.now()}-${safeName}.${extension}`

  const { error } = await supabase.storage
    .from(PERFUME_IMAGE_BUCKET)
    .upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
    })

  if (error) {
    const statusCode = "statusCode" in error ? String(error.statusCode) : ""
    throw new Error(
      statusCode === "403" || error.message.toLowerCase().includes("permission")
        ? "No tienes permisos de administrador para subir imágenes."
        : error.message,
    )
  }

  const { data } = supabase.storage.from(PERFUME_IMAGE_BUCKET).getPublicUrl(path)

  return {
    path,
    publicUrl: data.publicUrl,
  }
}
