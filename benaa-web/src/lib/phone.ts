/** Libya (+218) phone helpers, same rules as the mobile app. */
export function westernDigits(s: string): string {
  const map: Record<string, string> = {
    "٠": "0", "١": "1", "٢": "2", "٣": "3", "٤": "4", "٥": "5", "٦": "6", "٧": "7", "٨": "8", "٩": "9",
    "۰": "0", "۱": "1", "۲": "2", "۳": "3", "۴": "4", "۵": "5", "۶": "6", "۷": "7", "۸": "8", "۹": "9",
  };
  return s.replace(/[٠-٩۰-۹]/g, (c) => map[c] ?? c);
}

/** "0912345678" → "+218912345678"; accepts 00218…, 218…, +218… */
export function normalizePhone(raw: string): string {
  let s = westernDigits(raw).replace(/[^0-9+]/g, "");
  if (s.startsWith("00")) s = "+" + s.slice(2);
  if (s.startsWith("+")) return s;
  if (s.startsWith("218")) return "+" + s;
  if (s.startsWith("0")) s = s.slice(1);
  return "+218" + s;
}
