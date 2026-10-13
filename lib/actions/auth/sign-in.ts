"use server";

import { createClient } from "@/lib/supabase/server";

/* Owner login via built-in Auth. Return a result (not a redirect) so
   the login page keeps showing inline errors as before. */
export async function signIn(
  fd: FormData,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const email = (fd.get("email")?.toString() ?? "").trim();
  const password = fd.get("password")?.toString() ?? "";

  if (!email || !password)
    return { ok: false, error: "Email dan kata sandi wajib diisi." };

  const db = await createClient();
  const { error } = await db.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: "Email atau kata sandi salah." };

  return { ok: true };
}
