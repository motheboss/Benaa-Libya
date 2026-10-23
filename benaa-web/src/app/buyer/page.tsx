import Link from "next/link";
import { Building2, Calculator, FolderOpen, Store, TrendingUp, Truck } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { JobCard } from "@/components/shared/job-card";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireBuyer } from "@/lib/auth";
import { getMyJobs } from "@/lib/data/jobs";
import { getProjects } from "@/lib/data/projects";
import { getI18n } from "@/lib/i18n/server";

export default async function BuyerDashboard() {
  const { me, regionId } = await requireBuyer();
  const { t, fmt } = await getI18n();
  const [jobs, projects] = await Promise.all([getMyJobs(), getProjects(regionId)]);
  const active = jobs.filter((j) => ["pending_supplier", "open", "assigned", "arrived", "picked_up"].includes(j.status));

  const links = [
    { href: "/buyer/marketplace", icon: Store, title: "nav.marketplace", body: "buyer.dash.marketplace" },
    { href: "/buyer/suppliers", icon: Building2, title: "nav.suppliers", body: "buyer.dash.suppliers" },
    { href: "/buyer/price-index", icon: TrendingUp, title: "nav.price_index", body: "buyer.dash.prices" },
    { href: "/buyer/calculator", icon: Calculator, title: "nav.calculator", body: "buyer.dash.calculator" },
    { href: "/buyer/delivery-request", icon: Truck, title: "nav.delivery", body: "buyer.dash.delivery" },
    { href: "/buyer/projects", icon: FolderOpen, title: "nav.projects", body: "buyer.dash.projects" },
  ];

  return (
    <>
      <PageHeader title={`${t("dash.welcome")}${me.profile.full_name ? ` ${me.profile.full_name}` : ""}`} description={t("buyer.dash.subtitle")} />

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">{t("dash.active_requests")}</p><p className="mt-1 text-3xl font-bold text-primary">{fmt.num(active.length, 0)}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">{t("nav.projects")}</p><p className="mt-1 text-3xl font-bold">{fmt.num(projects.length, 0)}</p></CardContent></Card>
        <Card><CardContent className="p-5"><p className="text-sm text-muted-foreground">{t("dash.all_requests")}</p><p className="mt-1 text-3xl font-bold">{fmt.num(jobs.length, 0)}</p></CardContent></Card>
      </div>

      <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map(({ href, icon: Icon, title, body }) => (
          <Link key={href} href={href} className="group rounded-xl border bg-card p-5 transition-colors hover:border-primary">
            <Icon className="mb-3 h-6 w-6 text-primary" />
            <h3 className="font-semibold group-hover:text-primary">{t(title)}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{t(body)}</p>
          </Link>
        ))}
      </div>

      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-xl font-bold">{t("dash.recent_requests")}</h2>
        <Button asChild size="sm"><Link href="/buyer/delivery-request">{t("delivery.new")}</Link></Button>
      </div>
      {jobs.length === 0 ? (
        <EmptyState icon={<Truck />} title={t("delivery.empty")} description={t("delivery.empty_hint")} />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">{jobs.slice(0, 4).map((j) => <JobCard key={j.id} job={j} role="buyer" showSupplier />)}</div>
      )}
    </>
  );
}
