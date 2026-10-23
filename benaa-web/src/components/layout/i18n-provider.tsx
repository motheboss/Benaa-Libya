"use client";

import { createContext, useContext, useMemo } from "react";
import { makeT, type Translate } from "@/lib/i18n";
import { makeFormat, type Formatter, type Lang } from "@/lib/format";

interface I18nValue { lang: Lang; t: Translate; fmt: Formatter }

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  const value = useMemo<I18nValue>(() => ({ lang, t: makeT(lang), fmt: makeFormat(lang) }), [lang]);
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n must be used inside I18nProvider");
  return ctx;
}
