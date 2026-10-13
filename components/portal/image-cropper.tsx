"use client";

import { Check, ZoomIn, ZoomOut } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { canvasToWebP } from "@/lib/image";
import { cn } from "@/lib/utils";

export type CropAspect = "16:9" | "1:1";

/** Output size (long edge ≤1280) before WebP compression. */
const OUT_SIZE: Record<CropAspect, { w: number; h: number }> = {
  "16:9": { w: 1280, h: 720 },
  "1:1": { w: 960, h: 960 },
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 3;

function clamp(v: number, lo: number, hi: number) {
  return Math.min(hi, Math.max(lo, v));
}

/** Fixed-ratio image crop modal — drag to pan, slider to zoom. */
export function ImageCropperDialog({
  open,
  onOpenChange,
  src,
  aspect,
  onCropped,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  src: string;
  aspect: CropAspect;
  onCropped: (blob: Blob) => void | Promise<void>;
}) {
  const [zoom, setZoom] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [nat, setNat] = useState({ w: 0, h: 0 });
  const [view, setView] = useState({ w: 0, h: 0 });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const viewRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const dragRef = useRef<{ px: number; py: number } | null>(null);

  useEffect(() => {
    setZoom(1);
    setPos({ x: 0, y: 0 });
    setNat({ w: 0, h: 0 });
    setError("");
  }, [src]);

  useEffect(() => {
    const el = viewRef.current;
    if (!el) return;
    const sync = () =>
      setView({ w: el.clientWidth, h: el.clientHeight });
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [open, aspect]);

  const base =
    nat.w && nat.h && view.w && view.h
      ? Math.max(view.w / nat.w, view.h / nat.h)
      : 0;
  const dw = nat.w * base * zoom;
  const dh = nat.h * base * zoom;

  function limit(x: number, y: number, z: number) {
    if (!base) return { x: 0, y: 0 };
    const mx = Math.max(0, (nat.w * base * z - view.w) / 2);
    const my = Math.max(0, (nat.h * base * z - view.h) / 2);
    return { x: clamp(x, -mx, mx), y: clamp(y, -my, my) };
  }

  function setZoomClamped(z: number) {
    const nz = clamp(z, MIN_ZOOM, MAX_ZOOM);
    setZoom(nz);
    setPos((p) => limit(p.x, p.y, nz));
  }

  function onPointerDown(e: React.PointerEvent) {
    dragRef.current = { px: e.clientX, py: e.clientY };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = dragRef.current;
    if (!d) return;
    const dx = e.clientX - d.px;
    const dy = e.clientY - d.py;
    dragRef.current = { px: e.clientX, py: e.clientY };
    setPos((p) => limit(p.x + dx, p.y + dy, zoom));
  }

  function endDrag() {
    dragRef.current = null;
  }

  async function onCrop() {
    const img = imgRef.current;
    if (!(img && nat.w && nat.h && view.w && view.h)) return;
    setBusy(true);
    setError("");
    try {
      const eff = base * zoom;
      const sw = view.w / eff;
      const sh = view.h / eff;
      const sx = clamp(
        (nat.w / 2 - view.w / eff / 2 - pos.x / eff),
        0,
        nat.w - sw,
      );
      const sy = clamp(
        (nat.h / 2 - view.h / eff / 2 - pos.y / eff),
        0,
        nat.h - sh,
      );
      const out = OUT_SIZE[aspect];
      const canvas = document.createElement("canvas");
      canvas.width = out.w;
      canvas.height = out.h;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("no-canvas");
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, out.w, out.h);
      const blob = await canvasToWebP(canvas);
      await onCropped(blob);
    } catch {
      setError("Gagal memotong gambar di perangkat.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Potong gambar</DialogTitle>
          <DialogDescription>
            {aspect === "16:9" ? "Rasio 16:9 untuk sampul." : "Rasio 1:1 untuk foto profil."}{" "}
            Seret untuk menggeser, atur zoom bila perlu.
          </DialogDescription>
        </DialogHeader>
        <div
          ref={viewRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          className={cn(
            "relative w-full touch-none overflow-hidden select-none",
            aspect === "16:9" ? "aspect-video" : "aspect-square",
            "rounded-xl border border-[#d8e2d6] bg-[#eef4ec] dark:border-white/10 dark:bg-[#1c2620]",
            "cursor-grab active:cursor-grabbing",
          )}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={src}
            alt="Gambar yang dipotong"
            draggable={false}
            onLoad={(e) =>
              setNat({
                w: e.currentTarget.naturalWidth,
                h: e.currentTarget.naturalHeight,
              })
            }
            className="pointer-events-none absolute top-1/2 left-1/2 max-w-none"
            style={{
              width: dw || undefined,
              height: dh || undefined,
              transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px))`,
            }}
          />
          <div aria-hidden className="pointer-events-none absolute inset-0">
            <div className="absolute inset-y-0 left-1/3 w-px bg-white/60" />
            <div className="absolute inset-y-0 left-2/3 w-px bg-white/60" />
            <div className="absolute inset-x-0 top-1/3 h-px bg-white/60" />
            <div className="absolute inset-x-0 top-2/3 h-px bg-white/60" />
          </div>
        </div>
        <div className={cn("flex items-center gap-2", "", "text-sm")}>
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => setZoomClamped(zoom - 0.25)}
            disabled={zoom <= MIN_ZOOM}
            aria-label="Perkecil"
          >
            <ZoomOut aria-hidden />
          </Button>
          <input
            type="range"
            min={MIN_ZOOM}
            max={MAX_ZOOM}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoomClamped(Number(e.target.value))}
            aria-label="Zoom"
            className={cn(
              "h-1.5 flex-1 cursor-pointer appearance-none rounded-full",
              "bg-[#d8e2d6] dark:bg-white/15",
              "accent-[#2c4232]",
            )}
          />
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            onClick={() => setZoomClamped(zoom + 0.25)}
            disabled={zoom >= MAX_ZOOM}
            aria-label="Perbesar"
          >
            <ZoomIn aria-hidden />
          </Button>
          <span
            className={cn(
              "w-11 text-right",
              "text-[#4b5b4f] dark:text-white/70",
              "text-[12px] font-medium tabular-nums",
            )}
          >
            {Math.round(zoom * 100)}%
          </span>
        </div>
        {error ? (
          <p role="alert" className="text-[12px] text-red-700">
            {error}
          </p>
        ) : null}
        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Batal
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={onCrop}
            disabled={busy || !nat.w}
          >
            <Check aria-hidden />
            {busy ? "Memotong…" : "Potong & pakai"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
