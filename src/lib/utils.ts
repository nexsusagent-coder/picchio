import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export function formatBrandText(text: string | undefined): string {
  if (!text) return "";
  return text.replace(/i/g, "ı").replace(/İ/g, "I");
}
