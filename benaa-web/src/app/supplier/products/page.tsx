import type { Metadata } from "next";
import Link from "next/link";
import { Package, Pencil, Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DeleteProductButton } from "@/components/supplier/delete-product-button";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { requireSupplier } from "@/lib/auth";
import { getListingPhotos, getListingsBySupplier } from "@/lib/data/catalog";
import { getI18n } from "@/lib/i18n/server";
import { BUCKETS, publicStorageUrl } from "@/lib/utils";

export const metadata: Metadata = { title: "Products" };

export default async function ProductsPage() {
  const { supplier, regionId } = await requireSupplier();
  const { t, lang, fmt } = await getI18n();
  const listings = await getListingsBySupplier(regionId, supplier.id, true);
  const photos = await getListingPhotos(regionId, listings.map((l) => l.id));
  const first = new Map<number, string>();
  for (const p of photos) if (!first.has(p.listing_id)) first.set(p.listing_id, p.path);

  return (
    <>
      <PageHeader title={t("nav.products")} description={t("products.subtitle")}>
        <Button asChild><Link href="/supplier/products/new"><Plus />{t("inventory.add")}</Link></Button>
      </PageHeader>
      {listings.length === 0 ? (
        <EmptyState icon={<Package />} title={t("inventory.empty")} description={t("inventory.empty_hint")}>
          <Button asChild><Link href="/supplier/products/new"><Plus />{t("inventory.add")}</Link></Button>
        </EmptyState>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <THead><TR><TH>{t("estimator.material")}</TH><TH>{t("inventory.price")}</TH><TH>{t("inventory.stock")}</TH><TH>{t("products.status")}</TH><TH /></TR></THead>
              <TBody>
                {listings.map((l) => {
                  const photo = publicStorageUrl(BUCKETS.productPhotos, first.get(l.id));
                  const name = l.material ? (lang === "ar" ? l.material.name_ar : l.material.name_en) : "—";
                  return (
                    <TR key={l.id}>
                      <TD>
                        <Link href={`/supplier/products/${l.id}`} className="flex items-center gap-3 font-medium hover:text-primary">
                          <span className="h-10 w-10 shrink-0 overflow-hidden rounded-md bg-secondary/60">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            {photo && <img src={photo} alt="" className="h-full w-full object-cover" />}
                          </span>
                          {name}
                        </Link>
                      </TD>
                      <TD>{l.price_on_request || l.price == null ? <Badge variant="warning">{t("pricing.contact")}</Badge> : fmt.lyd(l.price)}</TD>
                      <TD>{fmt.num(l.stock_qty)} {l.material ? t(`unit.${l.material.unit}`) : ""}</TD>
                      <TD>
                        <div className="flex flex-wrap gap-1">
                          <Badge variant={l.is_active ? "success" : "muted"}>{t(l.is_active ? "products.visible" : "inventory.hidden")}</Badge>
                          {l.is_featured && <Badge variant="warning">{t("listing.featured")}</Badge>}
                        </div>
                      </TD>
                      <TD>
                        <div className="flex items-center justify-end gap-1">
                          <Button asChild variant="ghost" size="icon" aria-label={t("inventory.edit")}><Link href={`/supplier/products/${l.id}`}><Pencil /></Link></Button>
                          <DeleteProductButton listingId={l.id} compact />
                        </div>
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}
