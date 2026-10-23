import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AuthLayout } from "@/components/auth/auth-layout";
import { RegionPicker } from "@/components/auth/region-picker";
import { getRegions } from "@/lib/data/catalog";
import { getMe, homeFor } from "@/lib/auth";
import { getI18n } from "@/lib/i18n/server";
import { REGION_COOKIE } from "@/lib/i18n";

export const metadata: Metadata = { title: "Region" };

export default async function RegionPage() {
  const { t } = await getI18n();
  const [regions, me] = await Promise.all([getRegions(), getMe()]);
  const cookieRegion = Number((await cookies()).get(REGION_COOKIE)?.value);
  const currentId = me?.profile.region_id ?? (Number.isFinite(cookieRegion) && cookieRegion > 0 ? cookieRegion : null);
  const next = me ? homeFor(me.profile.role) : "/register";

  return (
    <div className="[&_.max-w-md]:max-w-3xl">
      <AuthLayout title={t("region.choose")} subtitle={t("region.subtitle")}>
        <RegionPicker regions={regions} currentId={currentId} signedIn={!!me} next={next} />
      </AuthLayout>
    </div>
  );
}
