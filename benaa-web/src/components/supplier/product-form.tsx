"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Field } from "@/components/shared/field";
import { Notice } from "@/components/shared/notice";
import { useI18n } from "@/components/layout/i18n-provider";
import { createClient } from "@/lib/supabase/client";
import { parseNumber } from "@/lib/utils";
import type { Listing, Material } from "@/types/db";

/** Add a product (a listing of a catalog material) or edit its price, inventory and visibility. */
export function ProductForm({ materials, listing }: { materials: Material[]; listing?: Listing }) {
  const { t, lang } = useI18n();
  const router = useRouter();
  const editing = !!listing;
  const [materialId, setMaterialId] = useState<string>(listing ? String(listing.material_id) : "");
  const [contact, setContact] = useState(listing?.price_on_request ?? false);
  const [price, setPrice] = useState(listing?.price != null ? String(listing.price) : "");
  const [stock, setStock] = useState(listing ? String(listing.stock_qty) : "0");
  const [minOrder, setMinOrder] = useState(listing ? String(listing.min_order_qty) : "1");
  const [active, setActive] = useState(listing?.is_active ?? true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    if (!editing && !materialId) return setError("estimator.err.project_material");
    if (!contact && parseNumber(price) <= 0) return setError("product.err.price");

    setBusy(true);
    const { data, error } = await createClient().rpc("rpc_supplier_upsert_listing", {
      p_listing_id: listing?.id ?? null,
      p_material_id: listing ? listing.material_id : Number(materialId),
      p_price: contact ? null : parseNumber(price),
      p_price_on_request: contact,
      p_stock_qty: parseNumber(stock),
      p_min_order_qty: parseNumber(minOrder) || 1,
      p_is_active: active,
    });
    setBusy(false);
    if (error) return setError(error.message);

    if (!editing) {
      router.push(`/supplier/products/${data as number}`); // continue to add photos
    } else {
      setSaved(true);
    }
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      {editing ? (
        <h2 className="text-xl font-bold">{listing?.material ? (lang === "ar" ? listing.material.name_ar : listing.material.name_en) : ""}</h2>
      ) : (
        <Field label={t("estimator.material")}>
          <Select value={materialId} onChange={(e) => setMaterialId(e.target.value)}>
            <option value="">{t("estimator.choose")}</option>
            {materials.map((m) => <option key={m.id} value={m.id}>{lang === "ar" ? m.name_ar : m.name_en}</option>)}
          </Select>
        </Field>
      )}

      <div className="flex items-center justify-between rounded-lg border bg-card p-3">
        <div>
          <p className="font-medium">{t("inventory.contact_pricing")}</p>
          <p className="text-xs text-muted-foreground">{t("inventory.contact_pricing_hint")}</p>
        </div>
        <Switch checked={contact} onCheckedChange={setContact} />
      </div>

      {!contact && (
        <Field label={t("inventory.price")}><Input inputMode="decimal" value={price} onChange={(e) => setPrice(e.target.value)} /></Field>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label={t("inventory.stock")}><Input inputMode="decimal" value={stock} onChange={(e) => setStock(e.target.value)} /></Field>
        <Field label={t("inventory.min_order")}><Input inputMode="decimal" value={minOrder} onChange={(e) => setMinOrder(e.target.value)} /></Field>
      </div>
      <div className="flex items-center justify-between rounded-lg border bg-card p-3">
        <p className="font-medium">{t("inventory.visible")}</p>
        <Switch checked={active} onCheckedChange={setActive} />
      </div>

      {error && <Notice>{t(error)}</Notice>}
      {saved && <Notice tone="success">{t("common.saved")}</Notice>}
      <Button type="submit" disabled={busy}>{busy && <Loader2 className="animate-spin" />}{t("common.save")}</Button>
    </form>
  );
}
