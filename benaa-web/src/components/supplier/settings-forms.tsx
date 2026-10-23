"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/shared/field";
import { Notice } from "@/components/shared/notice";
import { PhotoUploader } from "@/components/shared/photo-uploader";
import { useI18n } from "@/components/layout/i18n-provider";
import { createClient } from "@/lib/supabase/client";
import { BUCKETS, parseNumber, publicStorageUrl } from "@/lib/utils";
import type { DeliverySettings, Region, Supplier } from "@/types/db";

function useSubmit() {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  async function run(work: () => Promise<{ message: string } | null>) {
    setBusy(true); setError(null); setSaved(false);
    const err = await work();
    setBusy(false);
    if (err) setError(err.message); else setSaved(true);
  }
  return { busy, error, saved, run };
}

export function ProfileForm({ supplier }: { supplier: Supplier }) {
  const { t } = useI18n();
  const router = useRouter();
  const { busy, error, saved, run } = useSubmit();
  const [nameAr, setNameAr] = useState(supplier.name_ar);
  const [nameEn, setNameEn] = useState(supplier.name_en);
  const [phone, setPhone] = useState(supplier.phone ?? "");
  const [whatsapp, setWhatsapp] = useState(supplier.whatsapp ?? "");
  const [address, setAddress] = useState(supplier.address ?? "");
  const [logo, setLogo] = useState(supplier.logo_path);

  const save = (logoPath: string | null) =>
    createClient().rpc("rpc_supplier_update_profile", {
      p_name_ar: nameAr.trim(), p_name_en: nameEn.trim(), p_phone: phone.trim() || null, p_whatsapp: whatsapp.trim() || null,
      p_address: address.trim() || null, p_latitude: supplier.latitude, p_longitude: supplier.longitude, p_logo_path: logoPath,
    });

  async function onLogo(path: string) {
    const { error } = await save(path);
    if (error) throw new Error(error.message);
    setLogo(path);
    router.refresh();
  }

  return (
    <Card>
      <CardHeader><CardTitle>{t("settings.business")}</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 overflow-hidden rounded-full border bg-secondary/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {logo && <img src={publicStorageUrl(BUCKETS.supplierLogos, logo) ?? ""} alt="" className="h-full w-full object-cover" />}
          </div>
          <PhotoUploader bucket={BUCKETS.supplierLogos} subfolder="logo" onUploaded={onLogo} label={t("settings.change_logo")} />
        </div>
        <form onSubmit={(e) => { e.preventDefault(); void run(async () => { const { error } = await save(logo); if (!error) router.refresh(); return error; }); }} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t("settings.name_ar")}><Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} /></Field>
            <Field label={t("settings.name_en")}><Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} dir="ltr" /></Field>
            <Field label={t("auth.phone_number")}><Input value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" /></Field>
            <Field label="WhatsApp"><Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} dir="ltr" /></Field>
          </div>
          <Field label={t("settings.address")}><Input value={address} onChange={(e) => setAddress(e.target.value)} /></Field>
          {error && <Notice>{error}</Notice>}
          {saved && <Notice tone="success">{t("common.saved")}</Notice>}
          <Button type="submit" disabled={busy}>{busy && <Loader2 className="animate-spin" />}{t("common.save")}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function DeliveryFeesForm({ settings }: { settings: DeliverySettings | null }) {
  const { t } = useI18n();
  const router = useRouter();
  const { busy, error, saved, run } = useSubmit();
  const [base, setBase] = useState(settings ? String(settings.base_fee) : "");
  const [perKm, setPerKm] = useState(settings?.per_km_fee != null ? String(settings.per_km_fee) : "");
  const [freeOver, setFreeOver] = useState(settings?.free_over_amount != null ? String(settings.free_over_amount) : "");

  return (
    <Card>
      <CardHeader><CardTitle>{t("settings.delivery_fees")}</CardTitle></CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void run(async () => {
              const { error } = await createClient().rpc("rpc_supplier_set_delivery_settings", {
                p_base_fee: parseNumber(base), p_per_km_fee: perKm.trim() ? parseNumber(perKm) : null, p_free_over_amount: freeOver.trim() ? parseNumber(freeOver) : null,
              });
              if (!error) router.refresh();
              return error;
            });
          }}
          className="space-y-4"
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label={t("settings.base_fee")}><Input inputMode="decimal" value={base} onChange={(e) => setBase(e.target.value)} /></Field>
            <Field label={t("settings.per_km")}><Input inputMode="decimal" value={perKm} onChange={(e) => setPerKm(e.target.value)} /></Field>
            <Field label={t("settings.free_over")}><Input inputMode="decimal" value={freeOver} onChange={(e) => setFreeOver(e.target.value)} /></Field>
          </div>
          {error && <Notice>{error}</Notice>}
          {saved && <Notice tone="success">{t("common.saved")}</Notice>}
          <Button type="submit" disabled={busy}>{busy && <Loader2 className="animate-spin" />}{t("common.save")}</Button>
        </form>
      </CardContent>
    </Card>
  );
}

/** Change the supplier's city. The backend refuses while there are active deliveries. */
export function RegionSettingsForm({ regions, currentId }: { regions: Region[]; currentId: number }) {
  const { t, lang } = useI18n();
  const router = useRouter();
  const { busy, error, saved, run } = useSubmit();
  const [regionId, setRegionId] = useState(String(currentId));

  return (
    <Card>
      <CardHeader><CardTitle>{t("settings.region")}</CardTitle><p className="text-sm text-muted-foreground">{t("settings.region_hint")}</p></CardHeader>
      <CardContent>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void run(async () => {
              const { error } = await createClient().rpc("rpc_set_region", { p_region_id: Number(regionId) });
              if (!error) router.refresh();
              return error;
            });
          }}
          className="flex flex-wrap items-end gap-3"
        >
          <div className="min-w-56 flex-1">
            <Field label={t("auth.city")}>
              <Select value={regionId} onChange={(e) => setRegionId(e.target.value)}>
                {regions.map((r) => <option key={r.id} value={r.id}>{lang === "ar" ? r.name_ar : r.name_en}</option>)}
              </Select>
            </Field>
          </div>
          <Button type="submit" disabled={busy || Number(regionId) === currentId}>{busy && <Loader2 className="animate-spin" />}{t("common.save")}</Button>
        </form>
        {error && <div className="mt-3"><Notice>{error}</Notice></div>}
        {saved && <div className="mt-3"><Notice tone="success">{t("common.saved")}</Notice></div>}
      </CardContent>
    </Card>
  );
}
