"use client";

import { Menu } from "lucide-react";
import type { MouseEvent } from "react";
import { Logo } from "@/components/landing/logo";
import { Button } from "@/components/ui/button";
import { NAV_LINKS } from "@/lib/landing";

function closeMenu(e: MouseEvent<HTMLAnchorElement>) {
  e.currentTarget.closest("details")?.removeAttribute("open");
}

export function Navbar() {
  return (
    <header className="sticky top-3 z-40 mx-auto w-full max-w-3xl px-4 sm:px-6">
      <nav
        aria-label="Navigasi utama"
        className="flex h-14 items-center justify-between gap-4 rounded-2xl border border-white/60 bg-[#f0f5ee]/90 py-2 pr-2 pl-4 shadow-[0_8px_30px_-12px_rgba(61,79,66,0.25)] backdrop-blur-md"
      >
        <a href="#atas" aria-label="Rumah Qur'an Mubarak - ke atas">
          <Logo />
        </a>
        <ul className="hidden items-center gap-6 text-[13px] text-[#6b7a6e] sm:flex">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="nav-link py-1 transition-colors hover:text-[#1d2b21]"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-1">
          <details className="relative sm:hidden">
            <summary
              aria-label="Buka menu navigasi"
              className="flex size-8 cursor-pointer list-none items-center justify-center rounded-lg text-[#4b5b4f] transition-colors hover:bg-[#eef4ec] [&::-webkit-details-marker]:hidden"
            >
              <Menu className="size-4" aria-hidden />
            </summary>
            <div className="menu-panel absolute top-10 right-0 w-44 rounded-xl border border-[#d8e2d6] bg-white p-1.5 shadow-[0_16px_40px_-16px_rgba(61,79,66,0.35)]">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={closeMenu}
                  className="block rounded-lg px-3 py-2 text-sm text-[#4b5b4f] transition-colors hover:bg-[#eef4ec] hover:text-[#1d2b21]"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </details>
          <a href="/portal/login">
            <Button size="sm" className="rounded-lg">
              Login
            </Button>
          </a>
        </div>
      </nav>
    </header>
  );
}
