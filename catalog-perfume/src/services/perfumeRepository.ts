import type { Perfume } from "../data/types"
import { getPerfumes as getLocalPerfumes } from "../data/getPerfumes"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as
  | string
  | undefined
const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey)

type CatalogPerfumeRow = {
  id: string
  legacy_id: string | null
  name: string
  brand: string
  image: string | null
  family: Perfume["family"] | null
  concentration: Perfume["concentration"] | null
  gender: Perfume["gender"] | null
  year: number | null
  description: string | null
  tags: string[] | null
  notes: Perfume["notes"] | null
  is_active: boolean
}

export type PerfumeInput = {
  id?: string
  name: string
  brand: string
  image?: string
  family?: Perfume["family"]
  concentration?: Perfume["concentration"]
  gender?: Perfume["gender"]
  year?: number
  description?: string
  tags?: string[]
  notes?: Perfume["notes"]
  isActive?: boolean
}

function toSlug(text: string) {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’]/g, "'")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  )
}

function mapCatalogRow(row: CatalogPerfumeRow): Perfume {
  return {
    id: row.legacy_id ?? row.id,
    name: row.name,
    brand: row.brand,
    image: row.image ?? undefined,
    family: row.family ?? undefined,
    concentration: row.concentration ?? undefined,
    gender: row.gender ?? undefined,
    year: row.year ?? undefined,
    description: row.description ?? undefined,
    tags: row.tags ?? undefined,
    notes: row.notes ?? undefined,
  }
}

async function getSupabaseClient() {
  const { supabase } = await import("../lib/supabase")

  if (!supabase) {
    throw new Error("Supabase no está configurado.")
  }

  return supabase
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

  const brandName = input.brand.trim()
  const brandSlug = toSlug(brandName)

  const { data: brand, error: brandError } = await supabase
    .from("brands")
    .upsert({ name: brandName, slug: brandSlug }, { onConflict: "slug" })
    .select("id")
    .single()

  if (brandError) {
    throw new Error(brandError.message)
  }

  const payload = {
    legacy_id: input.id && !isUuid(input.id) ? input.id : null,
    brand_id: brand.id as string,
    name: input.name.trim(),
    slug: toSlug(input.name),
    family: input.family || null,
    concentration: input.concentration || null,
    gender: input.gender || null,
    year: input.year || null,
    description: input.description || null,
    tags: input.tags ?? [],
    notes: input.notes ?? {},
    primary_image_url: input.image || null,
    is_active: input.isActive ?? true,
  }

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

export async function uploadPerfumeImage(file: File): Promise<string> {
  if (!hasSupabaseConfig) {
    throw new Error("Supabase no está configurado para subir imágenes.")
  }

  const supabase = await getSupabaseClient()

  const extension = file.name.split(".").pop() ?? "jpg"
  const safeName = file.name
    .replace(/\.[^/.]+$/, "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
  const path = `${Date.now()}-${safeName || "perfume"}.${extension}`

  const { error } = await supabase.storage
    .from("perfume-images")
    .upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
    })

  if (error) {
    throw new Error(error.message)
  }

  const { data } = supabase.storage.from("perfume-images").getPublicUrl(path)

  return data.publicUrl
}
