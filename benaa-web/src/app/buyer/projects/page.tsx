import type { Metadata } from "next";
import Link from "next/link";
import { FolderOpen } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { DeleteButton, NewProjectForm } from "@/components/buyer/project-actions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { requireBuyer } from "@/lib/auth";
import { getProjectCalculations, getProjectItems, getProjects } from "@/lib/data/projects";
import { getI18n } from "@/lib/i18n/server";
import { dbResultsTotal } from "@/lib/calculator";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Projects" };

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ project?: string }> }) {
  const { regionId } = await requireBuyer();
  const { project: projectParam } = await searchParams;
  const { t, fmt } = await getI18n();
  const projects = await getProjects(regionId);
  const selected = projects.find((p) => p.id === projectParam) ?? null;
  const [items, calculations] = selected
    ? await Promise.all([getProjectItems(regionId, selected.id), getProjectCalculations(regionId, selected.id)])
    : [[], []];
  const itemsTotal = items.reduce((sum, i) => sum + (i.line_total ?? i.quantity * i.unit_price), 0);

  return (
    <>
      <PageHeader title={t("projects.title")} description={t("projects.subtitle")} />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)]">
        <div className="space-y-4">
          <NewProjectForm regionId={regionId} />
          {projects.length === 0 ? (
            <EmptyState icon={<FolderOpen />} title={t("projects.empty")} description={t("projects.empty_hint")} />
          ) : (
            <div className="space-y-2">
              {projects.map((p) => (
                <div key={p.id} className={cn("flex items-center justify-between rounded-xl border bg-card p-3", selected?.id === p.id && "border-primary ring-1 ring-primary")}>
                  <Link href={`/buyer/projects?project=${p.id}`} className="min-w-0 flex-1">
                    <p className="truncate font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{fmt.date(p.created_at)}</p>
                  </Link>
                  <DeleteButton table="projects" id={p.id} regionId={regionId} redirectTo="/buyer/projects" />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          {selected ? (
            <>
              <Card>
                <CardHeader><CardTitle>{selected.name} · {t("projects.items")}</CardTitle></CardHeader>
                <CardContent className="p-0">
                  {items.length === 0 ? (
                    <p className="p-5 pt-0 text-sm text-muted-foreground">{t("projects.no_items")}</p>
                  ) : (
                    <Table>
                      <THead><TR><TH>{t("estimator.material")}</TH><TH>{t("estimator.quantity")}</TH><TH>{t("prices.price")}</TH><TH>{t("calc.total_cost")}</TH><TH /></TR></THead>
                      <TBody>
                        {items.map((i) => (
                          <TR key={i.id}>
                            <TD className="font-medium">{i.label}</TD>
                            <TD>{fmt.num(i.quantity)} {i.unit ? t(`unit.${i.unit}`) : ""}</TD>
                            <TD>{fmt.lyd(i.unit_price)}</TD>
                            <TD>{fmt.lyd(i.line_total ?? i.quantity * i.unit_price)}</TD>
                            <TD><DeleteButton table="project_budget_items" id={i.id} regionId={regionId} /></TD>
                          </TR>
                        ))}
                        <TR><TD colSpan={3} className="font-bold">{t("calc.total_cost")}</TD><TD colSpan={2} className="font-bold text-primary">{fmt.lyd(itemsTotal)}</TD></TR>
                      </TBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {calculations.length > 0 && (
                <Card>
                  <CardHeader><CardTitle>{t("projects.calculations")}</CardTitle></CardHeader>
                  <CardContent className="space-y-3">
                    {calculations.map((c) => {
                      const inp = c.inputs as { floors?: number; floor_area_m2?: number };
                      return (
                        <div key={c.id} className="flex items-center justify-between rounded-lg border p-3 text-sm">
                          <div>
                            <p className="font-medium">{t("tools.calculator")}</p>
                            <p className="text-xs text-muted-foreground">
                              {fmt.num(inp.floors ?? 0, 0)} {t("calc.floors")} · {fmt.num(inp.floor_area_m2 ?? 0)} {t("unit.m2")} · {fmt.date(c.created_at)}
                            </p>
                          </div>
                          <b>{fmt.lyd(dbResultsTotal(c.results))}</b>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              )}
            </>
          ) : (
            projects.length > 0 && <EmptyState icon={<FolderOpen />} title={t("projects.select")} />
          )}
        </div>
      </div>
    </>
  );
}
