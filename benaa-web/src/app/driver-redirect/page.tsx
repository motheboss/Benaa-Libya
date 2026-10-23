import type { Metadata } from "next";
import { Smartphone } from "lucide-react";
import { AuthLayout } from "@/components/auth/auth-layout";
import { AppQr } from "@/components/auth/app-qr";
import { SignOutButton } from "@/components/layout/sign-out-button";
import { requireRole } from "@/lib/auth";
import { getI18n } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Driver" };

/** Drivers cannot use the website: show a QR code that opens the mobile app. */
export default async function DriverRedirectPage() {
  await requireRole("driver");
  const { t } = await getI18n();
  const appUrl = process.env.NEXT_PUBLIC_MOBILE_APP_URL ?? "https://benaa.ly";

  return (
    <AuthLayout title={t("driver.title")} subtitle={t("driver.subtitle")}>
      <div className="flex flex-col items-center gap-5 text-center">
        <Smartphone className="h-10 w-10 text-primary" />
        <div className="rounded-xl border bg-white p-3">
          <AppQr value={appUrl} />
        </div>
        <p className="text-sm text-muted-foreground">{t("driver.scan")}</p>
        <SignOutButton variant="outline" />
      </div>
    </AuthLayout>
  );
}
