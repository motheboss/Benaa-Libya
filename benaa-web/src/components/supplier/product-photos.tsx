"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { PhotoUploader } from "@/components/shared/photo-uploader";
import { Notice } from "@/components/shared/notice";
import { useI18n } from "@/components/layout/i18n-provider";
import { createClient } from "@/lib/supabase/client";
import { BUCKETS, publicStorageUrl } from "@/lib/utils";
import type { ListingPhoto } from "@/types/db";

export function ProductPhotos({ listingId, photos }: { listingId: number; photos: ListingPhoto[] }) {
  const { t } = useI18n();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function add(path: string) {
    const { error } = await createClient().rpc("rpc_supplier_add_photo", { p_listing_id: listingId, p_path: path });
    if (error) throw new Error(error.message);
    router.refresh();
  }

  async function remove(id: number) {
    setError(null);
    const { error } = await createClient().rpc("rpc_supplier_remove_photo", { p_photo_id: id });
    if (error) setError(error.message);
    else router.refresh();
  }

  return (
    <div className="space-y-3">
      <h3 className="font-bold">{t("inventory.photos")}</h3>
      <div className="flex flex-wrap gap-3">
        {photos.map((p) => (
          <div key={p.id} className="relative h-28 w-28 overflow-hidden rounded-lg border bg-secondary/50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={publicStorageUrl(BUCKETS.productPhotos, p.path) ?? ""} alt="" className="h-full w-full object-cover" />
            <button type="button" onClick={() => remove(p.id)} aria-label={t("common.delete")}
              className="absolute end-1 top-1 rounded-full bg-asphalt/70 p-1 text-white hover:bg-destructive">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </div>
      <PhotoUploader bucket={BUCKETS.productPhotos} subfolder={`listing-${listingId}`} onUploaded={add} />
      {error && <Notice>{error}</Notice>}
    </div>
  );
}
