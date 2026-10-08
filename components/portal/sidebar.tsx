"use client";

import {
  ArrowLeftRight,
  ChevronsUpDown,
  ClipboardCheck,
  Layers,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  NotebookPen,
  UserCog,
  Users,
  X,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Logo } from "@/components/landing/logo";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { PORTAL_NAV } from "@/lib/portal";
import { signOut } from "@/lib/actions";
import { cn } from "@/lib/utils";

export type ShellUser = { nama_lengkap: string; peran: string };

const PERAN_LABEL: Record<string, string> = {
  pemilik: "Pemilik",
  pengajar: "Pengajar",
  tak_dikenal: "Tak Dikenal",
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
}

const ICONS: Record<string, typeof LayoutDashboard> = {
  "/portal": LayoutDashboard,
  "/portal/absensi": ClipboardCheck,
  "/portal/setoran": NotebookPen,
  "/portal/santri": Users,
  "/portal/kelas": Layers,
  "/portal/pengguna": UserCog,
  "/portal/mengajar": ArrowLeftRight,
  "/portal/mading": Newspaper,
};

function isActive(href: string, pathname: string) {
  return href === "/portal" ? pathname === href : pathname.startsWith(href);
}

function NavItems({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className="space-y-1">
      {PORTAL_NAV.map((n) => {
        const Icon = ICONS[n.href] ?? LayoutDashboard;
        const active = isActive(n.href, pathname);
        return (
          <li key={n.href}>
            <a
              href={n.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium transition-colors duration-200 [transition-timing-function:var(--ease-out)]",
                active
                  ? "bg-[#cbdcc9] text-[#1d2b21]"
                  : "text-[#4b5b4f] hover:bg-[#eef4ec]",
              )}
            >
              <Icon aria-hidden className="size-4 shrink-0" />
              <span>{n.label}</span>
            </a>
          </li>
        );
      })}
    </ul>
  );
}

function SidebarBody({
  onNavigate,
  user,
}: {
  onNavigate?: () => void;
  user?: ShellUser;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 pt-6 pb-7">
        <Logo />
      </div>
      <nav aria-label="Navigasi portal" className="flex-1 overflow-y-auto px-3">
        <NavItems onNavigate={onNavigate} />
      </nav>
      <div className="px-3 py-4">
        {user ? (
          <Popover>
            <PopoverTrigger
              className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left transition-colors duration-200 [transition-timing-function:var(--ease-out)] hover:bg-[#eef4ec]"
            >
              <span
                aria-hidden
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#cbdcc9] text-[11px] font-semibold text-[#1d2b21]"
              >
                {initials(user.nama_lengkap)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-medium text-[#1d2b21]">
                  {user.nama_lengkap}
                </span>
                <span className="block text-[11.5px] text-[#6b7a6e]">
                  {PERAN_LABEL[user.peran] ?? user.peran}
                </span>
              </span>
              <ChevronsUpDown
                aria-hidden
                className="size-4 shrink-0 text-[#4b5b4f]"
              />
            </PopoverTrigger>
            <PopoverContent
              side="top"
              align="start"
              sideOffset={8}
              className="w-(--anchor-width) rounded-xl border border-white/60 bg-white p-1.5 shadow-[0_12px_40px_-16px_rgba(61,79,66,0.18)] ring-0"
            >
              <form action={signOut}>
                <button
                  type="submit"
                  className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-[13.5px] font-medium text-[#4b5b4f] transition-colors duration-200 [transition-timing-function:var(--ease-out)] hover:bg-[#eef4ec]"
                >
                  <LogOut aria-hidden className="size-4 shrink-0" />
                  <span>Logout</span>
                </button>
              </form>
            </PopoverContent>
          </Popover>
        ) : (
          <form action={signOut}>
            <button
              type="submit"
              className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-[13.5px] font-medium text-[#4b5b4f] transition-colors duration-200 [transition-timing-function:var(--ease-out)] hover:bg-[#eef4ec]"
            >
              <LogOut aria-hidden className="size-4 shrink-0" />
              <span>Logout</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

const CARD_CLASS =
  "w-[230px] rounded-3xl border border-white/60 bg-white shadow-[0_12px_40px_-16px_rgba(61,79,66,0.18)]";

export function PortalShell({
  children,
  user,
}: {
  children: React.ReactNode;
  user?: ShellUser;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-[linear-gradient(160deg,#eef4ec_0%,#fbfdfb_45%,#dde8da_100%)]">
      {/* Desktop: kartu putih mengambang */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 m-3 hidden h-[calc(100dvh-1.5rem)] lg:block",
          CARD_CLASS,
        )}
      >
        <SidebarBody user={user} />
      </aside>

      {/* Mobile: tombol menu + drawer */}
      <button
        type="button"
        aria-label="Buka menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
        className="fixed top-4 left-4 z-40 flex size-10 items-center justify-center rounded-xl border border-white/60 bg-white text-[#1d2b21] shadow-[0_12px_40px_-16px_rgba(61,79,66,0.18)] lg:hidden"
      >
        <Menu aria-hidden className="size-4" />
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Tutup menu"
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-[#1d2b21]/30 backdrop-blur-[2px]"
          />
          <aside className={cn("absolute top-3 bottom-3 left-3", CARD_CLASS)}>
            <button
              type="button"
              aria-label="Tutup menu"
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 flex size-10 items-center justify-center rounded-lg text-[#4b5b4f] hover:bg-[#eef4ec]"
            >
              <X aria-hidden className="size-4" />
            </button>
            <SidebarBody onNavigate={() => setOpen(false)} user={user} />
          </aside>
        </div>
      ) : null}

      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 pt-20 pb-6 sm:px-6 sm:pb-8 lg:py-8 lg:pl-[266px] lg:pr-8">
        {children}
      </main>
    </div>
  );
}
