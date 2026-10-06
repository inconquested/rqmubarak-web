"use server";

import { PERAN_PENGGUNA } from "@/lib/portal";
import { fail, idOrNull, ok, requirePemilik, str } from "./shared";

/* Master: pengguna — akun Auth dibuat/dikelola langsung di sini via Admin API.
   id baris = Auth UID (kontrak schema_real.sql §7), jadi tanpa input UID manual. */

export async function upsertPengguna(fd: FormData) {
  const returnTo = "/portal/pengguna";
  const { db } = await requirePemilik();
  const nama_lengkap = str(fd, "nama_lengkap");
  const email = str(fd, "email").toLowerCase();
  const password = fd.get("password")?.toString() ?? "";
  const peran = str(fd, "peran");
  const status = str(fd, "status");
  if (!nama_lengkap) fail(returnTo, "Nama wajib diisi.");
  if (!(PERAN_PENGGUNA as readonly string[]).includes(peran))
    fail(returnTo, "Peran tidak valid.");
  if (!["aktif", "nonaktif"].includes(status)) fail(returnTo, "Status tidak valid.");
  const payload = {
    nama_lengkap,
    email: email || null,
    no_telepon: str(fd, "no_telepon") || null,
    peran,
    status,
  };
  const id = idOrNull(fd);
  if (id) {
    if (email) {
      const { error } = await db.auth.admin.updateUserById(id, {
        email,
        ...(password ? { password } : {}),
      });
      if (error) fail(returnTo, `Gagal memperbarui akun login: ${error.message}`);
    } else if (password) {
      const { error } = await db.auth.admin.updateUserById(id, { password });
      if (error) fail(returnTo, `Gagal mengganti kata sandi: ${error.message}`);
    }
    const { error } = await db.from("pengguna").update(payload).eq("id", id);
    if (error) fail(returnTo, error.message);
    ok(returnTo, "Pengguna diperbarui.");
  }
  if (!email) fail(returnTo, "Email wajib diisi untuk akun baru.");
  if (password.length < 6) fail(returnTo, "Kata sandi minimal 6 karakter.");
  const { data, error: authErr } = await db.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { nama_lengkap },
  });
  if (authErr || !data.user)
    fail(returnTo, `Gagal membuat akun login: ${authErr?.message ?? "unknown"}`);
  const { error } = await db.from("pengguna").insert({ id: data.user.id, ...payload });
  if (error) {
    await db.auth.admin.deleteUser(data.user.id); // rollback akun yatim
    fail(returnTo, error.message);
  }
  ok(returnTo, "Pengguna + akun login dibuat. Tugaskan kelasnya di menu Mengajar.");
}

export async function deletePengguna(fd: FormData) {
  const returnTo = "/portal/pengguna";
  const { db, me } = await requirePemilik();
  const id = str(fd, "id");
  if (!id) fail(returnTo, "ID tidak valid.");
  if (id === me.id) fail(returnTo, "Akun sendiri tidak boleh dihapus.");
  const { error: authErr } = await db.auth.admin.deleteUser(id);
  if (authErr) fail(returnTo, `Gagal menghapus akun login: ${authErr.message}`);
  // ON DELETE CASCADE: penugasan + absensi + mutabaah ikut terhapus.
  const { error } = await db.from("pengguna").delete().eq("id", id);
  if (error) fail(returnTo, error.message);
  ok(returnTo, "Pengguna + akun login dihapus.");
}
