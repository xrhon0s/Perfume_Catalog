import { toSlug } from "../shared/utils/text"
import { hasSupabaseConfig, getSupabaseClient } from "./supabaseClient"

const PERFUME_IMAGE_BUCKET = "perfume-images"
const MAX_DIRECT_UPLOAD_BYTES = 3 * 1024 * 1024
const MAX_OPTIMIZER_UPLOAD_BYTES = 8 * 1024 * 1024
const IMAGE_OPTIMIZER_URL = (
  (import.meta.env.VITE_IMAGE_OPTIMIZER_URL as string | undefined) || "/api/optimize-image"
)?.replace(/\/$/, "")
const IMAGE_OPTIMIZER_STORAGE = import.meta.env.VITE_IMAGE_OPTIMIZER_STORAGE as
  | string
  | undefined

type OptimizedImageResponse = {
  path?: string
  publicUrl?: string
  message?: string
}

export type UploadedPerfumeImage = {
  path: string
  publicUrl: string
}

export async function uploadPerfumeImage(file: File): Promise<UploadedPerfumeImage> {
  if (!file.type.startsWith("image/")) {
    throw new Error("Selecciona un archivo de imagen válido.")
  }

  if (IMAGE_OPTIMIZER_URL) {
    return uploadWithOptimizer(file)
  }

  return uploadDirectlyToSupabase(file)
}

async function uploadWithOptimizer(file: File): Promise<UploadedPerfumeImage> {
  if (file.size > MAX_OPTIMIZER_UPLOAD_BYTES) {
    throw new Error("La imagen debe pesar máximo 8 MB antes de optimizarse.")
  }

  const formData = new FormData()
  formData.append("image", file)

  const params = new URLSearchParams({
    width: "1200",
    quality: "78",
    prefix: "perfumes",
  })

  if (IMAGE_OPTIMIZER_STORAGE) {
    params.set("storage", IMAGE_OPTIMIZER_STORAGE)
  }

  const supabase = hasSupabaseConfig ? await getSupabaseClient() : null
  const { data: sessionData } = supabase
    ? await supabase.auth.getSession()
    : { data: { session: null } }
  const accessToken = sessionData.session?.access_token

  const endpoint = IMAGE_OPTIMIZER_URL.startsWith("/")
    ? IMAGE_OPTIMIZER_URL
    : `${IMAGE_OPTIMIZER_URL}/optimize`

  const response = await fetch(`${endpoint}?${params.toString()}`, {
    method: "POST",
    headers: accessToken
      ? {
          Authorization: `Bearer ${accessToken}`,
        }
      : undefined,
    body: formData,
  })
  const data = (await response.json().catch(() => null)) as OptimizedImageResponse | null

  if (!response.ok) {
    throw new Error(
      data?.message || "No se pudo optimizar y subir la imagen. Revisa el servicio de imágenes.",
    )
  }

  if (!data?.publicUrl || !data.path) {
    throw new Error("El servicio de imágenes no devolvió una URL válida.")
  }

  return {
    path: data.path,
    publicUrl: data.publicUrl,
  }
}

async function uploadDirectlyToSupabase(file: File): Promise<UploadedPerfumeImage> {
  if (!hasSupabaseConfig) {
    throw new Error("Supabase no está configurado para subir imágenes.")
  }

  if (file.size > MAX_DIRECT_UPLOAD_BYTES) {
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
