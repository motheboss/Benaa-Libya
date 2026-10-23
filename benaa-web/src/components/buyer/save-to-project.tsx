"use client";

import { useState } from "react";
import { FolderPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Field } from "@/components/shared/field";
import { Notice } from "@/components/shared/notice";
import { useI18n } from "@/components/layout/i18n-provider";
import type { Project } from "@/types/db";

export interface SaveTarget { projectId?: string; newName?: string }

/** Pick an existing project or type a new project name, then run `onSave`. */
export function SaveToProject({ projects, onSave, disabled }: { projects: Project[]; onSave: (target: SaveTarget) => Promise<void>; disabled?: boolean }) {
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const [projectId, setProjectId] = useState("");
  const [newName, setNewName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  async function save() {
    setError(null);
    if (!newName.trim() && !projectId) return setError("estimator.err.project");
    setBusy(true);
    try {
      await onSave(newName.trim() ? { newName: newName.trim() } : { projectId });
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setSaved(false); setError(null); } }}>
      <DialogTrigger asChild>
        <Button variant="secondary" disabled={disabled}><FolderPlus />{t("common.save_to_project")}</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("common.save_to_project")}</DialogTitle>
          <DialogDescription>{t("projects.save_hint")}</DialogDescription>
        </DialogHeader>
        {saved ? (
          <Notice tone="success">{t("common.saved")}</Notice>
        ) : (
          <div className="space-y-4">
            <Field label={t("projects.new")}>
              <Input value={newName} onChange={(e) => { setNewName(e.target.value); if (e.target.value) setProjectId(""); }} placeholder={t("projects.name")} />
            </Field>
            {projects.length > 0 && (
              <Field label={t("projects.existing")}>
                <Select value={projectId} onChange={(e) => { setProjectId(e.target.value); if (e.target.value) setNewName(""); }}>
                  <option value="">—</option>
                  {projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </Select>
              </Field>
            )}
            {error && <Notice>{t(error)}</Notice>}
            <Button onClick={save} disabled={busy} className="w-full">{busy && <Loader2 className="animate-spin" />}{t("common.save")}</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
