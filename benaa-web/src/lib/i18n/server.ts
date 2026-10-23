import { cookies } from "next/headers";
import { LANG_COOKIE, makeT } from "./index";
import { makeFormat, type Lang } from "../format";

export async function getLang(): Promise<Lang> {
  const value = (await cookies()).get(LANG_COOKIE)?.value;
  return value === "en" ? "en" : "ar"; // Arabic by default
}

/** Server Components: const { t, lang, fmt } = await getI18n() */
export async function getI18n() {
  const lang = await getLang();
  return { lang, t: makeT(lang), fmt: makeFormat(lang), dir: lang === "ar" ? ("rtl" as const) : ("ltr" as const) };
}
