"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/components/shared/field";
import { Notice } from "@/components/shared/notice";
import { useI18n } from "@/components/layout/i18n-provider";
import { createClient } from "@/lib/supabase/client";
import { parseNumber } from "@/lib/utils";

/** Used by buyers (to a supplier or straight to drivers) and by suppliers (to request a driver). Creates the job through the backend. */
export function DeliveryForm({
  role, supplierId, supplierName, defaultPickup, defaultFee, baseFeeHint,
}: {
  role: "buyer" | "supplier"; supplierId?: number | null; supplierName?: string;
  defaultPickup?: string; defaultFee?: number; baseFeeHint?: string;
}) {
  const { t } = useI18n();
  const router = useRouter();
  const [pickup, setPickup] = useState(defaultPickup ?? "");
  const [dropoff, setDropoff] = useState("");
  const [material, setMaterial] = useState("");
  const [weight, setWeight] = useState("");
  const [volume, setVolume] = useState("");
  const [fee, setFee] = useState(defaultFee ? String(defaultFee) : "");
  const [goods, setGoods] = useState("");
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!pickup.trim() || !dropoff.trim()) return setError("delivery.err.address");
    if (!material.trim()) return setError("delivery.err.material");
    if (parseNumber(fee) <= 0) return setError("delivery.err.fee");

    setBusy(true);
    const { error } = await createClient().rpc("rpc_create_delivery_job", {
      p_supplier_id: role === "buyer" ? supplierId ?? null : null,
      p_pickup_address: pickup.trim(),
      p_pickup_lat: null,
      p_pickup_lng: null,
      p_dropoff_address: dropoff.trim(),
      p_dropoff_lat: null,
      p_dropoff_lng: null,
      p_material_type: material.trim(),
      p_weight_kg: parseNumber(weight) || null,
      p_volume_m3: parseNumber(volume) || null,
      p_delivery_fee: parseNumber(fee),
      p_goods_value: role === "supplier" ? parseNumber(goods) : 0,
      p_notes: notes.trim() || null,
    });
    setBusy(false);
    if (error) return setError(error.message);
    setDone(true);
    router.refresh();
  }

  if (done) {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <CheckCircle2 className="h-10 w-10 text-success" />
        <p className="font-medium">{t(role === "buyer" && supplierId ? "delivery.sent_supplier" : "delivery.sent")}</p>
        <Button variant="outline" onClick={() => { setDone(false); setMaterial(""); setDropoff(""); setNotes(""); }}>{t("delivery.another")}</Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {supplierName && role === "buyer" && (
        <p className="rounded-lg bg-muted/60 px-3 py-2 text-sm"><span className="text-muted-foreground">{t("job.supplier")}: </span><b>{supplierName}</b></p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("delivery.pickup")}><Input value={pickup} onChange={(e) => setPickup(e.target.value)} /></Field>
        <Field label={t("delivery.dropoff")}><Input value={dropoff} onChange={(e) => setDropoff(e.target.value)} /></Field>
      </div>
      <Field label={t("delivery.material")}><Input value={material} onChange={(e) => setMaterial(e.target.value)} /></Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label={t("delivery.weight")}><Input inputMode="decimal" value={weight} onChange={(e) => setWeight(e.target.value)} /></Field>
        <Field label={t("delivery.volume")}><Input inputMode="decimal" value={volume} onChange={(e) => setVolume(e.target.value)} /></Field>
        <Field label={t("delivery.fee_offer")} hint={baseFeeHint}><Input inputMode="decimal" value={fee} onChange={(e) => setFee(e.target.value)} /></Field>
      </div>
      {role === "supplier" && (
        <Field label={t("delivery.goods_value")}><Input inputMode="decimal" value={goods} onChange={(e) => setGoods(e.target.value)} /></Field>
      )}
      <Field label={t("delivery.notes")}><Textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></Field>
      {error && <Notice>{t(error)}</Notice>}
      <Button type="submit" disabled={busy}>
        {busy && <Loader2 className="animate-spin" />}
        {t(role === "buyer" && supplierId ? "delivery.send_request" : "delivery.find_driver")}
      </Button>
    </form>
  );
}
