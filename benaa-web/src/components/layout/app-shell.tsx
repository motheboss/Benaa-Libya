"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Banknote, Building2, Calculator, ClipboardList, FolderOpen, LayoutDashboard, MapPin,
  Menu, Package, Settings, Store, TrendingUp, Truck, X,
} from "lucide-react";
import { Logo } from "@/components/brand/logo";
import { TriangleBand } from "@/components/brand/triangle-band";
import { LangToggle } from "./lang-toggle";
import { SignOutButton } from "./sign-out-button";
import { useI18n } from "./i18n-provider";
import { cn } from "@/lib/utils";

type Variant = "buyer" | "supplier";

const NAV: Record<Variant, { href: string; key: string; icon: React.ComponentType<{ className?: string }> }[]> = {
  buyer: [
    { href: "/buyer", key: "nav.dashboard", icon: LayoutDashboard },
    { href: "/buyer/marketplace", key: "nav.marketplace", icon: Store },
    { href: "/buyer/suppliers", key: "nav.suppliers", icon: Building2 },
    { href: "/buyer/price-index", key: "nav.price_index", icon: TrendingUp },
    { href: "/buyer/calculator", key: "nav.calculator", icon: Calculator },
    { href: "/buyer/delivery-request", key: "nav.delivery", icon: Truck },
    { href: "/buyer/projects", key: "nav.projects", icon: FolderOpen },
  ],
  supplier: [
    { href: "/supplier", key: "nav.dashboard", icon: LayoutDashboard },
    { href: "/supplier/products", key: "nav.products", icon: Package },
    { href: "/supplier/orders", key: "nav.orders", icon: ClipboardList },
    { href: "/supplier/delivery-jobs", key: "nav.delivery_jobs", icon: Truck },
    { href: "/supplier/earnings", key: "nav.earnings", icon: Banknote },
    { href: "/supplier/settings", key: "nav.settings", icon: Settings },
  ],
};

export function AppShell({
  variant, userName, regionName, children,
}: { variant: Variant; userName: string; regionName: string; children: React.ReactNode }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const items = NAV[variant];
  const root = `/${variant}`;

  const isActive = (href: string) => (href === root ? pathname === root : pathname === href || pathname.startsWith(`${href}/`));

  const nav = (
    <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
      {items.map(({ href, key, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setOpen(false)}
          className={cn(
            "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
            isActive(href) ? "bg-primary text-primary-foreground" : "text-sand/80 hover:bg-slate-soft hover:text-sand",
          )}
        >
          <Icon className="h-4 w-4" />
          {t(key)}
        </Link>
      ))}
    </nav>
  );

  const footer = (
    <div className="space-y-2 border-t border-slate-soft p-4 text-sand/80">
      <Link href="/region" className="flex items-center gap-2 text-sm hover:text-sand">
        <MapPin className="h-4 w-4 text-ochre" />
        <span className="truncate">{regionName}</span>
      </Link>
      <div className="truncate text-xs text-sand/60">{userName}</div>
      <div className="flex flex-wrap gap-1">
        <LangToggle className="text-sand hover:bg-slate-soft hover:text-sand" />
        <SignOutButton className="text-sand hover:bg-slate-soft hover:text-sand" />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col bg-asphalt lg:flex">
        <div className="p-5"><Logo /></div>
        {nav}
        {footer}
        <TriangleBand height={10} />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-40 flex items-center justify-between bg-asphalt px-4 py-3 lg:hidden">
        <Logo />
        <button aria-label="Menu" onClick={() => setOpen((v) => !v)} className="rounded-md p-2 text-sand hover:bg-slate-soft">
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </header>
      {open && (
        <div className="fixed inset-x-0 top-[60px] z-30 flex max-h-[calc(100vh-60px)] flex-col overflow-auto bg-asphalt lg:hidden">
          {nav}
          {footer}
        </div>
      )}

      <main className="min-w-0 flex-1 px-4 py-6 lg:px-10 lg:py-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
