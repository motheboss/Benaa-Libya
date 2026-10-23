import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Accepts Arabic-Indic / Persian / Western digits and Arabic separators, returns a number (0 if invalid). */
export function parseNumber(input: string): number {
  const map: Record<string, string> = {
    "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4", "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
    "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4", "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
    "٫": ".", "،": ".", ",": ".",
  };
  const cleaned = input.replace(/[٠-٩۰-۹٫،,]/g, (c) => map[c] ?? c).replace(/[^0-9.]/g, "");
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : 0;
}

export function publicStorageUrl(bucket: string, path: string | null | undefined): string | null {
  if (!path) return null;
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return base ? `${base}/storage/v1/object/public/${bucket}/${path}` : null;
}

export const BUCKETS = {
  productPhotos: "product-photos",
  supplierLogos: "supplier-logos",
} as const;
