import type { Metadata } from "next";
import { ClipboardList } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { JobCard } from "@/components/shared/job-card";
import { requireSupplier } from "@/lib/auth";
import { getMyJobs } from "@/lib/data/jobs";
import { getI18n } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Orders" };

/** Orders = delivery requests buyers addressed to this supplier. Confirm or reject them here. */
export default async function OrdersPage() {
  await requireSupplier();
  const { t } = await getI18n();
  const orders = (await getMyJobs()).filter((j) => j.requester_role === "buyer");
  const pending = orders.filter((j) => j.status === "pending_supplier");
  const active = orders.filter((j) => ["open", "assigned", "arrived", "picked_up"].includes(j.status));
  const history = orders.filter((j) => ["delivered", "cancelled"].includes(j.status));

  const section = (title: string, list: typeof orders) =>
    list.length > 0 && (
      <section className="space-y-3">
        <h2 className="text-xl font-bold">{t(title)}</h2>
        <div className="grid gap-4 lg:grid-cols-2">{list.map((j) => <JobCard key={j.id} job={j} role="supplier" />)}</div>
      </section>
    );

  return (
    <>
      <PageHeader title={t("nav.orders")} description={t("orders.subtitle")} />
      {orders.length === 0 ? (
        <EmptyState icon={<ClipboardList />} title={t("orders.empty")} description={t("orders.empty_hint")} />
      ) : (
        <div className="space-y-8">
          {section("orders.requests", pending)}
          {section("orders.active", active)}
          {section("orders.history", history)}
        </div>
      )}
    </>
  );
}
