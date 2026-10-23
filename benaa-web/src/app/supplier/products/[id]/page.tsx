import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/shared/page-header";
import { DeleteProductButton } from "@/components/supplier/delete-product-button";
import { ProductForm } from "@/components/supplier/product-form";
import { ProductPhotos } from "@/components/supplier/product-photos";
import { Card, CardContent } from "@/components/ui/card";
import { requireSupplier } from "@/lib/auth";
import { getListingPhotos, getListingsBySupplier } from "@/lib/data/catalog";
import { getI18n } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Edit product" };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { supplier, regionId } = await requireSupplier();
  const { id } = await params;
  const listingId = Number(id);
  if (!Number.isInteger(listingId)) notFound();

  const { t } = await getI18n();
  const listings = await getListingsBySupplier(regionId, supplier.id, true);
  const listing = listings.find((l) => l.id === listingId);
  if (!listing) notFound();
  const photos = await getListingPhotos(regionId, [listing.id]);

  return (
    <>
      <PageHeader title={t("inventory.edit")}>
        <DeleteProductButton listingId={listing.id} />
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-2">
        <Card><CardContent className="p-6"><ProductForm materials={[]} listing={listing} /></CardContent></Card>
        <Card className="self-start"><CardContent className="p-6"><ProductPhotos listingId={listing.id} photos={photos} /></CardContent></Card>
      </div>
    </>
  );
}
