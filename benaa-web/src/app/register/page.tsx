import type { Metadata } from "next";
import { cookies } from "next/headers";
import { AuthLayout } from "@/components/auth/auth-layout";
import { RegisterForm } from "@/components/auth/register-form";
import { getRegions } from "@/lib/data/catalog";
import { getI18n } from "@/lib/i18n/server";
import { REGION_COOKIE } from "@/lib/i18n";

export const metadata: Metadata = { title: "Register" };

export default async function RegisterPage() {
  const { t } = await getI18n();
  const regions = await getRegions();
  const saved = Number((await cookies()).get(REGION_COOKIE)?.value);
  return (
    <AuthLayout title={t("auth.register")} subtitle={t("app.tagline")}>
      <RegisterForm regions={regions} defaultRegionId={Number.isFinite(saved) && saved > 0 ? saved : null} />
    </AuthLayout>
  );
}
