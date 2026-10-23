import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Star } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { OfferRow } from "@/components/shared/offer-row";
import { TrendChip } from "@/components/shared/trend-chip";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireBuyer } from "@/lib/auth";
import { getDeliverySettings, getListingsByMaterial, getMaterial } from "@/lib/data/catalog";
import { getLatestPrices } from "@/lib/data/prices";
import { getI18n } from "@/lib/i18n/server";
import { rankOffers } from "@/lib/ranking";

export const metadata: Metadata = { title: "Material" };

export default async function MaterialPage({ params }: { params: Promise<{ id: string }> }) {
  const { regionId } = await requireBuyer();
  const { id } = await params;
  const materialId = Number(id);
  if (!Number.isInteger(materialId)) notFound();

  const [material, listings, delivery, prices, { t, lang, fmt }] = await Promise.all([
    getMaterial(materialId), getListingsByMaterial(regionId, materialId), getDeliverySettings(regionId), getLatestPrices(regionId), getI18n(),
  ]);
  if (!material) notFound();

  const index = prices.find((p) => p.material_id === materialId);
  const deliveryBySupplier = new Map(delivery.map((d) => [d.supplier_id, d]));
  const { featured, rest } = rankOffers(listings);
  const name = lang === "ar" ? material.name_ar : material.name_en;

  return (
    <>
      <PageHeader title={name} description={`${t("material.unit")}: ${t(`unit.${material.unit}`)}`}>
        <Button asChild variant="outline"><Link href="/buyer/marketplace">{t("nav.marketplace")}</Link></Button>
        <Button asChild variant="secondary"><Link href={`/buyer/price-index?material=${material.id}`}>{t("nav.price_index")} <ArrowRight className="rtl:rotate-180" /></Link></Button>
      </PageHeader>

      {index && (
        <Card className="mb-8">
          <CardContent className="flex flex-wrap items-center justify-between gap-3 p-5">
            <span className="text-muted-foreground">{t("material.index_price")}</span>
            <span className="flex items-center gap-3">
              <span className="text-2xl font-bold">{fmt.lyd(index.price)}</span>
              <TrendChip price={index.price} prev={index.prev_price} />
            </span>
          </CardContent>
        </Card>
      )}

      {listings.length === 0 ? (
        <EmptyState title={t("material.no_offers")} />
      ) : (
        <div className="space-y-8">
          {featured.length > 0 && (
            <section className="space-y-3">
              <h2 className="flex items-center gap-2 text-lg font-bold"><Star className="h-5 w-5 text-ochre" />{t("listing.featured_strip")}</h2>
              {featured.map((l) => (
                <OfferRow key={l.id} listing={l} featured delivery={deliveryBySupplier.get(l.supplier_id)} materialName={name} />
              ))}
            </section>
          )}
          {rest.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-bold">{t("material.offers")}</h2>
              {rest.map((l) => (
                <OfferRow key={l.id} listing={l} delivery={deliveryBySupplier.get(l.supplier_id)} materialName={name} />
              ))}
            </section>
          )}
        </div>
      )}
    </>
  );
}
