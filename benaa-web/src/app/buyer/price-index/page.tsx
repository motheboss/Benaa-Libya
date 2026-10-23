import type { Metadata } from "next";
import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LineChart } from "@/components/shared/line-chart";
import { TrendChip } from "@/components/shared/trend-chip";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { requireBuyer } from "@/lib/auth";
import { getMaterials } from "@/lib/data/catalog";
import { getLatestPrices, getPriceSeries } from "@/lib/data/prices";
import { getI18n } from "@/lib/i18n/server";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Price index" };

export default async function PriceIndexPage({ searchParams }: { searchParams: Promise<{ material?: string; days?: string }> }) {
  const { regionId } = await requireBuyer();
  const sp = await searchParams;
  const { t, lang, fmt } = await getI18n();
  const [prices, materials] = await Promise.all([getLatestPrices(regionId), getMaterials()]);
  const byId = new Map(materials.map((m) => [m.id, m]));
  const rows = prices.filter((p) => byId.has(p.material_id)).sort((a, b) => byId.get(a.material_id)!.name_en.localeCompare(byId.get(b.material_id)!.name_en));

  const days = [30, 90, 365].includes(Number(sp.days)) ? Number(sp.days) : 90;
  const selectedId = Number(sp.material) || rows[0]?.material_id;
  const selected = selectedId ? byId.get(selectedId) : undefined;
  const series = selected ? await getPriceSeries(regionId, selected.id, days) : [];
  const name = (id: number) => { const m = byId.get(id); return m ? (lang === "ar" ? m.name_ar : m.name_en) : "—"; };

  return (
    <>
      <PageHeader title={t("nav.price_index")} description={t("prices.note")} />
      {rows.length === 0 ? (
        <EmptyState icon={<TrendingUp />} title={t("prices.empty")} />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <Card>
            <CardContent className="p-0">
              <Table>
                <THead><TR><TH>{t("estimator.material")}</TH><TH>{t("prices.price")}</TH><TH>{t("prices.change")}</TH><TH>{t("prices.updated")}</TH></TR></THead>
                <TBody>
                  {rows.map((r) => (
                    <TR key={r.material_id} className={cn(selected?.id === r.material_id && "bg-accent/60")}>
                      <TD><Link className="font-medium hover:text-primary" href={`/buyer/price-index?material=${r.material_id}&days=${days}`}>{name(r.material_id)}</Link></TD>
                      <TD>{fmt.lyd(r.price)} <span className="text-xs text-muted-foreground">/ {t(`unit.${byId.get(r.material_id)!.unit}`)}</span></TD>
                      <TD><TrendChip price={r.price} prev={r.prev_price} /></TD>
                      <TD className="text-muted-foreground">{fmt.date(r.observed_on)}</TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </CardContent>
          </Card>

          <Card className="self-start">
            <CardHeader>
              <CardTitle>{selected ? (lang === "ar" ? selected.name_ar : selected.name_en) : ""}</CardTitle>
              <div className="flex gap-2 pt-1">
                {[30, 90, 365].map((d) => (
                  <Link key={d} href={`/buyer/price-index?material=${selected?.id ?? ""}&days=${d}`}
                    className={cn("rounded-full border px-3 py-1 text-xs", d === days ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-accent")}>
                    {t(`prices.${d}d`)}
                  </Link>
                ))}
              </div>
            </CardHeader>
            <CardContent>
              {series.length < 2 ? (
                <p className="py-10 text-center text-sm text-muted-foreground">{t("prices.not_enough")}</p>
              ) : (
                <LineChart points={series.map((p) => ({ label: p.observed_on, value: p.price }))} formatValue={(n) => fmt.lyd(n)} formatLabel={(s) => fmt.date(s)} />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
