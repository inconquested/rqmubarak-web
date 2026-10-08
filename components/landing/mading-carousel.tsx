"use client";

import { useReducedMotion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { fmtTanggal } from "@/lib/portal";
import type { MadingKonten } from "@/lib/portal";
import { cn } from "@/lib/utils";

/**
 * Carousel 2D + aksen 3D: skewX mengikuti kecepatan geser, tiap kartu
 * rotateY menjauhi tengah viewport. Murni transform/opacity, loop rAF
 * hanya hidup saat track bergerak. Mobile: 1 kartu + snap + swipe native.
 */
export function MadingCarousel({ items }: { items: MadingKonten[] }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [ends, setEnds] = useState({ prev: false, next: items.length > 1 });
  const idxRef = useRef(-1);
  const endsRef = useRef("");

  useEffect(() => {
    const el = trackRef.current;
    if (!el || reduce) return;
    let raf = 0;
    let last = el.scrollLeft;
    let skew = 0;
    let idle: ReturnType<typeof setTimeout>;
    // Ukuran layout di-cache — loop hanya baca scrollLeft (murah, tanpa
    // reflow) dan tulis transform. Ukur ulang hanya saat ukuran berubah.
    let vw = 1;
    let max = 0;
    let centers: number[] = [];

    const measure = () => {
      vw = el.clientWidth || 1;
      max = el.scrollWidth - el.clientWidth - 4;
      centers = Array.from(
        el.querySelectorAll<HTMLElement>("[data-mading-card]"),
      ).map((c) => c.offsetLeft + c.offsetWidth / 2);
    };
    const render = (s: number) => {
      const mid = el.scrollLeft + vw / 2;
      const cards = el.querySelectorAll<HTMLElement>("[data-mading-card]");
      let best = 0;
      let bd = Infinity;
      cards.forEach((c, i) => {
        const off = ((centers[i] ?? 0) - mid) / vw;
        c.style.transform = `perspective(1100px) rotateY(${(-off * 12).toFixed(2)}deg) skewX(${s.toFixed(2)}deg)`;
        const d = Math.abs((centers[i] ?? 0) - vw / 2 - el.scrollLeft);
        if (d < bd) {
          bd = d;
          best = i;
        }
      });
      if (idxRef.current !== best) {
        idxRef.current = best;
        setIndex(best);
      }
      const key = `${el.scrollLeft > 4}|${el.scrollLeft < max}`;
      if (endsRef.current !== key) {
        endsRef.current = key;
        setEnds({ prev: el.scrollLeft > 4, next: el.scrollLeft < max });
      }
    };
    const loop = () => {
      const cur = el.scrollLeft;
      const target = Math.max(-9, Math.min(9, (cur - last) * 0.4));
      last = cur;
      skew += (target - skew) * 0.14;
      render(skew);
      raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(loop);
      clearTimeout(idle);
      idle = setTimeout(() => {
        cancelAnimationFrame(raf);
        render(0);
      }, 280);
    };
    measure();
    render(0);
    el.addEventListener("scroll", kick, { passive: true });
    const ro = new ResizeObserver(() => {
      measure();
      kick();
    });
    ro.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(idle);
      el.removeEventListener("scroll", kick);
      ro.disconnect();
    };
  }, [reduce, items.length]);

  const step = (dir: 1 | -1) => {
    const el = trackRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-mading-card]");
    el.scrollBy({
      left: dir * ((card?.offsetWidth ?? el.clientWidth * 0.8) + 16),
      behavior: reduce ? "auto" : "smooth",
    });
  };

  return (
    <div>
      <div
        ref={trackRef}
        role="region"
        aria-roledescription="carousel"
        aria-label="Daftar artikel mading"
        tabIndex={0}
        className="no-scrollbar relative -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pt-2 pb-4 sm:mx-0 sm:px-0.5"
      >
        {items.map((m) => (
          <Card
            key={m.id}
            data-mading-card
            className="lift flex h-full w-full max-w-sm shrink-0 snap-start flex-col overflow-hidden basis-[82%] sm:basis-[48%] lg:basis-[32%]"
          >
            <Link
              href={`/mading/${m.id}`}
              prefetch
              aria-label={`Baca: ${m.judul ?? "artikel tanpa judul"}`}
              className="group flex flex-1 flex-col"
            >
              {m.thumb_url ? (
                <Image
                  src={m.thumb_url}
                  alt={m.judul ?? ""}
                  width={640}
                  height={360}
                  sizes="(max-width: 640px) 82vw, (max-width: 1024px) 48vw, 400px"
                  loading="lazy"
                  draggable={false}
                  className="aspect-video w-full object-cover"
                />
              ) : null}
              <div className="flex flex-1 flex-col p-4 sm:p-6">
                <h3 className="font-display text-lg font-medium text-[#1d2b21] group-hover:underline">
                  {m.judul ?? "Tanpa judul"}
                </h3>
                {m.deskripsi ? (
                  <p className="mt-2 line-clamp-2 flex-1 text-[13px] leading-relaxed text-[#6b7a6e]">
                    {m.deskripsi}
                  </p>
                ) : null}
                <p className="mt-3 text-[12px] text-[#6b7a6e]">
                  {fmtTanggal(m.created_at.slice(0, 10))}
                  {m.penulis_ref?.nama_lengkap ? ` · ${m.penulis_ref.nama_lengkap}` : ""}
                </p>
              </div>
            </Link>
          </Card>
        ))}
      </div>

      <div className="mt-2 flex items-center justify-end gap-3">
        <p className="text-[12px] text-[#6b7a6e] tabular-nums" aria-live="polite">
          {String(index + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            aria-label="Sebelumnya"
            onClick={() => step(-1)}
            disabled={!ends.prev}
            className={cn("size-11 rounded-full px-0 disabled:opacity-40")}
          >
            <ArrowLeft aria-hidden className="size-4" />
          </Button>
          <Button
            type="button"
            aria-label="Berikutnya"
            onClick={() => step(1)}
            disabled={!ends.next}
            className={cn("size-11 rounded-full px-0 disabled:opacity-40")}
          >
            <ArrowRight aria-hidden className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
