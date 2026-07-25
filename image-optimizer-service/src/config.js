const numberFromEnv = (key, fallback) => {
  const value = Number(process.env[key]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

export const config = {
  port: numberFromEnv("PORT", 8787),
  host: process.env.HOST || "0.0.0.0",
  apiKey: process.env.API_KEY || "",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  maxUploadMb: numberFromEnv("MAX_UPLOAD_MB", 8),
  defaultMaxWidth: numberFromEnv("DEFAULT_MAX_WIDTH", 1200),
  defaultWebpQuality: numberFromEnv("DEFAULT_WEBP_QUALITY", 78),
  storageDriver: process.env.STORAGE_DRIVER || "local",
  localOutputDir: process.env.LOCAL_OUTPUT_DIR || "public/optimized",
  publicBaseUrl: process.env.PUBLIC_BASE_URL || `http://localhost:${numberFromEnv("PORT", 8787)}`,
  supabaseUrl: process.env.SUPABASE_URL || "",
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  supabaseBucket: process.env.SUPABASE_BUCKET || "perfume-images"
};

export const maxUploadBytes = config.maxUploadMb * 1024 * 1024;
