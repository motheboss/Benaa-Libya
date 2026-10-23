import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/auth-layout";
import { LoginForm } from "@/components/auth/login-form";
import { getI18n } from "@/lib/i18n/server";

export const metadata: Metadata = { title: "Login" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  const { t } = await getI18n();
  return (
    <AuthLayout title={t("auth.login")} subtitle={t("app.tagline")}>
      <LoginForm next={next} initialError={error === "admin" ? "auth.admin_notice" : undefined} />
    </AuthLayout>
  );
}
