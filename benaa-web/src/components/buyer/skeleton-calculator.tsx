"use client";

import { useState } from "react";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Field } from "@/components/shared/field";
import { Notice } from "@/components/shared/notice";
import { SaveToProject, type SaveTarget } from "./save-to-project";
import { useI18n } from "@/components/layout/i18n-provider";
import { createClient } from "@/lib/supabase/client";
import { calculateSkeleton, concreteTotal, DEFAULT_INPUTS, inputsToDb, lineTotal, resultsToDb, totalCost, type CalcError, type SkeletonInputs, type SkeletonResults } from "@/lib/calculator";
import { parseNumber } from "@/lib/utils";
import type { CalcCoefficient, Project } from "@/types/db";

const FIELDS: { key: keyof SkeletonInputs; label: string; group: "building" | "frame" | "infill" }[] = [
  { key: "floors", label: "calc.floors", group: "building" },
  { key: "floorAreaM2", label: "calc.floor_area", group: "building" },
  { key: "floorHeightM", label: "calc.floor_height", group: "building" },
  { key: "slabThicknessM", label: "calc.slab_thickness", group: "building" },
  { key: "columnsCount", label: "calc.columns", group: "frame" },
  { key: "columnWidthM", label: "calc.column_w", group: "frame" },
  { key: "columnDepthM", label: "calc.column_d", group: "frame" },
  { key: "beamsLengthPerFloorM", label: "calc.beams_length", group: "frame" },
  { key: "beamWidthM", label: "calc.beam_w", group: "frame" },
  { key: "beamDepthM", label: "calc.beam_d", group: "frame" },
  { key: "footingsVolumeM3", label: "calc.footings", group: "frame" },
  { key: "wallLengthPerFloorM", label: "calc.wall_length", group: "infill" },
];

export function SkeletonCalculator({
  coefficients, pricesByCode, projects, regionId,
}: { coefficients: CalcCoefficient[]; pricesByCode: Record<string, number>; projects: Project[]; regionId: number }) {
  const { t, fmt } = useI18n();
  const [values, setValues] = useState<Record<string, string>>(
    Object.fromEntries(Object.entries(DEFAULT_INPUTS).map(([k, v]) => [k, v === 0 ? "" : String(v)])),
  );
  const [inputs, setInputs] = useState<SkeletonInputs>(DEFAULT_INPUTS);
  const [results, setResults] = useState<SkeletonResults | null>(null);
  const [error, setError] = useState<CalcError | null>(null);

  function calculate(e: React.FormEvent) {
    e.preventDefault();
    const parsed = Object.fromEntries(FIELDS.map((f) => [f.key, parseNumber(values[f.key] ?? "")])) as unknown as SkeletonInputs;
    parsed.floors = Math.round(parsed.floors);
    parsed.columnsCount = Math.round(parsed.columnsCount);
    setInputs(parsed);
    const res = calculateSkeleton(parsed, coefficients, pricesByCode);
    if (res.ok) { setResults(res.results); setError(null); } else { setResults(null); setError(res.error); }
  }

  async function save(target: SaveTarget) {
    if (!results) return;
    const supabase = createClient();
    let projectId = target.projectId;
    if (target.newName) {
      const { data, error } = await supabase.from("projects").insert({ region_id: regionId, name: target.newName }).select("id").single();
      if (error) throw new Error(error.message);
      projectId = data.id as string;
    }
    const { error } = await supabase.from("saved_calculations").insert({
      region_id: regionId, project_id: projectId, kind: "skeleton", inputs: inputsToDb(inputs), results: resultsToDb(results),
    });
    if (error) throw new Error(error.message);
  }

  const group = (g: "building" | "frame" | "infill", title: string) => (
    <div className="space-y-3">
      <h3 className="font-semibold">{t(title)}</h3>
      <div className="grid gap-3 sm:grid-cols-2">
        {FIELDS.filter((f) => f.group === g).map((f) => (
          <Field key={f.key} label={t(f.label)}>
            <Input inputMode="decimal" value={values[f.key] ?? ""} onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))} />
          </Field>
        ))}
      </div>
    </div>
  );

  const errorText = error ? (error.type === "invalid" ? `${t("calc.err.invalid")}: ${t(`calc.field.${error.field}`)}` : `${t("calc.err.missing_coeff")}: ${error.key}`) : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <Card>
        <CardHeader><CardTitle>{t("tools.calculator")}</CardTitle><p className="text-sm text-muted-foreground">{t("calc.disclaimer")}</p></CardHeader>
        <CardContent>
          <form onSubmit={calculate} className="space-y-6">
            {group("building", "calc.building")}
            {group("frame", "calc.frame")}
            {group("infill", "calc.infill")}
            <Button type="submit"><Calculator />{t("calc.calculate")}</Button>
          </form>
        </CardContent>
      </Card>

      <div className="space-y-4 self-start">
        {errorText && <Notice>{errorText}</Notice>}
        {results && (
          <Card>
            <CardHeader><CardTitle>{t("calc.results")}</CardTitle></CardHeader>
            <CardContent className="space-y-3 text-sm">
              {[
                ["calc.concrete_total", concreteTotal(results), "m3"],
                ["calc.concrete_columns", results.concreteColumnsM3, "m3"],
                ["calc.concrete_beams", results.concreteBeamsM3, "m3"],
                ["calc.concrete_slabs", results.concreteSlabsM3, "m3"],
                ["calc.wall_area", results.wallAreaM2, "m2"],
              ].map(([k, v, u]) => (
                <div key={k as string} className="flex justify-between"><span className="text-muted-foreground">{t(k as string)}</span><b>{fmt.num(v as number)} {t(`unit.${u}`)}</b></div>
              ))}
              <hr />
              {results.lines.map((l) => (
                <div key={l.code} className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-medium">{t(`calc.line.${l.code}`)}</p>
                    <p className="text-xs text-muted-foreground">{fmt.num(l.quantity, 1)} {t(`unit.${l.unit}`)}</p>
                  </div>
                  <span className={l.unitPrice == null ? "text-warning-foreground" : ""}>{lineTotal(l) == null ? t("calc.price_missing") : fmt.lyd(lineTotal(l) as number)}</span>
                </div>
              ))}
              <hr />
              <div className="flex items-center justify-between text-lg"><b>{t("calc.total_cost")}</b><b className="text-primary">{fmt.lyd(totalCost(results))}</b></div>
              {results.lines.some((l) => l.unitPrice == null) && <Notice tone="info">{t("calc.partial_note")}</Notice>}
              <SaveToProject projects={projects} onSave={save} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
