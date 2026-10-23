import "server-only";
import { cache } from "react";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Me, Role } from "@/types/db";

/** The backend decides the role (rpc_me). Cached per request. */
export const getMe = cache(async (): Promise<Me | null> => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data, error } = await supabase.rpc("rpc_me");
  if (error) throw new Error(error.message);
  return (data as Me | null) ?? null;
});

export function homeFor(role: Role): string {
  switch (role) {
    case "buyer": return "/buyer";
    case "supplier": return "/supplier";
    case "driver": return "/driver-redirect";
    default: return "/login?error=admin";
  }
}

/** Layout guard: wrong role → their own home; signed out → /login. */
export async function requireRole(role: "buyer" | "supplier" | "driver"): Promise<Me> {
  const me = await getMe();
  if (!me) redirect("/login");
  if (me.profile.role !== role) redirect(homeFor(me.profile.role));
  return me;
}

/** Buyer pages: role guard + a city must be chosen. */
export async function requireBuyer(): Promise<{ me: Me; regionId: number }> {
  const me = await requireRole("buyer");
  if (!me.profile.region_id) redirect("/region");
  return { me, regionId: me.profile.region_id };
}

/** Supplier pages: role guard + the supplier profile created at sign-up. */
export async function requireSupplier(): Promise<{ me: Me; supplier: NonNullable<Me["supplier"]>; regionId: number }> {
  const me = await requireRole("supplier");
  if (!me.supplier) notFound();
  return { me, supplier: me.supplier, regionId: me.supplier.region_id };
}
