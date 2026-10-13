"use server";

import { fail, ok, requirePemilik, str } from "../shared";

export async function deletePengguna(fd: FormData) {
  const returnTo = "/portal/pengguna";
  const { db, me } = await requirePemilik();
  const id = str(fd, "id");
  if (!id) fail(returnTo, "ID tidak valid.");
  if (id === me.id) fail(returnTo, "Akun sendiri tidak boleh dihapus.");
  const { error: authErr } = await db.auth.admin.deleteUser(id);
  if (authErr) fail(returnTo, `Gagal menghapus akun login: ${authErr.message}`);
  // ON DELETE CASCADE: assignments + attendance + mutabaah are deleted too.
  const { error } = await db.from("pengguna").delete().eq("id", id);
  if (error) fail(returnTo, error.message);
  ok(returnTo, "Pengguna + akun login dihapus.");
}
