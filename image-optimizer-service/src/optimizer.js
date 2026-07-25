import sharp from "sharp";
import { config, maxUploadBytes } from "./config.js";

const clamp = (value, min, max, fallback) => {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(Math.max(Math.round(number), min), max);
};

export async function optimizeImage(inputBuffer, options = {}) {
  if (!inputBuffer?.length) {
    const error = new Error("No se recibio ninguna imagen.");
    error.statusCode = 400;
    throw error;
  }

  if (inputBuffer.length > maxUploadBytes) {
    const error = new Error(`La imagen supera el limite de ${config.maxUploadMb} MB.`);
    error.statusCode = 413;
    throw error;
  }

  const width = clamp(options.width, 100, 4000, config.defaultMaxWidth);
  const height = options.height ? clamp(options.height, 100, 4000, undefined) : undefined;
  const quality = clamp(options.quality, 45, 95, config.defaultWebpQuality);
  const fit = ["cover", "contain", "inside", "outside", "fill"].includes(options.fit)
    ? options.fit
    : "inside";

  const pipeline = sharp(inputBuffer, { failOn: "none" }).rotate();
  const metadata = await pipeline.metadata();
  const { data, info } = await pipeline
    .resize({
      width,
      height,
      fit,
      withoutEnlargement: true
    })
    .webp({
      quality,
      effort: 4,
      smartSubsample: true
    })
    .toBuffer({ resolveWithObject: true });

  const savedPercent = Math.max(0, Math.round((1 - data.length / inputBuffer.length) * 100));

  return {
    buffer: data,
    info,
    metadata,
    originalSize: inputBuffer.length,
    optimizedSize: data.length,
    savedPercent
  };
}
