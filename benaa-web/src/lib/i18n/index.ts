import { STRINGS } from "./strings";
import type { Lang } from "../format";

export type Translate = (key: string) => string;

/** Unknown keys return the key itself, so server error messages pass through untouched. */
export function makeT(lang: Lang): Translate {
  return (key: string) => {
    const pair = STRINGS[key];
    if (pair) return pair[lang === "ar" ? 0 : 1];
    return key.startsWith("unit.") ? key.slice(5) : key;
  };
}

export const LANG_COOKIE = "benaa_lang";
export const REGION_COOKIE = "benaa_region";
