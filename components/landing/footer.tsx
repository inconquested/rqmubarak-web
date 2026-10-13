import { ArrowRight, Clock, Mail, MapPin, Phone } from "lucide-react";
import { Logo } from "@/components/landing/logo";
import { Reveal } from "@/components/landing/reveal";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { NAV_LINKS } from "@/lib/landing";

const PRODUK_LINKS = [
  { label: "Program Halaqah", href: "#program" },
  { label: "Sistem Digital", href: "#sistem" },
  { label: "Mading", href: "#mading" },
] as const;

const linkCls = cn(
  "text-[#6b7a6e] hover:text-[#1d2b21] dark:text-[#8ba091] dark:hover:text-[#e9f1ea]",
  "transition-colors",
);

export function Footer() {
  return (
    <footer
      id="kontak"
      className={cn(
        "w-full scroll-mt-24 border-t",
        "border-[#d8e2d6] bg-white/70 dark:border-[#2b3c31] dark:bg-[#0d1410]/80",
      )}
    >
      <Reveal className="mx-auto w-full max-w-5xl px-4 sm:px-6">
        {/* Top row: identity + status + CTA */}
        <div
          className={cn(
            "flex flex-col gap-5 py-8 sm:py-10",
            "lg:flex-row lg:items-center lg:justify-between",
          )}
        >
          <div className="max-w-md">
            <Logo />
            <p
              className={cn(
                "mt-3",
                "text-[#6b7a6e] dark:text-[#8ba091]",
                "text-[13px] leading-relaxed",
              )}
            >
              Les mengaji &amp; tahfidz untuk anak, remaja, dan dewasa —
              tercatat rapi di portal digital.
            </p>
            <p
              className={cn(
                "mt-3 inline-flex items-center gap-2 rounded-full border px-2.5 py-1",
                "border-[#d8e2d6] bg-[#eef4ec] dark:border-[#2b3c31] dark:bg-[#182420]",
                "text-[12px] font-medium",
              )}
            >
              <span className="relative flex size-2">
                <span
                  aria-hidden
                  className={cn(
                    "absolute inline-flex h-full w-full rounded-full",
                    "bg-[#2f6b3a] dark:bg-[#93c184]",
                    "opacity-60 motion-safe:animate-ping",
                  )}
                />
                <span
                  aria-hidden
                  className={cn(
                    "relative inline-flex size-2 rounded-full",
                    "bg-[#2f6b3a] dark:bg-[#93c184]",
                  )}
                />
              </span>
              <span className={cn("text-[#4b5b4f] dark:text-[#b3c6b8]")}>
                Portal &amp; mading digital
              </span>
            </p>
          </div>
          <a href="/portal/login" className="shrink-0">
            <Button size="sm" className="rounded-xl" type="button">
              Masuk Portal
              <ArrowRight aria-hidden />
            </Button>
          </a>
        </div>

        {/* Link grid: Product / Navigation / Contact */}
        <div
          className={cn(
            "grid gap-8 border-t py-8 sm:grid-cols-3",
            "border-[#eef4ec] dark:border-[#223028]",
          )}
        >
          <nav aria-label="Produk">
            <h3
              className={cn(
                "font-display",
                "text-[#1d2b21] dark:text-[#e9f1ea]",
                "text-[15px] font-semibold",
              )}
            >
              Produk
            </h3>
            <ul className={cn("mt-3 space-y-1.5", "text-[12.5px]")}>
              {PRODUK_LINKS.map((link) => (
                <li key={link.href + link.label}>
                  <a href={link.href} className={linkCls}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Navigasi">
            <h3
              className={cn(
                "font-display",
                "text-[#1d2b21] dark:text-[#e9f1ea]",
                "text-[15px] font-semibold",
              )}
            >
              Navigasi
            </h3>
            <ul className={cn("mt-3 space-y-1.5", "text-[12.5px]")}>
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className={linkCls}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <nav aria-label="Kontak admin">
            <h3
              className={cn(
                "font-display",
                "text-[#1d2b21] dark:text-[#e9f1ea]",
                "text-[15px] font-semibold",
              )}
            >
              Kontak
            </h3>
            <ul
              className={cn(
                "mt-3 space-y-2",
                "text-[#6b7a6e] dark:text-[#8ba091]",
                "text-[12.5px] leading-relaxed",
              )}
            >
              <li className="flex items-start gap-2">
                <MapPin
                  aria-hidden
                  className={cn(
                    "mt-0.5 size-3.5 shrink-0",
                    "text-[#7d9b84] dark:text-[#86ab8d]",
                  )}
                />
                <span>Jl. Encep Kartawiria .........</span>
              </li>
              <li>
                <a
                  href="tel:+6289500000000"
                  className={cn(
                    "flex items-center gap-2",
                    "hover:text-[#1d2b21] dark:hover:text-[#e9f1ea]",
                    "transition-colors",
                  )}
                >
                  <Phone
                    aria-hidden
                    className={cn(
                      "size-3.5 shrink-0",
                      "text-[#7d9b84] dark:text-[#86ab8d]",
                    )}
                  />
                  +62 895-0000-0000
                </a>
              </li>
              <li>
                <a
                  href="mailto:admin@rqmubarak.lalululu"
                  className={cn(
                    "flex items-center gap-2",
                    "hover:text-[#1d2b21] dark:hover:text-[#e9f1ea]",
                    "transition-colors",
                  )}
                >
                  <Mail
                    aria-hidden
                    className={cn(
                      "size-3.5 shrink-0",
                      "text-[#7d9b84] dark:text-[#86ab8d]",
                    )}
                  />
                  admin@rqmubarak.lalululu
                </a>
              </li>
            </ul>
          </nav>
        </div>

        {/* Bottom row: © + opening hours + links */}
        <div
          className={cn(
            "flex flex-col items-center justify-between gap-3 border-t py-5 sm:flex-row",
            "border-[#eef4ec] dark:border-[#223028]",
            "text-[12px]",
          )}
        >
          <p className={cn("text-[#6b7a6e] dark:text-[#8ba091]")}>
            © 2026 Rumah Qur&rsquo;an Mubarak. Hak Cipta Dilindungi.
          </p>
          <p
            className={cn(
              "inline-flex items-center gap-1.5",
              "text-[#6b7a6e] dark:text-[#8ba091]",
            )}
          >
            <Clock aria-hidden className="size-3.5 shrink-0" />
            Buka Senin–Minggu, 08.00–20.00 WIB
          </p>
          <div className="flex items-center gap-4">
            <a href="/portal/login" className={linkCls}>
              Masuk Portal
            </a>
            <a href="#mading" className={linkCls}>
              Mading
            </a>
          </div>
        </div>
      </Reveal>
    </footer>
  );
}
