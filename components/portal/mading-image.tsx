"use client";

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { uploadMadingImage } from "@/lib/portal-actions";
import { cn } from "@/lib/utils";

const MAX_SIDE = 1280;
const TARGET_BYTES = 600 * 1024;

/** Perkecil + kompres di perangkat sebelum dikirim — hemat kuota & storage. */
async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const w = Math.max(1, Math.round(bitmap.width * scale));
  const h = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no-canvas");
  ctx.drawImage(bitmap, 0, 0, w, h);
  bitmap.close();
  for (const q of [0.82, 0.68, 0.55]) {
    const blob = await new Promise<Blob | null>((res) =>
      canvas.toBlob(res, "image/webp", q),
    );
    if (blob && (blob.size <= TARGET_BYTES || q === 0.55)) return blob;
  }
  throw new Error("compress-fail");
}

export function MadingImageField({ defaultUrl }: { defaultUrl?: string }) {
  const [url, setUrl] = useState(defaultUrl ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pickRef = useRef<HTMLInputElement>(null);

  async function onPick(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("Pilih berkas gambar.");
      return;
    }
    setBusy(true);
    setError("");
    try {
      const blob = await compressImage(file);
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
        <div className="relative overflow-hidden rounded-xl border border-[#d8e2d6]">
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
            "flex w-full flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-[#d8e2d6] bg-[#fafcfa] px-4 py-6 text-[13px] text-[#6b7a6e] transition-colors hover:bg-[#eef4ec] disabled:opacity-60",
          )}
        >
          <span className="font-medium text-[#1d2b21]">
            {busy ? "Mengompres & mengunggah…" : "Pilih gambar sampul"}
          </span>
          <span className="text-[12px]">Otomatis diperkecil ≤1280px · WebP ≤600KB</span>
        </button>
      )}
      <input
        ref={pickRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onPick}
      />
      {error ? (
        <p role="alert" className="text-[12px] text-red-700">{error}</p>
      ) : null}
    </div>
  );
}
