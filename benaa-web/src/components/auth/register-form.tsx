"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Loader2, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Field } from "@/components/shared/field";
import { Notice } from "@/components/shared/notice";
import { useI18n } from "@/components/layout/i18n-provider";
import { createClient } from "@/lib/supabase/client";
import { pathAfterLogin } from "@/lib/auth-client";
import { normalizePhone, westernDigits } from "@/lib/phone";
import { cn } from "@/lib/utils";
import type { Region } from "@/types/db";

type WebRole = "buyer" | "supplier"; // drivers use the mobile app only

export function RegisterForm({ regions, defaultRegionId }: { regions: Region[]; defaultRegionId: number | null }) {
  const { t, lang } = useI18n();
  const router = useRouter();
  const [role, setRole] = useState<WebRole>("buyer");
  const [fullName, setFullName] = useState("");
  const [regionId, setRegionId] = useState<string>(defaultRegionId ? String(defaultRegionId) : "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  function metadata() {
    if (!fullName.trim()) throw new Error("auth.err.name");
    if (!regionId) throw new Error("auth.err.region");
    return { role, full_name: fullName.trim(), region_id: Number(regionId) };
  }

  async function run(work: () => Promise<void>) {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      await work();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function finish() {
    const path = await pathAfterLogin();
    router.replace(path);
    router.refresh();
  }

  const registerEmail = (e: React.FormEvent) => {
    e.preventDefault();
    void run(async () => {
      const data = metadata();
      if (!email.includes("@")) throw new Error("auth.err.email");
      if (password.length < 6) throw new Error("auth.err.password");
      const { data: res, error } = await createClient().auth.signUp({ email: email.trim(), password, options: { data } });
      if (error) throw error;
      if (res.session) await finish();
      else setInfo("auth.confirm_email");
    });
  };

  const sendCode = (e?: React.FormEvent) => {
    e?.preventDefault();
    void run(async () => {
      const data = metadata();
      if (!phone.trim()) throw new Error("auth.err.phone");
      const { error } = await createClient().auth.signInWithOtp({ phone: normalizePhone(phone), options: { shouldCreateUser: true, data } });
      if (error) throw error;
      setOtpSent(true);
    });
  };

  const verifyCode = (e: React.FormEvent) => {
    e.preventDefault();
    void run(async () => {
      const { error } = await createClient().auth.verifyOtp({ phone: normalizePhone(phone), token: westernDigits(code.trim()), type: "sms" });
      if (error) throw error;
      await finish();
    });
  };

  const roleButton = (value: WebRole, icon: React.ReactNode, label: string) => (
    <button
      type="button"
      onClick={() => setRole(value)}
      className={cn(
        "flex flex-1 flex-col items-center gap-1 rounded-lg border p-3 text-sm font-medium transition-colors",
        role === value ? "border-primary bg-primary text-primary-foreground" : "bg-card hover:bg-accent",
      )}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <p className="text-sm font-medium text-muted-foreground">{t("auth.i_am")}</p>
        <div className="flex gap-2">
          {roleButton("buyer", <Building2 className="h-5 w-5" />, t("role.buyer"))}
          {roleButton("supplier", <Store className="h-5 w-5" />, t("role.supplier"))}
        </div>
        <p className="text-xs text-muted-foreground">{t("auth.drivers_note")}</p>
      </div>

      <Field label={t("auth.full_name")}>
        <Input value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="name" />
      </Field>
      <Field label={t("auth.city")}>
        <Select value={regionId} onChange={(e) => setRegionId(e.target.value)}>
          <option value="">{t("region.choose")}</option>
          {regions.map((r) => (
            <option key={r.id} value={r.id}>{lang === "ar" ? r.name_ar : r.name_en}</option>
          ))}
        </Select>
      </Field>

      <Tabs defaultValue="email">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email">{t("auth.email")}</TabsTrigger>
          <TabsTrigger value="phone">{t("auth.phone")}</TabsTrigger>
        </TabsList>

        <TabsContent value="email">
          <form onSubmit={registerEmail} className="space-y-4">
            <Field label={t("auth.email_address")}>
              <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} dir="ltr" />
            </Field>
            <Field label={t("auth.password")}>
              <Input type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} dir="ltr" />
            </Field>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy && <Loader2 className="animate-spin" />}
              {t("auth.register")}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="phone">
          <form onSubmit={otpSent ? verifyCode : sendCode} className="space-y-4">
            <Field label={t("auth.phone_number")} hint="+218 …">
              <Input type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} dir="ltr" />
            </Field>
            {otpSent && (
              <Field label={t("auth.code")}>
                <Input inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value)} dir="ltr" />
              </Field>
            )}
            <Button type="submit" className="w-full" disabled={busy}>
              {busy && <Loader2 className="animate-spin" />}
              {t(otpSent ? "auth.verify" : "auth.send_code")}
            </Button>
            {otpSent && (
              <Button type="button" variant="link" className="w-full" onClick={() => sendCode()} disabled={busy}>
                {t("auth.resend")}
              </Button>
            )}
          </form>
        </TabsContent>
      </Tabs>

      {error && <Notice>{t(error)}</Notice>}
      {info && <Notice tone="success">{t(info)}</Notice>}

      <p className="text-center text-sm text-muted-foreground">
        {t("auth.have_account")}{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">{t("auth.login")}</Link>
      </p>
    </div>
  );
}
