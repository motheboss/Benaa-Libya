"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Field } from "@/components/shared/field";
import { Notice } from "@/components/shared/notice";
import { useI18n } from "@/components/layout/i18n-provider";
import { createClient } from "@/lib/supabase/client";
import { pathAfterLogin } from "@/lib/auth-client";
import { normalizePhone, westernDigits } from "@/lib/phone";

export function LoginForm({ next, initialError }: { next?: string; initialError?: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(initialError ?? null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [otpSent, setOtpSent] = useState(false);

  async function run(work: () => Promise<void>) {
    setBusy(true);
    setError(null);
    try {
      await work();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  async function finish() {
    const path = await pathAfterLogin(next);
    router.replace(path);
    router.refresh();
  }

  const signInEmail = (e: React.FormEvent) => {
    e.preventDefault();
    void run(async () => {
      const { error } = await createClient().auth.signInWithPassword({ email: email.trim(), password });
      if (error) throw error;
      await finish();
    });
  };

  const sendCode = (e?: React.FormEvent) => {
    e?.preventDefault();
    void run(async () => {
      if (!phone.trim()) throw new Error("auth.err.phone");
      const { error } = await createClient().auth.signInWithOtp({ phone: normalizePhone(phone), options: { shouldCreateUser: false } });
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

  return (
    <div className="space-y-5">
      <Tabs defaultValue="email">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="email">{t("auth.email")}</TabsTrigger>
          <TabsTrigger value="phone">{t("auth.phone")}</TabsTrigger>
        </TabsList>

        <TabsContent value="email">
          <form onSubmit={signInEmail} className="space-y-4">
            <Field label={t("auth.email_address")}>
              <Input type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required dir="ltr" />
            </Field>
            <Field label={t("auth.password")}>
              <Input type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required dir="ltr" />
            </Field>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy && <Loader2 className="animate-spin" />}
              {t("auth.login")}
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="phone">
          <form onSubmit={otpSent ? verifyCode : sendCode} className="space-y-4">
            <Field label={t("auth.phone_number")} hint="+218 …">
              <Input type="tel" inputMode="tel" autoComplete="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required dir="ltr" />
            </Field>
            {otpSent && (
              <Field label={t("auth.code")}>
                <Input inputMode="numeric" autoComplete="one-time-code" value={code} onChange={(e) => setCode(e.target.value)} required dir="ltr" />
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

      <p className="text-center text-sm text-muted-foreground">
        {t("auth.no_account")}{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">{t("auth.register")}</Link>
      </p>
    </div>
  );
}
