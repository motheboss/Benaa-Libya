"use client";

import { useRef, useState } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/image";
import { useI18n } from "@/components/layout/i18n-provider";

/**
 * Uploads a photo to Supabase Storage at <bucket>/<user-id>/<subfolder>/<uuid>.jpg (storage policies require the
 * user-id folder), then hands the storage path to `onUploaded`, which registers it through an RPC.
 */
export function PhotoUploader({
  bucket, subfolder, onUploaded, label,
}: { bucket: string; subfolder: string; onUploaded: (path: string) => Promise<void>; label?: string }) {
  const { t } = useI18n();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not signed in");
      const blob = await compressImage(file);
      const path = `${user.id.toLowerCase()}/${subfolder}/${crypto.randomUUID()}.jpg`;
      const { error: uploadError } = await supabase.storage.from(bucket).upload(path, blob, { contentType: "image/jpeg" });
      if (uploadError) throw uploadError;
      await onUploaded(path);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-1">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
        }}
      />
      <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
        {busy ? <Loader2 className="animate-spin" /> : <Camera />}
        {label ?? t("photos.add")}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
