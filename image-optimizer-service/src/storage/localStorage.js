import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { config } from "../config.js";

const sanitizeSegment = (value, fallback) =>
  String(value || fallback)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase() || fallback;

export async function saveLocalImage(buffer, options = {}) {
  const prefix = sanitizeSegment(options.prefix, "images");
  const filename = sanitizeSegment(options.filename, "image.webp");
  const relativePath = path.posix.join(prefix, filename);
  const outputDir = path.resolve(config.localOutputDir, prefix);
  const outputPath = path.join(outputDir, filename);

  await mkdir(outputDir, { recursive: true });
  await writeFile(outputPath, buffer);

  return {
    path: relativePath,
    publicUrl: `${config.publicBaseUrl.replace(/\/$/, "")}/files/${relativePath}`
  };
}
