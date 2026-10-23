"use client";

import { MessageCircle, MessageSquare, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useI18n } from "@/components/layout/i18n-provider";
import { normalizePhone } from "@/lib/phone";
import type { Supplier } from "@/types/db";

/** Shown instead of a price when a supplier chose "Contact for pricing". Opens WhatsApp, Messages or the dialer. */
export function ContactForPricing({ supplier, materialName }: { supplier: Pick<Supplier, "whatsapp" | "phone">; materialName: string }) {
  const { t, lang } = useI18n();
  const whatsappNumber = supplier.whatsapp?.trim() || supplier.phone?.trim() || null;
  const phoneNumber = supplier.phone?.trim() || supplier.whatsapp?.trim() || null;

  const message =
    lang === "ar"
      ? `مرحبًا، أود الاستفسار عن سعر ${materialName} (عبر بناء ليبيا).`
      : `Hello, I'd like to ask about the price of ${materialName} (via Benaa Libya).`;
  const encoded = encodeURIComponent(message);
  const whatsapp = whatsappNumber ? `https://wa.me/${normalizePhone(whatsappNumber).replace("+", "")}?text=${encoded}` : null;
  const sms = phoneNumber ? `sms:${normalizePhone(phoneNumber)}?body=${encoded}` : null;
  const tel = phoneNumber ? `tel:${normalizePhone(phoneNumber)}` : null;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size="sm" disabled={!whatsapp && !sms} className="bg-ochre text-asphalt hover:bg-ochre/90">
          <MessageCircle />
          {t("pricing.contact")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("pricing.contact_via")}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-2">
          {whatsapp && (
            <Button asChild variant="outline"><a href={whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle />WhatsApp</a></Button>
          )}
          {sms && (
            <Button asChild variant="outline"><a href={sms}><MessageSquare />{t("pricing.messages")}</a></Button>
          )}
          {tel && (
            <Button asChild variant="outline"><a href={tel}><Phone />{t("pricing.call")}</a></Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
