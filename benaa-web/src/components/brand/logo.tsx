import { ArchMark } from "./arch-mark";
import { cn } from "@/lib/utils";

export function Logo({ light = false, className }: { light?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <ArchMark light={light} className="h-9 w-auto" />
      <div className="leading-tight">
        <div className={cn("font-display text-lg font-bold", light ? "text-foreground" : "text-sand")}>بناء ليبيا</div>
        <div className={cn("text-[10px] font-semibold tracking-[0.3em]", light ? "text-muted-foreground" : "text-sand/60")}>BENAA LIBYA</div>
      </div>
    </div>
  );
}
