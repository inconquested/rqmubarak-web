import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signOut } from "@/lib/actions";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { SetupNotice } from "@/components/portal/ui";
import { OfflineProvider } from "@/components/portal/offline";
import { PortalShell } from "@/components/portal/sidebar";

/**
 * Guard sesi + peran pemilik. Sengaja di route group (protected) agar
 * /portal/login TIDAK ikut terjaga — kalau login ada di dalam layout ini,
 * redirect ke /portal/login akan memantul ke dirinya sendiri (loop 307).
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
  const session = await createClient();
  const {
    data: { user },
  } = await session.auth.getUser();
  if (!user) redirect("/portal/login");

  // pengguna.id = auth.uid(). Baca via service_role agar konsisten dengan portal.
  const { data: me } = await createAdminClient()
    .from("pengguna")
    .select("id,peran,status,nama_lengkap")
    .eq("id", user.id)
    .maybeSingle();
  if (!me || me.peran !== "pemilik" || me.status !== "aktif") {
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
              Keluar
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <PortalShell nama={me.nama_lengkap}>
      <OfflineProvider>{children}</OfflineProvider>
    </PortalShell>
  );
}
