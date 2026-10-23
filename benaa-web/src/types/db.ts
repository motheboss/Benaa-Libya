export type Role = "buyer" | "supplier" | "driver" | "admin";

export interface Region { id: number; code: string; name_ar: string; name_en: string; currency: string; is_active: boolean }

export interface MaterialCategory { id: number; name_en: string; name_ar: string; icon: string | null; sort_order: number }

export interface Material {
  id: number; category_id: number; code: string | null; name_en: string; name_ar: string;
  unit: string; image_path: string | null; is_active: boolean;
}

export interface Supplier {
  id: number; region_id: number; owner_id: string | null; name_ar: string; name_en: string;
  phone: string | null; whatsapp: string | null; address: string | null;
  latitude: number | null; longitude: number | null; logo_path: string | null;
  is_verified: boolean; is_active: boolean;
}

export interface Listing {
  id: number; region_id: number; supplier_id: number; material_id: number;
  price: number | null;               // null when the supplier chose "Contact for pricing"
  price_on_request: boolean;
  stock_qty: number; min_order_qty: number; is_active: boolean; is_featured: boolean;
  material?: Material | null; supplier?: Supplier | null;
}

export interface ListingPhoto { id: number; listing_id: number; path: string; sort_order: number }

export interface DeliverySettings {
  supplier_id: number; region_id: number; base_fee: number; per_km_fee: number | null; free_over_amount: number | null;
}

export interface PriceRow { material_id: number; price: number; observed_on: string; prev_price: number | null }
export interface PricePoint { observed_on: string; price: number }

export interface CalcCoefficient { id: number; region_id: number; kind: "rc_frame" | "block_infill"; key: string; value: number; unit: string | null }

export interface Project { id: string; region_id: number; name: string; description: string | null; created_at: string }
export interface BudgetItem {
  id: string; project_id: string; region_id: number; category: string; label: string; material_id: number | null;
  quantity: number; unit: string | null; unit_price: number; line_total: number | null;
}
export interface SavedCalculation {
  id: string; project_id: string | null; region_id: number; kind: string; inputs: unknown; results: unknown; created_at: string;
}

export type JobStatus = "pending_supplier" | "open" | "assigned" | "arrived" | "picked_up" | "delivered" | "cancelled";

export interface DeliveryJob {
  id: string; region_id: number; requested_by: string; requester_role: "buyer" | "supplier";
  supplier_id: number | null; driver_id: string | null;
  pickup_address: string; pickup_lat: number | null; pickup_lng: number | null;
  dropoff_address: string; dropoff_lat: number | null; dropoff_lng: number | null;
  material_type: string; weight_kg: number | null; volume_m3: number | null;
  delivery_fee: number; goods_value: number; status: JobStatus; notes: string | null;
  driver_earning: number | null; supplier_earning: number | null;
  created_at: string; assigned_at: string | null; arrived_at: string | null; picked_up_at: string | null;
  delivered_at: string | null; cancelled_at: string | null;
  driver_name: string | null; driver_phone: string | null; supplier_name_ar: string | null; supplier_name_en: string | null;
}

export interface Me {
  profile: { id: string; role: Role; region_id: number | null; full_name: string | null; phone: string | null };
  supplier: Supplier | null;
  driver: { id: string; region_id: number | null; verification_status: string; rejection_note: string | null } | null;
}
