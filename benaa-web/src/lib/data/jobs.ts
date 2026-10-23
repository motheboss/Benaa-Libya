import "server-only";
import { createClient } from "@/lib/supabase/server";
import { rows } from "./db";
import type { DeliveryJob } from "@/types/db";

/** Jobs for the signed-in user (buyer: their requests; supplier: their orders and jobs). The backend scopes by role and city. */
export async function getMyJobs(): Promise<DeliveryJob[]> {
  const s = await createClient();
  return rows<DeliveryJob>(await s.rpc("rpc_jobs_for_me", { p_scope: "mine" }));
}
