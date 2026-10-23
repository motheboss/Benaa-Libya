"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/shared/notice";
import { useI18n } from "@/components/layout/i18n-provider";
import { createClient } from "@/lib/supabase/client";

export function DeleteProductButton({ listingId, compact = false }: { listingId: number; compact?: boolean }) {
  const { t } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function remove() {
    if (!window.confirm(t("common.confirm_delete"))) return;
    setBusy(true);
    setError(null);
    const { error } = await createClient().rpc("rpc_supplier_delete_listing", { p_listing_id: listingId });
    setBusy(false);
    if (error) return setError(error.message);
    router.push("/supplier/products");
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <Button type="button" variant={compact ? "ghost" : "destructive"} size={compact ? "icon" : "default"} onClick={remove} disabled={busy} aria-label={t("common.delete")}>
        {busy ? <Loader2 className="animate-spin" /> : <Trash2 className={compact ? "text-destructive" : ""} />}
        {!compact && t("common.delete")}
      </Button>
      {error && <Notice>{error}</Notice>}
    </div>
  );
}
