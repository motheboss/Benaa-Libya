import type { Metadata } from "next";
import { Truck } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { JobCard } from "@/components/shared/job-card";
import { DeliveryForm } from "@/components/shared/delivery-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireBuyer } from "@/lib/auth";
import { getDeliverySettings, getSupplier } from "@/lib/data/catalog";
import { getMyJobs } from "@/lib/data/jobs";
import { getI18n } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Delivery request" };

export default async function DeliveryRequestPage({ searchParams }: { searchParams: Promise<{ supplier?: string }> }) {
  const { regionId } = await requireBuyer();
  const { supplier: supplierParam } = await searchParams;
  const { t, lang, fmt } = await getI18n();

  const supplierId = Number(supplierParam);
  const supplier = Number.isInteger(supplierId) && supplierId > 0 ? await getSupplier(regionId, supplierId) : null;
  const [settings, jobs] = await Promise.all([supplier ? getDeliverySettings(regionId) : Promise.resolve([]), getMyJobs()]);
  const base = settings.find((s) => s.supplier_id === supplier?.id)?.base_fee;

  return (
    <>
      <PageHeader title={t("delivery.new")} description={t(supplier ? "delivery.subtitle_supplier" : "delivery.subtitle_direct")} />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card className="self-start">
          <CardHeader><CardTitle>{t("delivery.details")}</CardTitle></CardHeader>
          <CardContent>
            <DeliveryForm
              role="buyer"
              supplierId={supplier?.id ?? null}
              supplierName={supplier ? (lang === "ar" ? supplier.name_ar : supplier.name_en) : undefined}
              defaultPickup={supplier?.address ?? ""}
              defaultFee={base}
              baseFeeHint={base != null ? `${t("delivery.supplier_fee_hint")} ${fmt.lyd(base)}` : undefined}
            />
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-bold">{t("delivery.my_requests")}</h2>
          {jobs.length === 0 ? (
            <EmptyState icon={<Truck />} title={t("delivery.empty")} description={t("delivery.empty_hint")} />
          ) : (
            jobs.map((j) => <JobCard key={j.id} job={j} role="buyer" showSupplier />)
          )}
        </div>
      </div>
    </>
  );
}
