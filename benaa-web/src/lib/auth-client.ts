import { createClient } from "@/lib/supabase/client";
import type { Me } from "@/types/db";

/**
 * After any successful sign-in: ask the backend for the role and return where to go.
 * Buyer → /buyer, Supplier → /supplier, Driver → /driver-redirect. Throws a translation key on problems.
 */
export async function pathAfterLogin(next?: string | null): Promise<string> {
  const supabase = createClient();
  const { data, error } = await supabase.rpc("rpc_me");
  if (error) throw new Error(error.message);
  const me = data as Me | null;
  if (!me) throw new Error("auth.no_profile");

  const role = me.profile.role;
  if (role === "admin") {
    await supabase.auth.signOut();
    throw new Error("auth.admin_notice");
  }
  const home = role === "buyer" ? "/buyer" : role === "supplier" ? "/supplier" : "/driver-redirect";
  if (role !== "driver" && me.profile.region_id == null) return "/region";
  if (next && (next === home || next.startsWith(`${home}/`))) return next;
  return home;
}
