import { AppShell } from "@/components/layout/app-shell";
import { requireSupplier } from "@/lib/auth";
import { getRegion } from "@/lib/data/catalog";
import { getLang } from "@/lib/i18n/server";

export default async function SupplierLayout({ children }: { children: React.ReactNode }) {
  const { me, supplier, regionId } = await requireSupplier();
  const [region, lang] = await Promise.all([getRegion(regionId), getLang()]);
  const name = lang === "ar" ? supplier.name_ar : supplier.name_en;
  return (
    <AppShell variant="supplier" userName={name || me.profile.full_name || ""} regionName={region ? (lang === "ar" ? region.name_ar : region.name_en) : ""}>
      {children}
    </AppShell>
  );
}
