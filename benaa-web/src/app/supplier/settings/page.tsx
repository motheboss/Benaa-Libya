import type { Metadata } from "next";
import { PageHeader } from "@/components/shared/page-header";
import { DeliveryFeesForm, ProfileForm, RegionSettingsForm } from "@/components/supplier/settings-forms";
import { LangToggle } from "@/components/layout/lang-toggle";
import { requireSupplier } from "@/lib/auth";
import { getDeliverySettings, getRegions } from "@/lib/data/catalog";
import { getI18n } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Settings" };

export default async function SupplierSettingsPage() {
  const { supplier, regionId } = await requireSupplier();
  const { t } = await getI18n();
  const [settings, regions] = await Promise.all([getDeliverySettings(regionId), getRegions()]);

  return (
    <>
      <PageHeader title={t("nav.settings")}>
        <LangToggle className="border" />
      </PageHeader>
      <div className="max-w-3xl space-y-6">
        <ProfileForm supplier={supplier} />
        <DeliveryFeesForm settings={settings.find((s) => s.supplier_id === supplier.id) ?? null} />
        <RegionSettingsForm regions={regions} currentId={regionId} />
      </div>
    </>
  );
}
