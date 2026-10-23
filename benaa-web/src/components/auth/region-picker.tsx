"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, MapPin } from "lucide-react";
import { Notice } from "@/components/shared/notice";
import { useI18n } from "@/components/layout/i18n-provider";
import { createClient } from "@/lib/supabase/client";
import { REGION_COOKIE } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { Region } from "@/types/db";

/** Region = city. Signed-in users save it on their account; visitors just remember it for registration. */
export function RegionPicker({ regions, currentId, signedIn, next }: { regions: Region[]; currentId: number | null; signedIn: boolean; next: string }) {
  const { lang } = useI18n();
  const router = useRouter();
  const [busyId, setBusyId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function choose(id: number) {
    setBusyId(id);
    setError(null);
    try {
      if (signedIn) {
        const { error } = await createClient().rpc("rpc_set_region", { p_region_id: id });
        if (error) throw new Error(error.message);
      }
      document.cookie = `${REGION_COOKIE}=${id}; path=/; max-age=31536000; samesite=lax`;
      router.push(next);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-4">
      {error && <Notice>{error}</Notice>}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {regions.map((r) => (
          <button
            key={r.id}
            type="button"
            disabled={busyId !== null}
            onClick={() => choose(r.id)}
            className={cn(
              "flex items-center justify-between rounded-xl border bg-card p-4 text-start transition-colors hover:border-primary disabled:opacity-60",
              r.id === currentId && "border-primary ring-1 ring-primary",
            )}
          >
            <span className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-ochre" />
              <span className="font-medium">{lang === "ar" ? r.name_ar : r.name_en}</span>
            </span>
            {r.id === currentId && <Check className="h-5 w-5 text-success" />}
          </button>
        ))}
      </div>
    </div>
  );
}
