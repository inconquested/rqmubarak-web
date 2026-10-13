"use server";

import { fail, ok, requirePemilik } from "../shared";

export async function updatePasswordSelf(fd: FormData) {
  const returnTo = "/portal/profil";
  const { db, me } = await requirePemilik();
  const p1 = fd.get("password")?.toString() ?? "";
  const p2 = fd.get("confirm")?.toString() ?? "";
  if (p1.length < 6) fail(returnTo, "Kata sandi minimal 6 karakter.");
  if (p1 !== p2) fail(returnTo, "Konfirmasi kata sandi tidak sama.");
  const { error } = await db.auth.admin.updateUserById(me.id, { password: p1 });
  if (error) fail(returnTo, `Gagal mengganti kata sandi: ${error.message}`);
  ok(returnTo, "Kata sandi diperbarui.");
}
