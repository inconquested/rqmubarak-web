"use client";

import { Camera } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ImageCropperDialog } from "@/components/portal/image-cropper";
import { Button } from "@/components/ui/button";
import { uploadMadingImage } from "@/lib/actions";
import { cn } from "@/lib/utils";

/** Pick → crop 1:1 → upload; result stored in hidden `foto_url` input. */
export function ProfilFotoField({ defaultUrl }: { defaultUrl?: string }) {
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [src, setSrc] = useState<string | null>(null);
  const pickRef = useRef<HTMLInputElement>(null);

  useEffect(() => () => {
    if (src) URL.revokeObjectURL(src);
  }, [src]);

  function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Pilih berkas gambar.");
      return;
    }
    setError("");
    setSrc(URL.createObjectURL(file));
  }

  async function onCropped(blob: Blob) {
    setSrc(null);
    setBusy(true);
    setError("");
    try {
      const fd = new FormData();
      fd.append("file", blob, "profil.webp");
      const res = await uploadMadingImage(fd);
      if (res.ok) setUrl(res.url);
      else setError(res.error);
    } catch {
      setError("Gagal memproses gambar di perangkat.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-2">
      <input type="hidden" name="foto_url" value={url} />
      <div className="flex items-center gap-3">
        {url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={url}
            alt="Pratinjau foto profil"
            className="size-14 rounded-full border border-[#d8e2d6] object-cover"
          />
        ) : (
          <span
            aria-hidden
            className={cn(
              "flex size-14 shrink-0 items-center justify-center rounded-full border border-dashed",
              "border-[#d8e2d6] bg-[#fafcfa] dark:border-white/15 dark:bg-white/5",
              "",
            )}
          >
            <Camera className="size-5 text-[#7d9b84]" />
          </span>
        )}
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => pickRef.current?.click()}
            >
              {busy ? "Mengunggah…" : url ? "Ganti foto" : "Pilih foto"}
            </Button>
            {url ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setUrl("")}
              >
                Hapus
              </Button>
            ) : null}
          </div>
          <p
            className={cn(
              "",
              "text-[#6b7a6e] dark:text-white/60",
              "text-[12px] leading-relaxed",
            )}
          >
            Dipotong 1:1 · otomatis WebP ≤600KB
          </p>
        </div>
      </div>
      <input
        ref={pickRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onPick}
      />
      {src ? (
        <ImageCropperDialog
          open
          src={src}
          aspect="1:1"
          onOpenChange={(o) => {
            if (!o) setSrc(null);
          }}
          onCropped={onCropped}
        />
      ) : null}
      {error ? (
        <p role="alert" className="text-[12px] text-red-700">{error}</p>
      ) : null}
    </div>
  );
}
