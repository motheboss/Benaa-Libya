import type { Metadata } from "next";
import { Truck } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { JobCard } from "@/components/shared/job-card";
import { DeliveryForm } from "@/components/shared/delivery-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { requireSupplier } from "@/lib/auth";
import { getDeliverySettings } from "@/lib/data/catalog";
import { getMyJobs } from "@/lib/data/jobs";
import { getI18n } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Delivery jobs" };

/** Create a delivery job (request a driver) and watch the driver's progress. */
export default async function DeliveryJobsPage() {
  const { supplier, regionId } = await requireSupplier();
  const { t } = await getI18n();
  const [jobs, settings] = await Promise.all([getMyJobs(), getDeliverySettings(regionId)]);
  const mine = jobs.filter((j) => j.requester_role === "supplier");
  const base = settings.find((s) => s.supplier_id === supplier.id)?.base_fee;
  const active = mine.filter((j) => ["open", "assigned", "arrived", "picked_up"].includes(j.status));
  const rest = mine.filter((j) => !active.includes(j));

  return (
    <>
      <PageHeader title={t("nav.delivery_jobs")} description={t("jobs.subtitle")} />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Card className="self-start">
          <CardHeader><CardTitle>{t("supplier.create_job")}</CardTitle></CardHeader>
          <CardContent><DeliveryForm role="supplier" defaultPickup={supplier.address ?? ""} defaultFee={base} /></CardContent>
        </Card>

        <div className="space-y-6">
          <section className="space-y-3">
            <h2 className="text-xl font-bold">{t("dash.driver_status")}</h2>
            {active.length === 0 ? <EmptyState icon={<Truck />} title={t("dash.no_active")} /> : active.map((j) => <JobCard key={j.id} job={j} role="supplier" />)}
          </section>
          {rest.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-xl font-bold">{t("orders.history")}</h2>
              {rest.map((j) => <JobCard key={j.id} job={j} role="supplier" />)}
            </section>
          )}
        </div>
      </div>
    </>
  );
}
