import "server-only";
import { createClient } from "@/lib/supabase/server";
import { one, rows } from "./db";
import type { DeliverySettings, Listing, ListingPhoto, Material, MaterialCategory, Region, Supplier } from "@/types/db";

// Every region-scoped query below filters by region_id (region = city).

export async function getRegions(): Promise<Region[]> {
  const s = await createClient();
  return rows<Region>(await s.from("regions").select("*").eq("is_active", true).order("name_en"));
}

export async function getRegion(id: number): Promise<Region | null> {
  const s = await createClient();
  return one<Region>(await s.from("regions").select("*").eq("id", id).maybeSingle());
}

export async function getCategories(): Promise<MaterialCategory[]> {
  const s = await createClient();
  return rows<MaterialCategory>(await s.from("material_categories").select("*").order("sort_order"));
}

export async function getMaterials(): Promise<Material[]> {
  const s = await createClient();
  return rows<Material>(await s.from("materials").select("*").eq("is_active", true).order("name_en"));
}

export async function getMaterial(id: number): Promise<Material | null> {
  const s = await createClient();
  return one<Material>(await s.from("materials").select("*").eq("id", id).maybeSingle());
}

export async function getSuppliers(regionId: number): Promise<Supplier[]> {
  const s = await createClient();
  return rows<Supplier>(
    await s.from("suppliers").select("*").eq("region_id", regionId).eq("is_active", true)
      .order("is_verified", { ascending: false }).order("name_en"),
  );
}

export async function getSupplier(regionId: number, id: number): Promise<Supplier | null> {
  const s = await createClient();
  return one<Supplier>(await s.from("suppliers").select("*").eq("region_id", regionId).eq("id", id).maybeSingle());
}

/** A supplier's products (with their material). `includeInactive` is only meaningful for the owner (RLS). */
export async function getListingsBySupplier(regionId: number, supplierId: number, includeInactive = false): Promise<Listing[]> {
  const s = await createClient();
  let q = s.from("supplier_listings").select("*, material:materials(*)").eq("region_id", regionId).eq("supplier_id", supplierId);
  if (!includeInactive) q = q.eq("is_active", true);
  return rows<Listing>(await q.order("is_featured", { ascending: false }).order("id"));
}

/** Every active offer for one material in this city, with its supplier. Ranking is applied in lib/ranking.ts. */
export async function getListingsByMaterial(regionId: number, materialId: number): Promise<Listing[]> {
  const s = await createClient();
  return rows<Listing>(
    await s.from("supplier_listings").select("*, supplier:suppliers(*)")
      .eq("region_id", regionId).eq("material_id", materialId).eq("is_active", true),
  );
}

export interface ListingSummary { supplier_id: number; material_id: number; price: number | null; price_on_request: boolean; is_featured: boolean }

/** Light-weight view of all active offers in the city (used for marketplace cards and supplier ranking). */
export async function getListingSummaries(regionId: number): Promise<ListingSummary[]> {
  const s = await createClient();
  return rows<ListingSummary>(
    await s.from("supplier_listings").select("supplier_id, material_id, price, price_on_request, is_featured")
      .eq("region_id", regionId).eq("is_active", true),
  );
}

export async function getDeliverySettings(regionId: number): Promise<DeliverySettings[]> {
  const s = await createClient();
  return rows<DeliverySettings>(await s.from("supplier_delivery_settings").select("*").eq("region_id", regionId));
}

export async function getListingPhotos(regionId: number, listingIds: number[]): Promise<ListingPhoto[]> {
  if (listingIds.length === 0) return [];
  const s = await createClient();
  return rows<ListingPhoto>(
    await s.from("listing_photos").select("*").eq("region_id", regionId).in("listing_id", listingIds).order("sort_order"),
  );
}
