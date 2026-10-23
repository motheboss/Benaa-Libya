import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { TriangleBand } from "@/components/brand/triangle-band";
import { LangToggle } from "@/components/layout/lang-toggle";

export function AuthLayout({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex items-center justify-between bg-asphalt px-4 py-3 lg:px-10">
        <Link href="/"><Logo /></Link>
        <LangToggle className="text-sand hover:bg-slate-soft hover:text-sand" />
      </header>
      <main className="flex flex-1 items-start justify-center px-4 py-10">
        <div className="w-full max-w-md space-y-6">
          <div className="text-center">
            <h1 className="text-2xl font-bold">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-sm">{children}</div>
        </div>
      </main>
      <TriangleBand height={12} />
    </div>
  );
}
