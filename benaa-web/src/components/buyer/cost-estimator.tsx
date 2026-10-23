"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Notice } from "@/components/shared/notice";
import { SaveToProject, type SaveTarget } from "./save-to-project";
import { useI18n } from "@/components/layout/i18n-provider";
import { createClient } from "@/lib/supabase/client";
import { parseNumber } from "@/lib/utils";
import type { Material, Project } from "@/types/db";

interface Line { id: string; materialId: string; qty: string }
const newLine = (): Line => ({ id: crypto.randomUUID(), materialId: "", qty: "" });

/** Pick materials and quantities; priced from this city's price index. */
export function CostEstimator({
  materials, prices, projects, regionId,
}: { materials: Material[]; prices: Record<number, number>; projects: Project[]; regionId: number }) {
  const { t, lang, fmt } = useI18n();
  const [lines, setLines] = useState<Line[]>([newLine()]);
  const priced = materials.filter((m) => prices[m.id] != null);
  const name = (m: Material) => (lang === "ar" ? m.name_ar : m.name_en);

  const unitPrice = (l: Line) => (l.materialId ? prices[Number(l.materialId)] ?? 0 : 0);
  const lineTotal = (l: Line) => unitPrice(l) * parseNumber(l.qty);
  const total = lines.reduce((sum, l) => sum + lineTotal(l), 0);
  const update = (id: string, patch: Partial<Line>) => setLines((ls) => ls.map((l) => (l.id === id ? { ...l, ...patch } : l)));

  async function save(target: SaveTarget) {
    const valid = lines.filter((l) => l.materialId && parseNumber(l.qty) > 0);
    if (valid.length === 0) throw new Error("estimator.err.empty");
    const supabase = createClient();
    let projectId = target.projectId;
    if (target.newName) {
      const { data, error } = await supabase.from("projects").insert({ region_id: regionId, name: target.newName }).select("id").single();
      if (error) throw new Error(error.message);
      projectId = data.id as string;
    }
    const byId = new Map(materials.map((m) => [m.id, m]));
    const items = valid.map((l) => {
      const m = byId.get(Number(l.materialId))!;
      return {
        project_id: projectId, region_id: regionId, category: "estimate", label: name(m),
        material_id: m.id, quantity: parseNumber(l.qty), unit: m.unit, unit_price: prices[m.id],
      };
    });
    const { error } = await supabase.from("project_budget_items").insert(items);
    if (error) throw new Error(error.message);
  }

  return (
    <Card className="max-w-3xl">
      <CardHeader><CardTitle>{t("tools.estimator")}</CardTitle><p className="text-sm text-muted-foreground">{t("estimator.note")}</p></CardHeader>
      <CardContent className="space-y-4">
        {priced.length === 0 && <Notice tone="info">{t("prices.empty")}</Notice>}
        {lines.map((l) => {
          const m = materials.find((x) => String(x.id) === l.materialId);
          return (
            <div key={l.id} className="grid items-center gap-3 rounded-lg border p-3 sm:grid-cols-[1.4fr_0.8fr_auto_auto]">
              <Select value={l.materialId} onChange={(e) => update(l.id, { materialId: e.target.value })}>
                <option value="">{t("estimator.choose")}</option>
                {priced.map((p) => <option key={p.id} value={p.id}>{name(p)}</option>)}
              </Select>
              <Input inputMode="decimal" placeholder={t("estimator.quantity")} value={l.qty} onChange={(e) => update(l.id, { qty: e.target.value })} />
              <span className="min-w-28 text-sm text-muted-foreground">{m ? `${fmt.lyd(unitPrice(l))} / ${t(`unit.${m.unit}`)}` : "—"}</span>
              <div className="flex items-center gap-2">
                <b className="min-w-24 text-end">{fmt.lyd(lineTotal(l))}</b>
                <Button type="button" variant="ghost" size="icon" onClick={() => setLines((ls) => (ls.length > 1 ? ls.filter((x) => x.id !== l.id) : [newLine()]))}><Trash2 className="text-destructive" /></Button>
              </div>
            </div>
          );
        })}
        <Button type="button" variant="outline" onClick={() => setLines((ls) => [...ls, newLine()])}><Plus />{t("estimator.add_line")}</Button>
        <div className="flex items-center justify-between border-t pt-4 text-lg"><b>{t("calc.total_cost")}</b><b className="text-primary">{fmt.lyd(total)}</b></div>
        <SaveToProject projects={projects} onSave={save} />
      </CardContent>
    </Card>
  );
}
