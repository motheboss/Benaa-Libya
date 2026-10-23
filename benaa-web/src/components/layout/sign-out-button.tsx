"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { useI18n } from "./i18n-provider";

export function SignOutButton({ className, variant = "ghost" }: { className?: string; variant?: "ghost" | "outline" }) {
  const { t } = useI18n();
  const router = useRouter();

  async function signOut() {
    await createClient().auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <Button variant={variant} size="sm" onClick={signOut} className={className}>
      <LogOut />
      {t("account.signout")}
    </Button>
  );
}
