import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import Fastify from "fastify";
import { requireSupabaseAdmin } from "./auth.js";
import { config, maxUploadBytes, validateProductionConfig } from "./config.js";
import { optimizeImage } from "./optimizer.js";
import { saveLocalImage } from "./storage/localStorage.js";
import { saveSupabaseImage } from "./storage/supabaseStorage.js";

validateProductionConfig();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const localFilesDir = path.resolve(rootDir, config.localOutputDir);

const app = Fastify({
  logger: true,
  bodyLimit: maxUploadBytes + 1024
});

const sanitizeFilename = (value) =>
  String(value || "image")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\.[^.]+$/, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || "image";

const requireApiKey = async (request, reply) => {
  if (!config.apiKey) return;

  const headerKey = request.headers["x-api-key"];
  const bearer = request.headers.authorization?.replace(/^Bearer\s+/i, "");
  if (headerKey === config.apiKey || bearer === config.apiKey) return;

  await reply.code(401).send({
    error: "unauthorized",
    message: "API key invalida o ausente."
  });
};

const readFileBuffer = async (file) => {
  const chunks = [];
  let total = 0;

  for await (const chunk of file.file) {
    total += chunk.length;
    if (total > maxUploadBytes) {
      const error = new Error(`La imagen supera el limite de ${config.maxUploadMb} MB.`);
      error.statusCode = 413;
      throw error;
    }
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
};

await app.register(cors, {
  origin: config.corsOrigin === "*" ? true : config.corsOrigin
});

await app.register(multipart, {
  limits: {
    fileSize: maxUploadBytes,
    files: 1
  }
});

await app.register(fastifyStatic, {
  root: localFilesDir,
  prefix: "/files/"
});

app.get("/health", async () => ({
  ok: true,
  storageDriver: config.storageDriver,
  auth: config.requireSupabaseAdmin ? "supabase-admin" : config.apiKey ? "api-key" : "none"
}));

app.get("/ready", async () => ({
  ok: true,
  storageDriver: config.storageDriver,
  supabaseConfigured: Boolean(config.supabaseUrl && config.supabaseServiceRoleKey),
  requireSupabaseAdmin: config.requireSupabaseAdmin
}));

app.post("/optimize", { preHandler: [requireApiKey, requireSupabaseAdmin] }, async (request, reply) => {
  const file = await request.file();
  if (!file) {
    return reply.code(400).send({
      error: "missing_file",
      message: "Envia una imagen en el campo multipart llamado image."
    });
  }

  if (!file.mimetype?.startsWith("image/")) {
    return reply.code(415).send({
      error: "unsupported_media_type",
      message: "El archivo debe ser una imagen."
    });
  }

  const buffer = await readFileBuffer(file);
  const optimized = await optimizeImage(buffer, request.query);
  const prefix = request.query.prefix || "images";
  const filenameBase = sanitizeFilename(request.query.filename || file.filename);
  const filename = `${Date.now()}-${crypto.randomUUID()}-${filenameBase}.webp`;
  const storageDriver = config.allowStorageOverride
    ? request.query.storage || config.storageDriver
    : config.storageDriver;
  const save = storageDriver === "supabase" ? saveSupabaseImage : saveLocalImage;
  const stored = await save(optimized.buffer, { prefix, filename });

  return reply.code(201).send({
    path: stored.path,
    publicUrl: stored.publicUrl,
    format: "webp",
    original: {
      bytes: optimized.originalSize,
      width: optimized.metadata.width,
      height: optimized.metadata.height,
      format: optimized.metadata.format
    },
    optimized: {
      bytes: optimized.optimizedSize,
      width: optimized.info.width,
      height: optimized.info.height
    },
    savedPercent: optimized.savedPercent
  });
});

app.setErrorHandler((error, request, reply) => {
  request.log.error(error);
  reply.code(error.statusCode || 500).send({
    error: error.code || "image_optimizer_error",
    message: error.message || "No se pudo optimizar la imagen."
  });
});

await app.listen({
  host: config.host,
  port: config.port
});
