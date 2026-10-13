import { LogOut } from "lucide-react";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions";
import { getAuthPemilik } from "@/lib/actions/shared";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { SetupNotice } from "@/components/portal/ui";
import { OfflineProvider } from "@/components/portal/offline";
import { PortalShell } from "@/components/portal/sidebar";

/**
 * Owner session + role guard. Deliberately in the (protected) route group so
 * /portal/login is NOT guarded — if login lived inside this layout,
 * redirects to /portal/login would bounce to itself (307 loop).
 */
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!isSupabaseConfigured()) {
    return (
      <div className="px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <SetupNotice />
        </div>
      </div>
    );
  }
  const { user, me } = await getAuthPemilik();
  if (!user) redirect("/portal/login");
  if (!me) {
    return (
      <div className="flex min-h-dvh items-center justify-center px-4">
        <div className="max-w-sm text-center">
          <h1 className="font-display text-xl font-medium text-[#1d2b21]">
            Akses ditolak
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-[#6b7a6e]">
            Akun ini tidak terdaftar sebagai pemilik aktif. Minta pemilik menaikkan
            peranmu di menu Pengguna.
          </p>
          <form action={signOut} className="mt-4">
            <Button variant="outline" size="sm">
              <LogOut aria-hidden />
              Keluar
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <PortalShell user={{ nama_lengkap: me.nama_lengkap ?? "Pemilik", peran: me.peran }}>
      <OfflineProvider>{children}</OfflineProvider>
    </PortalShell>
  );
}
