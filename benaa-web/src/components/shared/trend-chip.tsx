"use client";

import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { useI18n } from "@/components/layout/i18n-provider";
import { cn } from "@/lib/utils";

/** Price movement: a rising cost is brick red, a falling cost is green. */
export function TrendChip({ price, prev }: { price: number; prev: number | null }) {
  const { fmt } = useI18n();
  if (prev == null || prev <= 0) return <span className="text-xs text-muted-foreground">—</span>;
  const pct = ((price - prev) / prev) * 100;
  if (Math.abs(pct) < 0.005) return <span className="text-xs text-muted-foreground">—</span>;
  const up = pct > 0;
  return (
    <span className={cn("inline-flex items-center gap-0.5 text-xs font-medium", up ? "text-primary" : "text-success")}>
      {up ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
      {fmt.num(Math.abs(pct), 1)}٪
    </span>
  );
}
