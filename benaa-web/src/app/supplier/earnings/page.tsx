import type { Metadata } from "next";
import { Banknote } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { requireSupplier } from "@/lib/auth";
import { getMyJobs } from "@/lib/data/jobs";
import { getI18n } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Earnings" };

export default async function EarningsPage() {
  await requireSupplier();
  const { t, fmt } = await getI18n();
  const delivered = (await getMyJobs())
    .filter((j) => j.status === "delivered")
    .sort((a, b) => new Date(b.delivered_at ?? 0).getTime() - new Date(a.delivered_at ?? 0).getTime());

  const sum = (days: number | null) => {
    const cutoff = days == null ? 0 : Date.now() - days * 86_400_000;
    return delivered.filter((j) => new Date(j.delivered_at ?? 0).getTime() >= cutoff).reduce((s, j) => s + (j.supplier_earning ?? 0), 0);
  };
  const cards: [string, number][] = [["earnings.today", sum(1)], ["earnings.week", sum(7)], ["earnings.month", sum(30)], ["earnings.all_time", sum(null)]];

  return (
    <>
      <PageHeader title={t("nav.earnings")} description={t("earnings.note")} />
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map(([k, v]) => (
          <Card key={k}><CardContent className="p-5"><p className="text-sm text-muted-foreground">{t(k)}</p><p className="mt-1 text-2xl font-bold text-primary">{fmt.lyd(v)}</p></CardContent></Card>
        ))}
      </div>
      {delivered.length === 0 ? (
        <EmptyState icon={<Banknote />} title={t("earnings.empty")} />
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <THead><TR><TH>{t("delivery.material")}</TH><TH>{t("earnings.delivered_on")}</TH><TH>{t("delivery.goods_value_short")}</TH><TH>{t("earnings.your_earning")}</TH></TR></THead>
              <TBody>
                {delivered.slice(0, 50).map((j) => (
                  <TR key={j.id}>
                    <TD className="font-medium">{j.material_type}</TD>
                    <TD className="text-muted-foreground">{j.delivered_at ? fmt.date(j.delivered_at, true) : "—"}</TD>
                    <TD>{fmt.lyd(j.goods_value)}</TD>
                    <TD className="font-semibold text-success">{fmt.lyd(j.supplier_earning ?? 0)}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </>
  );
}
