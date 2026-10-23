import type { CalcCoefficient } from "@/types/db";

/** Reinforced-concrete frame + block infill. Early estimates only, not structural design. */
export interface SkeletonInputs {
  floors: number; floorAreaM2: number; floorHeightM: number; slabThicknessM: number;
  columnsCount: number; columnWidthM: number; columnDepthM: number;
  beamsLengthPerFloorM: number; beamWidthM: number; beamDepthM: number;
  footingsVolumeM3: number; wallLengthPerFloorM: number;
}

export const DEFAULT_INPUTS: SkeletonInputs = {
  floors: 1, floorAreaM2: 0, floorHeightM: 3, slabThicknessM: 0.2,
  columnsCount: 0, columnWidthM: 0.3, columnDepthM: 0.3,
  beamsLengthPerFloorM: 0, beamWidthM: 0.25, beamDepthM: 0.5,
  footingsVolumeM3: 0, wallLengthPerFloorM: 0,
};

export interface CostLine { code: string; quantity: number; unit: string; unitPrice: number | null }

export interface SkeletonResults {
  concreteColumnsM3: number; concreteBeamsM3: number; concreteSlabsM3: number; concreteFootingsM3: number;
  wallAreaM2: number; lines: CostLine[];
}

export type CalcError = { type: "invalid"; field: string } | { type: "missing"; key: string };

export function concreteTotal(r: SkeletonResults) {
  return r.concreteColumnsM3 + r.concreteBeamsM3 + r.concreteSlabsM3 + r.concreteFootingsM3;
}
export function lineTotal(l: CostLine) { return l.unitPrice == null ? null : l.unitPrice * l.quantity; }
export function totalCost(r: SkeletonResults) { return r.lines.reduce((sum, l) => sum + (lineTotal(l) ?? 0), 0); }

export function calculateSkeleton(
  i: SkeletonInputs,
  coefficients: CalcCoefficient[],
  pricesByCode: Record<string, number>,
): { ok: true; results: SkeletonResults } | { ok: false; error: CalcError } {
  if (i.floors < 1) return { ok: false, error: { type: "invalid", field: "floors" } };
  if (i.floorAreaM2 <= 0) return { ok: false, error: { type: "invalid", field: "floor_area" } };
  if (i.floorHeightM <= 0) return { ok: false, error: { type: "invalid", field: "floor_height" } };
  if (i.slabThicknessM <= 0) return { ok: false, error: { type: "invalid", field: "slab_thickness" } };

  const missing: { key?: string } = {};
  const c = (kind: string, key: string): number => {
    const found = coefficients.find((x) => x.kind === kind && x.key === key);
    if (!found) { missing.key ??= `${kind}.${key}`; return 0; }
    return found.value;
  };

  const floors = i.floors;
  const columns = i.columnsCount * i.columnWidthM * i.columnDepthM * i.floorHeightM * floors;
  const beams = i.beamsLengthPerFloorM * i.beamWidthM * i.beamDepthM * floors;
  const slabs = i.floorAreaM2 * i.slabThicknessM * floors;
  const footings = i.footingsVolumeM3;
  const concrete = columns + beams + slabs + footings;

  const rcWaste = 1 + c("rc_frame", "waste_pct") / 100;
  const blockWaste = 1 + c("block_infill", "waste_pct") / 100;
  const opening = c("block_infill", "opening_pct");
  const wallArea = Math.max(0, i.wallLengthPerFloorM * i.floorHeightM * floors * (1 - opening / 100));

  const rebarKg = concrete * c("rc_frame", "rebar_kg_per_m3") * rcWaste;
  const cementBags = concrete * c("rc_frame", "cement_bags_per_m3") * rcWaste + wallArea * c("block_infill", "mortar_cement_bags_per_m2") * blockWaste;
  const sandM3 = concrete * c("rc_frame", "sand_m3_per_m3") * rcWaste + wallArea * c("block_infill", "mortar_sand_m3_per_m2") * blockWaste;
  const gravelM3 = concrete * c("rc_frame", "gravel_m3_per_m3") * rcWaste;
  const blocks = Math.ceil(wallArea * c("block_infill", "blocks_per_m2") * blockWaste);

  if (missing.key) return { ok: false, error: { type: "missing", key: missing.key } };

  const line = (code: string, quantity: number, unit: string): CostLine => ({ code, quantity, unit, unitPrice: pricesByCode[code] ?? null });
  return {
    ok: true,
    results: {
      concreteColumnsM3: columns, concreteBeamsM3: beams, concreteSlabsM3: slabs, concreteFootingsM3: footings, wallAreaM2: wallArea,
      lines: [line("cement", cementBags, "bag"), line("rebar", rebarKg, "kg"), line("sand", sandM3, "m3"), line("gravel", gravelM3, "m3"), line("block", blocks, "pcs")],
    },
  };
}

/** Same JSON shape the mobile app stores in saved_calculations, so projects work on both. */
export function inputsToDb(i: SkeletonInputs) {
  return {
    floors: i.floors, floor_area_m2: i.floorAreaM2, floor_height_m: i.floorHeightM, slab_thickness_m: i.slabThicknessM,
    columns_count: i.columnsCount, column_width_m: i.columnWidthM, column_depth_m: i.columnDepthM,
    beams_length_per_floor_m: i.beamsLengthPerFloorM, beam_width_m: i.beamWidthM, beam_depth_m: i.beamDepthM,
    footings_volume_m3: i.footingsVolumeM3, wall_length_per_floor_m: i.wallLengthPerFloorM,
  };
}

export function resultsToDb(r: SkeletonResults) {
  return {
    concrete_columns_m3: r.concreteColumnsM3, concrete_beams_m3: r.concreteBeamsM3, concrete_slabs_m3: r.concreteSlabsM3,
    concrete_footings_m3: r.concreteFootingsM3, wall_area_m2: r.wallAreaM2,
    lines: r.lines.map((l) => ({ code: l.code, quantity: l.quantity, unit: l.unit, unit_price: l.unitPrice })),
  };
}

/** Total cost of a saved calculation (db shape). */
export function dbResultsTotal(results: unknown): number {
  const lines = (results as { lines?: { quantity: number; unit_price: number | null }[] } | null)?.lines ?? [];
  return lines.reduce((sum, l) => sum + (l.unit_price ?? 0) * l.quantity, 0);
}
