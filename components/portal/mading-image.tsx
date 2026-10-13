"use client";

import { ImagePlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ImageCropperDialog } from "@/components/portal/image-cropper";
import { Button } from "@/components/ui/button";
import { uploadMadingImage } from "@/lib/actions";
import { cn } from "@/lib/utils";

export function MadingImageField({ defaultUrl }: { defaultUrl?: string }) {
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
      fd.append("file", blob, "sampul.webp");
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
      <input type="hidden" name="thumb_url" value={url} />
      {url ? (
        <div
          className={cn(
            "relative overflow-hidden rounded-xl border",
            "border-[#d8e2d6] dark:border-white/10",
            "",
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Pratinjau sampul" className="aspect-video w-full object-cover" />
          <Button
            variant="outline"
            size="sm"
            type="button"
            className="absolute top-2 right-2 bg-white/90"
            onClick={() => setUrl("")}
          >
            Ganti
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => pickRef.current?.click()}
          disabled={busy}
          className={cn(
            "flex w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed px-4 py-6 transition-colors disabled:opacity-60",
            "border-[#d8e2d6] bg-[#fafcfa] hover:bg-[#eef4ec] dark:border-white/15 dark:bg-white/5 dark:hover:bg-white/10",
            "text-[13px] font-medium",
          )}
        >
          <ImagePlus aria-hidden className="size-5 shrink-0 text-[#7d9b84]" />
          <span className="font-medium text-[#1d2b21] dark:text-white">
            {busy ? "Mengompres & mengunggah…" : "Pilih gambar sampul"}
          </span>
          <span className="text-[12px] text-[#6b7a6e] dark:text-white/60">
            Potong 16:9 · otomatis WebP ≤600KB
          </span>
        </button>
      )}
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
          aspect="16:9"
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
