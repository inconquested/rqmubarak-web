"use server";

import { fail, ok, requirePemilik, str } from "../shared";

/* Own profile (id = auth.uid, schema_real.sql §7 contract). */

export async function updateProfil(fd: FormData) {
  const returnTo = "/portal/profil";
  const { db, me } = await requirePemilik();
  const nama_lengkap = str(fd, "nama_lengkap");
  if (!nama_lengkap) fail(returnTo, "Nama wajib diisi.");
  const foto_url = str(fd, "foto_url");
  if (foto_url && !/^https?:\/\//i.test(foto_url))
    fail(returnTo, "URL foto harus diawali http(s).");
  const { error } = await db
    .from("pengguna")
    .update({
      nama_lengkap,
      no_telepon: str(fd, "no_telepon") || null,
      foto_url: foto_url || null,
    })
    .eq("id", me.id);
  if (error) fail(returnTo, error.message);
  ok(returnTo, "Profil diperbarui.");
}
