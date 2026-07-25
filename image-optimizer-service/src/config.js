import "dotenv/config";

const numberFromEnv = (key, fallback) => {
  const value = Number(process.env[key]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

const booleanFromEnv = (key, fallback) => {
  if (process.env[key] === undefined) return fallback;
  return ["1", "true", "yes", "on"].includes(process.env[key].toLowerCase());
};

export const config = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: numberFromEnv("PORT", 8787),
  host: process.env.HOST || "0.0.0.0",
  apiKey: process.env.API_KEY || "",
  requireSupabaseAdmin: booleanFromEnv("REQUIRE_SUPABASE_ADMIN", false),
  corsOrigin: process.env.CORS_ORIGIN || "*",
  maxUploadMb: numberFromEnv("MAX_UPLOAD_MB", 8),
  defaultMaxWidth: numberFromEnv("DEFAULT_MAX_WIDTH", 1200),
  defaultWebpQuality: numberFromEnv("DEFAULT_WEBP_QUALITY", 78),
  storageDriver: process.env.STORAGE_DRIVER || "local",
  allowStorageOverride: booleanFromEnv("ALLOW_STORAGE_OVERRIDE", false),
  localOutputDir: process.env.LOCAL_OUTPUT_DIR || "public/optimized",
  publicBaseUrl: process.env.PUBLIC_BASE_URL || `http://localhost:${numberFromEnv("PORT", 8787)}`,
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  supabaseBucket: process.env.SUPABASE_BUCKET || "perfume-images"
};

export const maxUploadBytes = config.maxUploadMb * 1024 * 1024;

export function validateProductionConfig() {
  if (config.nodeEnv !== "production") return;

  const errors = [];

  if (config.storageDriver !== "supabase") {
    errors.push("STORAGE_DRIVER=supabase es requerido en produccion.");
  }

  if (config.allowStorageOverride) {
    errors.push("ALLOW_STORAGE_OVERRIDE no debe estar activo en produccion.");
  }

  if (config.corsOrigin === "*") {
    errors.push("CORS_ORIGIN debe ser el dominio del catalogo en produccion.");
  }

  if (!config.requireSupabaseAdmin) {
    errors.push("REQUIRE_SUPABASE_ADMIN=true es requerido en produccion.");
  }

  if (!config.supabaseUrl) errors.push("SUPABASE_URL es requerido.");
  if (!config.supabaseServiceRoleKey) errors.push("SUPABASE_SERVICE_ROLE_KEY es requerido.");
  if (!config.supabaseBucket) errors.push("SUPABASE_BUCKET es requerido.");

  if (errors.length > 0) {
    throw new Error(`Configuracion de produccion invalida: ${errors.join(" ")}`);
  }
}
