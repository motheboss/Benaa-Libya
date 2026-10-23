import Link from "next/link";
import { BadgeCheck, Banknote, ClipboardList, Package, Plus, Truck } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { JobCard } from "@/components/shared/job-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { requireSupplier } from "@/lib/auth";
import { getListingsBySupplier } from "@/lib/data/catalog";
import { getMyJobs } from "@/lib/data/jobs";
import { getI18n } from "@/lib/i18n/server";

const ACTIVE = ["open", "assigned", "arrived", "picked_up"];

export default async function SupplierDashboard() {
  const { supplier, regionId } = await requireSupplier();
  const { t, lang, fmt } = await getI18n();
  const [listings, jobs] = await Promise.all([getListingsBySupplier(regionId, supplier.id, true), getMyJobs()]);

  const pending = jobs.filter((j) => j.status === "pending_supplier");
  const active = jobs.filter((j) => ACTIVE.includes(j.status));
  const since = Date.now() - 30 * 86_400_000;
  const earned30 = jobs
    .filter((j) => j.status === "delivered" && j.delivered_at && new Date(j.delivered_at).getTime() >= since)
    .reduce((sum, j) => sum + (j.supplier_earning ?? 0), 0);

  const stat = (icon: React.ReactNode, label: string, value: string, href: string, accent = false) => (
    <Link href={href}>
      <Card className="transition-colors hover:border-primary">
        <CardContent className="flex items-center gap-4 p-5">
          <div className="text-primary">{icon}</div>
          <div>
            <p className="text-sm text-muted-foreground">{label}</p>
            <p className={`text-2xl font-bold ${accent ? "text-primary" : ""}`}>{value}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );

  return (
    <>
      <PageHeader title={lang === "ar" ? supplier.name_ar || t("nav.dashboard") : supplier.name_en || t("nav.dashboard")} description={supplier.is_verified ? undefined : t("supplier.not_verified")}>
        {supplier.is_verified && <span className="inline-flex items-center gap-1 text-sm text-success"><BadgeCheck className="h-4 w-4" />{t("supplier.verified")}</span>}
        <Button asChild><Link href="/supplier/products/new"><Plus />{t("inventory.add")}</Link></Button>
      </PageHeader>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stat(<Package className="h-6 w-6" />, t("nav.products"), fmt.num(listings.length, 0), "/supplier/products")}
        {stat(<ClipboardList className="h-6 w-6" />, t("dash.pending"), fmt.num(pending.length, 0), "/supplier/orders", pending.length > 0)}
        {stat(<Truck className="h-6 w-6" />, t("dash.active"), fmt.num(active.length, 0), "/supplier/delivery-jobs")}
        {stat(<Banknote className="h-6 w-6" />, t("earnings.month"), fmt.lyd(earned30), "/supplier/earnings")}
      </div>

      {pending.length > 0 && (
        <section className="mb-8 space-y-3">
          <h2 className="text-xl font-bold">{t("orders.requests")}</h2>
          <div className="grid gap-4 lg:grid-cols-2">{pending.map((j) => <JobCard key={j.id} job={j} role="supplier" />)}</div>
        </section>
      )}

      <section className="space-y-3">
        <h2 className="text-xl font-bold">{t("dash.driver_status")}</h2>
        {active.length === 0 ? (
          <EmptyState icon={<Truck />} title={t("dash.no_active")} />
        ) : (
          <div className="grid gap-4 lg:grid-cols-2">{active.map((j) => <JobCard key={j.id} job={j} role="supplier" />)}</div>
        )}
      </section>
    </>
  );
}
