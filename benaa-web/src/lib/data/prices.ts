import "server-only";
import { createClient } from "@/lib/supabase/server";
import { rows } from "./db";
import type { CalcCoefficient, PricePoint, PriceRow } from "@/types/db";

/** Price index = prices set manually by admins per region (no auto-averaging). */
export async function getLatestPrices(regionId: number): Promise<PriceRow[]> {
  const s = await createClient();
  return rows<PriceRow>(await s.rpc("rpc_latest_prices", { p_region_id: regionId }));
}

export async function getPriceSeries(regionId: number, materialId: number, days: number): Promise<PricePoint[]> {
  const s = await createClient();
  return rows<PricePoint>(await s.rpc("rpc_price_series", { p_region_id: regionId, p_material_id: materialId, p_days: days }));
}

/** Skeleton calculator coefficients, stored per region. */
export async function getCoefficients(regionId: number): Promise<CalcCoefficient[]> {
  const s = await createClient();
  return rows<CalcCoefficient>(await s.from("calc_coefficients").select("*").eq("region_id", regionId));
}
