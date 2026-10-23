export type Lang = "ar" | "en";

/** Arabic-Indic digits (٠١٢٣…) in both languages. */
const locale = (lang: Lang) => (lang === "ar" ? "ar-u-nu-arab" : "en-u-nu-arab");

export function makeFormat(lang: Lang) {
  const nf = (max: number) =>
    new Intl.NumberFormat(locale(lang), { maximumFractionDigits: max, minimumFractionDigits: 0 });

  return {
    num: (n: number, max = 2) => nf(max).format(n),
    lyd: (n: number) => `${nf(2).format(n)} ${lang === "ar" ? "د.ل" : "LYD"}`,
    date: (d: string | Date, withTime = false) => {
      const date = typeof d === "string" ? new Date(/^\d{4}-\d{2}-\d{2}$/.test(d) ? `${d}T00:00:00` : d) : d;
      return new Intl.DateTimeFormat(locale(lang), {
        dateStyle: "medium",
        ...(withTime ? { timeStyle: "short" as const } : {}),
      }).format(date);
    },
    digits: (s: string) => s.replace(/[0-9]/g, (d) => "٠١٢٣٤٥٦٧٨٩"[Number(d)]),
  };
}

export type Formatter = ReturnType<typeof makeFormat>;
