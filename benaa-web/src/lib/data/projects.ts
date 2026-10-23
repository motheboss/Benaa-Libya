import "server-only";
import { createClient } from "@/lib/supabase/server";
import { rows } from "./db";
import type { BudgetItem, Project, SavedCalculation } from "@/types/db";

export async function getProjects(regionId: number): Promise<Project[]> {
  const s = await createClient();
  return rows<Project>(await s.from("projects").select("*").eq("region_id", regionId).order("created_at", { ascending: false }));
}

export async function getProjectItems(regionId: number, projectId: string): Promise<BudgetItem[]> {
  const s = await createClient();
  return rows<BudgetItem>(
    await s.from("project_budget_items").select("*").eq("region_id", regionId).eq("project_id", projectId).order("created_at"),
  );
}

export async function getProjectCalculations(regionId: number, projectId: string): Promise<SavedCalculation[]> {
  const s = await createClient();
  return rows<SavedCalculation>(
    await s.from("saved_calculations").select("*").eq("region_id", regionId).eq("project_id", projectId).order("created_at", { ascending: false }),
  );
}
