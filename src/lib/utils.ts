import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format text for brand display.
 * Previously this did broken i→ı replacement which corrupted Turkish text.
 * Now returns text as-is — Turkish rendering is handled by CSS font features.
 */
export function formatBrandText(text: string | undefined): string {
  if (!text) return "";
  return text;
}
