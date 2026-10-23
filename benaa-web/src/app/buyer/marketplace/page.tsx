import type { Metadata } from "next";
import Link from "next/link";
import { Search, Store } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { TrendChip } from "@/components/shared/trend-chip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { requireBuyer } from "@/lib/auth";
import { getCategories, getListingSummaries, getMaterials } from "@/lib/data/catalog";
import { getLatestPrices } from "@/lib/data/prices";
import { getI18n } from "@/lib/i18n/server";
import { BUCKETS, cn, publicStorageUrl } from "@/lib/utils";

export const metadata: Metadata = { title: "Marketplace" };

export default async function MarketplacePage({ searchParams }: { searchParams: Promise<{ q?: string; cat?: string }> }) {
  const { regionId } = await requireBuyer();
  const { q = "", cat } = await searchParams;
  const { t, lang, fmt } = await getI18n();
  const [categories, materials, prices, summaries] = await Promise.all([
    getCategories(), getMaterials(), getLatestPrices(regionId), getListingSummaries(regionId),
  ]);

  const priceByMaterial = new Map(prices.map((p) => [p.material_id, p]));
  const offers = new Map<number, { count: number; min: number | null }>();
  for (const l of summaries) {
    const o = offers.get(l.material_id) ?? { count: 0, min: null };
    o.count += 1;
    if (!l.price_on_request && l.price != null) o.min = o.min == null ? l.price : Math.min(o.min, l.price);
    offers.set(l.material_id, o);
  }

  const needle = q.trim().toLowerCase();
  const catId = cat ? Number(cat) : null;
  const filtered = materials.filter(
    (m) => (!catId || m.category_id === catId) && (!needle || m.name_en.toLowerCase().includes(needle) || m.name_ar.includes(needle)),
  );

  const chip = (href: string, label: string, active: boolean) => (
    <Link href={href} className={cn("rounded-full border px-3 py-1.5 text-sm transition-colors", active ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-accent")}>{label}</Link>
  );
  const catHref = (id: number | null) => `/buyer/marketplace?${new URLSearchParams({ ...(q ? { q } : {}), ...(id ? { cat: String(id) } : {}) }).toString()}`;

  return (
    <>
      <PageHeader title={t("nav.marketplace")} description={t("market.subtitle")} />
      <form action="/buyer/marketplace" className="mb-4 flex gap-2">
        {catId && <input type="hidden" name="cat" value={catId} />}
        <Input name="q" defaultValue={q} placeholder={t("common.search")} className="max-w-sm" />
        <Button type="submit" variant="secondary"><Search />{t("common.search")}</Button>
      </form>
      <div className="mb-6 flex flex-wrap gap-2">
        {chip(catHref(null), t("market.all"), !catId)}
        {categories.map((c) => chip(catHref(c.id), lang === "ar" ? c.name_ar : c.name_en, catId === c.id))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={<Store />} title={t("common.no_results")} description={materials.length === 0 ? t("market.empty_catalog") : undefined} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => {
            const price = priceByMaterial.get(m.id);
            const o = offers.get(m.id);
            const img = publicStorageUrl(BUCKETS.productPhotos, m.image_path);
            return (
              <Link key={m.id} href={`/buyer/materials/${m.id}`} className="group overflow-hidden rounded-xl border bg-card transition-colors hover:border-primary">
                <div className="flex h-36 items-center justify-center bg-secondary/50">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  {img ? <img src={img} alt="" className="h-full w-full object-cover" /> : <Store className="h-10 w-10 text-sand-deep" />}
                </div>
                <div className="space-y-2 p-4">
                  <h3 className="font-semibold group-hover:text-primary">{lang === "ar" ? m.name_ar : m.name_en}</h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t("market.index")}: {price ? `${fmt.lyd(price.price)} / ${t(`unit.${m.unit}`)}` : "—"}</span>
                    {price && <TrendChip price={price.price} prev={price.prev_price} />}
                  </div>
                  <div className="flex items-center justify-between">
                    <Badge variant={o ? "secondary" : "muted"}>{o ? `${fmt.num(o.count, 0)} ${t("market.offers")}` : t("market.no_offers")}</Badge>
                    {o?.min != null && <span className="text-sm font-medium">{t("market.from")} {fmt.lyd(o.min)}</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </>
  );
}
