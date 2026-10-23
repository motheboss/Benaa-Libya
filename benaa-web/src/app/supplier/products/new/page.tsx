import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { ProductForm } from "@/components/supplier/product-form";
import { Card, CardContent } from "@/components/ui/card";
import { requireSupplier } from "@/lib/auth";
import { getListingsBySupplier, getMaterials } from "@/lib/data/catalog";
import { getI18n } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Add product" };

export default async function NewProductPage() {
  const { supplier, regionId } = await requireSupplier();
  const { t } = await getI18n();
  const [materials, listings] = await Promise.all([getMaterials(), getListingsBySupplier(regionId, supplier.id, true)]);
  const used = new Set(listings.map((l) => l.material_id));
  const available = materials.filter((m) => !used.has(m.id));

  return (
    <>
      <PageHeader title={t("inventory.add")} description={t("products.new_hint")} />
      {available.length === 0 ? (
        <EmptyState title={t("products.no_materials")} description={t("products.no_materials_hint")} />
      ) : (
        <Card className="max-w-2xl"><CardContent className="p-6"><ProductForm materials={available} /></CardContent></Card>
      )}
    </>
  );
}
