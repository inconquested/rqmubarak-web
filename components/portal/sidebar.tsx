"use client";

import {
  ArrowLeftRight,
  ClipboardCheck,
  Layers,
  LayoutDashboard,
  LogOut,
  Newspaper,
  NotebookPen,
  UserCog,
  Users,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/landing/logo";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PORTAL_NAV } from "@/lib/portal";
import { signOut } from "@/lib/actions";

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

export function PortalShell({
  nama,
  children,
}: {
  nama: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  return (
    <TooltipProvider>
      <SidebarProvider>
        {/* Desktop: collapsible icon · Mobile: sheet drawer otomatis */}
        <Sidebar collapsible="icon">
          <SidebarHeader>
            <span className="flex items-center gap-2 py-1">
              <Logo />
            </span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {PORTAL_NAV.map((n) => {
                    const Icon = ICONS[n.href] ?? LayoutDashboard;
                    return (
                      <SidebarMenuItem key={n.href}>
                        <SidebarMenuButton
                          isActive={isActive(n.href, pathname)}
                          tooltip={n.label}
                          render={<a href={n.href} />}
                        >
                          <Icon aria-hidden />
                          <span>{n.label}</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter>
            <div className="flex items-center gap-2.5 rounded-2xl border border-white/60 bg-white/70 p-2.5">
              <span
                aria-hidden
                className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#1d2b21] text-[12px] font-semibold text-white"
              >
                {nama.charAt(0).toUpperCase()}
              </span>
              <span className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                <span className="block truncate text-[13px] font-medium text-[#1d2b21]">
                  {nama}
                </span>
                <span className="block text-[11px] text-[#6b7a6e]">Pemilik</span>
              </span>
              <form action={signOut} className="group-data-[collapsible=icon]:hidden">
                <Button variant="ghost" size="sm" type="submit" aria-label="Keluar">
                  <LogOut aria-hidden className="size-4" />
                </Button>
              </form>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset>
          <header className="sticky top-0 z-40 flex items-center gap-2 border-b border-[#d8e2d6]/60 bg-[#fbfdfb]/90 px-4 py-2.5 backdrop-blur-md sm:px-6">
            <SidebarTrigger aria-label="Buka/tutup menu" />
            <span className="text-[13px] font-medium text-[#4b5b4f]">
              Portal Pemilik
            </span>
          </header>
          <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 sm:px-6 sm:py-8">
            {children}
          </main>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
