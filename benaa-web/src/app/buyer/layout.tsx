import { AppShell } from "@/components/layout/app-shell";
import { requireBuyer } from "@/lib/auth";
import { getRegion } from "@/lib/data/catalog";
import { getLang } from "@/lib/i18n/server";

export default async function BuyerLayout({ children }: { children: React.ReactNode }) {
  const { me, regionId } = await requireBuyer();
  const [region, lang] = await Promise.all([getRegion(regionId), getLang()]);
  return (
    <AppShell variant="buyer" userName={me.profile.full_name ?? ""} regionName={region ? (lang === "ar" ? region.name_ar : region.name_en) : ""}>
      {children}
    </AppShell>
  );
}
