import type { Listing, Supplier } from "@/types/db";
import type { ListingSummary } from "@/lib/data/catalog";

export const FEATURED_SLOTS = 3;

const hidden = (l: Pick<Listing, "price" | "price_on_request">) => l.price_on_request || l.price == null;

/**
 * Offer order for one material:
 *   1. Featured strip (max 3, clearly labelled; priced offers first)
 *   2. Priced offers: verified suppliers first, then cheapest
 *   3. "Contact for pricing" offers last: verified first
 * Trust is verified-badge only for now; reviews / completed deliveries can replace it later without changing callers.
 */
export function rankOffers(offers: Listing[]): { featured: Listing[]; rest: Listing[] } {
  const verified = (l: Listing) => (l.supplier?.is_verified ? 1 : 0);
  const byPrice = (a: Listing, b: Listing) => verified(b) - verified(a) || (a.price ?? 0) - (b.price ?? 0);
  const byTrust = (a: Listing, b: Listing) => verified(b) - verified(a) || (a.supplier?.name_en ?? "").localeCompare(b.supplier?.name_en ?? "");

  const featuredAll = offers.filter((l) => l.is_featured);
  const featured = [...featuredAll].sort((a, b) => Number(hidden(a)) - Number(hidden(b)) || byPrice(a, b)).slice(0, FEATURED_SLOTS);
  const featuredIds = new Set(featured.map((l) => l.id));

  const remaining = offers.filter((l) => !featuredIds.has(l.id));
  const priced = remaining.filter((l) => !hidden(l)).sort(byPrice);
  const contact = remaining.filter(hidden).sort(byTrust);
  return { featured, rest: [...priced, ...contact] };
}

export interface RankedSupplier { supplier: Supplier; productCount: number; visibleRatio: number; featured: boolean }

/**
 * Supplier order: featured strip (max 3), then verified + price-transparency (share of products showing a price),
 * and suppliers whose products all say "Contact for pricing" last.
 */
export function rankSuppliers(suppliers: Supplier[], summaries: ListingSummary[]): { featured: RankedSupplier[]; rest: RankedSupplier[] } {
  const stats = new Map<number, { total: number; visible: number; featured: boolean }>();
  for (const l of summaries) {
    const s = stats.get(l.supplier_id) ?? { total: 0, visible: 0, featured: false };
    s.total += 1;
    if (!hidden(l)) s.visible += 1;
    if (l.is_featured) s.featured = true;
    stats.set(l.supplier_id, s);
  }

  const ranked: RankedSupplier[] = suppliers.map((supplier) => {
    const s = stats.get(supplier.id);
    return {
      supplier,
      productCount: s?.total ?? 0,
      visibleRatio: s && s.total > 0 ? s.visible / s.total : 0,
      featured: s?.featured ?? false,
    };
  });

  const compare = (a: RankedSupplier, b: RankedSupplier) =>
    Number(b.supplier.is_verified) - Number(a.supplier.is_verified) ||
    b.visibleRatio - a.visibleRatio ||
    a.supplier.name_en.localeCompare(b.supplier.name_en);

  const featured = ranked.filter((r) => r.featured).sort(compare).slice(0, FEATURED_SLOTS);
  const featuredIds = new Set(featured.map((r) => r.supplier.id));
  const rest = ranked.filter((r) => !featuredIds.has(r.supplier.id)).sort(compare);
  return { featured, rest };
}
