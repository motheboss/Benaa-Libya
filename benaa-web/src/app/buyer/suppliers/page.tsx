import type { Metadata } from "next";
import Link from "next/link";
import { BadgeCheck, Building2, MapPin, Phone, Star, Truck } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ContactForPricing } from "@/components/shared/contact-for-pricing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireBuyer } from "@/lib/auth";
import { getDeliverySettings, getListingPhotos, getListingsBySupplier, getListingSummaries, getSuppliers } from "@/lib/data/catalog";
import { getI18n } from "@/lib/i18n/server";
import { rankSuppliers, type RankedSupplier } from "@/lib/ranking";
import { BUCKETS, cn, publicStorageUrl } from "@/lib/utils";

export const metadata: Metadata = { title: "Suppliers" };

export default async function SuppliersPage({ searchParams }: { searchParams: Promise<{ supplier?: string }> }) {
  const { regionId } = await requireBuyer();
  const { supplier: selectedParam } = await searchParams;
  const { t, lang, fmt } = await getI18n();
  const [suppliers, summaries, delivery] = await Promise.all([getSuppliers(regionId), getListingSummaries(regionId), getDeliverySettings(regionId)]);
  const deliveryBySupplier = new Map(delivery.map((d) => [d.supplier_id, d]));
  const { featured, rest } = rankSuppliers(suppliers, summaries);

  const selectedId = Number(selectedParam);
  const selected = suppliers.find((s) => s.id === selectedId) ?? null;
  const listings = selected ? await getListingsBySupplier(regionId, selected.id) : [];
  const photos = await getListingPhotos(regionId, listings.map((l) => l.id));
  const firstPhoto = new Map<number, string>();
  for (const p of photos) if (!firstPhoto.has(p.listing_id)) firstPhoto.set(p.listing_id, p.path);

  const card = (r: RankedSupplier, isFeatured = false) => {
    const s = r.supplier;
    const d = deliveryBySupplier.get(s.id);
    return (
      <Link
        key={s.id}
        href={`/buyer/suppliers?supplier=${s.id}`}
        className={cn("block rounded-xl border bg-card p-4 transition-colors hover:border-primary", selected?.id === s.id && "border-primary ring-1 ring-primary")}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 font-semibold">
            {lang === "ar" ? s.name_ar : s.name_en}
            {s.is_verified && <BadgeCheck className="h-4 w-4 text-success" />}
          </div>
          {isFeatured && <Badge variant="warning"><Star className="h-3 w-3" />{t("listing.featured")}</Badge>}
        </div>
        {s.address && <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><MapPin className="h-3 w-3" />{s.address}</p>}
        <div className="mt-3 flex items-center justify-between text-sm">
          <span className="inline-flex items-center gap-1 text-muted-foreground"><Truck className="h-4 w-4" />{d ? fmt.lyd(d.base_fee) : t("delivery.not_set")}</span>
          <span className="text-xs text-muted-foreground">{fmt.num(r.productCount, 0)} {t("supplier.products_count")}</span>
        </div>
      </Link>
    );
  };

  return (
    <>
      <PageHeader title={t("nav.suppliers")} description={t("suppliers.subtitle")} />
      {suppliers.length === 0 ? (
        <EmptyState icon={<Building2 />} title={t("market.no_suppliers")} />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
          <div className="space-y-6">
            {featured.length > 0 && (
              <section className="space-y-3">
                <h2 className="flex items-center gap-2 font-bold"><Star className="h-5 w-5 text-ochre" />{t("listing.featured_strip")}</h2>
                {featured.map((r) => card(r, true))}
              </section>
            )}
            <section className="space-y-3">{rest.map((r) => card(r))}</section>
          </div>

          <div>
            {selected ? (
              <Card className="sticky top-6">
                <CardContent className="space-y-5 p-5">
                  <div className="space-y-1">
                    <h2 className="flex items-center gap-2 text-xl font-bold">
                      {lang === "ar" ? selected.name_ar : selected.name_en}
                      {selected.is_verified && <BadgeCheck className="h-5 w-5 text-success" />}
                    </h2>
                    {selected.address && <p className="text-sm text-muted-foreground">{selected.address}</p>}
                    {selected.phone && (
                      <a href={`tel:${selected.phone}`} dir="ltr" className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                        <Phone className="h-3.5 w-3.5" />{fmt.digits(selected.phone)}
                      </a>
                    )}
                  </div>
                  <div className="rounded-lg bg-muted/60 p-3 text-sm">
                    {(() => {
                      const d = deliveryBySupplier.get(selected.id);
                      return (
                        <div className="space-y-1">
                          <div className="flex justify-between"><span className="text-muted-foreground">{t("delivery.fee")}</span><b>{d ? fmt.lyd(d.base_fee) : t("delivery.not_set")}</b></div>
                          {d?.per_km_fee != null && <div className="flex justify-between"><span className="text-muted-foreground">{t("delivery.per_km")}</span><b>{fmt.lyd(d.per_km_fee)}</b></div>}
                          {d?.free_over_amount != null && <div className="flex justify-between"><span className="text-muted-foreground">{t("delivery.free_over")}</span><b>{fmt.lyd(d.free_over_amount)}</b></div>}
                        </div>
                      );
                    })()}
                  </div>
                  <Button asChild className="w-full"><Link href={`/buyer/delivery-request?supplier=${selected.id}`}><Truck />{t("delivery.request_from")}</Link></Button>

                  <h3 className="font-bold">{t("supplier.products")}</h3>
                  {listings.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{t("supplier.no_products")}</p>
                  ) : (
                    <div className="space-y-3">
                      {listings.map((l) => {
                        const photo = publicStorageUrl(BUCKETS.productPhotos, firstPhoto.get(l.id));
                        const name = l.material ? (lang === "ar" ? l.material.name_ar : l.material.name_en) : "—";
                        const hidden = l.price_on_request || l.price == null;
                        return (
                          <div key={l.id} className="flex items-center gap-3 rounded-lg border p-3">
                            <div className="h-14 w-14 shrink-0 overflow-hidden rounded-md bg-secondary/50">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              {photo && <img src={photo} alt="" className="h-full w-full object-cover" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="truncate font-medium">{name}</p>
                              <div className="mt-1 flex flex-wrap items-center gap-2">
                                <Badge variant={l.stock_qty > 0 ? "success" : "muted"}>{t(l.stock_qty > 0 ? "listing.in_stock" : "listing.out_of_stock")}</Badge>
                                {l.is_featured && <Badge variant="warning">{t("listing.featured")}</Badge>}
                              </div>
                            </div>
                            {hidden ? <ContactForPricing supplier={selected} materialName={name} /> : <b>{fmt.lyd(l.price as number)}</b>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <EmptyState icon={<Building2 />} title={t("suppliers.select")} />
            )}
          </div>
        </div>
      )}
    </>
  );
}
