import Link from "next/link";
import { BadgeCheck, Star, Truck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ContactForPricing } from "@/components/shared/contact-for-pricing";
import { getI18n } from "@/lib/i18n/server";
import type { DeliverySettings, Listing } from "@/types/db";

/** One supplier's offer for a material: price (or "Contact for pricing"), stock, delivery fee. */
export async function OfferRow({
  listing, delivery, materialName, featured = false,
}: { listing: Listing; delivery?: DeliverySettings; materialName: string; featured?: boolean }) {
  const { t, lang, fmt } = await getI18n();
  const supplier = listing.supplier;
  if (!supplier) return null;
  const hidden = listing.price_on_request || listing.price == null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border bg-card p-4">
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Link href={`/buyer/suppliers?supplier=${supplier.id}`} className="font-semibold hover:text-primary">
            {lang === "ar" ? supplier.name_ar : supplier.name_en}
          </Link>
          {supplier.is_verified && <BadgeCheck className="h-4 w-4 text-success" />}
          {featured && <Badge variant="warning"><Star className="h-3 w-3" />{t("listing.featured")}</Badge>}
        </div>
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <Badge variant={listing.stock_qty > 0 ? "success" : "muted"}>{t(listing.stock_qty > 0 ? "listing.in_stock" : "listing.out_of_stock")}</Badge>
          <span className="inline-flex items-center gap-1">
            <Truck className="h-3.5 w-3.5" />
            {delivery ? fmt.lyd(delivery.base_fee) : t("delivery.not_set")}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {hidden ? (
          <ContactForPricing supplier={supplier} materialName={materialName} />
        ) : (
          <span className="text-lg font-bold">{fmt.lyd(listing.price as number)}</span>
        )}
        <Button asChild size="sm" variant="outline">
          <Link href={`/buyer/delivery-request?supplier=${supplier.id}`}>{t("delivery.request")}</Link>
        </Button>
      </div>
    </div>
  );
}
