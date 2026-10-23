"use client";

import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/components/layout/i18n-provider";
import type { JobStatus } from "@/types/db";

const VARIANT: Record<JobStatus, "warning" | "muted" | "default" | "success"> = {
  pending_supplier: "warning",
  open: "muted",
  assigned: "default",
  arrived: "default",
  picked_up: "default",
  delivered: "success",
  cancelled: "muted",
};

export function StatusBadge({ status }: { status: JobStatus }) {
  const { t } = useI18n();
  return <Badge variant={VARIANT[status] ?? "muted"}>{t(`job.status.${status}`)}</Badge>;
}
