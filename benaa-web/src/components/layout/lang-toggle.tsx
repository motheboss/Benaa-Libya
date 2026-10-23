"use client";

import { useRouter } from "next/navigation";
import { Languages } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useI18n } from "./i18n-provider";
import { LANG_COOKIE } from "@/lib/i18n";

export function LangToggle({ className }: { className?: string }) {
  const { lang } = useI18n();
  const router = useRouter();

  function toggle() {
    const next = lang === "ar" ? "en" : "ar";
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" onClick={toggle} className={className}>
      <Languages />
      {lang === "ar" ? "English" : "العربية"}
    </Button>
  );
}
