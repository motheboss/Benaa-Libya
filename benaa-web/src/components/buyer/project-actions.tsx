"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Notice } from "@/components/shared/notice";
import { useI18n } from "@/components/layout/i18n-provider";
import { createClient } from "@/lib/supabase/client";

export function NewProjectForm({ regionId }: { regionId: number }) {
  const { t } = useI18n();
  const router = useRouter();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    setError(null);
    const { data, error } = await createClient().from("projects").insert({ region_id: regionId, name: name.trim() }).select("id").single();
    setBusy(false);
    if (error) return setError(error.message);
    setName("");
    router.push(`/buyer/projects?project=${data.id}`);
    router.refresh();
  }

  return (
    <form onSubmit={create} className="space-y-2">
      <div className="flex gap-2">
        <Input value={name} onChange={(e) => setName(e.target.value)} placeholder={t("projects.name")} />
        <Button type="submit" disabled={busy}>{busy ? <Loader2 className="animate-spin" /> : <Plus />}{t("projects.new")}</Button>
      </div>
      {error && <Notice>{error}</Notice>}
    </form>
  );
}

/** Deletes a project (and, by cascade, its items and saved calculations) or a single budget item. */
export function DeleteButton({ table, id, regionId, redirectTo }: { table: "projects" | "project_budget_items"; id: string; regionId: number; redirectTo?: string }) {
  const { t } = useI18n();
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function remove() {
    if (!window.confirm(t("common.confirm_delete"))) return;
    setBusy(true);
    await createClient().from(table).delete().eq("id", id).eq("region_id", regionId);
    setBusy(false);
    if (redirectTo) router.push(redirectTo);
    router.refresh();
  }

  return (
    <Button type="button" variant="ghost" size="icon" onClick={remove} disabled={busy} aria-label={t("common.delete")}>
      {busy ? <Loader2 className="animate-spin" /> : <Trash2 className="text-destructive" />}
    </Button>
  );
}
