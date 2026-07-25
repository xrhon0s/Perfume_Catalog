import { createClient } from "@supabase/supabase-js";
import { config } from "../config.js";

let supabase;

const sanitizeSegment = (value, fallback) =>
  String(value || fallback)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || fallback;

const getClient = () => {
  if (!config.supabaseUrl || !config.supabaseServiceRoleKey) {
    const error = new Error("Faltan SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY.");
    error.statusCode = 500;
    throw error;
  }

  if (!supabase) {
    supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey, {
      auth: { persistSession: false }
    });
  }

  return supabase;
};

export async function saveSupabaseImage(buffer, options = {}) {
  const client = getClient();
  const prefix = sanitizeSegment(options.prefix, "images");
  const filename = sanitizeSegment(options.filename, "image.webp");
  const storagePath = `${prefix}/${filename}`;

  const { error } = await client.storage
    .from(config.supabaseBucket)
    .upload(storagePath, buffer, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: false
    });

  if (error) {
    const uploadError = new Error(error.message);
    uploadError.statusCode = 502;
    throw uploadError;
  }

  const { data } = client.storage.from(config.supabaseBucket).getPublicUrl(storagePath);

  return {
    path: storagePath,
    publicUrl: data.publicUrl
  };
}
