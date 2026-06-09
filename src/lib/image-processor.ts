/**
 * Browser-side image optimization utilities.
 * Uses Canvas API to resize and convert images before upload.
 * No server-side dependencies required (no sharp).
 */

export interface ProcessOptions {
  /** Max width in pixels (default 1200) */
  maxWidth?: number;
  /** Output quality 0-1 (default 0.8) */
  quality?: number;
  /** Output format (default "image/webp") */
  format?: "image/webp" | "image/jpeg" | "image/png";
  /** Max file size in bytes before rejection (default 10MB) */
  maxFileSize?: number;
}

export interface ProcessResult {
  /** The processed file ready for upload */
  file: File;
  /** Original file name (for reference) */
  originalName: string;
  /** Original dimensions */
  originalDimensions: { width: number; height: number };
  /** Processed dimensions */
  processedDimensions: { width: number; height: number };
  /** Original size in bytes */
  originalSize: number;
  /** Processed size in bytes */
  processedSize: number;
}

const DEFAULT_OPTIONS: Required<ProcessOptions> = {
  maxWidth: 1200,
  quality: 0.8,
  format: "image/webp",
  maxFileSize: 10 * 1024 * 1024, // 10MB
};

/**
 * Check if the browser supports WebP encoding via Canvas
 */
function supportsWebP(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return canvas.toDataURL("image/webp").indexOf("data:image/webp") === 0;
  } catch {
    return false;
  }
}

/**
 * Get file extension for a MIME type
 */
function extensionForType(type: string): string {
  switch (type) {
    case "image/webp":
      return "webp";
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    default:
      return "webp";
  }
}

/**
 * Process an image file: resize, convert format, optimize quality.
 * Pure browser-side using Canvas API — no server required.
 *
 * @param file - Original File from input
 * @param options - Processing options
 * @returns ProcessResult with the optimized File
 * @throws If file is too large or unsupported type
 */
export async function processImage(
  file: File,
  options: ProcessOptions = {}
): Promise<ProcessResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Validate file
  if (!file.type.startsWith("image/")) {
    throw new Error(`Desteklenmeyen dosya formati: ${file.type}. Lutfen PNG, JPG veya WebP secin.`);
  }

  if (file.size > opts.maxFileSize) {
    const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
    const maxMB = (opts.maxFileSize / (1024 * 1024)).toFixed(0);
    throw new Error(
      `Dosya cok buyuk (${sizeMB}MB). Maksimum ${maxMB}MB yukleyebilirsiniz.`
    );
  }

  // Determine output format (fall back to JPEG if WebP not supported)
  let format = opts.format;
  if (format === "image/webp" && !supportsWebP()) {
    console.warn("WebP desteklenmiyor, JPEG kullaniliyor.");
    format = "image/jpeg";
  }

  // If already small WebP with acceptable quality, return as-is
  if (
    file.type === "image/webp" &&
    file.size < 200 * 1024 && // < 200KB
    options.maxWidth === undefined &&
    options.quality === undefined
  ) {
    const dims = await getImageDimensions(file);
    return {
      file,
      originalName: file.name,
      originalDimensions: dims,
      processedDimensions: dims,
      originalSize: file.size,
      processedSize: file.size,
    };
  }

  // Load image
  const bitmap = await createImageBitmap(file);
  const { width: origW, height: origH } = bitmap;

  // Calculate output dimensions
  let outW = origW;
  let outH = origH;
  if (outW > opts.maxWidth) {
    const ratio = opts.maxWidth / outW;
    outW = opts.maxWidth;
    outH = Math.round(outH * ratio);
  }

  // Draw to canvas
  const canvas = document.createElement("canvas");
  canvas.width = outW;
  canvas.height = outH;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context olusturulamadi.");

  ctx.drawImage(bitmap, 0, 0, outW, outH);
  bitmap.close();

  // Convert to blob
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error("Gorsel islenemedi."));
      },
      format,
      opts.quality
    );
  });

  // Build output file
  const ext = extensionForType(format);
  const baseName = file.name.replace(/\.[^.]+$/, "");
  const outputName = `${baseName}.${ext}`;
  const processedFile = new File([blob], outputName, { type: format });

  return {
    file: processedFile,
    originalName: file.name,
    originalDimensions: { width: origW, height: origH },
    processedDimensions: { width: outW, height: outH },
    originalSize: file.size,
    processedSize: blob.size,
  };
}

/**
 * Get image dimensions from a File without fully decoding it.
 * Falls back to createImageBitmap for non-standard formats.
 */
async function getImageDimensions(
  file: File
): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    // Try standard approach first
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      // Fall back to bitmap
      createImageBitmap(file)
        .then((bmp) => {
          const dims = { width: bmp.width, height: bmp.height };
          bmp.close();
          resolve(dims);
        })
        .catch(reject);
    };
    img.src = url;
  });
}

/**
 * Quick check: is this file type acceptable for image upload?
 */
export function isAcceptedImageType(file: File): boolean {
  const accepted = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
  return accepted.includes(file.type) || accepted.some((t) =>
    file.name.toLowerCase().endsWith(t.replace("image/", "."))
  );
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
