import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { CostEstimator } from "@/components/buyer/cost-estimator";
import { SkeletonCalculator } from "@/components/buyer/skeleton-calculator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { requireBuyer } from "@/lib/auth";
import { getMaterials } from "@/lib/data/catalog";
import { getCoefficients, getLatestPrices } from "@/lib/data/prices";
import { getProjects } from "@/lib/data/projects";
import { getI18n } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Calculator" };

export default async function CalculatorPage() {
  const { regionId } = await requireBuyer();
  const { t } = await getI18n();
  const [coefficients, materials, prices, projects] = await Promise.all([
    getCoefficients(regionId), getMaterials(), getLatestPrices(regionId), getProjects(regionId),
  ]);

  const priceById: Record<number, number> = Object.fromEntries(prices.map((p) => [p.material_id, p.price]));
  const pricesByCode: Record<string, number> = {};
  for (const m of materials) if (m.code && priceById[m.id] != null) pricesByCode[m.code] = priceById[m.id];

  return (
    <>
      <PageHeader title={t("nav.calculator")} description={t("tools.subtitle")} />
      <Tabs defaultValue="skeleton">
        <TabsList>
          <TabsTrigger value="skeleton">{t("tools.calculator")}</TabsTrigger>
          <TabsTrigger value="estimator">{t("tools.estimator")}</TabsTrigger>
        </TabsList>
        <TabsContent value="skeleton">
          <SkeletonCalculator coefficients={coefficients} pricesByCode={pricesByCode} projects={projects} regionId={regionId} />
        </TabsContent>
        <TabsContent value="estimator">
          <CostEstimator materials={materials} prices={priceById} projects={projects} regionId={regionId} />
        </TabsContent>
      </Tabs>
    </>
  );
}
