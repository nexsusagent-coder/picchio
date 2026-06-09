import { v2 as cloudinary } from "cloudinary";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.CLOUDINARY_API_KEY;
const API_SECRET = process.env.CLOUDINARY_API_SECRET;

let configured = false;

function ensureConfig() {
  if (!configured && CLOUD_NAME && API_KEY && API_SECRET) {
    cloudinary.config({
      cloud_name: CLOUD_NAME,
      api_key: API_KEY,
      api_secret: API_SECRET,
    });
    configured = true;
  }
}

export function isCloudinaryAvailable(): boolean {
  return !!(CLOUD_NAME && API_KEY && API_SECRET);
}

export async function uploadToCloudinary(
  file: File,
  folder: "products" | "campaigns" | "site-assets",
  publicId: string
): Promise<string> {
  ensureConfig();
  if (!isCloudinaryAvailable()) {
    throw new Error("Cloudinary yapilandirmasi eksik");
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(base64, {
    folder: `picchio/${folder}`,
    public_id: publicId,
    overwrite: true,
    resource_type: "image",
  });

  return result.secure_url;
}
