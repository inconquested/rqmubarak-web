import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

/* Guard + helper — dipakai semua action domain. Bukan action, jadi tanpa "use server". */

export async function requirePemilik() {
  const session = await createClient();
  const {
    data: { user },
  } = await session.auth.getUser();
  if (!user) redirect("/portal/login");
  // pengguna.id = auth.uid() (schema_real.sql §7). Baca via service_role karena
  // policy RLS hanya mengizinkan baris sendiri untuk SELECT — pemilik butuh global.
  const db = createAdminClient();
  const { data: me } = await db
    .from("pengguna")
    .select("id,peran,status")
    .eq("id", user.id)
    .maybeSingle();
  if (!me || me.peran !== "pemilik" || me.status !== "aktif")
    throw new Error("Hanya akun pemilik yang boleh mengubah data.");
  return { db, me: me as { id: string; peran: string; status: string } };
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

export const str = (fd: FormData, k: string) => (fd.get(k)?.toString() ?? "").trim();
export const numOrNull = (fd: FormData, k: string) => {
  const v = str(fd, k);
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};
export const idOrNull = (fd: FormData) => str(fd, "id") || null;
