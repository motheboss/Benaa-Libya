import * as React from "react";
import { cn } from "@/lib/utils";

const Table = ({ className, ...props }: React.TableHTMLAttributes<HTMLTableElement>) => (
  <div className="w-full overflow-auto">
    <table className={cn("w-full caption-bottom text-sm", className)} {...props} />
  </div>
);
const THead = (props: React.HTMLAttributes<HTMLTableSectionElement>) => <thead className="[&_tr]:border-b" {...props} />;
const TBody = (props: React.HTMLAttributes<HTMLTableSectionElement>) => <tbody className="[&_tr:last-child]:border-0" {...props} />;
const TR = ({ className, ...props }: React.HTMLAttributes<HTMLTableRowElement>) => (
  <tr className={cn("border-b transition-colors hover:bg-muted/40", className)} {...props} />
);
const TH = ({ className, ...props }: React.ThHTMLAttributes<HTMLTableCellElement>) => (
  <th className={cn("h-11 px-4 text-start align-middle text-xs font-medium uppercase tracking-wide text-muted-foreground", className)} {...props} />
);
const TD = ({ className, ...props }: React.TdHTMLAttributes<HTMLTableCellElement>) => (
  <td className={cn("p-4 align-middle", className)} {...props} />
);

export { Table, THead, TBody, TR, TH, TD };
