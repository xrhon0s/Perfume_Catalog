import { readFile } from "node:fs/promises"
import type { IncomingMessage, ServerResponse } from "node:http"
import crypto from "node:crypto"
import formidable, { type File } from "formidable"
import sharp from "sharp"
import { createClient } from "@supabase/supabase-js"

export const config = {
  api: {
    bodyParser: false,
  },
}

const MAX_UPLOAD_MB = Number(process.env.MAX_UPLOAD_MB || 8)
const MAX_UPLOAD_BYTES = MAX_UPLOAD_MB * 1024 * 1024
const DEFAULT_MAX_WIDTH = Number(process.env.DEFAULT_MAX_WIDTH || 1200)
const DEFAULT_WEBP_QUALITY = Number(process.env.DEFAULT_WEBP_QUALITY || 78)
const SUPABASE_BUCKET = process.env.SUPABASE_BUCKET || "perfume-images"

type JsonPayload = Record<string, unknown>

function sendJson(response: ServerResponse, statusCode: number, payload: JsonPayload) {
  response.statusCode = statusCode
  response.setHeader("content-type", "application/json; charset=utf-8")
  response.end(JSON.stringify(payload))
}

function sanitizeFilename(value: string | null | undefined) {
  return (
    String(value || "image")
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-zA-Z0-9._-]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() || "image"
  )
}

function clamp(value: unknown, min: number, max: number, fallback: number) {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return fallback
  return Math.min(Math.max(Math.round(parsed), min), max)
}

function getSupabaseAdmin() {
  const supabaseUrl = process.env.SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.")
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })
}

async function readJsonBody(request: IncomingMessage) {
  const chunks: Buffer[] = []

  for await (const chunk of request) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }

  if (chunks.length === 0) return {}

  return JSON.parse(Buffer.concat(chunks).toString("utf8")) as Record<string, unknown>
}

async function requireAdmin(request: IncomingMessage) {
  const token = request.headers.authorization?.replace(/^Bearer\s+/i, "")
  if (!token) {
    const error = new Error("Inicia sesión como admin para subir imágenes.")
    Object.assign(error, { statusCode: 401 })
    throw error
  }

  const supabase = getSupabaseAdmin()
  const { data: userData, error: userError } = await supabase.auth.getUser(token)

  if (userError || !userData.user) {
    const error = new Error("La sesión no es válida o expiró.")
    Object.assign(error, { statusCode: 401 })
    throw error
  }

  const { data: adminUser, error: adminError } = await supabase
    .from("admin_users")
    .select("user_id")
    .eq("user_id", userData.user.id)
    .maybeSingle()

  if (adminError) throw new Error(adminError.message)

  if (!adminUser) {
    const error = new Error("Este usuario no tiene permiso admin para subir imágenes.")
    Object.assign(error, { statusCode: 403 })
    throw error
  }

  return supabase
}

async function parseImage(request: IncomingMessage) {
  const form = formidable({
    maxFiles: 1,
    maxFileSize: MAX_UPLOAD_BYTES,
    multiples: false,
    filter: (part) => part.name === "image" && Boolean(part.mimetype?.startsWith("image/")),
  })
  const [, files] = await form.parse(request)
  const uploaded = files.image
  const image = Array.isArray(uploaded) ? uploaded[0] : uploaded

  if (!image) {
    const error = new Error("Envía una imagen en el campo multipart llamado image.")
    Object.assign(error, { statusCode: 400 })
    throw error
  }

  return image as File
}

export default async function handler(request: IncomingMessage, response: ServerResponse) {
  if (request.method !== "POST" && request.method !== "DELETE") {
    response.setHeader("allow", "POST, DELETE")
    return sendJson(response, 405, {
      error: "method_not_allowed",
      message: "Usa POST para optimizar imágenes o DELETE para eliminarlas.",
    })
  }

  try {
    const supabase = await requireAdmin(request)

    if (request.method === "DELETE") {
      const body = await readJsonBody(request)
      const path = typeof body.path === "string" ? body.path : ""

      if (!path || !path.startsWith("perfumes/")) {
        return sendJson(response, 400, {
          error: "invalid_storage_path",
          message: "No se recibió una ruta de imagen válida.",
        })
      }

      const { error: removeError } = await supabase.storage
        .from(SUPABASE_BUCKET)
        .remove([path])

      if (removeError) throw new Error(removeError.message)

      return sendJson(response, 200, { ok: true })
    }

    const image = await parseImage(request)
    const input = await readFile(image.filepath)
    const width = clamp(process.env.IMAGE_MAX_WIDTH, 100, 4000, DEFAULT_MAX_WIDTH)
    const quality = clamp(process.env.IMAGE_WEBP_QUALITY, 45, 95, DEFAULT_WEBP_QUALITY)
    const metadata = await sharp(input, { failOn: "none" }).metadata()
    const { data, info } = await sharp(input, { failOn: "none" })
      .rotate()
      .resize({
        width,
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({
        quality,
        effort: 4,
        smartSubsample: true,
      })
      .toBuffer({ resolveWithObject: true })

    const filenameBase = sanitizeFilename(image.originalFilename)
    const path = `perfumes/${Date.now()}-${crypto.randomUUID()}-${filenameBase}.webp`
    const { error: uploadError } = await supabase.storage
      .from(SUPABASE_BUCKET)
      .upload(path, data, {
        cacheControl: "31536000",
        contentType: "image/webp",
        upsert: false,
      })

    if (uploadError) throw new Error(uploadError.message)

    const { data: publicData } = supabase.storage.from(SUPABASE_BUCKET).getPublicUrl(path)
    const savedPercent = Math.max(0, Math.round((1 - data.length / input.length) * 100))

    return sendJson(response, 201, {
      path,
      publicUrl: publicData.publicUrl,
      format: "webp",
      original: {
        bytes: input.length,
        width: metadata.width,
        height: metadata.height,
        format: metadata.format,
      },
      optimized: {
        bytes: data.length,
        width: info.width,
        height: info.height,
      },
      savedPercent,
    })
  } catch (error) {
    const statusCode =
      error instanceof Error && "statusCode" in error ? Number(error.statusCode) : 500

    return sendJson(response, Number.isFinite(statusCode) ? statusCode : 500, {
      error: "image_upload_error",
      message: error instanceof Error ? error.message : "No se pudo optimizar la imagen.",
    })
  }
}
