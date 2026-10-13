import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/* Guard + helpers — used by all domain actions. Not an action, so no "use server". */

type PemilikRow = {
  id: string;
  peran: string;
  status: string;
  nama_lengkap: string | null;
  no_telepon: string | null;
  email: string | null;
  foto_url: string | null;
};

/* Single place checking the built-in Auth session (getUser) + owner role row.
   Never throws — layout uses it to render "Akses ditolak". */
export async function getAuthPemilik() {
  const session = await createClient();
  const {
    data: { user },
  } = await session.auth.getUser();
  const db = createAdminClient();
  if (!user) return { db, user: null, me: null as PemilikRow | null };
  const { data: me } = await db
    .from("pengguna")
    .select("id,peran,status,nama_lengkap,no_telepon,email,foto_url")
    .eq("id", user.id)
    .maybeSingle();
  const pemilik =
    me && me.peran === "pemilik" && me.status === "aktif"
      ? (me as PemilikRow)
      : null;
  return { db, user, me: pemilik };
}

export async function requirePemilik() {
  const { db, user, me } = await getAuthPemilik();
  if (!user) redirect("/portal/login");
  if (!me) throw new Error("Hanya akun pemilik yang boleh mengubah data.");
  return { db, me };
}

export type AdminDb = Awaited<ReturnType<typeof requirePemilik>>["db"];

export function back(returnTo: string, params: string): never {
  revalidatePath("/portal", "layout");
  redirect(`${returnTo}${params}`);
}

export function fail(returnTo: string, msg: string): never {
  back(returnTo, `?error=${encodeURIComponent(msg)}`);
}

export function ok(returnTo: string, msg = "Tersimpan."): never {
  back(returnTo, `?ok=${encodeURIComponent(msg)}`);
}

export const str = (fd: FormData, k: string) =>
  (fd.get(k)?.toString() ?? "").trim();
export const numOrNull = (fd: FormData, k: string) => {
  const v = str(fd, k);
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
export const idOrNull = (fd: FormData) => str(fd, "id") || null;
