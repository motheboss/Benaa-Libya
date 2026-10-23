import Link from "next/link";
import { Banknote, Building2, Calculator, ChevronLeft, ChevronRight, Package, TrendingUp, Truck } from "lucide-react";
import { ArchMark } from "@/components/brand/arch-mark";
import { Logo } from "@/components/brand/logo";
import { TriangleBand } from "@/components/brand/triangle-band";
import { LangToggle } from "@/components/layout/lang-toggle";
import { Button } from "@/components/ui/button";
import { getMe, homeFor } from "@/lib/auth";
import { getI18n } from "@/lib/i18n/server";

async function safeMe() {
  try { return await getMe(); } catch { return null; }
}

export default async function LandingPage() {
  const { t, dir } = await getI18n();
  const me = await safeMe();
  const Arrow = dir === "rtl" ? ChevronLeft : ChevronRight;

  const features = [
    { icon: TrendingUp, title: "landing.f1.title", body: "landing.f1.body" },
    { icon: Building2, title: "landing.f2.title", body: "landing.f2.body" },
    { icon: Calculator, title: "landing.f3.title", body: "landing.f3.body" },
    { icon: Truck, title: "landing.f4.title", body: "landing.f4.body" },
    { icon: Package, title: "landing.f5.title", body: "landing.f5.body" },
    { icon: Banknote, title: "landing.f6.title", body: "landing.f6.body" },
  ];

  return (
    <div className="min-h-screen">
      <header className="bg-asphalt">
        <div className="container flex items-center justify-between py-4">
          <Logo />
          <div className="flex items-center gap-2">
            <LangToggle className="text-sand hover:bg-slate-soft hover:text-sand" />
            {me ? (
              <Button asChild size="sm"><Link href={homeFor(me.profile.role)}>{t("landing.dashboard")}</Link></Button>
            ) : (
              <>
                <Button asChild variant="ghost" size="sm" className="text-sand hover:bg-slate-soft hover:text-sand"><Link href="/login">{t("auth.login")}</Link></Button>
                <Button asChild size="sm"><Link href="/register">{t("auth.register")}</Link></Button>
              </>
            )}
          </div>
        </div>

        <section className="container grid items-center gap-10 py-14 lg:grid-cols-2 lg:py-20">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight text-sand lg:text-5xl">{t("app.tagline")}</h1>
            <p className="max-w-xl text-lg text-sand/80">{t("landing.hero")}</p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg"><Link href="/register">{t("landing.cta")} <Arrow /></Link></Button>
              <Button asChild size="lg" variant="outline" className="border-sand/30 bg-transparent text-sand hover:bg-slate-soft hover:text-sand">
                <Link href="/login">{t("auth.login")}</Link>
              </Button>
            </div>
          </div>
          <div className="flex justify-center">
            <ArchMark className="h-64 w-auto lg:h-80" />
          </div>
        </section>
        <TriangleBand height={16} />
      </header>

      <section className="container py-16">
        <h2 className="mb-2 text-center text-2xl font-bold lg:text-3xl">{t("landing.features")}</h2>
        <p className="mx-auto mb-10 max-w-2xl text-center text-muted-foreground">{t("landing.problem")}</p>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-xl border bg-card p-6 shadow-sm">
              <Icon className="mb-4 h-8 w-8 text-primary" />
              <h3 className="mb-1 text-lg font-semibold">{t(title)}</h3>
              <p className="text-sm text-muted-foreground">{t(body)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-secondary">
        <div className="container py-14 text-center">
          <h2 className="mb-6 text-2xl font-bold">{t("landing.how")}</h2>
          <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-3">
            {["landing.step1", "landing.step2", "landing.step3"].map((k, i) => (
              <div key={k} className="space-y-2">
                <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-asphalt font-bold text-sand">{["١", "٢", "٣"][i]}</div>
                <p className="font-medium">{t(k)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="bg-asphalt py-8 text-center text-sm text-sand/70">
        <p>{t("landing.drivers")}</p>
        <p className="mt-2">© بناء ليبيا · Benaa Libya</p>
      </footer>
    </div>
  );
}
