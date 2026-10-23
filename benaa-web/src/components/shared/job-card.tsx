"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, MapPin, Package, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/status-badge";
import { Notice } from "@/components/shared/notice";
import { useI18n } from "@/components/layout/i18n-provider";
import { createClient } from "@/lib/supabase/client";
import type { DeliveryJob } from "@/types/db";

const CANCELLABLE = ["pending_supplier", "open", "assigned"];

/**
 * One delivery job. The website only creates, confirms/rejects and cancels requests; drivers move jobs
 * forward (arrived → picked up → delivered) in the mobile app, and this card just shows that progress.
 */
export function JobCard({ job, role, showSupplier = false }: { job: DeliveryJob; role: "buyer" | "supplier"; showSupplier?: boolean }) {
  const { t, lang, fmt } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function call(fn: string, params: Record<string, unknown>, key: string) {
    setBusy(key);
    setError(null);
    const { error } = await createClient().rpc(fn, params);
    setBusy(null);
    if (error) setError(error.message);
    else router.refresh();
  }

  const canRespond = role === "supplier" && job.status === "pending_supplier" && job.requester_role === "buyer";
  const canCancel = CANCELLABLE.includes(job.status);
  const supplierName = lang === "ar" ? job.supplier_name_ar : job.supplier_name_en;

  const progress: { key: string; at: string | null }[] = [
    { key: "job.t.assigned", at: job.assigned_at },
    { key: "job.t.arrived", at: job.arrived_at },
    { key: "job.t.picked_up", at: job.picked_up_at },
    { key: "job.t.delivered", at: job.delivered_at },
  ];

  return (
    <Card>
      <CardContent className="space-y-3 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <h3 className="text-lg font-semibold">{job.material_type}</h3>
          </div>
          <StatusBadge status={job.status} />
        </div>

        <div className="grid gap-1.5 text-sm">
          <div className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" /><span>{job.pickup_address}</span></div>
          <div className="flex gap-2"><MapPin className="mt-0.5 h-4 w-4 shrink-0 text-success" /><span>{job.dropoff_address}</span></div>
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-muted-foreground">
          {job.weight_kg != null && <span>{fmt.num(job.weight_kg)} {t("unit.kg")}</span>}
          {job.volume_m3 != null && <span>{fmt.num(job.volume_m3)} {t("unit.m3")}</span>}
          <span className="font-semibold text-foreground">{t("delivery.fee")}: {fmt.lyd(job.delivery_fee)}</span>
          {role === "supplier" && job.goods_value > 0 && <span>{t("delivery.goods_value_short")}: {fmt.lyd(job.goods_value)}</span>}
        </div>

        {showSupplier && supplierName && <p className="text-sm"><span className="text-muted-foreground">{t("job.supplier")}: </span>{supplierName}</p>}

        {job.driver_name && (
          <div className="rounded-lg bg-muted/60 p-3 text-sm">
            <p className="font-medium">{t("job.driver")}: {job.driver_name}</p>
            {job.driver_phone && (
              <a href={`tel:${job.driver_phone}`} className="mt-1 inline-flex items-center gap-1 text-primary hover:underline" dir="ltr">
                <Phone className="h-3.5 w-3.5" />{fmt.digits(job.driver_phone)}
              </a>
            )}
            <ul className="mt-2 space-y-0.5 text-xs text-muted-foreground">
              {progress.filter((p) => p.at).map((p) => <li key={p.key}>{t(p.key)} · {fmt.date(p.at as string, true)}</li>)}
            </ul>
          </div>
        )}

        {job.notes && <p className="text-sm text-muted-foreground">{job.notes}</p>}
        <p className="text-xs text-muted-foreground">{fmt.date(job.created_at, true)}</p>

        {error && <Notice>{error}</Notice>}

        {(canRespond || canCancel) && (
          <div className="flex flex-wrap gap-2 pt-1">
            {canRespond && (
              <>
                <Button size="sm" disabled={busy !== null} onClick={() => call("rpc_supplier_respond_job", { p_job_id: job.id, p_accept: true }, "accept")}>
                  {busy === "accept" && <Loader2 className="animate-spin" />}{t("orders.accept")}
                </Button>
                <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => call("rpc_supplier_respond_job", { p_job_id: job.id, p_accept: false }, "reject")}>
                  {busy === "reject" && <Loader2 className="animate-spin" />}{t("orders.reject")}
                </Button>
              </>
            )}
            {canCancel && !canRespond && (
              <Button size="sm" variant="outline" disabled={busy !== null} onClick={() => call("rpc_cancel_delivery_job", { p_job_id: job.id }, "cancel")}>
                {busy === "cancel" && <Loader2 className="animate-spin" />}{t("job.cancel")}
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
